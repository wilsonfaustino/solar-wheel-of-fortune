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
  for (const cycle of cycles) {
    const cooldown = getCooldownRange(cycle);
    if (todayISO < cycle.start || todayISO > cooldown.end) continue;

    const inCooldown = todayISO >= cooldown.start;
    const phaseStart = inCooldown ? cooldown.start : cycle.start;
    const phaseEnd = inCooldown ? cooldown.end : cycle.end;
    const totalPhaseDays = daysBetween(phaseStart, phaseEnd) + 1;
    const dayOfPhase = daysBetween(phaseStart, todayISO) + 1;

    return {
      cycle,
      phase: inCooldown ? 'cooldown' : 'cycle',
      dayOfPhase,
      totalPhaseDays,
      percentComplete: Math.round((dayOfPhase / totalPhaseDays) * 100),
    };
  }
  return null;
}
