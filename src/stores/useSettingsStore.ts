import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoExcludeEnabled: boolean;
  clearSelectionAfterExclude: boolean;
  soundEnabled: boolean;
  memorialBannerEnabled: boolean;

  setAutoExclude: (enabled: boolean) => void;
  setClearSelectionAfterExclude: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMemorialBannerEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoExcludeEnabled: true,
      clearSelectionAfterExclude: false,
      soundEnabled: false,
      memorialBannerEnabled: true,

      setAutoExclude: (enabled) => set({ autoExcludeEnabled: enabled }),
      setClearSelectionAfterExclude: (enabled) => set({ clearSelectionAfterExclude: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMemorialBannerEnabled: (enabled) => set({ memorialBannerEnabled: enabled }),
    }),
    { name: 'settings-storage' }
  )
);
