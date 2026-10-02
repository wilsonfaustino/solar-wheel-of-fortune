import { act, fireEvent, render, screen } from '@testing-library/react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { MemorialBanner } from './MemorialBanner';

describe('MemorialBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-02T12:00:00Z'));
    useSettingsStore.setState({ memorialBannerEnabled: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the days elapsed since ClaudeCode was lost', () => {
    render(<MemorialBanner />);

    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('WITHOUT CLAUDECODE')).toBeInTheDocument();
    expect(screen.getByText('SINCE 2026-09-30')).toBeInTheDocument();
  });

  it('moves the counter forward at local midnight', () => {
    vi.setSystemTime(new Date(2026, 9, 2, 23, 59));
    render(<MemorialBanner />);
    expect(screen.getByText('02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('03')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    });

    expect(screen.getByText('04')).toBeInTheDocument();
  });

  it('picks the mascot at random', () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation(
      <T extends ArrayBufferView | null>(target: T): T => {
        (target as unknown as Uint32Array)[0] = 1;
        return target;
      }
    );

    render(<MemorialBanner />);

    expect(screen.getByAltText('ClaudeCode mascot failed')).toBeInTheDocument();
  });

  it('renders nothing when the setting is off', () => {
    useSettingsStore.setState({ memorialBannerEnabled: false });

    const { container } = render(<MemorialBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('turns the setting off when dismissed', () => {
    render(<MemorialBanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss memorial banner' }));

    expect(useSettingsStore.getState().memorialBannerEnabled).toBe(false);
    expect(screen.queryByTestId('memorial-banner')).not.toBeInTheDocument();
  });
});
