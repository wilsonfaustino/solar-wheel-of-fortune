import type { Cycle, EventCountdown, EventOverlap, SpecialEvent } from '../types/name';

const MS_PER_DAY = 86_400_000;

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / MS_PER_DAY);
}

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

/** Positions events on the cycle timeline as percentages, clamped to the cycle range. */
export function getEventOverlaps(cycle: Cycle, events: SpecialEvent[]): EventOverlap[] {
  const totalDays = daysBetween(cycle.start, cycle.end) + 1;

  return events
    .filter((event) => event.end >= cycle.start && event.start <= cycle.end)
    .map((event) => {
      const startDay = Math.max(0, daysBetween(cycle.start, event.start));
      const endDay = Math.min(totalDays - 1, daysBetween(cycle.start, event.end));
      return {
        event,
        leftPercent: (startDay / totalDays) * 100,
        widthPercent: ((endDay - startDay + 1) / totalDays) * 100,
        clipped: event.start < cycle.start || event.end > cycle.end,
      };
    });
}
