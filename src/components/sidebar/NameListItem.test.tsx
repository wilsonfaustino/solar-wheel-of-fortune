import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Name } from '../../types/name';
import { NameListItem } from './NameListItem';

const mockName: Name = {
  id: 'name-1',
  value: 'ALICE',
  weight: 1,
  createdAt: new Date(),
  lastSelectedAt: null,
  selectionCount: 0,
  isExcluded: false,
  categoryId: null,
};

const defaultProps = {
  name: mockName,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onToggleExclude: vi.fn(),
  onVolunteer: vi.fn(),
};

describe('NameListItem', () => {
  it('should show volunteer button for active names', () => {
    render(<NameListItem {...defaultProps} />);

    expect(screen.getByRole('button', { name: /volunteer alice/i })).toBeInTheDocument();
  });

  it('should not show volunteer button for excluded names', () => {
    const excludedName: Name = { ...mockName, isExcluded: true };
    render(<NameListItem {...defaultProps} name={excludedName} />);

    expect(screen.queryByRole('button', { name: /volunteer alice/i })).not.toBeInTheDocument();
  });

  it('should call onVolunteer with name id when volunteer button clicked', async () => {
    const onVolunteer = vi.fn();
    const user = userEvent.setup();
    render(<NameListItem {...defaultProps} onVolunteer={onVolunteer} />);

    await user.click(screen.getByRole('button', { name: /volunteer alice/i }));

    expect(onVolunteer).toHaveBeenCalledWith(mockName.id);
  });
});
