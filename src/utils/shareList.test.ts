import { describe, expect, it, vi } from 'vitest';
import type { NameList } from '../types/name';
import { exportListToJSON, parseSharedList } from './shareList';

const list: NameList = {
  id: 'list-1',
  title: 'Squad A',
  names: [
    {
      id: 'n1',
      value: 'ALICE',
      weight: 1,
      createdAt: new Date('2026-01-01'),
      lastSelectedAt: new Date('2026-02-01'),
      selectionCount: 3,
      isExcluded: true,
      categoryId: null,
    },
  ],
  cycles: [{ id: 'c1', name: 'Q1', start: '2026-01-01', end: '2026-03-31', cooldownWeeks: 2 }],
  events: [{ id: 'e1', name: 'Demo', start: '2026-02-10', end: '2026-02-11' }],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

let capturedContent = '';

class MockBlob {
  constructor(parts: string[]) {
    capturedContent = parts[0];
  }
}

function captureExport(): string {
  vi.stubGlobal('Blob', MockBlob);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  exportListToJSON(list);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  return capturedContent;
}

describe('shareList', () => {
  it('round-trips names, cycles and events', () => {
    const imported = parseSharedList(captureExport());

    expect(imported.title).toBe('Squad A');
    expect(imported.names.map((name) => name.value)).toEqual(['ALICE']);
    expect(imported.cycles?.[0]).toMatchObject({ name: 'Q1', cooldownWeeks: 2 });
    expect(imported.events?.[0]).toMatchObject({ name: 'Demo', start: '2026-02-10' });
  });

  it('resets selection state and ids on import', () => {
    const imported = parseSharedList(captureExport());

    expect(imported.id).not.toBe(list.id);
    expect(imported.names[0].id).not.toBe('n1');
    expect(imported.names[0].selectionCount).toBe(0);
    expect(imported.names[0].isExcluded).toBe(false);
  });

  it('rejects files that are not shared lists', () => {
    expect(() => parseSharedList('{"foo":1}')).toThrow('Unrecognized list file');
  });
});
