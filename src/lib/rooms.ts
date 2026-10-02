import type { NameList, SelectionRecord } from '../types/name';
import { supabase } from './supabase';

export interface RoomData {
  lists: NameList[];
  history: SelectionRecord[];
}

export interface Room {
  id: string;
  data: RoomData;
  version: number;
}

export interface RoomChannel {
  announceSave: (version: number) => void;
  close: () => void;
}

function client() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

/** The room functions return a row set: an empty set means "not found" or "stale version". */
async function callRoomFunction(name: string, args: Record<string, unknown>): Promise<Room | null> {
  const { data, error } = await client().rpc(name, args);
  if (error) throw error;
  return (data as Room[])[0] ?? null;
}

export async function createRoom(data: RoomData): Promise<Room> {
  const room = await callRoomFunction('create_room', { room_data: data });
  if (!room) throw new Error('create_room returned no row');
  return room;
}

export function getRoom(roomId: string): Promise<Room | null> {
  return callRoomFunction('get_room', { room_id: roomId });
}

export function saveRoom(
  roomId: string,
  data: RoomData,
  baseVersion: number
): Promise<Room | null> {
  return callRoomFunction('save_room', {
    room_id: roomId,
    room_data: data,
    base_version: baseVersion,
  });
}

/**
 * Broadcast carries only the new version: Realtime caps message size, so receivers fetch
 * the room themselves. `onSubscribed` runs on every (re)join, because broadcasts are not replayed.
 */
export function openRoomChannel(
  roomId: string,
  handlers: { onSaved: (version: number) => void; onSubscribed: () => void }
): RoomChannel {
  const channel = client()
    .channel(`room:${roomId}`)
    .on('broadcast', { event: 'saved' }, ({ payload }) => handlers.onSaved(payload.version))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') handlers.onSubscribed();
    });

  return {
    announceSave: (version) => {
      void channel.send({ type: 'broadcast', event: 'saved', payload: { version } });
    },
    close: () => {
      void client().removeChannel(channel);
    },
  };
}
