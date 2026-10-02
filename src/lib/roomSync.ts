import { showSelectionToast } from '../components/toast';
import { useNameStore } from '../stores/useNameStore';
import { useRoomStore } from '../stores/useRoomStore';
import type { NameList, SelectionRecord } from '../types/name';
import {
  createRoom,
  getRoom,
  openRoomChannel,
  type RoomChannel,
  type RoomData,
  saveRoom,
} from './rooms';
import { supabase } from './supabase';

// Short enough to feel live, long enough to batch typing into one save
const SAVE_DEBOUNCE_MS = 300;
// Long enough not to hammer a down network, short enough to feel live after it returns
const SAVE_RETRY_MS = 5000;
const ROOM_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NameStoreState = ReturnType<typeof useNameStore.getState>;

interface ActiveRoom {
  id: string;
  version: number;
  /** Store snapshot at the last save or apply. Never built from a server payload: jsonb reorders keys. */
  syncedFingerprint: string;
  channel: RoomChannel;
  unsubscribeStore: () => void;
  saveTimer?: ReturnType<typeof setTimeout>;
  isSaving: boolean;
  hasPendingSave: boolean;
}

let activeRoom: ActiveRoom | null = null;
let isApplyingRemote = false;

export const isRoomSyncAvailable = supabase !== null;

function buildRoomData(lists: NameList[], history: SelectionRecord[], roomId: string): RoomData {
  const roomLists = lists.filter((list) => list.roomId === roomId);
  const roomListIds = new Set(roomLists.map((list) => list.id));
  return {
    lists: roomLists,
    history: history.filter((record) => roomListIds.has(record.listId)),
  };
}

function snapshotRoom(roomId: string): RoomData {
  const { lists, history } = useNameStore.getState();
  return buildRoomData(lists, history, roomId);
}

function fingerprintRoom(roomId: string): string {
  return JSON.stringify(snapshotRoom(roomId));
}

function applyRoomData(
  room: ActiveRoom,
  data: RoomData,
  options: { announce: boolean; focus: boolean }
) {
  const { lists, history, activeListId } = useNameStore.getState();
  const remoteLists: NameList[] = data.lists.map((list) => ({ ...list, roomId: room.id }));
  const remoteListIds = new Set(remoteLists.map((list) => list.id));
  // A local copy of a room list (left the room, then rejoined) needs its own id: store actions act on the first id match
  const renamedListIds = new Map(
    lists
      .filter((list) => list.roomId !== room.id && remoteListIds.has(list.id))
      .map((list) => [list.id, crypto.randomUUID()])
  );
  // One room per device: lists of a previous room stay here as plain local lists
  const localLists = lists
    .filter((list) => list.roomId !== room.id)
    .map((list) => ({
      ...list,
      id: renamedListIds.get(list.id) ?? list.id,
      roomId: undefined,
    }));
  const localHistory = history.map((record) => {
    const renamedListId = renamedListIds.get(record.listId);
    return renamedListId ? { ...record, id: crypto.randomUUID(), listId: renamedListId } : record;
  });
  const replacedListIds = new Set(
    [...lists.filter((list) => list.roomId === room.id), ...remoteLists].map((list) => list.id)
  );
  const knownRecordIds = new Set(history.map((record) => record.id));
  const nextHistory = [
    ...localHistory.filter((record) => !replacedListIds.has(record.listId)),
    ...data.history,
  ].sort(
    (first, second) => new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime()
  );
  const nextLists = [...localLists, ...remoteLists];
  const isActiveListKept = nextLists.some((list) => list.id === activeListId);
  const fallbackListId = nextLists[0]?.id ?? null;

  isApplyingRemote = true;
  try {
    useNameStore.setState({
      lists: nextLists,
      history: nextHistory,
      activeListId:
        options.focus && remoteLists[0]
          ? remoteLists[0].id
          : isActiveListKept
            ? activeListId
            : fallbackListId,
    });
  } finally {
    isApplyingRemote = false;
  }
  room.syncedFingerprint = fingerprintRoom(room.id);

  if (options.announce) {
    const latestNewRecord = data.history.filter((record) => !knownRecordIds.has(record.id)).at(-1);
    const selectedName = remoteLists
      .flatMap((list) => list.names)
      .find((name) => name.id === latestNewRecord?.nameId);
    // The toast expects the name as it was before the pick; synced data already counts it
    if (selectedName) {
      showSelectionToast({
        ...selectedName,
        selectionCount: Math.max(0, selectedName.selectionCount - 1),
      });
    }
  }
}

async function pullRoom(room: ActiveRoom, announce: boolean) {
  try {
    const latest = await getRoom(room.id);
    if (activeRoom !== room || !latest || latest.version <= room.version) return;
    room.version = latest.version;
    applyRoomData(room, latest.data, { announce, focus: false });
  } catch (error) {
    console.warn('[room] pull failed', error);
  }
}

/** Pull first so a stale local copy cannot overwrite newer data, then push any unsaved edit. */
async function catchUp(room: ActiveRoom) {
  await pullRoom(room, false);
  await saveRoomNow(room);
}

