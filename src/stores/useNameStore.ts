import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DEFAULT_NAMES } from '../constants/defaults';
import { DEFAULT_THEME } from '../constants/themes';
import type { Name, NameList, SelectionRecord } from '../types/name';
import type { Theme } from '../types/theme';

function generateId(): string {
  return crypto.randomUUID();
}

function createName(value: string): Name {
  return {
    id: generateId(),
    value,
    weight: 1.0,
    createdAt: new Date(),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  };
}

function createDefaultList(): NameList {
  return {
    id: generateId(),
    title: 'Default List',
    names: DEFAULT_NAMES.map(createName),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const initialList = createDefaultList();

interface NameState {
  lists: NameList[];
  activeListId: string | null;
  history: SelectionRecord[];
  currentTheme: Theme;
}

interface NameActions {
  addName: (value: string) => void;
  deleteName: (nameId: string) => void;
  updateName: (nameId: string, updates: Partial<Name>) => void;
  markSelected: (nameId: string) => void;
  setActiveList: (listId: string) => void;
  createList: (title: string) => void;
  deleteList: (listId: string) => void;
  updateListTitle: (listId: string, title: string) => void;
  toggleNameExclusion: (nameId: string) => void;
  clearSelections: () => void;
  resetList: () => void;
  bulkAddNames: (names: string[]) => void;
  recordSelection: (nameValue: string, nameId: string) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  setTheme: (theme: Theme) => void;
}

type NameStore = NameState & NameActions;

export const useNameStore = create<NameStore>()(
  persist(
    immer((set) => ({
      lists: [initialList],
      activeListId: initialList.id,
      history: [],
      currentTheme: DEFAULT_THEME,

      addName: (value: string) => {
        const trimmedValue = value.trim().toUpperCase();
        if (!trimmedValue) return;

        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            activeList.names.push(createName(trimmedValue));
            activeList.updatedAt = new Date();
          }
        });
      },

      deleteName: (nameId: string) => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            activeList.names = activeList.names.filter((name) => name.id !== nameId);
            activeList.updatedAt = new Date();
          }
        });
      },

      updateName: (nameId: string, updates: Partial<Name>) => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            const name = activeList.names.find((n) => n.id === nameId);
            if (name) {
              Object.assign(name, updates);
              activeList.updatedAt = new Date();
            }
          }
        });
      },

      markSelected: (nameId: string) => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            const name = activeList.names.find((n) => n.id === nameId);
            if (name) {
              name.lastSelectedAt = new Date();
              name.selectionCount += 1;
              activeList.updatedAt = new Date();
            }
          }
        });
      },

      setActiveList: (listId: string) => {
        set((draft) => {
          draft.activeListId = listId;
        });
      },

      createList: (title: string) => {
        set((draft) => {
          const newList: NameList = {
            id: generateId(),
            title: title.trim() || 'New List',
            names: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          draft.lists.push(newList);
          draft.activeListId = newList.id;
        });
      },

      deleteList: (listId: string) => {
        set((draft) => {
          if (draft.lists.length <= 1) return;

          const index = draft.lists.findIndex((list) => list.id === listId);
          if (index !== -1) {
            draft.lists.splice(index, 1);
            if (draft.activeListId === listId) {
              draft.activeListId = draft.lists[0].id;
            }
          }
        });
      },

      updateListTitle: (listId: string, title: string) => {
        set((draft) => {
          const list = draft.lists.find((l) => l.id === listId);
          if (list) {
            list.title = title.trim() || 'Untitled List';
            list.updatedAt = new Date();
          }
        });
      },

      toggleNameExclusion: (nameId: string) => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            const name = activeList.names.find((n) => n.id === nameId);
            if (name) {
              name.isExcluded = !name.isExcluded;
              activeList.updatedAt = new Date();
            }
          }
        });
      },

      clearSelections: () => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            activeList.names.forEach((name) => {
              name.lastSelectedAt = null;
              name.selectionCount = 0;
            });
            activeList.updatedAt = new Date();
          }
        });
      },

      resetList: () => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            activeList.names.forEach((name) => {
              name.lastSelectedAt = null;
              name.selectionCount = 0;
              name.isExcluded = false;
            });
            activeList.updatedAt = new Date();
          }
        });
      },

      bulkAddNames: (names: string[]) => {
        set((draft) => {
          const activeList = draft.lists.find((list) => list.id === draft.activeListId);
          if (activeList) {
            const validNames = names
              .map((n) => n.trim().toUpperCase())
              .filter((n) => n.length > 0 && n.length <= 100);

            validNames.forEach((nameValue) => {
              activeList.names.push(createName(nameValue));
            });
            activeList.updatedAt = new Date();
          }
        });
      },

      recordSelection: (nameValue: string, nameId: string) => {
        set((draft) => {
          const record: SelectionRecord = {
            id: generateId(),
            nameId,
            nameValue,
            listId: draft.activeListId || '',
            timestamp: new Date(),
            sessionId: '',
            spinDuration: 0,
          };
          draft.history.push(record);
          // Keep only last 100 records (FIFO)
          if (draft.history.length > 100) {
            draft.history = draft.history.slice(-100);
          }
        });
      },

      clearHistory: () => {
        set((draft) => {
          draft.history = [];
        });
      },

      deleteHistoryItem: (id: string) => {
        set((draft) => {
          draft.history = draft.history.filter((item) => item.id !== id);
        });
      },

      setTheme: (theme: Theme) => {
        set((draft) => {
          draft.currentTheme = theme;
        });
      },
    })),
    {
      name: 'radial-randomizer-v1-state',
      partialize: (state) => ({
        lists: state.lists,
        activeListId: state.activeListId,
        history: state.history,
        currentTheme: state.currentTheme,
      }),
    }
  )
);

export const selectHistoryStats = (
  state: NameStore
): { total: number; unique: number; lastSelection: Date | null } => {
  const total = state.history.length;
  const uniqueNames = new Set(state.history.map((r) => r.nameId)).size;
  const lastSelection = state.history.at(-1)?.timestamp ?? null;
  return {
    total,
    unique: uniqueNames,
    lastSelection,
  };
};
