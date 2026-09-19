import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { useNameStore } from '../../stores/useNameStore';
import { getCycleStatus, toISODay } from '../../utils/cycle';
import { getEventOverlaps } from '../../utils/event';

function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
}

interface WeekSlot {
  week: number;
  weekdays: number;
  buildWeekdays: number;
  cooldownWeekdays: number;
  buildFillPercent: number;
  cooldownFillPercent: number;
}

function fillPercent(elapsed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/** One block per calendar week. The cooldown boundary may fall inside a block. */
function buildWeekSlots(
  weekdaysPerWeek: number[],
  buildWeekdays: number,
  elapsedWeekdays: number
): WeekSlot[] {
  const slots: WeekSlot[] = [];
  let firstWeekday = 0;

  for (const [index, weekdays] of weekdaysPerWeek.entries()) {
    const build = Math.min(weekdays, Math.max(0, buildWeekdays - firstWeekday));
    const elapsed = Math.min(weekdays, Math.max(0, elapsedWeekdays - firstWeekday));
    slots.push({
      week: index + 1,
      weekdays,
      buildWeekdays: build,
      cooldownWeekdays: weekdays - build,
      buildFillPercent: fillPercent(elapsed, build),
      cooldownFillPercent: fillPercent(elapsed - build, weekdays - build),
    });
    firstWeekday += weekdays;
  }
  return slots;
}

function CycleWidgetComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId),
    [lists, activeListId]
  );

  const status = useMemo(
    () => getCycleStatus(activeList?.cycles ?? [], toISODay(new Date())),
    [activeList]
  );

  const overlaps = useMemo(
    () => (status ? getEventOverlaps(status.cycle, activeList?.events ?? []) : []),
    [status, activeList]
  );

  if (!status) return null;

  const isCooldown = status.phase === 'cooldown';
  const { cooldownWeekdays, totalCycleWeekdays, weekdayOfCycle } = status;
  const weekSlots = buildWeekSlots(
    status.weekdaysPerWeek,
    totalCycleWeekdays - cooldownWeekdays,
    weekdayOfCycle
  );

  return (
    <div
      data-testid="cycle-widget"
      className={cn(
        'w-full max-w-3xl flex flex-col gap-3 border px-5 py-4 font-mono',
        isCooldown ? 'border-white/20 bg-white/3' : 'border-border-light bg-black/90'
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              'text-sm font-medium tracking-[0.22em]',
              isCooldown ? 'text-text/75' : 'text-accent'
            )}
          >
            {status.cycle.name.toUpperCase()}
          </span>
          <span className="text-xs tracking-widest text-text/40">
            {status.cycle.start} → {status.cycle.end}
          </span>
        </div>
        <span
          className={cn(
            'border px-2.5 py-1 text-[11px] tracking-[0.22em]',
            isCooldown ? 'border-white/30 text-text/75' : 'border-border-light text-accent'
          )}
        >
          {isCooldown ? 'COOLDOWN' : 'IN CYCLE'}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <span className="text-4xl font-bold leading-none text-text">
            {isCooldown ? `DAY ${status.dayOfPhase}` : `WEEK ${status.weekOfCycle}`}
          </span>
          <span className="text-lg font-light text-text/35">
            / {isCooldown ? status.totalPhaseDays : status.totalCycleWeeks}
          </span>
        </div>
        <span
          className={cn(
            'text-3xl font-medium leading-none',
            isCooldown ? 'text-text/70' : 'text-accent'
          )}
        >
          {status.percentComplete}%
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative flex h-2.5 gap-0.5">
          {weekSlots.map((slot) => (
            <div
              key={slot.week}
              data-testid="cycle-week-block"
              className="flex"
              style={{ flexGrow: slot.weekdays }}
            >
              {slot.buildWeekdays > 0 && (
                <div
                  className="flex border border-border-light bg-accent-10"
                  style={{ flexGrow: slot.buildWeekdays }}
                >
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${slot.buildFillPercent}%` }}
                  />
                </div>
              )}
              {slot.cooldownWeekdays > 0 && (
                <div
                  className="flex border border-dashed border-white/25 bg-white/4"
                  style={{ flexGrow: slot.cooldownWeekdays }}
                >
                  <div
                    className="h-full bg-white/35"
                    style={{ width: `${slot.cooldownFillPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
          {overlaps.map((overlap) => (
            <div
              key={overlap.event.id}
              data-testid="cycle-event-band"
              data-holiday={Boolean(overlap.event.isHoliday)}
              title={`${overlap.event.name} · ${overlap.event.start} → ${overlap.event.end}`}
              className={cn(
                'pointer-events-auto absolute -top-1 bottom-[-4px] border-x-2',
                overlap.event.isHoliday
                  ? 'border-dashed border-white/30 bg-white/12'
                  : 'border-accent bg-accent/25'
              )}
              style={{ left: `${overlap.leftPercent}%`, width: `${overlap.widthPercent}%` }}
            />
          ))}
        </div>
        <div className="flex gap-0.5 text-[10px] tracking-[0.12em]">
          {weekSlots.map((slot) => (
            <span
              key={slot.week}
              data-testid="cycle-week-label"
              className={cn(
                'text-center',
                slot.week === status.weekOfCycle ? 'text-accent' : 'text-text/30'
              )}
              style={{ flexGrow: slot.weekdays }}
            >
              {slot.week}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-[10px] tracking-[0.18em] text-text/30">
          <span>START</span>
          {cooldownWeekdays > 0 && <span>COOLDOWN START</span>}
          <span>CYCLE END</span>
        </div>
      </div>

      <div className="flex gap-6 border-t border-white/8 pt-3">
        {isCooldown ? (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.2em] text-text/35">COOLDOWN LEFT</span>
            <span className="text-lg font-medium text-text">
              {formatDays(status.daysToCycleEnd)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.2em] text-text/35">TO COOLDOWN</span>
              <span className="text-lg font-medium text-text">
                {formatDays(status.daysToCooldownStart)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.2em] text-text/35">TO CYCLE END</span>
              <span className="text-lg font-medium text-text/60">
                {formatDays(status.daysToCycleEnd)}
              </span>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.2em] text-text/35">WEEKDAYS</span>
          <span data-testid="cycle-weekday-count" className="text-lg font-medium text-text/60">
            {weekdayOfCycle} / {totalCycleWeekdays}
          </span>
        </div>

        {isCooldown && status.nextCycle && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.2em] text-text/35">
              NEXT — {status.nextCycle.cycle.name.toUpperCase()} · {status.nextCycle.cycle.start}
            </span>
            <span className="text-lg font-medium text-accent">
              STARTS IN {formatDays(status.nextCycle.daysUntilStart)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const CycleWidget = memo(CycleWidgetComponent);
