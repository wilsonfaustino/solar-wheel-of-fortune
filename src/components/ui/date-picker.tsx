import * as Popover from '@radix-ui/react-popover';
import { CalendarDays } from 'lucide-react';
import { memo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { toLocalISODay } from '../../utils/name';

/** The year dropdown lists this many years before and after the current year. */
const YEAR_RANGE = 5;

const TRIGGER_CLASS =
  'flex w-40 shrink-0 items-center justify-between gap-2 px-3 py-2 h-10 font-mono text-sm text-text bg-black/50 border border-border-light focus:shadow-xs focus:shadow-accent focus:outline-none';

const CALENDAR_CLASS =
  'font-mono text-sm text-text [color-scheme:dark] [--rdp-accent-color:var(--color-accent)] [--rdp-accent-background-color:var(--color-accent-20)] [--rdp-day-height:36px] [--rdp-day-width:36px] [--rdp-day_button-height:34px] [--rdp-day_button-width:34px] [--rdp-day_button-border-radius:0]';

function fromLocalISODay(isoDay: string): Date {
  const [year, month, day] = isoDay.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface DatePickerProps {
  /** Local ISO day (YYYY-MM-DD), or an empty string when no day is set. */
  value: string;
  onChange: (isoDay: string) => void;
  /** Earliest selectable local ISO day. */
  min?: string;
  className?: string;
  'aria-label': string;
}

function DatePickerComponent({
  value,
  onChange,
  min,
  className,
  'aria-label': ariaLabel,
}: Readonly<DatePickerProps>) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? fromLocalISODay(value) : undefined;
  const minDate = min ? fromLocalISODay(min) : undefined;
  const currentYear = new Date().getFullYear();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" aria-label={ariaLabel} className={cn(TRIGGER_CLASS, className)}>
          <span className={cn(!value && 'text-white/30')}>{value || 'YYYY-MM-DD'}</span>
          <CalendarDays className="size-4 text-accent/70" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-50 p-3 bg-black border border-border-light"
        >
          <DayPicker
            mode="single"
            required
            selected={selectedDate}
            defaultMonth={selectedDate ?? minDate}
            disabled={minDate && { before: minDate }}
            captionLayout="dropdown"
            startMonth={new Date(currentYear - YEAR_RANGE, 0)}
            endMonth={new Date(currentYear + YEAR_RANGE, 11)}
            onSelect={(date) => {
              onChange(toLocalISODay(date));
              setOpen(false);
            }}
            className={CALENDAR_CLASS}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const DatePicker = memo(DatePickerComponent);
