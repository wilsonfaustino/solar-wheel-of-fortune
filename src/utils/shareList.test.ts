import type { NameList, SelectionRecord } from '../types/name';
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

const history: SelectionRecord[] = [
  {
    id: 'r1',
    nameId: 'n1',
    nameValue: 'ALICE',
    listId: 'list-1',
    timestamp: new Date('2026-02-01'),
    sessionId: 's1',
    spinDuration: 4000,
    selectionMethod: 'wheel',
  },
  {
    id: 'r2',
    nameId: 'other',
    nameValue: 'BOB',
    listId: 'other-list',
    timestamp: new Date('2026-02-02'),
    sessionId: 's1',
    spinDuration: 4000,
    selectionMethod: 'wheel',
  },
];

let capturedContent = '';

class MockBlob {
  constructor(parts: string[]) {
    capturedContent = parts[0];
  }
}

function captureExport(options?: Parameters<typeof exportListToJSON>[1]): string {
  vi.stubGlobal('Blob', MockBlob);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  exportListToJSON(list, options);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  return capturedContent;
}

describe('shareList', () => {
  it('round-trips names, cycles and events', () => {
    const parsed = parseSharedList(captureExport());

    expect(parsed.title).toBe('Squad A');
    expect(parsed.names.map((name) => name.value)).toEqual(['ALICE']);
    expect(parsed.cycles[0]).toMatchObject({ name: 'Q1', cooldownWeeks: 2 });
    expect(parsed.events[0]).toMatchObject({ name: 'Demo', start: '2026-02-10' });
  });

  it('keeps selection state and history for the exported list only', () => {
    const parsed = parseSharedList(captureExport({ history }));

    expect(parsed.names[0]).toMatchObject({ selectionCount: 3, isExcluded: true });
    expect(parsed.names[0].lastSelectedAt).toEqual(new Date('2026-02-01'));
    expect(parsed.history.map((record) => record.nameValue)).toEqual(['ALICE']);
  });

  it('drops selection state and history when not included', () => {
    const parsed = parseSharedList(captureExport({ history, includeState: false }));

    expect(parsed.names[0]).toMatchObject({
      selectionCount: 0,
      isExcluded: false,
      lastSelectedAt: null,
    });
    expect(parsed.history).toEqual([]);
  });

  it('reads v1 files with plain name strings', () => {
    const v1 = JSON.stringify({
      metadata: { exportDate: '2026-01-01T00:00:00.000Z', format: 'name-list-v1' },
      list: { title: 'Legacy', names: ['ALICE'], cycles: [], events: [] },
    });

    const parsed = parseSharedList(v1);

    expect(parsed.names[0]).toMatchObject({ value: 'ALICE', selectionCount: 0, isExcluded: false });
    expect(parsed.history).toEqual([]);
  });

  it('rejects files that are not shared lists', () => {
    expect(() => parseSharedList('{"foo":1}')).toThrow('Unrecognized list file');
  });
});
