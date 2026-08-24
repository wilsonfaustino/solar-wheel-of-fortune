import { fireEvent, render, screen } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import { EventsPanel } from './EventsPanel';

function activeEvents() {
  const state = useNameStore.getState();
  return state.lists.find((list) => list.id === state.activeListId)?.events ?? [];
}

describe('EventsPanel', () => {
  afterEach(() => {
    useNameStore.setState((current) => ({
      lists: current.lists.map((list) => ({ ...list, events: [] })),
    }));
  });

  it('adds an event and lists it', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Launch Day' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.change(screen.getByLabelText('Event end date'), { target: { value: '2026-09-12' } });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    expect(activeEvents()).toHaveLength(1);
    expect(screen.getByText('Launch Day')).toBeInTheDocument();
    expect(screen.getByText('SEP 10 → SEP 12')).toBeInTheDocument();
  });

  it('defaults the end date to the start date', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    expect(activeEvents()[0].end).toBe('2026-09-10');
    expect(screen.getByText('SEP 10')).toBeInTheDocument();
  });

  it('rejects a submit without a start date', () => {
    render(<EventsPanel />);

    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    expect(screen.getByText('Start date is required')).toBeInTheDocument();
    expect(activeEvents()).toHaveLength(0);
  });

  it('deletes an event', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Demo' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Demo' }));

    expect(activeEvents()).toHaveLength(0);
    expect(screen.getByText('NO EVENTS YET')).toBeInTheDocument();
  });
});
