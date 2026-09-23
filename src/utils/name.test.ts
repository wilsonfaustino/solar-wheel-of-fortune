import { MAX_NAME_LENGTH } from '../constants/defaults';
import type { Name } from '../types/name';
import { filterValidNames, isUnavailableToday, isValidNameLength, toLocalISODay } from './name';

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

  it('is true when unavailableOn matches today', () => {
    expect(isUnavailableToday({ unavailableOn: '2026-09-23' } as Name, today)).toBe(true);
  });

  it('is false when unavailableOn is a past day', () => {
    expect(isUnavailableToday({ unavailableOn: '2026-09-22' } as Name, today)).toBe(false);
  });

  it('is false when unavailableOn is not set', () => {
    expect(isUnavailableToday({} as Name, today)).toBe(false);
  });
});
