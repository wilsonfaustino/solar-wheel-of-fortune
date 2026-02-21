import { render, screen } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import { describe, expect, it, vi } from 'vitest';
import type { Name } from '../../types/name';
import { RadialWheel } from './RadialWheel';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: vi.fn().mockReturnValue(null),
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
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<RadialWheel names={MOCK_NAMES} onSelect={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should use spring transition when reduced motion is not preferred', () => {
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
});
