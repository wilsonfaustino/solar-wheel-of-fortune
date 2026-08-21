import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNameStore } from '../../stores/useNameStore';
import { CyclesPanel } from './CyclesPanel';

function getActiveCycles() {
  const state = useNameStore.getState();
  return state.lists.find((list) => list.id === state.activeListId)?.cycles ?? [];
}

function fillDates(start: string, end: string) {
  fireEvent.change(screen.getByLabelText('Cycle start date'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('Cycle end date'), { target: { value: end } });
}

describe('CyclesPanel', () => {
  afterEach(() => {
    useNameStore.setState((current) => ({
      lists: current.lists.map((list) => ({ ...list, cycles: [] })),
    }));
  });

  it('shows the empty state before any cycle exists', () => {
    render(<CyclesPanel />);
    expect(screen.getByText('NO CYCLES YET')).toBeInTheDocument();
  });

  it('adds a cycle and lists it with its derived cooldown range', async () => {
    const user = userEvent.setup();
    render(<CyclesPanel />);

    await user.type(screen.getByLabelText('Cycle name'), 'Cycle 2');
    fillDates('2026-08-11', '2026-10-02');
    await user.clear(screen.getByLabelText('COOLDOWN WEEKS'));
    await user.type(screen.getByLabelText('COOLDOWN WEEKS'), '2');
    await user.click(screen.getByRole('button', { name: /add cycle/i }));

    expect(screen.getByText('Cycle 2')).toBeInTheDocument();
    expect(screen.getByText('AUG 11 → OCT 2')).toBeInTheDocument();
    expect(screen.getByText('2W · SEP 19 → OCT 2')).toBeInTheDocument();
    expect(getActiveCycles()).toHaveLength(1);
  });

  it('falls back to a numbered name and reports no cooldown', async () => {
    const user = userEvent.setup();
    render(<CyclesPanel />);

    fillDates('2026-08-11', '2026-10-02');
    await user.clear(screen.getByLabelText('COOLDOWN WEEKS'));
    await user.type(screen.getByLabelText('COOLDOWN WEEKS'), '0');
    await user.click(screen.getByRole('button', { name: /add cycle/i }));

    expect(screen.getByText('Cycle 1')).toBeInTheDocument();
    expect(screen.getByText('NO COOLDOWN')).toBeInTheDocument();
  });

  it('rejects missing dates and an inverted range', async () => {
    const user = userEvent.setup();
    render(<CyclesPanel />);
    const submit = screen.getByRole('button', { name: /add cycle/i });

    await user.click(submit);
    expect(screen.getByText('Start and end dates are required')).toBeInTheDocument();

    fillDates('2026-10-02', '2026-08-11');
    await user.click(submit);
    expect(screen.getByText('End date must be after start date')).toBeInTheDocument();

    fillDates('2026-08-11', '2026-08-21');
    fireEvent.change(screen.getByLabelText('COOLDOWN WEEKS'), { target: { value: '2' } });
    await user.click(submit);
    expect(screen.getByText('Cooldown must fit inside the cycle')).toBeInTheDocument();

    expect(getActiveCycles()).toHaveLength(0);
  });

  it('deletes a cycle', async () => {
    const user = userEvent.setup();
    render(<CyclesPanel />);

    await user.type(screen.getByLabelText('Cycle name'), 'Cycle 2');
    fillDates('2026-08-11', '2026-10-02');
    await user.click(screen.getByRole('button', { name: /add cycle/i }));

    await user.click(screen.getByRole('button', { name: 'Delete Cycle 2' }));

    expect(screen.getByText('NO CYCLES YET')).toBeInTheDocument();
    expect(getActiveCycles()).toHaveLength(0);
  });
});
