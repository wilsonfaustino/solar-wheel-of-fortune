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

  it('edits an event through the form and persists the change', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Launch Day' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Edit Launch Day' }));

    expect(screen.getByLabelText('Event name')).toHaveValue('Launch Day');
    expect(screen.getByLabelText('Event start date')).toHaveValue('2026-09-10');

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Launch Week' } });
    fireEvent.change(screen.getByLabelText('Event end date'), { target: { value: '2026-09-14' } });
    fireEvent.click(screen.getByRole('button', { name: /save event/i }));

    const events = activeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('Launch Week');
    expect(events[0].end).toBe('2026-09-14');
    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Event name')).toHaveValue('');
  });

  it('keeps the event unchanged when an edit is cancelled', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Demo' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Edit Demo' }));
    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Discarded' } });
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(activeEvents()[0].name).toBe('Demo');
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Event name')).toHaveValue('');
  });

  it('leaves edit mode when the edited event is deleted', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Demo' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Edit Demo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Demo' }));

    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Event name')).toHaveValue('');
  });
  it('marks an event as a holiday when the holiday switch is on', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Independence' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-07' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /holiday/i }));
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    expect(activeEvents()[0].isHoliday).toBe(true);
  });

  it('loads and clears the holiday flag through the edit form', () => {
    render(<EventsPanel />);

    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Independence' } });
    fireEvent.change(screen.getByLabelText('Event start date'), {
      target: { value: '2026-09-07' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /holiday/i }));
    fireEvent.click(screen.getByRole('button', { name: /add event/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Edit Independence' }));
    expect(screen.getByRole('switch', { name: /holiday/i })).toBeChecked();

    fireEvent.click(screen.getByRole('switch', { name: /holiday/i }));
    fireEvent.click(screen.getByRole('button', { name: /save event/i }));

    expect(activeEvents()[0].isHoliday).toBe(false);
    expect(screen.getByRole('switch', { name: /holiday/i })).not.toBeChecked();
  });
});
