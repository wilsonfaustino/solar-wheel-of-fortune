import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { CycleGridDay } from '../../utils/cycle';

const WEEKDAY_COLUMNS = [
  { id: 'mon', letter: 'M', name: 'Mon' },
  { id: 'tue', letter: 'T', name: 'Tue' },
  { id: 'wed', letter: 'W', name: 'Wed' },
  { id: 'thu', letter: 'T', name: 'Thu' },
  { id: 'fri', letter: 'F', name: 'Fri' },
] as const;

const HATCH_NEUTRAL =
  'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0_3px,transparent_3px_6px)]';
const HATCH_ACCENT =
  'bg-[repeating-linear-gradient(135deg,var(--color-accent-70)_0_3px,var(--color-accent-30)_3px_6px)]';

function describeDay(day: CycleGridDay, weekdayName: string): string {
  const date = new Date(Date.parse(day.isoDay)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const parts = [`${weekdayName} ${date}`, day.progress];
  if (day.isCooldown) parts.push('cooldown');
  if (day.eventKind) parts.push(`${day.eventKind}: ${day.eventNames.join(', ')}`);
  return parts.join(', ');
}

function dayCellClass(day: CycleGridDay): string {
  const isHoliday = day.eventKind === 'holiday';
  return cn(
    'relative h-4.5 border border-accent-30 p-0 text-center align-middle text-[9px] text-text/40',
    day.progress === 'upcoming' && day.isCooldown && 'border-dashed border-white/30 text-white/35',
    isHoliday && cn('border-dashed border-white/35', HATCH_NEUTRAL),
    day.progress === 'done' && 'border-accent bg-accent text-background',
    day.progress === 'done' && isHoliday && HATCH_ACCENT,
    day.progress === 'today' &&
      'border-2 border-solid border-accent font-bold text-accent animate-today-pulse motion-reduce:animate-none'
  );
}

interface CycleDayGridProps {
  rows: (CycleGridDay | null)[][];
  currentWeek: number;
}

function CycleDayGridComponent({ rows, currentWeek }: Readonly<CycleDayGridProps>) {
  return (
    <table
      data-testid="cycle-day-grid"
      aria-label="Cycle weekdays by week"
      className="w-full table-fixed border-separate border-spacing-0.75 text-[10px] tracking-widest"
    >
      <thead>
        <tr>
          <th scope="col" className="w-6">
            <span className="sr-only">Week</span>
          </th>
          {WEEKDAY_COLUMNS.map((column) => (
            <th key={column.id} scope="col" className="text-[9px] font-normal text-text/30">
              {column.letter}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => {
          const week = rowIndex + 1;
          return (
            <tr key={`W${week}`}>
              <th
                scope="row"
                className={cn(
                  'text-left font-normal',
                  week === currentWeek ? 'text-accent' : 'text-text/30'
                )}
              >
                W{week}
              </th>
              {WEEKDAY_COLUMNS.map((column, columnIndex) => {
                const day = row[columnIndex];
                if (!day) return <td key={column.id} />;
                return (
                  <td
                    key={column.id}
                    data-testid="cycle-day-cell"
                    data-progress={day.progress}
                    data-cooldown={day.isCooldown}
                    data-event={day.eventKind ?? 'none'}
                    aria-label={describeDay(day, column.name)}
                    title={day.eventNames.length > 0 ? day.eventNames.join(', ') : undefined}
                    className={dayCellClass(day)}
                  >
                    {Number(day.isoDay.slice(8))}
                    {day.eventKind === 'event' && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute top-0.5 right-0.5 size-1 rounded-full',
                          day.progress === 'done' ? 'bg-background' : 'bg-accent'
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export const CycleDayGrid = memo(CycleDayGridComponent);
