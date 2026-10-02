const mocks = vi.hoisted(() => ({ initRoomSync: vi.fn() }));

vi.mock('./roomSync', () => ({ initRoomSync: mocks.initRoomSync }));

const ROOM_ID = '11111111-2222-4333-8444-555555555555';

async function loadLoader({ configured }: { configured: boolean }) {
  vi.stubEnv('VITE_SUPABASE_URL', configured ? 'https://example.supabase.co' : '');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', configured ? 'sb_publishable_test' : '');
  const { useNameStore } = await import('../stores/useNameStore');
  const loader = await import('./roomSyncLoader');
  return { useNameStore, ...loader };
}

async function flushDynamicImport() {
  await vi.dynamicImportSettled();
}

describe('roomSyncLoader', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.initRoomSync.mockReset();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never loads room sync when Supabase is not configured', async () => {
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { bootRoomSync, isRoomSyncConfigured } = await loadLoader({ configured: false });

    bootRoomSync();
    await flushDynamicImport();

    expect(isRoomSyncConfigured).toBe(false);
    expect(mocks.initRoomSync).not.toHaveBeenCalled();
  });

  it('loads room sync at boot for a room link', async () => {
    window.history.replaceState(null, '', `/#${ROOM_ID}`);
    const { bootRoomSync, loadRoomSync } = await loadLoader({ configured: true });

    bootRoomSync();
    await loadRoomSync();

    expect(mocks.initRoomSync).toHaveBeenCalledTimes(1);
  });

  it('loads room sync at boot for a cached room', async () => {
    const { useNameStore, bootRoomSync } = await loadLoader({ configured: true });
    useNameStore.setState({
      lists: useNameStore.getState().lists.map((list) => ({ ...list, roomId: ROOM_ID })),
    });

    bootRoomSync();
    await flushDynamicImport();

    expect(mocks.initRoomSync).toHaveBeenCalledTimes(1);
  });

  it('waits for a hash change before loading a local-only session', async () => {
    const { bootRoomSync } = await loadLoader({ configured: true });

    bootRoomSync();
    await flushDynamicImport();
    expect(mocks.initRoomSync).not.toHaveBeenCalled();

    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await flushDynamicImport();
    expect(mocks.initRoomSync).toHaveBeenCalledTimes(1);
  });
});
