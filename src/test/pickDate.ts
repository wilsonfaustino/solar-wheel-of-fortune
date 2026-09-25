import { fireEvent, screen } from '@testing-library/react';

/** Opens the DatePicker with the given label and clicks the local ISO day (YYYY-MM-DD). */
export function pickDate(label: string, isoDay: string) {
  const [year, month] = isoDay.split('-').map(Number);
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.change(screen.getByLabelText('Choose the Year'), { target: { value: String(year) } });
  fireEvent.change(screen.getByLabelText('Choose the Month'), {
    target: { value: String(month - 1) },
  });
  const dayButton = document.querySelector(`[data-day="${isoDay}"] button`);
  if (!dayButton) throw new Error(`Day ${isoDay} is not in the open calendar`);
  fireEvent.click(dayButton);
}
