import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNameStore } from '../../stores/useNameStore';
import { HistoryPanel } from './HistoryPanel';

describe('HistoryPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    useNameStore.getState().clearHistory();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should display empty state when no history', () => {
    render(<HistoryPanel />);

    expect(screen.getByText(/spin the wheel to record selections/i)).toBeInTheDocument();
  });

  it('should display history records', () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    expect(screen.getByText('ALICE')).toBeInTheDocument();
    expect(screen.getByText('BOB')).toBeInTheDocument();
  });

  it('should display total and unique count', () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    expect(screen.getByText(/2 total • 2 unique/)).toBeInTheDocument();
  });

  it('should display history in reverse order (newest first)', () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    const names = screen.getAllByText(/ALICE|BOB/);
    expect(names[0].textContent).toBe('BOB');
  });

  it('should delete a history item when delete button clicked', async () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    const { rerender } = render(<HistoryPanel />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const user = userEvent.setup();

    await user.click(deleteButtons[0]);

    rerender(<HistoryPanel />);

    expect(screen.queryByText('BOB')).not.toBeInTheDocument();
    expect(screen.getByText('ALICE')).toBeInTheDocument();
  });

  it('should show confirmation dialog when clear button clicked', async () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    const user = userEvent.setup();
    const clearButton = screen.getByRole('button', { name: /clear all history/i });

    await user.click(clearButton);

    expect(screen.getByText('Clear All History?')).toBeInTheDocument();
    expect(
      screen.getByText(/this will permanently delete all selection history/i)
    ).toBeInTheDocument();
  });

  it('should clear all history when confirmation is accepted', async () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    const user = userEvent.setup();
    const clearButton = screen.getByRole('button', { name: /clear all history/i });

    await user.click(clearButton);

    const confirmButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(confirmButton);

    expect(screen.getByText(/spin the wheel to record selections/i)).toBeInTheDocument();
  });

  it('should not clear history if user cancels confirmation', async () => {
    const store = useNameStore.getState();
    store.recordSelection('ALICE', 'name-1', 'wheel');
    store.recordSelection('BOB', 'name-2', 'wheel');

    render(<HistoryPanel />);

    const user = userEvent.setup();
    const clearButton = screen.getByRole('button', { name: /clear all history/i });

    await user.click(clearButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.getByText('ALICE')).toBeInTheDocument();
    expect(screen.getByText('BOB')).toBeInTheDocument();
  });

  it('should display "History" heading', () => {
    render(<HistoryPanel />);

    expect(screen.getByRole('heading', { name: /history/i })).toBeInTheDocument();
  });
});
