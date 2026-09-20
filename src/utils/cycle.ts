import type { Cycle, CycleStatus } from '../types/name';

const MS_PER_DAY = 86_400_000;

const MONTH_LABELS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

export function toISODay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / MS_PER_DAY);
}

export function addDays(isoDay: string, days: number): string {
  return toISODay(new Date(Date.parse(isoDay) + days * MS_PER_DAY));
}

/** Compact label for narrow surfaces: 2026-08-11 -> AUG 11. */
export function formatShortDay(isoDay: string): string {
  const [, month, day] = isoDay.split('-');
  return `${MONTH_LABELS[Number(month) - 1]} ${Number(day)}`;
}

/** Cooldown is the last cooldownWeeks of the cycle, ending on the cycle end date. */
export function getCooldownRange(cycle: Cycle): { start: string; end: string } {
  return {
    start: addDays(cycle.end, -(cycle.cooldownWeeks * 7) + 1),
    end: cycle.end,
  };
}

export function isWeekday(isoDay: string): boolean {
  const weekday = new Date(Date.parse(isoDay)).getUTCDay();
  return weekday >= 1 && weekday <= 5;
}

/** The Monday that opens the calendar week holding this day. */
function mondayOf(isoDay: string): string {
  const daysSinceMonday = (new Date(Date.parse(isoDay)).getUTCDay() + 6) % 7;
  return toISODay(new Date(Date.parse(isoDay) - daysSinceMonday * MS_PER_DAY));
}

/**
 * Weekdays per calendar week covered by the cycle, in order. Blocks follow Mon-Fri rather than
 * running five weekdays from the start date, so no block steps over a weekend.
 * A cycle opening or closing mid-week gives a short first or last entry.
 */
export function getWeekdaysPerWeek(cycle: Cycle): number[] {
  const counts: number[] = [];
  let currentMonday = '';

  for (let ms = Date.parse(cycle.start); ms <= Date.parse(cycle.end); ms += MS_PER_DAY) {
    const isoDay = toISODay(new Date(ms));
    if (!isWeekday(isoDay)) continue;

    const monday = mondayOf(isoDay);
    if (monday !== currentMonday) {
      currentMonday = monday;
      counts.push(0);
    }
    counts[counts.length - 1] += 1;
  }
  return counts;
}

/** 1-based calendar week holding the nth elapsed weekday. */
function weekIndexOf(weekdaysPerWeek: number[], weekdayOfCycle: number): number {
  let elapsed = 0;
  for (const [index, weekdays] of weekdaysPerWeek.entries()) {
    elapsed += weekdays;
    if (weekdayOfCycle <= elapsed) return index + 1;
  }
  return weekdaysPerWeek.length;
}

/** Inclusive Mon-Fri count. Weekends carry no cycle capacity, so they take no room on the axis. */
export function weekdaysBetween(fromISO: string, toISO: string): number {
  // Day-by-day walk; cycles span weeks, so a closed form would only add risk here.
  let count = 0;
  for (let ms = Date.parse(fromISO); ms <= Date.parse(toISO); ms += MS_PER_DAY) {
    const weekday = new Date(ms).getUTCDay();
    if (weekday >= 1 && weekday <= 5) count += 1;
  }
  return count;
}

function buildStatus(
  cycle: Cycle,
  todayISO: string,
  upcoming: Cycle | undefined
): CycleStatus | null {
  const weekdaysPerWeek = getWeekdaysPerWeek(cycle);
  const totalCycleWeekdays = weekdaysBetween(cycle.start, cycle.end);
  // A cycle made only of weekend days holds no working time, so it has no position to report.
  if (totalCycleWeekdays === 0) return null;

  const cooldown = getCooldownRange(cycle);
  const inCooldown = cycle.cooldownWeeks > 0 && todayISO >= cooldown.start;
  const phaseStart = inCooldown ? cooldown.start : cycle.start;
  const phaseEnd = inCooldown ? cycle.end : addDays(cooldown.start, -1);
  const weekdayOfCycle = weekdaysBetween(cycle.start, todayISO);
  // A zero-week cooldown yields an empty range, so this lands on 0 without a branch.
  const cooldownWeekdays = weekdaysBetween(cooldown.start, cooldown.end);

  return {
    cycle,
    phase: inCooldown ? 'cooldown' : 'cycle',
    dayOfPhase: daysBetween(phaseStart, todayISO) + 1,
    totalPhaseDays: daysBetween(phaseStart, phaseEnd) + 1,
    percentComplete: Math.round((weekdayOfCycle / totalCycleWeekdays) * 100),
    weekOfCycle: weekIndexOf(weekdaysPerWeek, weekdayOfCycle),
    totalCycleWeeks: weekdaysPerWeek.length,
    weekdaysPerWeek,
    weekdayOfCycle,
    totalCycleWeekdays,
    cooldownWeekdays,
    daysToCooldownStart: inCooldown ? 0 : daysBetween(todayISO, cooldown.start),
    daysToCycleEnd: daysBetween(todayISO, cycle.end),
    nextCycle: upcoming
      ? { cycle: upcoming, daysUntilStart: daysBetween(todayISO, upcoming.start) }
      : null,
  };
}

export function getCycleStatus(cycles: Cycle[], todayISO: string): CycleStatus | null {
  const sorted = [...cycles].sort((a, b) => a.start.localeCompare(b.start));
  const current = sorted.find((cycle) => todayISO >= cycle.start && todayISO <= cycle.end);
  if (!current) return null;

  return buildStatus(
    current,
    todayISO,
    sorted.find((candidate) => candidate.start > todayISO)
  );
}
