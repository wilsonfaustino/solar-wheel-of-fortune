import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';
import { useNameStore } from './stores/useNameStore';
import { useSettingsStore } from './stores/useSettingsStore';
import type { Name } from './types/name';

// Mock components to isolate App logic
vi.mock('./components/sidebar', () => ({
  NameManagementSidebar: () => <div data-testid="sidebar">Sidebar</div>,
  MobileSidebar: () => <div data-testid="mobile-sidebar">Mobile Sidebar</div>,
}));

vi.mock('./components/wheel', () => ({
  RadialWheel: ({ onSelect }: { onSelect: (name: Name) => void }) => (
    <button
      type="button"
      data-testid="wheel"
      onClick={() =>
        onSelect({ id: 'name-1', value: 'Alice', isExcluded: false, selectionCount: 0 } as Name)
      }
    >
      Spin
    </button>
  ),
}));

vi.mock('./components/toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
  showSelectionToast: vi.fn(),
}));

vi.mock('./components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('./components/MobileHeader', () => ({
  MobileHeader: () => <div data-testid="mobile-header">Header</div>,
}));

vi.mock('./hooks', () => ({
  useKeyboardShortcuts: vi.fn(),
  useMediaQuery: () => ({
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: true,
  }),
}));

describe('App - Auto-Exclusion Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Reset store to default state
    const state = useNameStore.getState();
    const now = new Date();
    state.lists = [
      {
        id: 'default',
        title: 'Default List',
        names: [
          {
            id: 'name-1',
            value: 'Alice',
            isExcluded: false,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
          {
            id: 'name-2',
            value: 'Bob',
            isExcluded: false,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
          {
            id: 'name-3',
            value: 'Charlie',
            isExcluded: false,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
    state.activeListId = 'default';

    // Reset settings store to defaults
    const settingsState = useSettingsStore.getState();
    settingsState.autoExcludeEnabled = true;
    settingsState.clearSelectionAfterExclude = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('should auto-exclude name 2 seconds after selection', async () => {
    render(<App />);

    // Trigger selection by clicking wheel
    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Verify name not excluded immediately
    const state1 = useNameStore.getState();
    const name1 = state1.lists[0].names.find((n) => n.id === 'name-1');
    expect(name1?.isExcluded).toBe(false);

    // Fast-forward 2 seconds and run pending timers
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify name is now excluded
    const state2 = useNameStore.getState();
    const name2 = state2.lists[0].names.find((n) => n.id === 'name-1');
    expect(name2?.isExcluded).toBe(true);
  });

  test('should not auto-exclude before 2 seconds', async () => {
    render(<App />);

    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Fast-forward 1.5 seconds (not enough time)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Verify name still not excluded
    const state = useNameStore.getState();
    const name = state.lists[0].names.find((n) => n.id === 'name-1');
    expect(name?.isExcluded).toBe(false);
  });

  test('should NOT auto-exclude last remaining name', async () => {
    // Set up state with only 1 active name
    const state = useNameStore.getState();
    const now = new Date();
    state.lists = [
      {
        id: 'default',
        title: 'Default List',
        names: [
          {
            id: 'name-1',
            value: 'Alice',
            isExcluded: false,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
          {
            id: 'name-2',
            value: 'Bob',
            isExcluded: true,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
          {
            id: 'name-3',
            value: 'Charlie',
            isExcluded: true,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];

    render(<App />);

    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify last name NOT excluded
    const state2 = useNameStore.getState();
    const name2 = state2.lists[0].names.find((n) => n.id === 'name-1');
    expect(name2?.isExcluded).toBe(false);
  });

  test('should queue multiple exclusions independently', async () => {
    render(<App />);

    const wheelButton = screen.getByTestId('wheel');

    // First selection
    await act(async () => {
      wheelButton.click();
    });

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Second selection (same name clicked twice - timer should still work)
    await act(async () => {
      wheelButton.click();
    });

    // Advance another 1 second (total 2s for first, 1s for second)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // First timer should have fired, name should be excluded
    const state1 = useNameStore.getState();
    const name1 = state1.lists[0].names.find((n) => n.id === 'name-1');
    expect(name1?.isExcluded).toBe(true);

    // Second timer still pending (only 1s has passed for it)
    // Since name is already excluded, second timer should be a no-op
    // Verify selectionCount is 2 (clicked twice)
    expect(name1?.selectionCount).toBe(2);
  });

  test('should mark name as selected before scheduling exclusion', async () => {
    const markSelectedSpy = vi.spyOn(useNameStore.getState(), 'markSelected');

    render(<App />);

    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Verify markSelected called immediately
    expect(markSelectedSpy).toHaveBeenCalledWith('name-1');

    // Verify selectionCount updated
    const state = useNameStore.getState();
    const name = state.lists[0].names.find((n) => n.id === 'name-1');
    expect(name?.selectionCount).toBe(1);
  });

  test('should NOT auto-exclude when autoExcludeEnabled is false', async () => {
    // Disable auto-exclude setting
    useSettingsStore.getState().autoExcludeEnabled = false;

    render(<App />);

    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify name NOT excluded (setting is disabled)
    const state = useNameStore.getState();
    const name = state.lists[0].names.find((n) => n.id === 'name-1');
    expect(name?.isExcluded).toBe(false);

    // But selection should still be marked
    expect(name?.selectionCount).toBe(1);
  });

  test('should respect clearSelectionAfterExclude setting', async () => {
    // Enable clear selection setting
    useSettingsStore.getState().clearSelectionAfterExclude = true;

    render(<App />);

    const wheelButton = screen.getByTestId('wheel');
    await act(async () => {
      wheelButton.click();
    });

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify name is excluded
    const state = useNameStore.getState();
    const name = state.lists[0].names.find((n) => n.id === 'name-1');
    expect(name?.isExcluded).toBe(true);
  });
});

describe('App - Instruction Text Glitch Effect', () => {
  beforeEach(() => {
    // Reset store to default (cyan theme)
    const state = useNameStore.getState();
    const now = new Date();
    state.lists = [
      {
        id: 'default',
        title: 'Default List',
        names: [
          {
            id: 'name-1',
            value: 'Alice',
            isExcluded: false,
            selectionCount: 0,
            weight: 1,
            createdAt: now,
            lastSelectedAt: null,
            categoryId: null,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
    state.activeListId = 'default';
    state.currentTheme = 'cyan';
  });

  test('renders instruction text normally with cyan theme', () => {
    render(<App />);

    // With cyan theme (default), should have 1 plain text element
    const instructionElements = screen.queryAllByText('CLICK CENTER TO RANDOMIZE');
    expect(instructionElements.length).toBe(1);
    // No aria-hidden elements for non-matrix theme
    const hiddenElements = instructionElements.filter(
      (el) => el.getAttribute('aria-hidden') === 'true'
    );
    expect(hiddenElements.length).toBe(0);
  });

  test('renders instruction text normally with sunset theme', () => {
    useNameStore.setState({
      ...useNameStore.getState(),
      currentTheme: 'sunset',
    });

    render(<App />);

    // With sunset theme, should have 1 plain text element
    const instructionElements = screen.queryAllByText('CLICK CENTER TO RANDOMIZE');
    expect(instructionElements.length).toBe(1);
  });

  test('applies glitch effect with matrix theme', () => {
    useNameStore.setState({
      ...useNameStore.getState(),
      currentTheme: 'matrix',
    });

    render(<App />);

    // With GlitchText, there should be 3 spans: main + 2 glitch layers
    const instructionElements = screen.queryAllByText('CLICK CENTER TO RANDOMIZE');
    expect(instructionElements.length).toBe(3);

    // Check for aria-hidden glitch layers (2 out of 3 should be aria-hidden)
    const hiddenElements = instructionElements.filter(
      (el) => el.getAttribute('aria-hidden') === 'true'
    );
    expect(hiddenElements.length).toBe(2);

    // The first (visible) element should not be aria-hidden
    expect(instructionElements[0].getAttribute('aria-hidden')).toBeNull();
  });
});
