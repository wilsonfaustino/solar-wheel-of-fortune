import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SelectionRecord } from '../../types/name';
import { HistoryItem } from './HistoryItem';

const mockRecord: SelectionRecord = {
  id: 'record-1',
  nameId: 'name-1',
  nameValue: 'ALICE',
  listId: 'list-1',
  timestamp: new Date('2024-12-10T12:00:00'),
  sessionId: '',
  spinDuration: 0,
};

describe('HistoryItem', () => {
  it('should display the name value', () => {
    const onDelete = vi.fn();
    render(<HistoryItem record={mockRecord} onDelete={onDelete} />);

    expect(screen.getByText('ALICE')).toBeInTheDocument();
  });

  it('should display relative time', () => {
    const onDelete = vi.fn();
    const recentRecord: SelectionRecord = {
      ...mockRecord,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    };
    render(<HistoryItem record={recentRecord} onDelete={onDelete} />);

    expect(screen.getByText(/5m ago/)).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<HistoryItem record={mockRecord} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockRecord.id);
  });

  it('should have proper aria-label for accessibility', () => {
    const onDelete = vi.fn();
    render(<HistoryItem record={mockRecord} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', {
      name: /delete alice from history/i,
    });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should show VOLUNTEER tag for volunteer picks', () => {
    const onDelete = vi.fn();
    const volunteerRecord: SelectionRecord = {
      ...mockRecord,
      selectionMethod: 'volunteer',
    };
    render(<HistoryItem record={volunteerRecord} onDelete={onDelete} />);

    expect(screen.getByText('VOLUNTEER')).toBeInTheDocument();
  });

  it('should not show VOLUNTEER tag for wheel picks', () => {
    const onDelete = vi.fn();
    const wheelRecord: SelectionRecord = {
      ...mockRecord,
      selectionMethod: 'wheel',
    };
    render(<HistoryItem record={wheelRecord} onDelete={onDelete} />);

    expect(screen.queryByText('VOLUNTEER')).not.toBeInTheDocument();
  });
});