async function saveRoomNow(room: ActiveRoom) {
  // A queued save of a room this device left would push an empty snapshot and wipe it
  if (activeRoom !== room) return;
  if (room.isSaving) {
    room.hasPendingSave = true;
    return;
  }
  const data = snapshotRoom(room.id);
  const nextFingerprint = JSON.stringify(data);
  if (nextFingerprint === room.syncedFingerprint) return;

  room.isSaving = true;
  try {
    const saved = await saveRoom(room.id, data, room.version);
    if (activeRoom !== room) return;
    if (saved) {
      // A pull may have applied a newer version while this save was in flight
      if (saved.version > room.version) {
        room.version = saved.version;
        room.syncedFingerprint = nextFingerprint;
      }
      room.channel.announceSave(saved.version);
    } else {
      // ponytail: stale version means another device saved first; its data wins and this edit drops. Merge per list if that bites.
      await pullRoom(room, true);
    }
  } catch (error) {
    console.warn('[room] save failed', error);
    // ponytail: fixed interval, so an offline device retries every 5s; add backoff if that shows up in logs
    room.saveTimer = setTimeout(() => void saveRoomNow(room), SAVE_RETRY_MS);
  } finally {
    room.isSaving = false;
    if (room.hasPendingSave) {
      room.hasPendingSave = false;
      void saveRoomNow(room);
    }
  }
}

function handleStoreChange(state: NameStoreState, previous: NameStoreState) {
  const room = activeRoom;
  if (!room || isApplyingRemote) return;

  const previousListIds = new Set(previous.lists.map((list) => list.id));
  const isNewLocalList = (list: NameList) => !list.roomId && !previousListIds.has(list.id);
  if (state.lists.some(isNewLocalList)) {
    // Re-enters this handler, which then schedules the save
    useNameStore.setState({
      lists: state.lists.map((list) =>
        isNewLocalList(list) ? { ...list, roomId: room.id } : list
      ),
    });
    return;
  }

  scheduleSave(room);
}

function scheduleSave(room: ActiveRoom) {
  clearTimeout(room.saveTimer);
  room.saveTimer = setTimeout(() => void saveRoomNow(room), SAVE_DEBOUNCE_MS);
}

function startRoom(roomId: string, version: number): ActiveRoom {
  const room: ActiveRoom = {
    id: roomId,
    version,
    syncedFingerprint: fingerprintRoom(roomId),
    isSaving: false,
    hasPendingSave: false,
    channel: openRoomChannel(roomId, {
      onSaved: (savedVersion) => {
        if (savedVersion > room.version) void pullRoom(room, true);
      },
      onSubscribed: () => void catchUp(room),
    }),
    unsubscribeStore: useNameStore.subscribe(handleStoreChange),
  };
  activeRoom = room;
  useRoomStore.setState({ activeRoomId: roomId });
  window.history.replaceState(null, '', `#${roomId}`);
  return room;
}

async function joinRoom(roomId: string, focus: boolean) {
  const room = startRoom(roomId, 0);
  try {
    const latest = await getRoom(roomId);
    if (activeRoom !== room) return;
    if (!latest) {
      console.warn('[room] not found', roomId);
      stopRoomSync();
      return;
    }
    // A catch-up pull may have applied a newer version first; an equal one re-applies the same data
    if (latest.version < room.version) return;
    room.version = latest.version;
    applyRoomData(room, latest.data, { announce: false, focus });
  } catch (error) {
    console.warn('[room] join failed', error);
  }
}

export function stopRoomSync() {
  if (!activeRoom) return;
  clearTimeout(activeRoom.saveTimer);
  activeRoom.channel.close();
  activeRoom.unsubscribeStore();
  activeRoom = null;
  useRoomStore.setState({ activeRoomId: null });
}

/** Moves every current list into a new room and returns its id. */
export async function shareRoom(): Promise<string> {
  if (activeRoom) return activeRoom.id;
  const { lists, history } = useNameStore.getState();
  const created = await createRoom({ lists, history });
  useNameStore.setState({
    lists: useNameStore.getState().lists.map((list) => ({ ...list, roomId: created.id })),
  });
  const room = startRoom(created.id, created.version);
  // The server holds the snapshot sent above; edits made while createRoom ran still need a save
  const sentLists = lists.map((list) => ({ ...list, roomId: created.id }));
  room.syncedFingerprint = JSON.stringify(buildRoomData(sentLists, history, created.id));
  scheduleSave(room);
  return created.id;
}

/** Runs once, from roomSyncLoader. */
export function initRoomSync(): () => void {
  if (!isRoomSyncAvailable) return () => {};

  const joinFromHash = () => {
    const hashRoomId = window.location.hash.slice(1);
    if (!ROOM_ID_PATTERN.test(hashRoomId) || hashRoomId === activeRoom?.id) return false;
    stopRoomSync();
    void joinRoom(hashRoomId, true);
    return true;
  };
  const catchUpWhenVisible = () => {
    if (document.visibilityState === 'visible' && activeRoom) void catchUp(activeRoom);
  };

  window.addEventListener('hashchange', joinFromHash);
  document.addEventListener('visibilitychange', catchUpWhenVisible);

  if (!joinFromHash()) {
    const cachedRoomId = useNameStore.getState().lists.find((list) => list.roomId)?.roomId;
    if (cachedRoomId) void joinRoom(cachedRoomId, false);
  }

  return () => {
    window.removeEventListener('hashchange', joinFromHash);
    document.removeEventListener('visibilitychange', catchUpWhenVisible);
    stopRoomSync();
  };
}
