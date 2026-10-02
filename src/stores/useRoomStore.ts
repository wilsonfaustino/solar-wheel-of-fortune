import { create } from 'zustand';

/**
 * The room this device syncs with. Kept apart from the lists, because a room can have
 * no lists left and still be live. Not persisted: roomSync sets it after each (re)join.
 */
export const useRoomStore = create<{ activeRoomId: string | null }>(() => ({
  activeRoomId: null,
}));
