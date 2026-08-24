import type { Cycle, SpecialEvent } from '../types/name';
import { getEventCountdown, getEventOverlaps } from './event';

const makeEvent = (id: string, start: string, end: string): SpecialEvent => ({
  id,
  name: id,
  start,
  end,
});

const cycle: Cycle = {
  id: 'c1',
  name: 'Cycle 1',
  start: '2026-09-01',
  end: '2026-09-10',
  cooldownWeeks: 0,
};

describe('getEventCountdown', () => {
  it('returns null with no events', () => {
    expect(getEventCountdown([], '2026-09-01')).toBeNull();
  });

  it('returns the nearest upcoming event', () => {
    const countdown = getEventCountdown(
      [
        makeEvent('late', '2026-09-20', '2026-09-21'),
        makeEvent('soon', '2026-09-05', '2026-09-06'),
      ],
      '2026-09-01'
    );
    expect(countdown?.event.id).toBe('soon');
    expect(countdown?.isActive).toBe(false);
    expect(countdown?.daysUntilStart).toBe(4);
  });

  it('prefers an active event over upcoming ones', () => {
    const countdown = getEventCountdown(
      [
        makeEvent('now', '2026-09-01', '2026-09-03'),
        makeEvent('later', '2026-09-05', '2026-09-06'),
      ],
      '2026-09-02'
    );
    expect(countdown?.event.id).toBe('now');
    expect(countdown?.isActive).toBe(true);
    expect(countdown?.daysUntilStart).toBe(0);
    expect(countdown?.daysRemaining).toBe(1);
  });

  it('ignores events already finished', () => {
    expect(
      getEventCountdown([makeEvent('past', '2026-08-01', '2026-08-02')], '2026-09-01')
    ).toBeNull();
  });
});

describe('getEventOverlaps', () => {
  it('drops events outside the cycle range', () => {
    expect(getEventOverlaps(cycle, [makeEvent('after', '2026-10-01', '2026-10-02')])).toHaveLength(
      0
    );
  });

  it('positions an interior event by day offset', () => {
    const [overlap] = getEventOverlaps(cycle, [makeEvent('mid', '2026-09-03', '2026-09-04')]);
    expect(overlap.leftPercent).toBe(20);
    expect(overlap.widthPercent).toBe(20);
    expect(overlap.clipped).toBe(false);
  });

  it('clamps and flags events that spill outside the cycle', () => {
    const [overlap] = getEventOverlaps(cycle, [makeEvent('spill', '2026-08-28', '2026-09-12')]);
    expect(overlap.leftPercent).toBe(0);
    expect(overlap.widthPercent).toBe(100);
    expect(overlap.clipped).toBe(true);
  });
});
