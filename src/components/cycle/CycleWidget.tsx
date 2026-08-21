import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { useNameStore } from '../../stores/useNameStore';
import { getCycleStatus, toISODay } from '../../utils/cycle';

function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
}

function CycleWidgetComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );

  const status = useMemo(() => {
    const cycles = lists.find((list) => list.id === activeListId)?.cycles ?? [];
    return getCycleStatus(cycles, toISODay(new Date()));
  }, [lists, activeListId]);

  if (!status) return null;

  const isCooldown = status.phase === 'cooldown';

  return (
    <div
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
        <div className="flex h-2.5 gap-0.5">
          <div className="flex flex-5 border border-border-light bg-accent-10">
            <div
              className={cn('h-full', isCooldown ? 'w-full bg-white/25' : 'bg-accent')}
              style={isCooldown ? undefined : { width: `${status.percentComplete}%` }}
            />
          </div>
          <div className="flex flex-1 border border-dashed border-white/25 bg-white/4">
            {isCooldown && (
              <div className="h-full bg-white/35" style={{ width: `${status.percentComplete}%` }} />
            )}
          </div>
        </div>
        <div className="flex justify-between text-[10px] tracking-[0.18em] text-text/30">
          <span>START</span>
          <span>CYCLE END</span>
          <span>COOLDOWN END</span>
        </div>
      </div>

      <div className="flex gap-6 border-t border-white/8 pt-3">
        {isCooldown ? (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.2em] text-text/35">COOLDOWN LEFT</span>
            <span className="text-lg font-medium text-text">
              {formatDays(status.daysToCooldownEnd)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.2em] text-text/35">TO CYCLE END</span>
              <span className="text-lg font-medium text-text">
                {formatDays(status.daysToCycleEnd)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.2em] text-text/35">TO COOLDOWN END</span>
              <span className="text-lg font-medium text-text/60">
                {formatDays(status.daysToCooldownEnd)}
              </span>
            </div>
          </>
        )}

        {status.nextCycle && (
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
