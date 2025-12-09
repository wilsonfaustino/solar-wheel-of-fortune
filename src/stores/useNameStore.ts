import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Name, NameList } from "../types/name";
import { DEFAULT_NAMES } from "../constants/defaults";

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
    title: "Default List",
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
}

type NameStore = NameState & NameActions;

export const useNameStore = create<NameStore>()(
  persist(
    (set) => ({
      lists: [initialList],
      activeListId: initialList.id,

      addName: (value: string) => {
        const trimmedValue = value.trim().toUpperCase();
        if (!trimmedValue) return;

        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.activeListId
              ? {
                  ...list,
                  names: [...list.names, createName(trimmedValue)],
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      deleteName: (nameId: string) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.activeListId
              ? {
                  ...list,
                  names: list.names.filter((name) => name.id !== nameId),
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      updateName: (nameId: string, updates: Partial<Name>) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.activeListId
              ? {
                  ...list,
                  names: list.names.map((name) =>
                    name.id === nameId ? { ...name, ...updates } : name
                  ),
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      markSelected: (nameId: string) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.activeListId
              ? {
                  ...list,
                  names: list.names.map((name) =>
                    name.id === nameId
                      ? {
                          ...name,
                          lastSelectedAt: new Date(),
                          selectionCount: name.selectionCount + 1,
                        }
                      : name
                  ),
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      setActiveList: (listId: string) => {
        set({ activeListId: listId });
      },
    }),
    {
      name: "radial-randomizer-v1-state",
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
