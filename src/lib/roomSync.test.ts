import type { NameList, SelectionRecord } from '../types/name';
import type { Room, RoomData } from './rooms';

const ROOM_ID = '11111111-2222-4333-8444-555555555555';
const OTHER_ROOM_ID = '99999999-2222-4333-8444-555555555555';

const mocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getRoom: vi.fn(),
  saveRoom: vi.fn(),
  openRoomChannel: vi.fn(),
  announceSave: vi.fn(),
  closeChannel: vi.fn(),
  showSelectionToast: vi.fn(),
  isSupabaseConfigured: true,
}));

vi.mock('./rooms', () => ({
  createRoom: mocks.createRoom,
  getRoom: mocks.getRoom,
  saveRoom: mocks.saveRoom,
  openRoomChannel: mocks.openRoomChannel,
}));
vi.mock('./supabase', () => ({
  get supabase() {
    return mocks.isSupabaseConfigured ? {} : null;
  },
}));
vi.mock('../components/toast', () => ({ showSelectionToast: mocks.showSelectionToast }));

let channelHandlers: { onSaved: (version: number) => void; onSubscribed: () => void };
let disposeRoomSync: (() => void) | undefined;

function buildRoomList(id: string, names: string[]): NameList {
  return {
    id,
    title: `List ${id}`,
    names: names.map((value) => ({
      id: `${id}-${value}`,
      value,
      weight: 1,
      createdAt: new Date('2026-01-01'),
      lastSelectedAt: null,
      selectionCount: 0,
      isExcluded: false,
      categoryId: null,
    })),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function buildRecord(
  id: string,
  listId: string,
  nameId: string,
  timestamp: string
): SelectionRecord {
  return {
    id,
    nameId,
    nameValue: nameId,
    listId,
    timestamp: new Date(timestamp),
    sessionId: '',
    spinDuration: 0,
  };
}

/** Round-trips like jsonb: dates become strings and key order is not kept. */
function asServerData(data: RoomData): RoomData {
  return JSON.parse(JSON.stringify(data), (_key, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).reverse())
      : value
  );
}

function serverRoom(version: number, data: RoomData): Room {
  return { id: ROOM_ID, version, data: asServerData(data) };
}

async function loadModules() {
  const store = await import('../stores/useNameStore');
  const sync = await import('./roomSync');
  return { useNameStore: store.useNameStore, ...sync };
}

describe('roomSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    mocks.isSupabaseConfigured = true;
    for (const mock of Object.values(mocks)) {
      if (typeof mock === 'function') mock.mockReset();
    }
    mocks.openRoomChannel.mockImplementation((_roomId, handlers) => {
      channelHandlers = handlers;
      return { announceSave: mocks.announceSave, close: mocks.closeChannel };
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    disposeRoomSync?.();
    disposeRoomSync = undefined;
    const { stopRoomSync } = await import('./roomSync');
    stopRoomSync();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured = false;
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { initRoomSync, isRoomSyncAvailable } = await loadModules();

    disposeRoomSync = initRoomSync();

    expect(isRoomSyncAvailable).toBe(false);
    expect(mocks.getRoom).not.toHaveBeenCalled();
  });

  it('shares every local list into a new room and puts the room id in the hash', async () => {
    const { useNameStore, shareRoom } = await loadModules();
    const localLists = useNameStore.getState().lists;
    mocks.createRoom.mockResolvedValue({ id: ROOM_ID, version: 1, data: {} });

    const roomId = await shareRoom();

    expect(roomId).toBe(ROOM_ID);
    expect(mocks.createRoom).toHaveBeenCalledWith({ lists: localLists, history: [] });
    expect(useNameStore.getState().lists.every((list) => list.roomId === ROOM_ID)).toBe(true);
    expect(window.location.hash).toBe(`#${ROOM_ID}`);
    expect(await shareRoom()).toBe(ROOM_ID);
    expect(mocks.createRoom).toHaveBeenCalledTimes(1);
  });

  it('saves a debounced snapshot after a local edit and announces the new version', async () => {
    const { useNameStore, shareRoom } = await loadModules();
    mocks.createRoom.mockResolvedValue({ id: ROOM_ID, version: 1, data: {} });
    await shareRoom();
    mocks.saveRoom.mockResolvedValue({ id: ROOM_ID, version: 2, data: {} });

    useNameStore.getState().addName('Zed');
    useNameStore.getState().addName('Ann');
    await vi.advanceTimersByTimeAsync(300);

    expect(mocks.saveRoom).toHaveBeenCalledTimes(1);
    const [, savedData, baseVersion] = mocks.saveRoom.mock.calls[0];
    expect(baseVersion).toBe(1);
    expect(savedData.lists[0].names.map((name: { value: string }) => name.value)).toContain('ANN');
    expect(mocks.announceSave).toHaveBeenCalledWith(2);
  });

  it('joins a room from the hash next to local lists without a toast', async () => {
    const roomList = buildRoomList('room-list', ['Ana', 'Bo']);
    const record = buildRecord('r1', 'room-list', 'room-list-Ana', '2026-01-02');
    mocks.getRoom.mockResolvedValue(serverRoom(3, { lists: [roomList], history: [record] }));
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();
    const localListId = useNameStore.getState().lists[0].id;

    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    const state = useNameStore.getState();
    expect(state.lists.map((list) => [list.id, list.roomId])).toEqual([
      [localListId, undefined],
      ['room-list', ROOM_ID],
    ]);
    expect(state.activeListId).toBe('room-list');
    expect(state.history.map((entry) => entry.id)).toEqual(['r1']);
    expect(mocks.showSelectionToast).not.toHaveBeenCalled();
  });

  it('keeps local lists out of the saved snapshot', async () => {
    const roomList = buildRoomList('room-list', ['Ana']);
    mocks.getRoom.mockResolvedValue(serverRoom(1, { lists: [roomList], history: [] }));
    mocks.saveRoom.mockResolvedValue({ id: ROOM_ID, version: 2, data: {} });
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    useNameStore.getState().addName('Cy');
    await vi.advanceTimersByTimeAsync(300);

    const [, savedData] = mocks.saveRoom.mock.calls[0];
    expect(savedData.lists.map((list: NameList) => list.id)).toEqual(['room-list']);
  });

  it('applies a remote save, toasts the new selection, and does not save it back', async () => {
    const roomList = buildRoomList('room-list', ['Ana', 'Bo']);
    mocks.getRoom.mockResolvedValueOnce(serverRoom(1, { lists: [roomList], history: [] }));
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    const record = buildRecord('r2', 'room-list', 'room-list-Bo', '2026-01-03');
    const pickedList = {
      ...roomList,
      names: roomList.names.map((name) =>
        name.id === 'room-list-Bo' ? { ...name, selectionCount: 3 } : name
      ),
    };
    mocks.getRoom.mockResolvedValueOnce(serverRoom(2, { lists: [pickedList], history: [record] }));
    channelHandlers.onSaved(2);
    await vi.advanceTimersByTimeAsync(1000);

    expect(useNameStore.getState().history.map((entry) => entry.id)).toEqual(['r2']);
    expect(mocks.showSelectionToast).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'room-list-Bo', selectionCount: 2 })
    );
    expect(mocks.saveRoom).not.toHaveBeenCalled();
  });

  it('ignores a broadcast for a version it already has', async () => {
    mocks.getRoom.mockResolvedValue(serverRoom(2, { lists: [], history: [] }));
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    channelHandlers.onSaved(2);
    channelHandlers.onSubscribed();
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.getRoom).toHaveBeenCalledTimes(2);
  });

  it('pulls the remote room when its save is stale', async () => {
    const roomList = buildRoomList('room-list', ['Ana']);
    const remoteList = buildRoomList('room-list', ['Ana', 'Remote']);
    mocks.getRoom.mockResolvedValueOnce(serverRoom(1, { lists: [roomList], history: [] }));
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);
    mocks.saveRoom.mockResolvedValue(null);
    mocks.getRoom.mockResolvedValueOnce(serverRoom(2, { lists: [remoteList], history: [] }));

    useNameStore.getState().addName('Local');
    await vi.advanceTimersByTimeAsync(300);

    const names = useNameStore.getState().lists[1].names.map((name) => name.value);
    expect(names).toEqual(['Ana', 'Remote']);
  });

  it('drops a queued save of a room this device left', async () => {
    const { useNameStore, initRoomSync, shareRoom } = await loadModules();
    disposeRoomSync = initRoomSync();
    mocks.createRoom.mockResolvedValue({ id: ROOM_ID, version: 1, data: {} });
    await shareRoom();
    let resolveFirstSave: (room: Room) => void = () => {};
    mocks.saveRoom.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirstSave = resolve;
      })
    );
    useNameStore.getState().addName('First');
    await vi.advanceTimersByTimeAsync(300);
    useNameStore.getState().addName('Second');
    await vi.advanceTimersByTimeAsync(300);

    mocks.getRoom.mockResolvedValue({
      id: OTHER_ROOM_ID,
      version: 1,
      data: { lists: [], history: [] },
    });
    window.history.replaceState(null, '', `/#${OTHER_ROOM_ID}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await vi.advanceTimersByTimeAsync(0);
    resolveFirstSave({ id: ROOM_ID, version: 2, data: { lists: [], history: [] } });
    await vi.advanceTimersByTimeAsync(300);

    expect(mocks.saveRoom).toHaveBeenCalledTimes(1);
  });

  it('puts a list created while in a room into that room', async () => {
    const { useNameStore, shareRoom } = await loadModules();
    mocks.createRoom.mockResolvedValue({ id: ROOM_ID, version: 1, data: {} });
    mocks.saveRoom.mockResolvedValue({ id: ROOM_ID, version: 2, data: {} });
    await shareRoom();

    useNameStore.getState().createList('Fresh');
    await vi.advanceTimersByTimeAsync(300);

    const freshList = useNameStore.getState().lists.find((list) => list.title === 'Fresh');
    expect(freshList?.roomId).toBe(ROOM_ID);
    const [, savedData] = mocks.saveRoom.mock.calls[0];
    expect(savedData.lists.map((list: NameList) => list.title)).toContain('Fresh');
  });

  it('rejoins the cached room on boot without a hash', async () => {
    const { useNameStore } = await loadModules();
    const cachedList = { ...buildRoomList('room-list', ['Ana']), roomId: ROOM_ID };
    useNameStore.setState({ lists: [cachedList], activeListId: 'room-list' });
    mocks.getRoom.mockResolvedValue(serverRoom(4, { lists: [cachedList], history: [] }));
    const { initRoomSync } = await import('./roomSync');

    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.getRoom).toHaveBeenCalledWith(ROOM_ID);
    expect(window.location.hash).toBe(`#${ROOM_ID}`);
  });

  it('keeps lists of a previous room as local lists when joining another room', async () => {
    const { useNameStore } = await loadModules();
    const oldRoomList = { ...buildRoomList('old-list', ['Ana']), roomId: OTHER_ROOM_ID };
    useNameStore.setState({ lists: [oldRoomList], activeListId: 'old-list' });
    mocks.getRoom.mockResolvedValue(
      serverRoom(1, { lists: [buildRoomList('new-list', ['Bo'])], history: [] })
    );
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { initRoomSync } = await import('./roomSync');

    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    expect(useNameStore.getState().lists.map((list) => [list.id, list.roomId])).toEqual([
      ['old-list', undefined],
      ['new-list', ROOM_ID],
    ]);
  });

  it('gives a local copy a new id when it collides with a rejoined room list', async () => {
    const { useNameStore } = await loadModules();
    const detachedCopy = buildRoomList('room-list', ['Ana']);
    const localRecord = buildRecord('local-r1', 'room-list', 'room-list-Ana', '2026-01-02');
    useNameStore.setState({
      lists: [detachedCopy],
      activeListId: 'room-list',
      history: [localRecord],
    });
    const roomRecord = buildRecord('room-r1', 'room-list', 'room-list-Ana', '2026-01-03');
    mocks.getRoom.mockResolvedValue(
      serverRoom(1, { lists: [buildRoomList('room-list', ['Ana', 'Bo'])], history: [roomRecord] })
    );
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { initRoomSync } = await import('./roomSync');

    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    const { lists, history, activeListId } = useNameStore.getState();
    const localCopy = lists.find((list) => !list.roomId);
    expect(localCopy?.id).not.toBe('room-list');
    expect(lists.find((list) => list.roomId === ROOM_ID)?.id).toBe('room-list');
    expect(activeListId).toBe('room-list');
    expect(history.find((record) => record.listId === localCopy?.id)?.nameValue).toBe(
      'room-list-Ana'
    );
    expect(history.filter((record) => record.listId === 'room-list').map((r) => r.id)).toEqual([
      'room-r1',
    ]);
    expect(new Set(history.map((record) => record.id)).size).toBe(history.length);
  });

  it('ignores a join response older than a version already applied', async () => {
    let resolveJoin: (room: Room) => void = () => {};
    mocks.getRoom
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveJoin = resolve;
        })
      )
      .mockResolvedValueOnce(
        serverRoom(2, { lists: [buildRoomList('room-list', ['New'])], history: [] })
      );
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();

    disposeRoomSync = initRoomSync();
    channelHandlers.onSubscribed();
    await vi.advanceTimersByTimeAsync(0);
    resolveJoin(serverRoom(1, { lists: [buildRoomList('room-list', ['Old'])], history: [] }));
    await vi.advanceTimersByTimeAsync(0);

    const roomList = useNameStore.getState().lists.find((list) => list.roomId === ROOM_ID);
    expect(roomList?.names.map((name) => name.value)).toEqual(['New']);
  });

  it('keeps a newer pulled version when an older save response arrives late', async () => {
    mocks.getRoom.mockResolvedValueOnce(
      serverRoom(1, { lists: [buildRoomList('room-list', ['Ana'])], history: [] })
    );
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);
    let resolveSave: (room: Room) => void = () => {};
    mocks.saveRoom.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );

    useNameStore.getState().addName('Mine');
    await vi.advanceTimersByTimeAsync(300);
    mocks.getRoom.mockResolvedValueOnce(
      serverRoom(3, { lists: [buildRoomList('room-list', ['Ana', 'MINE', 'Theirs'])], history: [] })
    );
    channelHandlers.onSaved(3);
    await vi.advanceTimersByTimeAsync(0);
    resolveSave({ id: ROOM_ID, version: 2, data: { lists: [], history: [] } });
    await vi.advanceTimersByTimeAsync(0);
    mocks.saveRoom.mockResolvedValue({ id: ROOM_ID, version: 4, data: { lists: [], history: [] } });
    useNameStore.getState().addName('Next');
    await vi.advanceTimersByTimeAsync(300);

    expect(mocks.saveRoom).toHaveBeenLastCalledWith(ROOM_ID, expect.anything(), 3);
  });

  it('stops syncing when the room does not exist', async () => {
    mocks.getRoom.mockResolvedValue(null);
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { useNameStore, initRoomSync } = await loadModules();

    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);
    useNameStore.getState().addName('Nobody');
    await vi.advanceTimersByTimeAsync(300);

    expect(mocks.closeChannel).toHaveBeenCalled();
    expect(mocks.saveRoom).not.toHaveBeenCalled();
  });

  it('switches rooms when the hash changes', async () => {
    mocks.getRoom.mockResolvedValue(serverRoom(1, { lists: [], history: [] }));
    const { initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();

    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.openRoomChannel).toHaveBeenCalledTimes(1);
    expect(mocks.openRoomChannel).toHaveBeenCalledWith(ROOM_ID, expect.anything());
  });

  it('catches up when the tab becomes visible', async () => {
    mocks.getRoom.mockResolvedValue(serverRoom(1, { lists: [], history: [] }));
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { initRoomSync } = await loadModules();
    disposeRoomSync = initRoomSync();
    await vi.advanceTimersByTimeAsync(0);

    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.getRoom).toHaveBeenCalledTimes(2);
  });

  it('logs and keeps running when a save or pull fails', async () => {
    const { useNameStore, shareRoom } = await loadModules();
    mocks.createRoom.mockResolvedValue({ id: ROOM_ID, version: 1, data: {} });
    await shareRoom();
    mocks.saveRoom.mockRejectedValue(new Error('offline'));
    mocks.getRoom.mockRejectedValue(new Error('offline'));

    useNameStore.getState().addName('Offline');
    await vi.advanceTimersByTimeAsync(300);
    channelHandlers.onSubscribed();
    await vi.advanceTimersByTimeAsync(0);

    expect(console.warn).toHaveBeenCalledWith('[room] save failed', expect.any(Error));
    expect(console.warn).toHaveBeenCalledWith('[room] pull failed', expect.any(Error));
  });
});
