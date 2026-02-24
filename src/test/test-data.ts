import type { Name, NameList, SelectionRecord } from '@/types/name';

const now = new Date('2025-01-01T00:00:00Z');

const namesOnly = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

/**
 * Sample names for testing
 */
export const sampleNames: Name[] = namesOnly.map((name, index) => ({
  id: (index + 1).toString(),
  value: name,
  weight: 1,
  createdAt: now,
  lastSelectedAt: null,
  selectionCount: 0,
  isExcluded: false,
  categoryId: null,
}));

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
 * Mock initial state for store tests
 */
export const mockInitialState = {
  lists: [
    {
      id: 'test-list-1',
      title: 'Test List',
      names: [
        sampleNames.slice(0, 2).map((name) => ({
          ...name,
          id: `test-name-${name.id}`,
        })),
      ].flat(),
      createdAt: now,
      updatedAt: now,
    },
  ],
  activeListId: 'test-list-1',
  history: [],
  currentTheme: 'cyan' as const,
};
