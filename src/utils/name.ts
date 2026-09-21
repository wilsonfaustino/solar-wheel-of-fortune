import { MAX_NAME_LENGTH } from '../constants/defaults';

export function isValidNameLength(value: string): boolean {
  return value.length > 0 && value.length <= MAX_NAME_LENGTH;
}

export function filterValidNames(names: string[]): string[] {
  return names.map((name) => name.trim()).filter(isValidNameLength);
}
