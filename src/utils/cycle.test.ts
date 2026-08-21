import type { Cycle } from '../types/name';
import { formatShortDay, getCooldownRange, getCycleStatus } from './cycle';

/** Whole cycle: AUG 11 -> OCT 2, last 2 weeks (SEP 21 -> OCT 2) are cooldown. */
const cycle: Cycle = {
  id: '1',
  name: 'Cycle 1',
  start: '2026-08-11',
  end: '2026-10-02',
  cooldownWeeks: 2,
};

describe('getCooldownRange', () => {
  it('takes the last weeks of the cycle and ends on the cycle end', () => {
    expect(getCooldownRange(cycle)).toEqual({ start: '2026-09-19', end: '2026-10-02' });
  });

  it('collapses to an empty range with zero cooldown weeks', () => {
    expect(getCooldownRange({ ...cycle, cooldownWeeks: 0 })).toEqual({
      start: '2026-10-03',
      end: '2026-10-02',
    });
  });
});

describe('getCycleStatus', () => {
  it('returns null outside the cycle range', () => {
    expect(getCycleStatus([cycle], '2026-08-10')).toBeNull();
    expect(getCycleStatus([cycle], '2026-10-03')).toBeNull();
  });

  it('reports the build phase before the cooldown starts', () => {
    const status = getCycleStatus([cycle], '2026-08-11');
    expect(status).toMatchObject({
      phase: 'cycle',
      dayOfPhase: 1,
      totalPhaseDays: 39,
      weekOfCycle: 1,
      totalCycleWeeks: 8,
      percentComplete: 2,
      daysToCooldownStart: 39,
      daysToCycleEnd: 52,
    });
  });

  it('switches to cooldown on the first cooldown day', () => {
    expect(getCycleStatus([cycle], '2026-09-18')?.phase).toBe('cycle');
    expect(getCycleStatus([cycle], '2026-09-19')).toMatchObject({
      phase: 'cooldown',
      dayOfPhase: 1,
      totalPhaseDays: 14,
      daysToCooldownStart: 0,
      daysToCycleEnd: 13,
    });
  });

  it('reaches 100 percent on the last day of the cycle', () => {
    expect(getCycleStatus([cycle], '2026-10-02')).toMatchObject({
      phase: 'cooldown',
      percentComplete: 100,
      daysToCycleEnd: 0,
    });
  });

  it('stays in the build phase when there is no cooldown', () => {
    const status = getCycleStatus([{ ...cycle, cooldownWeeks: 0 }], '2026-10-02');
    expect(status).toMatchObject({ phase: 'cycle', daysToCooldownStart: 1 });
  });
});

describe('next cycle', () => {
  const next: Cycle = {
    id: '2',
    name: 'Cycle 2',
    start: '2026-10-05',
    end: '2026-11-06',
    cooldownWeeks: 1,
  };

  it('counts the days to the next cycle start', () => {
    const status = getCycleStatus([cycle, next], '2026-09-30');
    expect(status?.phase).toBe('cooldown');
    expect(status?.nextCycle).toMatchObject({ daysUntilStart: 5 });
    expect(status?.nextCycle?.cycle.id).toBe('2');
  });

  it('has no next cycle when none is defined ahead', () => {
    expect(getCycleStatus([cycle], '2026-09-30')?.nextCycle).toBeNull();
  });
});

describe('formatShortDay', () => {
  it('renders a compact month and day label', () => {
    expect(formatShortDay('2026-08-11')).toBe('AUG 11');
    expect(formatShortDay('2026-01-02')).toBe('JAN 2');
  });
});
