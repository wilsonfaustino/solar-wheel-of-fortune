import { MAX_NAME_LENGTH } from '../constants/defaults';
import { filterValidNames, isValidNameLength } from './name';

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
