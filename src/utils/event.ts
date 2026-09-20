import type { Cycle, EventCountdown, EventOverlap, SpecialEvent } from '../types/name';
import { daysBetween, isWeekday, weekdaysBetween } from './cycle';

/** Active event wins over upcoming ones; otherwise the nearest future event. */
export function getEventCountdown(events: SpecialEvent[], todayISO: string): EventCountdown | null {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const active = sorted.find((event) => todayISO >= event.start && todayISO <= event.end);
  const next = active ?? sorted.find((event) => event.start > todayISO);
  if (!next) return null;

  return {
    event: next,
    isActive: Boolean(active),
    daysUntilStart: Math.max(0, daysBetween(todayISO, next.start)),
    daysRemaining: daysBetween(todayISO, next.end),
  };
}

const MIN_OVERLAP_PERCENT = 0.6;

/**
 * Positions events on the weekday-only cycle axis, clamped to the cycle range.
 * A weekend-only event has no width there, so it keeps a hairline marker instead of vanishing.
 */
export function getEventOverlaps(cycle: Cycle, events: SpecialEvent[]): EventOverlap[] {
  const totalWeekdays = weekdaysBetween(cycle.start, cycle.end);
  if (totalWeekdays === 0) return [];

  return events
    .filter((event) => event.end >= cycle.start && event.start <= cycle.end)
    .map((event) => {
      const start = event.start > cycle.start ? event.start : cycle.start;
      const end = event.end < cycle.end ? event.end : cycle.end;
      const weekdaysUpToStart = weekdaysBetween(cycle.start, start);
      const weekdaysBefore = isWeekday(start) ? weekdaysUpToStart - 1 : weekdaysUpToStart;
      const weekdaysInside = weekdaysBetween(start, end);
      const widthPercent = Math.max(MIN_OVERLAP_PERCENT, (weekdaysInside / totalWeekdays) * 100);
      return {
        event,
        // An event on a trailing weekend sits past the last weekday, so pull it back into the bar.
        leftPercent: Math.min((weekdaysBefore / totalWeekdays) * 100, 100 - widthPercent),
        widthPercent,
        weekdaysInside,
        clipped: event.start < cycle.start || event.end > cycle.end,
      };
    });
}
