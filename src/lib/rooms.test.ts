const mocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    send: vi.fn(),
  };
  return {
    channel,
    rpc: vi.fn(),
    removeChannel: vi.fn(),
    isSupabaseConfigured: true,
  };
});

vi.mock('./supabase', () => ({
  get supabase() {
    return mocks.isSupabaseConfigured
      ? { rpc: mocks.rpc, channel: () => mocks.channel, removeChannel: mocks.removeChannel }
      : null;
  },
}));

import { createRoom, getRoom, openRoomChannel, saveRoom } from './rooms';

const EMPTY_DATA = { lists: [], history: [] };
const ROOM = { id: 'room-1', version: 1, data: EMPTY_DATA };

describe('rooms', () => {
  beforeEach(() => {
    mocks.isSupabaseConfigured = true;
    mocks.rpc.mockReset();
    mocks.channel.on.mockReset().mockReturnValue(mocks.channel);
    mocks.channel.subscribe.mockReset().mockReturnValue(mocks.channel);
    mocks.channel.send.mockReset().mockResolvedValue('ok');
    mocks.removeChannel.mockReset().mockResolvedValue('ok');
  });

  it('creates a room and returns its row', async () => {
    mocks.rpc.mockResolvedValue({ data: [ROOM], error: null });

    await expect(createRoom(EMPTY_DATA)).resolves.toEqual(ROOM);
    expect(mocks.rpc).toHaveBeenCalledWith('create_room', { room_data: EMPTY_DATA });
  });

  it('throws when create_room returns no row', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });

    await expect(createRoom(EMPTY_DATA)).rejects.toThrow('create_room returned no row');
  });

  it('returns null for an unknown room', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });

    await expect(getRoom('missing')).resolves.toBeNull();
    expect(mocks.rpc).toHaveBeenCalledWith('get_room', { room_id: 'missing' });
  });

  it('saves with the base version', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ ...ROOM, version: 2 }], error: null });

    await expect(saveRoom('room-1', EMPTY_DATA, 1)).resolves.toMatchObject({ version: 2 });
    expect(mocks.rpc).toHaveBeenCalledWith('save_room', {
      room_id: 'room-1',
      room_data: EMPTY_DATA,
      base_version: 1,
    });
  });

  it('throws the rpc error', async () => {
    const rpcError = new Error('permission denied');
    mocks.rpc.mockResolvedValue({ data: null, error: rpcError });

    await expect(getRoom('room-1')).rejects.toBe(rpcError);
  });

  it('throws when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured = false;

    await expect(getRoom('room-1')).rejects.toThrow('Supabase is not configured');
  });

  it('forwards saved broadcasts and subscription status, announces and closes', () => {
    const onSaved = vi.fn();
    const onSubscribed = vi.fn();

    const roomChannel = openRoomChannel('room-1', { onSaved, onSubscribed });
    const broadcastListener = mocks.channel.on.mock.calls[0][2];
    const statusListener = mocks.channel.subscribe.mock.calls[0][0];
    broadcastListener({ payload: { version: 5 } });
    statusListener('CHANNEL_ERROR');
    statusListener('SUBSCRIBED');
    roomChannel.announceSave(6);
    roomChannel.close();

    expect(mocks.channel.on).toHaveBeenCalledWith(
      'broadcast',
      { event: 'saved' },
      expect.any(Function)
    );
    expect(onSaved).toHaveBeenCalledWith(5);
    expect(onSubscribed).toHaveBeenCalledTimes(1);
    expect(mocks.channel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'saved',
      payload: { version: 6 },
    });
    expect(mocks.removeChannel).toHaveBeenCalledWith(mocks.channel);
  });
});
