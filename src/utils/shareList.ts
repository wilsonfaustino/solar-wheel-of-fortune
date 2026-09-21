import type { Cycle, Name, NameList, SelectionRecord, SpecialEvent } from '../types/name';
import { downloadFile } from './export';
import { isValidNameLength } from './name';

const SHARE_FORMAT_V1 = 'name-list-v1';
const SHARE_FORMAT_V2 = 'name-list-v2';

/** History entries key on the name value: ids are rebuilt by the importing store. */
export type SharedRecord = Pick<
  SelectionRecord,
  'nameValue' | 'sessionId' | 'spinDuration' | 'selectionMethod'
> & { timestamp: string };

interface SharedName {
  value: string;
  weight: number;
  isExcluded: boolean;
  selectionCount: number;
  lastSelectedAt: string | null;
}

interface SharedListFile {
  metadata: { exportDate: string; format: string; includesState?: boolean };
  list: {
    title: string;
    description?: string;
    names: SharedName[] | string[];
    cycles: Cycle[];
    events: SpecialEvent[];
    history?: SharedRecord[];
  };
}

/** Ready to import: ids are minted by the store so it can merge or create a list. */
export interface ParsedSharedList {
  /** False when the sender opted out of state, so importers must not touch theirs. */
  includesState: boolean;
  title: string;
  description?: string;
  names: Omit<Name, 'id'>[];
  cycles: Omit<Cycle, 'id'>[];
  events: Omit<SpecialEvent, 'id'>[];
  history: SharedRecord[];
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'list'
  );
}

/**
 * Serializes a list's names, cycles, events and, optionally, its selection state
 * and the history records belonging to that list.
 */
export function exportListToJSON(
  list: NameList,
  options: { history?: SelectionRecord[]; includeState?: boolean; filename?: string } = {}
): void {
  const { history = [], includeState = true, filename } = options;

  const payload: SharedListFile = {
    metadata: {
      exportDate: new Date().toISOString(),
      format: SHARE_FORMAT_V2,
      includesState: includeState,
    },
    list: {
      title: list.title,
      description: list.description,
      names: list.names.map((name) => ({
        value: name.value,
        weight: name.weight,
        isExcluded: includeState ? name.isExcluded : false,
        selectionCount: includeState ? name.selectionCount : 0,
        lastSelectedAt: includeState ? toISO(name.lastSelectedAt) : null,
      })),
      cycles: list.cycles ?? [],
      events: list.events ?? [],
      history: includeState
        ? history
            .filter((record) => record.listId === list.id)
            .map((record) => ({
              nameValue: record.nameValue,
              timestamp: toISO(record.timestamp) ?? new Date().toISOString(),
              sessionId: record.sessionId,
              spinDuration: record.spinDuration,
              selectionMethod: record.selectionMethod,
            }))
        : [],
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(blob, filename || `list_${slugify(list.title)}_${timestamp}.json`);
}

function toISO(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function parseName(entry: SharedName | string): Omit<Name, 'id'> {
  const shared: SharedName =
    typeof entry === 'string'
      ? { value: entry, weight: 1.0, isExcluded: false, selectionCount: 0, lastSelectedAt: null }
      : entry;

  return {
    value: shared.value.trim().toUpperCase(),
    weight: shared.weight ?? 1.0,
    createdAt: new Date(),
    lastSelectedAt: shared.lastSelectedAt ? new Date(shared.lastSelectedAt) : null,
    selectionCount: shared.selectionCount ?? 0,
    isExcluded: shared.isExcluded ?? false,
    categoryId: null,
  };
}

/**
 * Parses a shared list file. Accepts both the v1 format (plain name strings, no
 * selection state) and v2. Throws on malformed input so callers can surface it.
 */
export function parseSharedList(fileContent: string): ParsedSharedList {
  const parsed = JSON.parse(fileContent) as Partial<SharedListFile>;
  const format = parsed?.metadata?.format;

  if (
    (format !== SHARE_FORMAT_V1 && format !== SHARE_FORMAT_V2) ||
    !Array.isArray(parsed.list?.names)
  ) {
    throw new Error('Unrecognized list file');
  }

  return {
    title: parsed.list.title || 'Imported List',
    description: parsed.list.description,
    includesState: parsed.metadata?.includesState ?? false,
    names: parsed.list.names
      .filter((entry) => typeof entry === 'string' || typeof entry?.value === 'string')
      .map(parseName)
      .filter((name) => isValidNameLength(name.value)),
    cycles: (parsed.list.cycles ?? []).map(({ id: _id, ...cycle }) => cycle),
    events: (parsed.list.events ?? []).map(({ id: _id, ...event }) => event),
    history: Array.isArray(parsed.list.history) ? parsed.list.history : [],
  };
}
