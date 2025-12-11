import type { NameList } from '../types/name';

export const mockTestList: NameList = {
  id: 'test-list-1',
  title: 'Test List',
  names: [
    {
      id: 'test-name-1',
      value: 'ALICE',
      weight: 1.0,
      createdAt: new Date(),
      lastSelectedAt: null,
      selectionCount: 0,
      isExcluded: false,
      categoryId: null,
    },
    {
      id: 'test-name-2',
      value: 'BOB',
      weight: 1.0,
      createdAt: new Date(),
      lastSelectedAt: null,
      selectionCount: 0,
      isExcluded: false,
      categoryId: null,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockInitialState = {
  lists: [mockTestList],
  activeListId: mockTestList.id,
  history: [],
};
