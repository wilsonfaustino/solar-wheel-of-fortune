import { beforeEach, describe, expect, test } from 'vitest';
import { useSettingsStore } from './useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    const state = useSettingsStore.getState();
    state.autoExcludeEnabled = true;
    state.clearSelectionAfterExclude = false;
  });

  describe('initial state', () => {
    test('should have autoExcludeEnabled set to true by default', () => {
      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(true);
    });

    test('should have clearSelectionAfterExclude set to false by default', () => {
      const state = useSettingsStore.getState();
      expect(state.clearSelectionAfterExclude).toBe(false);
    });
  });

  describe('setAutoExclude', () => {
    test('should disable auto-exclude when set to false', () => {
      const { setAutoExclude } = useSettingsStore.getState();

      setAutoExclude(false);

      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(false);
    });

    test('should enable auto-exclude when set to true', () => {
      const { setAutoExclude } = useSettingsStore.getState();

      setAutoExclude(false);
      setAutoExclude(true);

      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(true);
    });
  });

  describe('setClearSelectionAfterExclude', () => {
    test('should enable clear selection when set to true', () => {
      const { setClearSelectionAfterExclude } = useSettingsStore.getState();

      setClearSelectionAfterExclude(true);

      const state = useSettingsStore.getState();
      expect(state.clearSelectionAfterExclude).toBe(true);
    });

    test('should disable clear selection when set to false', () => {
      const { setClearSelectionAfterExclude } = useSettingsStore.getState();

      setClearSelectionAfterExclude(true);
      setClearSelectionAfterExclude(false);

      const state = useSettingsStore.getState();
      expect(state.clearSelectionAfterExclude).toBe(false);
    });
  });

  describe('settings independence', () => {
    test('changing autoExclude should not affect clearSelection', () => {
      const { setAutoExclude, setClearSelectionAfterExclude } = useSettingsStore.getState();

      setClearSelectionAfterExclude(true);
      setAutoExclude(false);

      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(false);
      expect(state.clearSelectionAfterExclude).toBe(true);
    });

    test('changing clearSelection should not affect autoExclude', () => {
      const { setAutoExclude, setClearSelectionAfterExclude } = useSettingsStore.getState();

      setAutoExclude(false);
      setClearSelectionAfterExclude(true);

      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(false);
      expect(state.clearSelectionAfterExclude).toBe(true);
    });
  });
});
