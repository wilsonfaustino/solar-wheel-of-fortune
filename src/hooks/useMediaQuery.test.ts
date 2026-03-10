import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

type MediaQueryListener = () => void;

function createMatchMediaMock(matches: boolean) {
  const listeners: MediaQueryListener[] = [];
  return {
    matches,
    addEventListener: vi.fn((_event: string, listener: MediaQueryListener) => {
      listeners.push(listener);
    }),
    removeEventListener: vi.fn(),
    _triggerChange: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe('useMediaQuery', () => {
  let smallQueryMock: ReturnType<typeof createMatchMediaMock>;
  let mediumQueryMock: ReturnType<typeof createMatchMediaMock>;
  let largeQueryMock: ReturnType<typeof createMatchMediaMock>;

  function setupMatchMediaMock({ isSmall = false, isMedium = false, isLarge = true } = {}) {
    smallQueryMock = createMatchMediaMock(isSmall);
    mediumQueryMock = createMatchMediaMock(isMedium);
    largeQueryMock = createMatchMediaMock(isLarge);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return smallQueryMock;
        if (query === '(min-width: 640px) and (max-width: 1023px)') return mediumQueryMock;
        if (query === '(min-width: 1024px)') return largeQueryMock;
        return createMatchMediaMock(false);
      }),
    });
  }

  beforeEach(() => {
    setupMatchMediaMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns default large-screen state when no small or medium queries match', () => {
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isSmallScreen).toBe(false);
    expect(result.current.isMediumScreen).toBe(false);
    expect(result.current.isLargeScreen).toBe(true);
  });

  it('returns isSmallScreen true when small query matches on mount', () => {
    setupMatchMediaMock({ isSmall: true, isMedium: false, isLarge: false });

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isSmallScreen).toBe(true);
    expect(result.current.isMediumScreen).toBe(false);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('returns isMediumScreen true when medium query matches on mount', () => {
    setupMatchMediaMock({ isSmall: false, isMedium: true, isLarge: false });

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isSmallScreen).toBe(false);
    expect(result.current.isMediumScreen).toBe(true);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('updates isSmallScreen to true when small query change event fires', () => {
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isSmallScreen).toBe(false);

    smallQueryMock.matches = true;
    largeQueryMock.matches = false;

    act(() => {
      smallQueryMock._triggerChange();
    });

    expect(result.current.isSmallScreen).toBe(true);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('updates isMediumScreen to true when medium query change event fires', () => {
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMediumScreen).toBe(false);

    mediumQueryMock.matches = true;
    largeQueryMock.matches = false;

    act(() => {
      mediumQueryMock._triggerChange();
    });

    expect(result.current.isMediumScreen).toBe(true);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('adds event listeners for all three media queries on mount', () => {
    renderHook(() => useMediaQuery());

    expect(smallQueryMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mediumQueryMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(largeQueryMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes all event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery());

    unmount();

    expect(smallQueryMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mediumQueryMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
    expect(largeQueryMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
