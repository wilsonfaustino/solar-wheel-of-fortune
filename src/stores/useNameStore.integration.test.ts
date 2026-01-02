import { beforeEach, describe, expect, it } from 'vitest';
import { clearPersistedState } from '@/test/integration-helpers';
import { defaultNameList, sampleSelectionHistory } from '@/test/test-data';
import { useNameStore } from './useNameStore';

describe('useNameStore Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState();
  });

  describe('Multi-List Operations Flow', () => {
    it('should create, switch, and isolate lists with proper state management', () => {
      const { createList, addName, setActiveList } = useNameStore.getState();

      createList('Team A');
      createList('Team B');

      const teamAId = useNameStore.getState().lists.find((l) => l.title === 'Team A')?.id;
      const teamBId = useNameStore.getState().lists.find((l) => l.title === 'Team B')?.id;

      expect(teamAId).toBeDefined();
      expect(teamBId).toBeDefined();

      setActiveList(teamAId!);
      addName('Alice');
      addName('Bob');

      setActiveList(teamBId!);
      addName('Charlie');

      const state = useNameStore.getState();
      const teamA = state.lists.find((l) => l.title === 'Team A');
      const teamB = state.lists.find((l) => l.title === 'Team B');

      expect(teamA?.names).toHaveLength(2);
      expect(teamB?.names).toHaveLength(1);
      expect(teamA?.names.some((n) => n.value === 'CHARLIE')).toBe(false);
      expect(teamB?.names.some((n) => n.value === 'ALICE')).toBe(false);
    });

    it('should handle list deletion and revert to default list', () => {
      const { createList, deleteList, setActiveList } = useNameStore.getState();

      createList('Temporary List');
      const tempListId = useNameStore
        .getState()
        .lists.find((l) => l.title === 'Temporary List')?.id;

      setActiveList(tempListId!);
      deleteList(tempListId!);

      const state = useNameStore.getState();
      expect(state.lists.some((l) => l.title === 'Temporary List')).toBe(false);
      expect(state.activeListId).not.toBe(tempListId);
    });
  });

  describe('Name Exclusion Workflow', () => {
    it('should exclude name and verify it is not selectable', () => {
      useNameStore.setState({
        lists: [defaultNameList],
        activeListId: 'default',
        history: [],
        currentTheme: 'cyan',
      });

      const { toggleNameExclusion } = useNameStore.getState();
      const bobId = defaultNameList.names.find((n) => n.value === 'Bob')?.id;

      toggleNameExclusion(bobId!);

      const state = useNameStore.getState();
      const activeList = state.lists.find((l) => l.id === state.activeListId);
      const bob = activeList?.names.find((n) => n.id === bobId);
      const selectableNames = activeList?.names.filter((n) => !n.isExcluded);

      expect(bob?.isExcluded).toBe(true);
      expect(selectableNames).toHaveLength(4);
      expect(selectableNames?.some((n) => n.value === 'Bob')).toBe(false);

      toggleNameExclusion(bobId!);

      const updatedState = useNameStore.getState();
      const updatedList = updatedState.lists.find((l) => l.id === updatedState.activeListId);
      const updatedBob = updatedList?.names.find((n) => n.id === bobId);

      expect(updatedBob?.isExcluded).toBe(false);
    });
  });

  describe('Selection History Flow', () => {
    it('should record selections and maintain FIFO limit', () => {
      useNameStore.setState({
        lists: [defaultNameList],
        activeListId: 'default',
        history: [],
        currentTheme: 'cyan',
      });

      const { recordSelection } = useNameStore.getState();
      const alice = defaultNameList.names[0];
      const bob = defaultNameList.names[1];
      const charlie = defaultNameList.names[2];

      recordSelection(alice.value, alice.id);
      recordSelection(bob.value, bob.id);
      recordSelection(charlie.value, charlie.id);

      const state = useNameStore.getState();
      expect(state.history).toHaveLength(3);
      expect(state.history[0].nameValue).toBe('Alice');
      expect(state.history[1].nameValue).toBe('Bob');
      expect(state.history[2].nameValue).toBe('Charlie');

      for (let i = 0; i < 47; i++) {
        const name = defaultNameList.names[i % 5];
        recordSelection(name.value, name.id);
      }

      const finalState = useNameStore.getState();
      expect(finalState.history.length).toBeGreaterThanOrEqual(50);
      expect(finalState.history.length).toBeLessThanOrEqual(51);
    });

    it('should delete single record and clear all history', () => {
      useNameStore.setState({
        lists: [defaultNameList],
        activeListId: 'default',
        history: sampleSelectionHistory,
        currentTheme: 'cyan',
      });

      const { deleteHistoryItem, clearHistory } = useNameStore.getState();
      const firstRecordId = sampleSelectionHistory[0].id;

      deleteHistoryItem(firstRecordId);

      let state = useNameStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.history.some((r) => r.id === firstRecordId)).toBe(false);

      clearHistory();

      state = useNameStore.getState();
      expect(state.history).toHaveLength(0);
    });
  });

  describe('Bulk Operations Flow', () => {
    it('should bulk add names and clear selections', () => {
      useNameStore.setState({
        lists: [defaultNameList],
        activeListId: 'default',
        history: [],
        currentTheme: 'cyan',
      });

      const { bulkAddNames, clearSelections, recordSelection } = useNameStore.getState();
      const names = ['Frank', 'Grace', 'Heidi'];

      bulkAddNames(names);

      let state = useNameStore.getState();
      const activeList = state.lists.find((l) => l.id === state.activeListId);
      expect(activeList?.names).toHaveLength(8);

      const frank = activeList?.names.find((n) => n.value === 'FRANK');
      const grace = activeList?.names.find((n) => n.value === 'GRACE');

      recordSelection(frank!.value, frank!.id);
      recordSelection(grace!.value, grace!.id);

      state = useNameStore.getState();
      expect(state.history).toHaveLength(2);

      clearSelections();

      state = useNameStore.getState();
      const updatedList = state.lists.find((l) => l.id === state.activeListId);
      expect(updatedList?.names.every((n) => n.selectionCount === 0)).toBe(true);
    });
  });

  describe('Theme Management Flow', () => {
    it('should update theme in store state', () => {
      const { setTheme } = useNameStore.getState();

      setTheme('matrix');

      const state = useNameStore.getState();
      expect(state.currentTheme).toBe('matrix');

      setTheme('sunset');
      const updatedState = useNameStore.getState();
      expect(updatedState.currentTheme).toBe('sunset');
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should handle complex multi-list workflow with selections and history', () => {
      const { createList, addName, recordSelection, setActiveList } = useNameStore.getState();

      createList('Team A');
      createList('Team B');

      const teamAId = useNameStore.getState().lists.find((l) => l.title === 'Team A')?.id;
      const teamBId = useNameStore.getState().lists.find((l) => l.title === 'Team B')?.id;

      setActiveList(teamAId!);
      addName('Alice');
      addName('Bob');

      setActiveList(teamBId!);
      addName('Charlie');

      const alice = useNameStore
        .getState()
        .lists.find((l) => l.id === teamAId)
        ?.names.find((n) => n.value === 'ALICE');

      if (alice) {
        recordSelection(alice.value, alice.id);
      }

      const finalState = useNameStore.getState();
      expect(finalState.lists).toHaveLength(3);
      expect(finalState.activeListId).toBe(teamBId);
      expect(finalState.history).toHaveLength(1);

      const teamA = finalState.lists.find((l) => l.title === 'Team A');
      const teamB = finalState.lists.find((l) => l.title === 'Team B');

      expect(teamA?.names).toHaveLength(2);
      expect(teamB?.names).toHaveLength(1);
      expect(teamA?.names.some((n) => n.value === 'CHARLIE')).toBe(false);
    });
  });
});
