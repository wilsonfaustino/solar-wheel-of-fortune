import type { Cycle } from '../types/name';
import {
  formatShortDay,
  getCooldownRange,
  getCycleDayGrid,
  getCycleStatus,
  getWeekdaysPerWeek,
  isWeekday,
  weekdaysBetween,
} from './cycle';

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
      percentComplete: 3,
      weekdayOfCycle: 1,
      totalCycleWeekdays: 39,
      cooldownWeekdays: 10,
      daysToCooldownStart: 39,
      daysToCycleEnd: 52,
    });
  });

  it('measures progress in weekdays, so a weekend adds nothing', () => {
    const friday = getCycleStatus([cycle], '2026-09-18');
    const saturday = getCycleStatus([cycle], '2026-09-19');
    expect(friday?.weekdayOfCycle).toBe(29);
    expect(saturday?.weekdayOfCycle).toBe(29);
    expect(saturday?.percentComplete).toBe(friday?.percentComplete);
  });

  it('numbers weeks by the calendar, so a weekend closes a week', () => {
    // The cycle opens on a Tuesday, so week 1 is the short AUG 11 -> AUG 14.
    expect(getCycleStatus([cycle], '2026-08-14')?.weekOfCycle).toBe(1);
    expect(getCycleStatus([cycle], '2026-08-17')?.weekOfCycle).toBe(2);
    expect(getCycleStatus([cycle], '2026-10-02')?.weekOfCycle).toBe(8);
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

  it('reports no position for a cycle that holds no weekdays', () => {
    const weekendOnly: Cycle = { ...cycle, start: '2026-09-05', end: '2026-09-06' };
    expect(getCycleStatus([weekendOnly], '2026-09-05')).toBeNull();
  });

  it('stays in the build phase when there is no cooldown', () => {
    const status = getCycleStatus([{ ...cycle, cooldownWeeks: 0 }], '2026-10-02');
    expect(status).toMatchObject({ phase: 'cycle', daysToCooldownStart: 1, cooldownWeekdays: 0 });
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

describe('weekday counting', () => {
  it('accepts monday through friday only', () => {
    expect(isWeekday('2026-09-18')).toBe(true);
    expect(isWeekday('2026-09-19')).toBe(false);
    expect(isWeekday('2026-09-20')).toBe(false);
    expect(isWeekday('2026-09-21')).toBe(true);
  });

  it('counts weekdays inclusively across a span', () => {
    expect(weekdaysBetween('2026-09-14', '2026-09-18')).toBe(5);
    expect(weekdaysBetween('2026-09-14', '2026-09-20')).toBe(5);
    expect(weekdaysBetween('2026-09-19', '2026-09-20')).toBe(0);
  });
});

describe('getWeekdaysPerWeek', () => {
  it('gives one entry per calendar week, short at a mid-week start', () => {
    // AUG 11 is a Tuesday, so the opening week carries four weekdays and the rest carry five.
    expect(getWeekdaysPerWeek(cycle)).toEqual([4, 5, 5, 5, 5, 5, 5, 5]);
  });

  it('never lets a block hold more than one working week', () => {
    expect(getWeekdaysPerWeek(cycle).every((weekdays) => weekdays <= 5)).toBe(true);
  });

  it('is short at a mid-week end too', () => {
    expect(getWeekdaysPerWeek({ ...cycle, start: '2026-08-17', end: '2026-08-25' })).toEqual([
      5, 2,
    ]);
  });

  it('is empty for a span holding no weekdays', () => {
    expect(getWeekdaysPerWeek({ ...cycle, start: '2026-09-05', end: '2026-09-06' })).toEqual([]);
  });
});

describe('getCycleDayGrid', () => {
  const isoDaysOf = (row: ReturnType<typeof getCycleDayGrid>[number]) =>
    row.map((slot) => slot?.isoDay ?? null);

  it('has one row per calendar week, with null slots before a mid-week start', () => {
    const grid = getCycleDayGrid(cycle, '2026-08-11', []);

    expect(grid).toHaveLength(8);
    expect(isoDaysOf(grid[0])).toEqual([
      null,
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
    ]);
    expect(isoDaysOf(grid[7])).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('leaves null slots after a mid-week end', () => {
    const grid = getCycleDayGrid({ ...cycle, start: '2026-08-17', end: '2026-08-25' }, '', []);

    expect(grid).toHaveLength(2);
    expect(isoDaysOf(grid[1])).toEqual(['2026-08-24', '2026-08-25', null, null, null]);
  });

  it('adds no row for a weekend before the first weekday', () => {
    const grid = getCycleDayGrid({ ...cycle, start: '2026-08-15', end: '2026-08-21' }, '', []);

    expect(grid).toHaveLength(1);
    expect(isoDaysOf(grid[0])).toEqual([
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
    ]);
  });

  it('marks days before today done, today today, and the rest upcoming', () => {
    const [week] = getCycleDayGrid(
      { ...cycle, start: '2026-08-17', end: '2026-08-21' },
      '2026-08-19',
      []
    );

    expect(week.map((slot) => slot?.progress)).toEqual([
      'done',
      'done',
      'today',
      'upcoming',
      'upcoming',
    ]);
  });

  it('flags cooldown from the first weekday on or after the cooldown start', () => {
    const days = getCycleDayGrid(cycle, '2026-08-11', []).flat();
    const byDay = (isoDay: string) => days.find((slot) => slot?.isoDay === isoDay);

    // Cooldown opens on Sat SEP 19, so Fri SEP 18 is the last build day.
    expect(byDay('2026-09-18')?.isCooldown).toBe(false);
    expect(byDay('2026-09-21')?.isCooldown).toBe(true);
    expect(byDay('2026-10-02')?.isCooldown).toBe(true);
  });

  it('flags no cooldown day when the cycle has zero cooldown weeks', () => {
    const days = getCycleDayGrid({ ...cycle, cooldownWeeks: 0 }, '2026-08-11', []).flat();

    expect(days.some((slot) => slot?.isCooldown)).toBe(false);
  });

  it('marks overlapping events, and a holiday wins over a plain event', () => {
    const [week] = getCycleDayGrid({ ...cycle, start: '2026-08-17', end: '2026-08-21' }, '', [
      { id: 'e1', name: 'Demo day', start: '2026-08-18', end: '2026-08-19' },
      { id: 'e2', name: 'Founders day', start: '2026-08-19', end: '2026-08-19', isHoliday: true },
    ]);

    expect(week[0]).toMatchObject({ eventKind: null, eventNames: [] });
    expect(week[1]).toMatchObject({ eventKind: 'event', eventNames: ['Demo day'] });
    expect(week[2]).toMatchObject({
      eventKind: 'holiday',
      eventNames: ['Demo day', 'Founders day'],
    });
    expect(week[3]).toMatchObject({ eventKind: null, eventNames: [] });
  });

  it('marks no cell for an event that covers only a weekend', () => {
    const days = getCycleDayGrid({ ...cycle, start: '2026-08-17', end: '2026-08-25' }, '', [
      { id: 'e1', name: 'Offsite', start: '2026-08-22', end: '2026-08-23' },
    ]).flat();

    expect(days.some((slot) => slot?.eventKind)).toBe(false);
  });
});
