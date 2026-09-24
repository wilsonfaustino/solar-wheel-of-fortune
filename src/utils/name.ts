import { MAX_NAME_LENGTH, MAX_UNAVAILABILITY_DAYS } from '../constants/defaults';
import type { Name } from '../types/name';

export function isValidNameLength(value: string): boolean {
  return value.length > 0 && value.length <= MAX_NAME_LENGTH;
}

export function filterValidNames(names: string[]): string[] {
  return names.map((name) => name.trim()).filter(isValidNameLength);
}

/** Local calendar day, unlike toISODay in cycle.ts which uses UTC. */
export function toLocalISODay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// ISO day strings sort the same as the dates they hold
export function isUnavailableToday(name: Name, today = new Date()): boolean {
  const { unavailableFrom, unavailableUntil } = name;
  if (!unavailableFrom || !unavailableUntil) return false;
  const todayISO = toLocalISODay(today);
  return unavailableFrom <= todayISO && todayISO <= unavailableUntil;
}

const MILLISECONDS_PER_DAY = 86_400_000;

export function validateUnavailabilityRange(
  from: string,
  until: string,
  todayISO: string
): string | null {
  if (!from || !until) return 'SELECT BOTH DATES';
  if (until < from) return 'END DATE IS BEFORE START DATE';
  if (until < todayISO) return 'END DATE IS IN THE PAST';
  // Date-only ISO strings parse as UTC midnight, so daylight saving never skews the count
  const inclusiveDays = (Date.parse(until) - Date.parse(from)) / MILLISECONDS_PER_DAY + 1;
  if (inclusiveDays > MAX_UNAVAILABILITY_DAYS) {
    return `RANGE IS LONGER THAN ${MAX_UNAVAILABILITY_DAYS} DAYS`;
  }
  return null;
}

/** Short month and day after the range ends, in the browser locale unless one is given. */
export function formatReturnDay(unavailableUntil: string, locale?: string): string {
  const [year, month, day] = unavailableUntil.split('-').map(Number);
  const returnDay = new Date(year, month - 1, day + 1);
  return returnDay.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
