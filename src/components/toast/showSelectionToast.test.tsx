import { toast } from 'sonner';
import type { Name } from '../../types/name';
import { showSelectionToast } from './showSelectionToast';

vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('showSelectionToast', () => {
  const mockName: Name = {
    id: 'test-id',
    value: 'Test Name',
    weight: 1,
    createdAt: new Date('2025-12-15T10:00:00'),
    lastSelectedAt: null,
    selectionCount: 2,
    isExcluded: false,
    categoryId: null,
  };

  it('calls toast.custom with correct parameters', () => {
    showSelectionToast(mockName);

    expect(toast.custom).toHaveBeenCalledTimes(1);
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        duration: 5000,
        id: expect.stringMatching(/^selection-test-id-\d+$/),
      })
    );
  });

  it('generates unique toast IDs for the same name', () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Set initial time
    vi.setSystemTime(new Date('2025-12-15T10:00:00.000Z'));
    showSelectionToast(mockName);

    // Advance time by 1ms
    vi.advanceTimersByTime(1);
    showSelectionToast(mockName);

    expect(toast.custom).toHaveBeenCalledTimes(2);

    const firstCall = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[0][1];
    const secondCall = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[1][1];

    expect(firstCall.id).not.toBe(secondCall.id);

    vi.useRealTimers();
  });

  it('uses name ID in the toast ID', () => {
    showSelectionToast(mockName);

    const callArgs = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.id).toContain('selection-test-id');
  });
});
