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

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / MS_PER_DAY);
}

function addDays(isoDay: string, days: number): string {
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

export function getCycleStatus(cycles: Cycle[], todayISO: string): CycleStatus | null {
  const sorted = [...cycles].sort((a, b) => a.start.localeCompare(b.start));

  for (const cycle of sorted) {
    if (todayISO < cycle.start || todayISO > cycle.end) continue;

    const cooldown = getCooldownRange(cycle);
    const inCooldown = cycle.cooldownWeeks > 0 && todayISO >= cooldown.start;
    const phaseStart = inCooldown ? cooldown.start : cycle.start;
    const phaseEnd = inCooldown ? cycle.end : addDays(cooldown.start, -1);
    const totalCycleDays = daysBetween(cycle.start, cycle.end) + 1;
    const dayOfCycle = daysBetween(cycle.start, todayISO) + 1;
    const upcoming = sorted.find((candidate) => candidate.start > todayISO);

    return {
      cycle,
      phase: inCooldown ? 'cooldown' : 'cycle',
      dayOfPhase: daysBetween(phaseStart, todayISO) + 1,
      totalPhaseDays: daysBetween(phaseStart, phaseEnd) + 1,
      percentComplete: Math.round((dayOfCycle / totalCycleDays) * 100),
      weekOfCycle: Math.floor((dayOfCycle - 1) / 7) + 1,
      totalCycleWeeks: Math.ceil(totalCycleDays / 7),
      daysToCooldownStart: inCooldown ? 0 : daysBetween(todayISO, cooldown.start),
      daysToCycleEnd: daysBetween(todayISO, cycle.end),
      nextCycle: upcoming
        ? { cycle: upcoming, daysUntilStart: daysBetween(todayISO, upcoming.start) }
        : null,
    };
  }
  return null;
}
