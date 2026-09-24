import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleNames } from '../../test/test-data';
import type { Name } from '../../types/name';
import { toLocalISODay } from '../../utils/name';
import { UnavailabilityDialog } from './UnavailabilityDialog';

const today = toLocalISODay(new Date());

function daysFromToday(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toLocalISODay(date);
}

function renderDialog(name: Name = sampleNames[0]) {
  const handlers = { onSave: vi.fn(), onClear: vi.fn(), onClose: vi.fn() };
  render(<UnavailabilityDialog name={name} {...handlers} />);
  return handlers;
}

const fromInput = () => screen.getByLabelText('Unavailable from');
const toInput = () => screen.getByLabelText('Unavailable until');

describe('UnavailabilityDialog', () => {
  it('should prefill today for a name without a range', () => {
    renderDialog();

    expect(fromInput()).toHaveValue(today);
    expect(toInput()).toHaveValue(today);
    expect(screen.queryByRole('button', { name: /mark available/i })).not.toBeInTheDocument();
  });

  it('should prefill the current range and offer to clear it', () => {
    renderDialog({
      ...sampleNames[0],
      unavailableFrom: daysFromToday(-2),
      unavailableUntil: daysFromToday(3),
    });

    expect(fromInput()).toHaveValue(daysFromToday(-2));
    expect(toInput()).toHaveValue(daysFromToday(3));
    expect(screen.getByRole('button', { name: /mark available/i })).toBeInTheDocument();
  });

  it('should offer to clear a future range', () => {
    renderDialog({
      ...sampleNames[0],
      unavailableFrom: daysFromToday(5),
      unavailableUntil: daysFromToday(8),
    });

    expect(screen.getByRole('button', { name: /mark available/i })).toBeInTheDocument();
  });

  it('should treat an ended range as no range', () => {
    renderDialog({
      ...sampleNames[0],
      unavailableFrom: daysFromToday(-5),
      unavailableUntil: daysFromToday(-1),
    });

    expect(fromInput()).toHaveValue(today);
    expect(toInput()).toHaveValue(today);
    expect(screen.queryByRole('button', { name: /mark available/i })).not.toBeInTheDocument();
  });

  it('should save today only and close', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: /today only/i }));

    expect(onSave).toHaveBeenCalledWith(today, today);
    expect(onClose).toHaveBeenCalled();
  });

  it('should save the selected range and close', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = renderDialog();

    fireEvent.change(fromInput(), { target: { value: daysFromToday(1) } });
    fireEvent.change(toInput(), { target: { value: daysFromToday(4) } });
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSave).toHaveBeenCalledWith(daysFromToday(1), daysFromToday(4));
    expect(onClose).toHaveBeenCalled();
  });

  it('should clear the range and close', async () => {
    const user = userEvent.setup();
    const { onClear, onClose } = renderDialog({
      ...sampleNames[0],
      unavailableFrom: today,
      unavailableUntil: today,
    });

    await user.click(screen.getByRole('button', { name: /mark available/i }));

    expect(onClear).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should disable save and show the reason for an invalid range', () => {
    renderDialog();

    fireEvent.change(fromInput(), { target: { value: daysFromToday(3) } });
    fireEvent.change(toInput(), { target: { value: daysFromToday(1) } });

    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByText('END DATE IS BEFORE START DATE')).toBeInTheDocument();
  });

  it('should disable save for a range longer than 30 days', () => {
    renderDialog();

    fireEvent.change(toInput(), { target: { value: daysFromToday(30) } });

    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByText('RANGE IS LONGER THAN 30 DAYS')).toBeInTheDocument();
  });

  it('should close without saving on cancel', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
