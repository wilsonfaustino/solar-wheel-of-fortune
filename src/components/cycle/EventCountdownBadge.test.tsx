import { render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import type { SpecialEvent } from '../../types/name';
import { EventCountdownBadge } from './EventCountdownBadge';

function seedEvents(events: SpecialEvent[]) {
  useNameStore.setState((current) => ({
    lists: current.lists.map((list) => ({ ...list, events })),
  }));
}

describe('EventCountdownBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    seedEvents([]);
  });

  it('renders nothing without upcoming events', () => {
    vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
    seedEvents([{ id: 'e1', name: 'Past', start: '2026-08-01', end: '2026-08-02' }]);

    const { container } = render(<EventCountdownBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it('counts down to the nearest upcoming event', () => {
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));
    seedEvents([{ id: 'e1', name: 'Launch Day', start: '2026-09-03', end: '2026-09-04' }]);

    render(<EventCountdownBadge />);

    expect(screen.getByText('NEXT EVENT')).toBeInTheDocument();
    expect(screen.getByText('LAUNCH DAY')).toBeInTheDocument();
    expect(screen.getByText('IN 2 DAYS')).toBeInTheDocument();
  });

  it('shows remaining days while an event is running', () => {
    vi.setSystemTime(new Date('2026-09-03T12:00:00Z'));
    seedEvents([{ id: 'e1', name: 'Launch Day', start: '2026-09-02', end: '2026-09-04' }]);

    render(<EventCountdownBadge />);

    expect(screen.getByText('HAPPENING NOW')).toBeInTheDocument();
    expect(screen.getByText('1 DAY LEFT')).toBeInTheDocument();
  });
});
