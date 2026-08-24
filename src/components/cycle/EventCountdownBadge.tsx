import { CalendarClock } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { useNameStore } from '../../stores/useNameStore';
import { toISODay } from '../../utils/cycle';
import { getEventCountdown } from '../../utils/event';

function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
}

function EventCountdownBadgeComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );

  const countdown = useMemo(() => {
    const events = lists.find((list) => list.id === activeListId)?.events ?? [];
    return getEventCountdown(events, toISODay(new Date()));
  }, [lists, activeListId]);

  if (!countdown) return null;

  const { event, isActive, daysUntilStart, daysRemaining } = countdown;

  return (
    <div
      data-testid="event-countdown-badge"
      className={cn(
        'pointer-events-none absolute bottom-16 right-4 z-10 flex items-center gap-3 border px-4 py-3 font-mono lg:bottom-20 lg:right-8',
        isActive ? 'border-accent bg-accent-10' : 'border-border-light bg-black/90'
      )}
    >
      <CalendarClock className={cn('size-5', isActive ? 'text-accent' : 'text-text/50')} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.2em] text-text/40">
          {isActive ? 'HAPPENING NOW' : 'NEXT EVENT'}
        </span>
        <span className="text-sm tracking-[0.18em] text-text">{event.name.toUpperCase()}</span>
        <span className={cn('text-lg font-medium', isActive ? 'text-accent' : 'text-text/70')}>
          {isActive ? `${formatDays(daysRemaining)} LEFT` : `IN ${formatDays(daysUntilStart)}`}
        </span>
      </div>
    </div>
  );
}

export const EventCountdownBadge = memo(EventCountdownBadgeComponent);
