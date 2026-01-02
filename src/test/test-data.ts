import type { Name, NameList, SelectionRecord } from '@/types/name';

const now = new Date('2025-01-01T00:00:00Z');

/**
 * Sample names for testing
 */
export const sampleNames: Name[] = [
  {
    id: '1',
    value: 'Alice',
    weight: 1,
    createdAt: now,
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
  {
    id: '2',
    value: 'Bob',
    weight: 1,
    createdAt: now,
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
  {
    id: '3',
    value: 'Charlie',
    weight: 1,
    createdAt: now,
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
  {
    id: '4',
    value: 'Diana',
    weight: 1,
    createdAt: now,
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
  {
    id: '5',
    value: 'Eve',
    weight: 1,
    createdAt: now,
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  },
];

/**
 * Sample name with selection history
 */
export const selectedName: Name = {
  ...(sampleNames.at(0) as Name),
  lastSelectedAt: new Date('2025-01-01T10:00:00Z'),
  selectionCount: 1,
};

/**
 * Sample excluded name
 */
export const excludedName: Name = {
  ...(sampleNames.at(1) as Name),
  isExcluded: true,
};

/**
 * Default name list for testing
 */
export const defaultNameList: NameList = {
  id: 'default',
  title: 'Default List',
  names: sampleNames,
  createdAt: now,
  updatedAt: now,
};

/**
 * Secondary name list for multi-list tests
 */
export const secondaryNameList: NameList = {
  id: 'secondary',
  title: 'Team B',
  names: [
    {
      id: '6',
      value: 'Frank',
      weight: 1,
      createdAt: now,
      lastSelectedAt: null,
      selectionCount: 0,
      isExcluded: false,
      categoryId: null,
    },
    {
      id: '7',
      value: 'Grace',
      weight: 1,
      createdAt: now,
      lastSelectedAt: null,
      selectionCount: 0,
      isExcluded: false,
      categoryId: null,
    },
  ],
  createdAt: now,
  updatedAt: now,
};

/**
 * Sample selection history records
 */
export const sampleSelectionHistory: SelectionRecord[] = [
  {
    id: 'rec-1',
    nameId: '1',
    nameValue: 'Alice',
    timestamp: new Date('2025-01-01T10:00:00Z'),
    listId: 'default',
    sessionId: 'test-session-1',
    spinDuration: 3000,
  },
  {
    id: 'rec-2',
    nameId: '2',
    nameValue: 'Bob',
    timestamp: new Date('2025-01-01T11:00:00Z'),
    listId: 'default',
    sessionId: 'test-session-1',
    spinDuration: 3500,
  },
  {
    id: 'rec-3',
    nameId: '3',
    nameValue: 'Charlie',
    timestamp: new Date('2025-01-01T12:00:00Z'),
    listId: 'default',
    sessionId: 'test-session-1',
    spinDuration: 4000,
  },
];

/**
 * CSV-formatted names for bulk import tests
 */
export const bulkImportCSV = `Alice
Bob
Charlie
Diana
Eve`;

/**
 * CSV with special characters (commas, quotes)
 */
export const bulkImportCSVSpecialChars = `"Smith, John"
"O'Brien, Mary"
"Jane ""The Best"" Doe"`;

/**
 * Mock initial state for store tests
 */
export const mockInitialState = {
  lists: [
    {
      id: 'test-list-1',
      title: 'Test List',
      names: [
        ...sampleNames.slice(0, 2).map((name) => ({
          ...name,
          id: `test-name-${name.id}`,
        })),
      ],
      createdAt: now,
      updatedAt: now,
    },
  ],
  activeListId: 'test-list-1',
  history: [],
  currentTheme: 'cyan' as const,
};
