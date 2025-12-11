import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DEFAULT_NAMES } from '../constants/defaults';
import type { Name, NameList } from '../types/name';

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
}

type NameStore = NameState & NameActions;

export const useNameStore = create<NameStore>()(
  persist(
    immer((set) => ({
      lists: [initialList],
      activeListId: initialList.id,

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
    })),
    {
      name: 'radial-randomizer-v1-state',
      partialize: (state) => ({
        lists: state.lists,
        activeListId: state.activeListId,
      }),
    }
  )
);

// Selectors - use these outside the store
export const selectActiveList = (state: NameStore): NameList | undefined => {
  return state.lists.find((list) => list.id === state.activeListId);
};

export const selectActiveNames = (state: NameStore): Name[] => {
  const activeList = state.lists.find((list) => list.id === state.activeListId);
  if (!activeList) return [];
  return activeList.names.filter((name) => !name.isExcluded);
};
