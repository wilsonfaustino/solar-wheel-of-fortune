import { MAX_NAME_LENGTH } from '../constants/defaults';
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

export function isUnavailableToday(name: Name, today = new Date()): boolean {
  return name.unavailableOn === toLocalISODay(today);
}
