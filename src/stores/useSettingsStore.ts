import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoExcludeEnabled: boolean;
  clearSelectionAfterExclude: boolean;

  setAutoExclude: (enabled: boolean) => void;
  setClearSelectionAfterExclude: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoExcludeEnabled: true,
      clearSelectionAfterExclude: false,

      setAutoExclude: (enabled) => set({ autoExcludeEnabled: enabled }),
      setClearSelectionAfterExclude: (enabled) => set({ clearSelectionAfterExclude: enabled }),
    }),
    { name: 'settings-storage' }
  )
);
