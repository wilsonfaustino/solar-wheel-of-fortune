import { render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import { CycleWidget } from './CycleWidget';

function seedCycle(cooldownWeeks = 2) {
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
                start: '2026-08-11',
                end: '2026-10-02',
                cooldownWeeks,
              },
              {
                id: 'c2',
                name: 'Cycle 2',
                start: '2026-10-05',
                end: '2026-11-06',
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
    vi.setSystemTime(new Date('2026-08-01T12:00:00Z'));
    seedCycle();
    const { container } = render(<CycleWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows week, percent and both countdowns during the build phase', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getByText('IN CYCLE')).toBeInTheDocument();
    expect(screen.getByText('WEEK 3')).toBeInTheDocument();
    expect(screen.getByText('TO COOLDOWN')).toBeInTheDocument();
    expect(screen.getByText('25 DAYS')).toBeInTheDocument();
    expect(screen.getByText('TO CYCLE END')).toBeInTheDocument();
    expect(screen.getByText('38 DAYS')).toBeInTheDocument();
  });

  it('shows the cooldown state and the next cycle countdown', () => {
    vi.setSystemTime(new Date('2026-09-30T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getByText('COOLDOWN')).toBeInTheDocument();
    expect(screen.getByText('DAY 12')).toBeInTheDocument();
    expect(screen.getByText('COOLDOWN LEFT')).toBeInTheDocument();
    expect(screen.getByText('STARTS IN 5 DAYS')).toBeInTheDocument();
  });
});
