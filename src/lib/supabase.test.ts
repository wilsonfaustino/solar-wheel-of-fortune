describe('supabase client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('is null when env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');

    const { supabase } = await import('./supabase');

    expect(supabase).toBeNull();
  });

  it('creates a client when env vars are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    // realtime-js needs a WebSocket constructor; browsers have one, the happy-dom test env does not
    vi.stubGlobal('WebSocket', class {});

    const { supabase } = await import('./supabase');

    expect(supabase).not.toBeNull();
  });
});
