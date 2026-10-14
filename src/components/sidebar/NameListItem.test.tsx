import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Name } from '../../types/name';
import { formatReturnDay, toLocalISODay } from '../../utils/name';
import { TooltipProvider } from '../ui/tooltip';
import { NameListItem as NameListItemWithoutProvider } from './NameListItem';

const NameListItem = (props: ComponentProps<typeof NameListItemWithoutProvider>) => (
  <TooltipProvider>
    <NameListItemWithoutProvider {...props} />
  </TooltipProvider>
);

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
  onSetUnavailability: vi.fn(),
  onClearUnavailability: vi.fn(),
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

  describe('unavailability', () => {
    const today = toLocalISODay(new Date());
    const unavailableName: Name = { ...mockName, unavailableFrom: today, unavailableUntil: today };

    it('should open the availability dialog from the row icon', async () => {
      const user = userEvent.setup();
      render(<NameListItem {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /set availability for alice/i }));

      expect(screen.getByRole('dialog', { name: /alice availability/i })).toBeInTheDocument();
    });

    it('should call onSetUnavailability with the name id and range', async () => {
      const onSetUnavailability = vi.fn();
      const user = userEvent.setup();
      render(<NameListItem {...defaultProps} onSetUnavailability={onSetUnavailability} />);

      await user.click(screen.getByRole('button', { name: /set availability for alice/i }));
      await user.click(screen.getByRole('button', { name: /today only/i }));

      expect(onSetUnavailability).toHaveBeenCalledWith(mockName.id, today, today, undefined);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onClearUnavailability with the name id', async () => {
      const onClearUnavailability = vi.fn();
      const user = userEvent.setup();
      render(
        <NameListItem
          {...defaultProps}
          name={unavailableName}
          onClearUnavailability={onClearUnavailability}
        />
      );

      await user.click(screen.getByRole('button', { name: /set availability for alice/i }));
      await user.click(screen.getByRole('button', { name: /mark available/i }));

      expect(onClearUnavailability).toHaveBeenCalledWith(mockName.id);
    });

    it('should show BACK TOMORROW when the range ends today', () => {
      render(<NameListItem {...defaultProps} name={unavailableName} />);

      expect(screen.getByText('BACK TOMORROW')).toBeInTheDocument();
    });

    it('should show the return day when the range ends later', () => {
      const laterDay = new Date();
      laterDay.setDate(laterDay.getDate() + 3);
      const laterISO = toLocalISODay(laterDay);
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...mockName, unavailableFrom: today, unavailableUntil: laterISO }}
        />
      );

      expect(screen.getByText(`BACK ${formatReturnDay(laterISO)} · 4 DAYS`)).toBeInTheDocument();
    });

    it('should show the total day count for a multi-day range', () => {
      const laterDay = new Date();
      laterDay.setDate(laterDay.getDate() + 4);
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...mockName, unavailableFrom: today, unavailableUntil: toLocalISODay(laterDay) }}
        />
      );

      expect(screen.getByText(/· 5 DAYS$/)).toBeInTheDocument();
    });

    it('should not show a day count for a single day', () => {
      render(<NameListItem {...defaultProps} name={unavailableName} />);

      expect(screen.queryByText(/DAYS/)).not.toBeInTheDocument();
    });

    it('should show the icon and open its tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...unavailableName, unavailableIcon: 'vacation' }}
        />
      );

      await user.hover(screen.getByRole('img', { name: 'VACATION' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('VACATION');
    });

    it('should not make the row icon focusable', () => {
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...unavailableName, unavailableIcon: 'vacation' }}
        />
      );

      expect(screen.getByRole('img', { name: 'VACATION' })).not.toHaveAttribute('tabindex');
    });

    it('should show no icon when none is set', () => {
      render(<NameListItem {...defaultProps} name={unavailableName} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show no icon and not crash for an unknown icon id', () => {
      const unknownIconName = {
        ...unavailableName,
        unavailableIcon: 'teleport',
      } as unknown as Name;
      render(<NameListItem {...defaultProps} name={unknownIconName} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('BACK TOMORROW')).toBeInTheDocument();
    });

    it('should enter edit mode on double-click of the name', async () => {
      const user = userEvent.setup();
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...unavailableName, unavailableIcon: 'vacation' }}
        />
      );

      await user.dblClick(screen.getByText('ALICE'));

      expect(screen.getByRole('textbox')).toHaveValue('ALICE');
    });

    it('should not show a badge for a future range', () => {
      const futureDay = new Date();
      futureDay.setDate(futureDay.getDate() + 3);
      const futureISO = toLocalISODay(futureDay);
      render(
        <NameListItem
          {...defaultProps}
          name={{ ...mockName, unavailableFrom: futureISO, unavailableUntil: futureISO }}
        />
      );

      expect(screen.queryByText(/^BACK /)).not.toBeInTheDocument();
      expect(screen.getByTestId('name-item-name-1')).toHaveClass('opacity-100');
    });

    it('should grey out an unavailable name and hide the volunteer button', () => {
      render(<NameListItem {...defaultProps} name={unavailableName} />);

      expect(screen.getByTestId('name-item-name-1')).toHaveClass('opacity-50');
      expect(screen.queryByRole('button', { name: /volunteer alice/i })).not.toBeInTheDocument();
    });
  });
});
