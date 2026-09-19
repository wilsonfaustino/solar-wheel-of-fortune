import { render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import { CycleWidget } from './CycleWidget';

function seedCycle(cooldownWeeks = 2, end = '2026-10-02') {
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
                end,
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
      lists: current.lists.map((list) => ({ ...list, cycles: [], events: [] })),
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

  it('splits the bar into one gapped block per week', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getAllByTestId('cycle-week-block')).toHaveLength(8);
    expect(screen.getAllByTestId('cycle-week-label').map((label) => label.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
    ]);
  });

  it('keeps a whole-week cooldown on its own blocks', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    // 10 cooldown weekdays land on exactly the last two calendar weeks, so nothing is split.
    const blocks = screen.getAllByTestId('cycle-week-block');
    expect(blocks.map((block) => block.children.length)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('cuts a mid-week cooldown boundary inside the block it falls in', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    // Ending on a Wednesday puts the cooldown start on the Thursday before, mid calendar week.
    seedCycle(1, '2026-09-30');
    render(<CycleWidget />);

    const blocks = screen.getAllByTestId('cycle-week-block');
    expect(blocks[6].children).toHaveLength(2);
    expect(blocks[7].children).toHaveLength(1);
  });

  it('counts elapsed weekdays rather than calendar days', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    seedCycle();
    render(<CycleWidget />);

    expect(screen.getByTestId('cycle-weekday-count')).toHaveTextContent('11 / 39');
  });

  it('holds the weekday count steady across a weekend', () => {
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'));
    seedCycle();
    const { unmount } = render(<CycleWidget />);
    expect(screen.getByTestId('cycle-weekday-count')).toHaveTextContent('9 / 39');
    unmount();

    vi.setSystemTime(new Date('2026-08-23T12:00:00Z'));
    render(<CycleWidget />);
    expect(screen.getByTestId('cycle-weekday-count')).toHaveTextContent('9 / 39');
  });

  it('renders a band for each event overlapping the active cycle', () => {
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    seedCycle();
    useNameStore.setState((current) => ({
      lists: current.lists.map((list) => ({
        ...list,
        events: [
          { id: 'e1', name: 'Launch Day', start: '2026-09-01', end: '2026-09-03' },
          { id: 'e2', name: 'Off cycle', start: '2027-01-01', end: '2027-01-02' },
        ],
      })),
    }));

    render(<CycleWidget />);

    const bands = screen.getAllByTestId('cycle-event-band');
    expect(bands).toHaveLength(1);
    expect(bands[0]).toHaveAttribute('title', 'Launch Day · 2026-09-01 → 2026-09-03');
  });
  it('grays out a holiday band and keeps a normal event accented', () => {
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));
    seedCycle();
    useNameStore.setState((current) => ({
      lists: current.lists.map((list) => ({
        ...list,
        events: [
          { id: 'e1', name: 'Launch Day', start: '2026-09-01', end: '2026-09-03' },
          {
            id: 'e2',
            name: 'Independence',
            start: '2026-09-07',
            end: '2026-09-07',
            isHoliday: true,
          },
        ],
      })),
    }));

    render(<CycleWidget />);

    const [launch, holiday] = screen.getAllByTestId('cycle-event-band');
    expect(launch).toHaveAttribute('data-holiday', 'false');
    expect(launch.className).toContain('border-accent');
    expect(holiday).toHaveAttribute('data-holiday', 'true');
    expect(holiday.className).toContain('border-dashed');
  });
});
