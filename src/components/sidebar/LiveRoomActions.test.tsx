import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import { LiveRoomActions } from './LiveRoomActions';

const ROOM_ID = '11111111-2222-4333-8444-555555555555';

const mocks = vi.hoisted(() => ({
  isConfigured: true,
  shareRoom: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock('../../lib/roomSyncLoader', () => ({
  get isRoomSyncConfigured() {
    return mocks.isConfigured;
  },
  loadRoomSync: () => Promise.resolve({ shareRoom: mocks.shareRoom }),
}));

function moveListsIntoRoom() {
  useNameStore.setState({
    lists: useNameStore.getState().lists.map((list) => ({ ...list, roomId: ROOM_ID })),
  });
}

describe('LiveRoomActions', () => {
  const initialLists = useNameStore.getState().lists;

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.isConfigured = true;
    mocks.shareRoom.mockReset();
    mocks.writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mocks.writeText },
      configurable: true,
    });
    useNameStore.setState({ lists: initialLists });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders nothing when Supabase is not configured', () => {
    mocks.isConfigured = false;

    const { container } = render(<LiveRoomActions />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shares into a live room and copies the room link', async () => {
    mocks.shareRoom.mockImplementation(async () => {
      moveListsIntoRoom();
      return ROOM_ID;
    });
    render(<LiveRoomActions />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share live/i }));
    });

    expect(mocks.shareRoom).toHaveBeenCalledTimes(1);
    expect(mocks.writeText).toHaveBeenCalledWith(`${window.location.origin}/#${ROOM_ID}`);
    expect(screen.getByText(/LIVE ROOM/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('copies the link again from a live room and resets the label', async () => {
    moveListsIntoRoom();
    render(<LiveRoomActions />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    });
    expect(mocks.writeText).toHaveBeenCalledWith(`${window.location.origin}/#${ROOM_ID}`);
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
  });

  it('shows an error when the room cannot start', async () => {
    mocks.shareRoom.mockRejectedValue(new Error('offline'));
    render(<LiveRoomActions />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share live/i }));
    });

    expect(screen.getByText('Could not start the live room')).toBeInTheDocument();
    expect(mocks.writeText).not.toHaveBeenCalled();
  });

  it('shows an error when the clipboard rejects the link', async () => {
    moveListsIntoRoom();
    mocks.writeText.mockRejectedValue(new Error('denied'));
    render(<LiveRoomActions />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    });

    expect(
      screen.getByText('Could not copy the link. Copy it from the address bar.')
    ).toBeInTheDocument();
  });
});
