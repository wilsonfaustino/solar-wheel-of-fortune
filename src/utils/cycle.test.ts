import type { Cycle } from '../types/name';
import { getCooldownRange, getCycleStatus } from './cycle';

const cycle: Cycle = {
  id: '1',
  name: 'Cycle 1',
  start: '2026-01-12',
  end: '2026-02-13',
  cooldownWeeks: 1,
};

describe('getCooldownRange', () => {
  it('starts the day after the cycle end and lasts whole weeks', () => {
    expect(getCooldownRange(cycle)).toEqual({ start: '2026-02-14', end: '2026-02-20' });
  });

  it('collapses to an empty range with zero cooldown weeks', () => {
    expect(getCooldownRange({ ...cycle, cooldownWeeks: 0 })).toEqual({
      start: '2026-02-14',
      end: '2026-02-13',
    });
  });
});

describe('getCycleStatus', () => {
  it('returns null outside any cycle', () => {
    expect(getCycleStatus([cycle], '2026-01-11')).toBeNull();
    expect(getCycleStatus([cycle], '2026-02-21')).toBeNull();
  });

  it('reports progress inside the cycle phase', () => {
    const status = getCycleStatus([cycle], '2026-01-12');
    expect(status).toMatchObject({ phase: 'cycle', dayOfPhase: 1, totalPhaseDays: 33 });
  });

  it('reports progress inside the cooldown phase', () => {
    const status = getCycleStatus([cycle], '2026-02-20');
    expect(status).toMatchObject({
      phase: 'cooldown',
      dayOfPhase: 7,
      totalPhaseDays: 7,
      percentComplete: 100,
    });
  });
});

describe('getCycleStatus extras', () => {
  const next: Cycle = {
    id: '2',
    name: 'Cycle 2',
    start: '2026-02-23',
    end: '2026-03-27',
    cooldownWeeks: 1,
  };

  it('reports week, day countdowns and the next cycle during cooldown', () => {
    const status = getCycleStatus([cycle, next], '2026-02-18');
    expect(status).toMatchObject({
      phase: 'cooldown',
      daysToCycleEnd: 0,
      daysToCooldownEnd: 2,
      nextCycle: { daysUntilStart: 5 },
    });
    expect(status?.nextCycle?.cycle.id).toBe('2');
  });

  it('counts weeks from the cycle start', () => {
    expect(getCycleStatus([cycle], '2026-01-18')?.weekOfCycle).toBe(1);
    expect(getCycleStatus([cycle], '2026-01-19')?.weekOfCycle).toBe(2);
    expect(getCycleStatus([cycle], '2026-01-19')?.totalCycleWeeks).toBe(5);
  });

  it('has no next cycle when none is defined ahead', () => {
    expect(getCycleStatus([cycle], '2026-01-20')?.nextCycle).toBeNull();
  });
});
