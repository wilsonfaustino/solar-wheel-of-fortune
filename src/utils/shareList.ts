import type { Cycle, Name, NameList, SpecialEvent } from '../types/name';
import { downloadFile } from './export';

const SHARE_FORMAT = 'name-list-v1';

interface SharedListFile {
  metadata: { exportDate: string; format: string };
  list: {
    title: string;
    description?: string;
    names: string[];
    cycles: Cycle[];
    events: SpecialEvent[];
  };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'list'
  );
}

/** Serializes a list's names, cycles and events into a shareable JSON file. */
export function exportListToJSON(list: NameList, filename?: string): void {
  const payload: SharedListFile = {
    metadata: { exportDate: new Date().toISOString(), format: SHARE_FORMAT },
    list: {
      title: list.title,
      description: list.description,
      names: list.names.map((name) => name.value),
      cycles: list.cycles ?? [],
      events: list.events ?? [],
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(blob, filename || `list_${slugify(list.title)}_${timestamp}.json`);
}

function createName(value: string): Name {
  return {
    id: crypto.randomUUID(),
    value,
    weight: 1.0,
    createdAt: new Date(),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  };
}

/**
 * Parses a shared list file into a fresh NameList.
 * Selection state is not shared: names start unselected and included.
 * Throws on malformed input so callers can surface the failure.
 */
export function parseSharedList(fileContent: string): NameList {
  const parsed = JSON.parse(fileContent) as Partial<SharedListFile>;

  if (parsed?.metadata?.format !== SHARE_FORMAT || !Array.isArray(parsed.list?.names)) {
    throw new Error('Unrecognized list file');
  }

  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: parsed.list.title || 'Imported List',
    description: parsed.list.description,
    names: parsed.list.names.filter((value) => typeof value === 'string').map(createName),
    cycles: (parsed.list.cycles ?? []).map((cycle) => ({ ...cycle, id: crypto.randomUUID() })),
    events: (parsed.list.events ?? []).map((event) => ({ ...event, id: crypto.randomUUID() })),
    createdAt: now,
    updatedAt: now,
  };
}
