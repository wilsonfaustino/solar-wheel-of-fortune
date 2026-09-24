import { MAX_NAME_LENGTH } from '../constants/defaults';
import type { Name } from '../types/name';
import {
  filterValidNames,
  formatReturnDay,
  isUnavailableToday,
  isValidNameLength,
  toLocalISODay,
  validateUnavailabilityRange,
} from './name';

describe('isValidNameLength', () => {
  it('rejects empty strings', () => {
    expect(isValidNameLength('')).toBe(false);
  });

  it('accepts a name at the maximum length', () => {
    expect(isValidNameLength('A'.repeat(MAX_NAME_LENGTH))).toBe(true);
  });

  it('rejects a name over the maximum length', () => {
    expect(isValidNameLength('A'.repeat(MAX_NAME_LENGTH + 1))).toBe(false);
  });
});

describe('filterValidNames', () => {
  it('trims each name', () => {
    expect(filterValidNames(['  ALEX  ', 'JORDAN'])).toEqual(['ALEX', 'JORDAN']);
  });

  it('drops blank and oversized names', () => {
    const names = ['ALEX', '   ', '', 'A'.repeat(MAX_NAME_LENGTH + 1)];
    expect(filterValidNames(names)).toEqual(['ALEX']);
  });

  it('measures length after the caller normalizes, so uppercase expansion is caught', () => {
    // 'ß'.toUpperCase() is 'SS', so uppercasing can push a name past the limit
    const nearLimit = 'ß'.repeat(MAX_NAME_LENGTH - 1);
    expect(isValidNameLength(nearLimit)).toBe(true);
    expect(filterValidNames([nearLimit.toUpperCase()])).toEqual([]);
  });
});

describe('toLocalISODay', () => {
  it('formats the local calendar day with zero padding', () => {
    expect(toLocalISODay(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('isUnavailableToday', () => {
  const today = new Date(2026, 8, 23, 10);

  it('is true on the first day of the range', () => {
    const name = { unavailableFrom: '2026-09-23', unavailableUntil: '2026-09-25' } as Name;
    expect(isUnavailableToday(name, today)).toBe(true);
  });

  it('is true on the last day of the range', () => {
    const name = { unavailableFrom: '2026-09-20', unavailableUntil: '2026-09-23' } as Name;
    expect(isUnavailableToday(name, today)).toBe(true);
  });

  it('is false before the range starts', () => {
    const name = { unavailableFrom: '2026-09-24', unavailableUntil: '2026-09-30' } as Name;
    expect(isUnavailableToday(name, today)).toBe(false);
  });

  it('is false after the range ends', () => {
    const name = { unavailableFrom: '2026-09-20', unavailableUntil: '2026-09-22' } as Name;
    expect(isUnavailableToday(name, today)).toBe(false);
  });

  it('is false when no range is set', () => {
    expect(isUnavailableToday({} as Name, today)).toBe(false);
  });
});

describe('validateUnavailabilityRange', () => {
  const today = '2026-09-23';

  it('accepts a single day today', () => {
    expect(validateUnavailabilityRange('2026-09-23', '2026-09-23', today)).toBeNull();
  });

  it('accepts a range that started in the past', () => {
    expect(validateUnavailabilityRange('2026-09-01', '2026-09-23', today)).toBeNull();
  });

  it('rejects an end date before the start date', () => {
    expect(validateUnavailabilityRange('2026-09-25', '2026-09-24', today)).toBe(
      'END DATE IS BEFORE START DATE'
    );
  });

  it('rejects a range that ended before today', () => {
    expect(validateUnavailabilityRange('2026-09-20', '2026-09-22', today)).toBe(
      'END DATE IS IN THE PAST'
    );
  });

  it('accepts 30 days counting both ends', () => {
    expect(validateUnavailabilityRange('2026-10-01', '2026-10-30', today)).toBeNull();
  });

  it('rejects 31 days counting both ends', () => {
    expect(validateUnavailabilityRange('2026-10-01', '2026-10-31', today)).toBe(
      'RANGE IS LONGER THAN 30 DAYS'
    );
  });

  it('counts days across a daylight saving change', () => {
    expect(validateUnavailabilityRange('2026-10-20', '2026-11-18', today)).toBeNull();
    expect(validateUnavailabilityRange('2026-10-20', '2026-11-19', today)).toBe(
      'RANGE IS LONGER THAN 30 DAYS'
    );
  });

  it('rejects an empty date', () => {
    expect(validateUnavailabilityRange('', '2026-09-23', today)).toBe('SELECT BOTH DATES');
  });
});

describe('formatReturnDay', () => {
  it('formats the day after the range ends in the given locale', () => {
    expect(formatReturnDay('2026-09-30', 'en-US')).toBe('Oct 1');
  });

  it('rolls over the year', () => {
    expect(formatReturnDay('2026-12-31', 'en-US')).toBe('Jan 1');
  });
});
