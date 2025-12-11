import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SelectionRecord } from '../types/name';
import { exportToCSV, exportToJSON } from './export';

interface MockLink {
  href: string;
  download: string;
  click: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}

const mockRecords: SelectionRecord[] = [
  {
    id: '1',
    nameId: 'name-1',
    nameValue: 'ALICE',
    listId: 'list-1',
    timestamp: new Date('2024-12-10T10:00:00Z'),
    sessionId: 'session-1',
    spinDuration: 2000,
  },
  {
    id: '2',
    nameId: 'name-2',
    nameValue: 'BOB',
    listId: 'list-1',
    timestamp: new Date('2024-12-10T10:05:00Z'),
    sessionId: 'session-1',
    spinDuration: 2500,
  },
  {
    id: '3',
    nameId: 'name-3',
    nameValue: 'CHARLIE',
    listId: 'list-1',
    timestamp: new Date('2024-12-10T10:10:00Z'),
    sessionId: 'session-1',
    spinDuration: 2200,
  },
];

describe('Export Utilities', () => {
  let createdBlobContent: string[] = [];
  let blobType: string = '';

  beforeEach(() => {
    createdBlobContent = [];
    blobType = '';

    // Mock Blob to capture content
    class MockBlob {
      parts: string[];
      options: Record<string, string>;

      constructor(parts: string[], options: Record<string, string>) {
        this.parts = parts;
        this.options = options;
        createdBlobContent = parts;
        blobType = options.type;
      }
    }

    vi.stubGlobal('Blob', MockBlob);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const mockLink: MockLink = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should format records as CSV with headers', () => {
      exportToCSV(mockRecords, 'test.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toContain('name,timestamp,list_id');
    });

    it('should include all records as rows', () => {
      exportToCSV(mockRecords, 'test.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toContain('ALICE');
      expect(csvContent).toContain('BOB');
      expect(csvContent).toContain('CHARLIE');
    });

    it('should escape CSV fields with commas', () => {
      const record = {
        ...mockRecords[0],
        nameValue: 'ALICE, BOB',
      };
      exportToCSV([record], 'test.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toContain('"ALICE, BOB"');
    });

    it('should escape CSV fields with quotes', () => {
      const record = {
        ...mockRecords[0],
        nameValue: 'CHARLIE "CHUCK" BROWN',
      };
      exportToCSV([record], 'test.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toContain('"CHARLIE ""CHUCK"" BROWN"');
    });

    it('should escape CSV fields with newlines', () => {
      const record = {
        ...mockRecords[0],
        nameValue: 'MULTI\nLINE\nNAME',
      };
      exportToCSV([record], 'test.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toContain('"MULTI\nLINE\nNAME"');
    });

    it('should handle empty records array', () => {
      exportToCSV([], 'empty.csv');
      const csvContent = createdBlobContent[0];

      expect(csvContent).toBe('name,timestamp,list_id');
    });

    it('should set correct Blob type for CSV', () => {
      exportToCSV(mockRecords, 'test.csv');

      expect(blobType).toBe('text/csv;charset=utf-8;');
    });

    it('should trigger createObjectURL for download', () => {
      exportToCSV(mockRecords, 'test.csv');

      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('should format records as valid JSON', () => {
      exportToJSON(mockRecords, 'test.json');
      const jsonContent = createdBlobContent[0];

      expect(() => JSON.parse(jsonContent)).not.toThrow();
    });

    it('should include metadata with export date and record count', () => {
      exportToJSON(mockRecords, 'test.json');
      const jsonContent = createdBlobContent[0];
      const data = JSON.parse(jsonContent);

      expect(data.metadata).toBeDefined();
      expect(data.metadata.exportDate).toBeDefined();
      expect(data.metadata.totalRecords).toBe(3);
      expect(data.metadata.format).toBe('selection-history-v1');
    });

    it('should convert timestamps to ISO strings', () => {
      exportToJSON(mockRecords, 'test.json');
      const jsonContent = createdBlobContent[0];
      const data = JSON.parse(jsonContent);

      expect(data.records[0].timestamp).toBe('2024-12-10T10:00:00.000Z');
      expect(typeof data.records[0].timestamp).toBe('string');
    });

    it('should include all record fields', () => {
      exportToJSON(mockRecords, 'test.json');
      const jsonContent = createdBlobContent[0];
      const data = JSON.parse(jsonContent);

      const record = data.records[0];
      expect(record.id).toBe('1');
      expect(record.nameId).toBe('name-1');
      expect(record.nameValue).toBe('ALICE');
      expect(record.listId).toBe('list-1');
      expect(record.sessionId).toBe('session-1');
      expect(record.spinDuration).toBe(2000);
    });

    it('should be pretty-printed (formatted JSON)', () => {
      exportToJSON(mockRecords, 'test.json');
      const jsonContent = createdBlobContent[0];

      expect(jsonContent).toContain('\n');
      expect(jsonContent).toContain('  ');
    });

    it('should handle empty records array', () => {
      exportToJSON([], 'empty.json');
      const jsonContent = createdBlobContent[0];
      const data = JSON.parse(jsonContent);

      expect(data.records).toEqual([]);
      expect(data.metadata.totalRecords).toBe(0);
    });

    it('should handle special characters in names', () => {
      const records = [
        { ...mockRecords[0], nameValue: 'ALICE, BOB' },
        { ...mockRecords[1], nameValue: 'CHARLIE "CHUCK" BROWN' },
        { ...mockRecords[2], nameValue: 'MULTI\nLINE\nNAME' },
      ];
      exportToJSON(records, 'test.json');
      const jsonContent = createdBlobContent[0];
      const data = JSON.parse(jsonContent);

      expect(data.records[0].nameValue).toBe('ALICE, BOB');
      expect(data.records[1].nameValue).toBe('CHARLIE "CHUCK" BROWN');
      expect(data.records[2].nameValue).toContain('\n');
    });

    it('should set correct Blob type for JSON', () => {
      exportToJSON(mockRecords, 'test.json');

      expect(blobType).toBe('application/json;charset=utf-8;');
    });

    it('should trigger createObjectURL for download', () => {
      exportToJSON(mockRecords, 'test.json');

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should revoke blob URL after download', () => {
      exportToJSON(mockRecords, 'test.json');

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
