import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Name } from '../../types/name';
import { SelectionToast } from './SelectionToast';

describe('SelectionToast', () => {
  const mockName: Name = {
    id: '1',
    value: 'Alice',
    weight: 1,
    createdAt: new Date('2025-12-15T10:00:00'),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  };

  const mockTimestamp = new Date('2025-12-15T10:30:45');

  it('renders the selected name', () => {
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays the SELECTED label', () => {
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} />);
    expect(screen.getByText('SELECTED')).toBeInTheDocument();
  });

  it('formats timestamp correctly (24-hour format)', () => {
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} />);
    expect(screen.getByText('10:30:45')).toBeInTheDocument();
  });

  it('shows selection count when name has been picked before', () => {
    const nameWithHistory: Name = {
      ...mockName,
      selectionCount: 2,
    };
    render(<SelectionToast name={nameWithHistory} timestamp={mockTimestamp} />);
    expect(screen.getByText('PICKED 3x')).toBeInTheDocument();
  });

  it('does not show selection count for first selection', () => {
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} />);
    expect(screen.queryByText(/PICKED/)).not.toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const mockDismiss = vi.fn();
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} onDismiss={mockDismiss} />);
    expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} />);
    expect(screen.queryByRole('button', { name: /dismiss notification/i })).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const mockDismiss = vi.fn();
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} onDismiss={mockDismiss} />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss notification/i,
    });
    await user.click(dismissButton);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles long names with word wrapping', () => {
    const longName: Name = {
      ...mockName,
      value: 'Extraordinarily Long Name That Should Wrap Properly',
    };
    render(<SelectionToast name={longName} timestamp={mockTimestamp} />);
    expect(
      screen.getByText('Extraordinarily Long Name That Should Wrap Properly')
    ).toBeInTheDocument();
  });

  it('displays correct selection count for multiple picks', () => {
    const namePickedMultiple: Name = {
      ...mockName,
      selectionCount: 9,
    };
    render(<SelectionToast name={namePickedMultiple} timestamp={mockTimestamp} />);
    expect(screen.getByText('PICKED 10x')).toBeInTheDocument();
  });

  it('has proper accessibility attributes on dismiss button', () => {
    const mockDismiss = vi.fn();
    render(<SelectionToast name={mockName} timestamp={mockTimestamp} onDismiss={mockDismiss} />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss notification/i,
    });
    expect(dismissButton).toHaveAttribute('type', 'button');
    expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
  });
});
