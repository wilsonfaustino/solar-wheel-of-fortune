import { render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import { CycleWidget } from './CycleWidget';

function seedCycle(cooldownWeeks = 1) {
  const state = useNameStore.getState();
  const listId = state.activeListId as string;
  useNameStore.setState((current) => ({
    lists: current.lists.map((list) =>
      list.id === listId
        ? {
            ...list,
            cycles: [
              {
                id: 'c1',
                name: 'Cycle 1',
                start: '2026-01-12',
                end: '2026-02-13',
                cooldownWeeks,
              },
              {
                id: 'c2',
                name: 'Cycle 2',
                start: '2026-02-23',
                end: '2026-03-27',
                cooldownWeeks: 1,
              },
            ],
          }
        : list
    ),
  }));
}

describe('CycleWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    useNameStore.setState((current) => ({
      lists: current.lists.map((list) => ({ ...list, cycles: [] })),
    }));
  });

  it('renders nothing outside any cycle', () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    seedCycle();
    const { container } = render(<CycleWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows week, percent and both countdowns inside a cycle', () => {
    vi.setSystemTime(new Date('2026-01-26T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getByText('IN CYCLE')).toBeInTheDocument();
    expect(screen.getByText('WEEK 3')).toBeInTheDocument();
    expect(screen.getByText('TO CYCLE END')).toBeInTheDocument();
    expect(screen.getByText('18 DAYS')).toBeInTheDocument();
    expect(screen.getByText('25 DAYS')).toBeInTheDocument();
  });

  it('shows cooldown state and the next cycle countdown', () => {
    vi.setSystemTime(new Date('2026-02-18T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getByText('COOLDOWN')).toBeInTheDocument();
    expect(screen.getByText('DAY 5')).toBeInTheDocument();
    expect(screen.getByText('STARTS IN 5 DAYS')).toBeInTheDocument();
  });
});
