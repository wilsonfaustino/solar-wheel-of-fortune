import { useNameStore } from '../stores/useNameStore';
import type * as RoomSync from './roomSync';

export const isRoomSyncConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

let roomSyncPromise: Promise<typeof RoomSync> | null = null;

/** supabase-js adds ~60 kB gzip, so it loads only for a room link, a cached room, or a share. */
export function loadRoomSync(): Promise<typeof RoomSync> {
  roomSyncPromise ??= import('./roomSync').then((roomSync) => {
    roomSync.initRoomSync();
    return roomSync;
  });
  return roomSyncPromise;
}

/** Runs once from main.tsx: outside React, so StrictMode cannot join a room twice. */
export function bootRoomSync() {
  if (!isRoomSyncConfigured) return;
  const hasCachedRoom = useNameStore.getState().lists.some((list) => list.roomId);
  if (window.location.hash.length > 1 || hasCachedRoom) {
    void loadRoomSync();
  } else {
    window.addEventListener('hashchange', () => void loadRoomSync(), { once: true });
  }
}
