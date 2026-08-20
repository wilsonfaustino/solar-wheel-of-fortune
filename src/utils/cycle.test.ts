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
