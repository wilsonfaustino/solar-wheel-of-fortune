import type { Cycle, CycleStatus } from '../types/name';

const MS_PER_DAY = 86_400_000;

export function toISODay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / MS_PER_DAY);
}

function addDays(isoDay: string, days: number): string {
  return toISODay(new Date(Date.parse(isoDay) + days * MS_PER_DAY));
}

/** Cooldown always follows the cycle end, lasting cooldownWeeks whole weeks. */
export function getCooldownRange(cycle: Cycle): { start: string; end: string } {
  return {
    start: addDays(cycle.end, 1),
    end: addDays(cycle.end, cycle.cooldownWeeks * 7),
  };
}

export function getCycleStatus(cycles: Cycle[], todayISO: string): CycleStatus | null {
  const sorted = [...cycles].sort((a, b) => a.start.localeCompare(b.start));

  for (const cycle of sorted) {
    const cooldown = getCooldownRange(cycle);
    if (todayISO < cycle.start || todayISO > cooldown.end) continue;

    const inCooldown = todayISO >= cooldown.start;
    const phaseStart = inCooldown ? cooldown.start : cycle.start;
    const phaseEnd = inCooldown ? cooldown.end : cycle.end;
    const totalPhaseDays = daysBetween(phaseStart, phaseEnd) + 1;
    const dayOfPhase = daysBetween(phaseStart, todayISO) + 1;

    const upcoming = sorted.find((candidate) => candidate.start > todayISO);

    return {
      cycle,
      phase: inCooldown ? 'cooldown' : 'cycle',
      dayOfPhase,
      totalPhaseDays,
      percentComplete: Math.round((dayOfPhase / totalPhaseDays) * 100),
      weekOfCycle: Math.floor(Math.max(0, daysBetween(cycle.start, todayISO)) / 7) + 1,
      totalCycleWeeks: Math.ceil((daysBetween(cycle.start, cycle.end) + 1) / 7),
      daysToCycleEnd: Math.max(0, daysBetween(todayISO, cycle.end)),
      daysToCooldownEnd: Math.max(0, daysBetween(todayISO, cooldown.end)),
      nextCycle: upcoming
        ? { cycle: upcoming, daysUntilStart: daysBetween(todayISO, upcoming.start) }
        : null,
    };
  }
  return null;
}

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

/** Compact label for narrow surfaces: 2026-08-11 -> AUG 11. */
export function formatShortDay(isoDay: string): string {
  const [, month, day] = isoDay.split('-');
  return `${MONTH_LABELS[Number(month) - 1]} ${Number(day)}`;
}
