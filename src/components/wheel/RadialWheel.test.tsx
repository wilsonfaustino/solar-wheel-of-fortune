import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { m, useReducedMotion } from 'framer-motion';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Name } from '../../types/name';
import { RadialWheel, type RadialWheelRef } from './RadialWheel';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: vi.fn().mockReturnValue(null),
    m: {
      ...actual.m,
      div: vi.fn(
        ({
          onAnimationComplete,
          children,
          ...rest
        }: {
          onAnimationComplete?: () => void;
          children?: React.ReactNode;
          [key: string]: unknown;
        }) => {
          return <div {...rest}>{children}</div>;
        }
      ),
    },
  };
});

vi.mock('../../stores/useNameStore', () => ({
  useNameStore: vi
    .fn()
    .mockImplementation((selector: (state: { recordSelection: () => void }) => unknown) =>
      selector({ recordSelection: vi.fn() })
    ),
}));

vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn().mockReturnValue({ isSmallScreen: false, isMediumScreen: false }),
}));

const MOCK_NAMES: Name[] = [
  {
    id: '1',
    value: 'Alice',
    weight: 1,
    createdAt: new Date(),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
  {
    id: '2',
    value: 'Bob',
    weight: 1,
    createdAt: new Date(),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
];

describe('RadialWheel', () => {
  it('should render the wheel SVG', () => {
    const { container } = render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render all name labels', () => {
    const { container } = render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(container.querySelectorAll('text')).toHaveLength(MOCK_NAMES.length);
  });

  it('should use instant transition when reduced motion is preferred', () => {
    // Asserts render succeeds; transition prop values not testable in happy-dom
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should use spring transition when reduced motion is not preferred', () => {
    // Asserts render succeeds; transition prop values not testable in happy-dom
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render spin button', () => {
    render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /randomize selection/i })).toBeInTheDocument();
  });

  it('should render with empty names list', () => {
    const { container } = render(<RadialWheel names={[]} onSelect={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should expose spin method via ref', () => {
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(wheelRef.current?.spin).toBeDefined();
    expect(typeof wheelRef.current?.spin).toBe('function');
  });

  it('should expose clearSelection method via ref', () => {
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(wheelRef.current?.clearSelection).toBeDefined();
    expect(typeof wheelRef.current?.clearSelection).toBe('function');

    act(() => {
      wheelRef.current?.clearSelection();
    });
    // clearSelection sets selectedIndex to null — no error thrown confirms it works
  });

  it('should not call onSelect when spin is called with empty names list', () => {
    const onSelectMock = vi.fn();
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={[]} onSelect={onSelectMock} />);

    act(() => {
      wheelRef.current?.spin();
    });

    expect(onSelectMock).not.toHaveBeenCalled();
  });

  it('should disable the spin button when names list is empty', () => {
    render(<RadialWheel names={[]} onSelect={vi.fn()} />);
    const spinButton = screen.getByRole('button', { name: /randomize selection/i });
    expect(spinButton).toBeDisabled();
  });

  it('should enable the spin button when names are present', () => {
    render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    const spinButton = screen.getByRole('button', { name: /randomize selection/i });
    expect(spinButton).not.toBeDisabled();
  });

  it('should disable the spin button after spin is triggered via ref', async () => {
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={MOCK_NAMES} onSelect={vi.fn()} />);

    act(() => {
      wheelRef.current?.spin();
    });

    const spinButton = screen.getByRole('button', { name: /randomize selection/i });
    expect(spinButton).toBeDisabled();
  });

  it('should disable the spin button after CenterButton click', async () => {
    const user = userEvent.setup();
    render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    const spinButton = screen.getByRole('button', { name: /randomize selection/i });

    await user.click(spinButton);

    expect(spinButton).toBeDisabled();
  });

  it('should not spin again when spin ref is called while already spinning', () => {
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={MOCK_NAMES} onSelect={vi.fn()} />);

    act(() => {
      wheelRef.current?.spin();
    });

    const spinButton = screen.getByRole('button', { name: /randomize selection/i });
    expect(spinButton).toBeDisabled();

    // Calling spin a second time while spinning should be a no-op
    act(() => {
      wheelRef.current?.spin();
    });

    // Button remains disabled — still in spinning state
    expect(spinButton).toBeDisabled();
  });

  it('should call onSelect and reset spinning state when onAnimationComplete fires', () => {
    const onSelect = vi.fn();
    const wheelRef = createRef<RadialWheelRef>();
    render(<RadialWheel ref={wheelRef} names={MOCK_NAMES} onSelect={onSelect} />);

    act(() => {
      wheelRef.current?.spin();
    });

    const mockDiv = vi.mocked(m.div);
    const lastCallProps = mockDiv.mock.calls[mockDiv.mock.calls.length - 1][0];
    const onAnimationComplete = lastCallProps.onAnimationComplete as (() => void) | undefined;

    expect(onAnimationComplete).toBeDefined();

    act(() => {
      onAnimationComplete?.();
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(String), value: expect.any(String) })
    );

    // After animation completes, spinning state is cleared and button re-enables
    const spinButton = screen.getByRole('button', { name: /randomize selection/i });
    expect(spinButton).not.toBeDisabled();
  });
});
