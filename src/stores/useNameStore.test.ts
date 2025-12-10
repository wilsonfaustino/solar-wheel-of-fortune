import { useNameStore } from './useNameStore';
import { mockInitialState } from './useNameStore.mock';

describe('useNameStore', () => {
  beforeEach(() => {
    useNameStore.setState(mockInitialState);
  });

  describe('addName', () => {
    it('should add a name to the active list', () => {
      const addName = useNameStore.getState().addName;
      addName('Charlie');

      const state = useNameStore.getState();
      const activeList = state.lists.find((l) => l.id === state.activeListId);
      expect(activeList?.names).toHaveLength(3);
      expect(activeList?.names[2].value).toBe('CHARLIE');
    });

    it('should trim and uppercase the name', () => {
      const addName = useNameStore.getState().addName;
      addName('  david  ');

      const state = useNameStore.getState();
      const activeList = state.lists.find((l) => l.id === state.activeListId);
      expect(activeList?.names[2].value).toBe('DAVID');
    });

    it('should ignore empty names', () => {
      const addName = useNameStore.getState().addName;
      const initialLength = useNameStore.getState().lists[0].names.length;

      addName('   ');

      const state = useNameStore.getState();
      expect(state.lists[0].names.length).toBe(initialLength);
    });
  });

  describe('deleteName', () => {
    it('should delete a name from the active list', () => {
      const state = useNameStore.getState();
      const nameIdToDelete = state.lists[0].names[0].id;

      state.deleteName(nameIdToDelete);

      const updatedState = useNameStore.getState();
      const activeList = updatedState.lists.find(
        (l) => l.id === updatedState.activeListId
      );
      expect(activeList?.names).toHaveLength(1);
      expect(activeList?.names[0].id).not.toBe(nameIdToDelete);
    });

    it('should not delete if name does not exist', () => {
      const initialLength = useNameStore.getState().lists[0].names.length;

      useNameStore.getState().deleteName('non-existent-id');

      expect(useNameStore.getState().lists[0].names.length).toBe(
        initialLength
      );
    });
  });

  describe('updateName', () => {
    it('should update a name with new values', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.updateName(nameId, { value: 'UPDATED' });

      const updatedState = useNameStore.getState();
      const updatedName = updatedState.lists[0].names.find(
        (n) => n.id === nameId
      );
      expect(updatedName?.value).toBe('UPDATED');
    });

    it('should update multiple properties', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.updateName(nameId, { value: 'NEW', weight: 2.0 });

      const updatedState = useNameStore.getState();
      const updatedName = updatedState.lists[0].names.find(
        (n) => n.id === nameId
      );
      expect(updatedName?.value).toBe('NEW');
      expect(updatedName?.weight).toBe(2.0);
    });
  });

  describe('markSelected', () => {
    it('should increment selectionCount and set lastSelectedAt', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.markSelected(nameId);

      const updatedState = useNameStore.getState();
      const selectedName = updatedState.lists[0].names.find(
        (n) => n.id === nameId
      );
      expect(selectedName?.selectionCount).toBe(1);
      expect(selectedName?.lastSelectedAt).not.toBeNull();
    });

    it('should increment selectionCount on multiple calls', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.markSelected(nameId);
      state.markSelected(nameId);
      state.markSelected(nameId);

      const updatedState = useNameStore.getState();
      const selectedName = updatedState.lists[0].names.find(
        (n) => n.id === nameId
      );
      expect(selectedName?.selectionCount).toBe(3);
    });
  });

  describe('setActiveList', () => {
    it('should change the active list', () => {
      const state = useNameStore.getState();
      state.createList('New List');

      const newListId = useNameStore
        .getState()
        .lists[useNameStore.getState().lists.length - 1].id;

      useNameStore.getState().setActiveList(newListId);

      expect(useNameStore.getState().activeListId).toBe(newListId);
    });
  });

  describe('createList', () => {
    it('should create a new list and set it as active', () => {
      const initialListCount = useNameStore.getState().lists.length;

      useNameStore.getState().createList('Brand New List');

      const state = useNameStore.getState();
      expect(state.lists.length).toBe(initialListCount + 1);
      expect(state.lists[state.lists.length - 1].title).toBe('Brand New List');
      expect(state.activeListId).toBe(state.lists[state.lists.length - 1].id);
    });

    it('should use default title if name is empty', () => {
      useNameStore.getState().createList('   ');

      const state = useNameStore.getState();
      expect(state.lists[state.lists.length - 1].title).toBe('New List');
    });

    it('should create an empty names array', () => {
      useNameStore.getState().createList('Empty List');

      const state = useNameStore.getState();
      expect(state.lists[state.lists.length - 1].names).toEqual([]);
    });
  });

  describe('deleteList', () => {
    it('should delete a list', () => {
      const state = useNameStore.getState();
      state.createList('List to Delete');
      const listIdToDelete = state.lists[state.lists.length - 1].id;
      const initialCount = useNameStore.getState().lists.length;

      useNameStore.getState().deleteList(listIdToDelete);

      expect(useNameStore.getState().lists.length).toBe(initialCount - 1);
      expect(
        useNameStore.getState().lists.find((l) => l.id === listIdToDelete)
      ).toBeUndefined();
    });

    it('should not delete if only one list remains', () => {
      const state = useNameStore.getState();
      const onlyListId = state.lists[0].id;

      state.deleteList(onlyListId);

      expect(useNameStore.getState().lists.length).toBe(1);
    });

    it('should switch to first list if deleted list was active', () => {
      const state = useNameStore.getState();
      const firstListId = state.lists[0].id;
      state.createList('Second List');
      const secondListId = useNameStore.getState().lists[useNameStore.getState().lists.length - 1].id;
      state.setActiveList(secondListId);

      state.deleteList(secondListId);

      expect(useNameStore.getState().activeListId).toBe(firstListId);
    });
  });

  describe('updateListTitle', () => {
    it('should update list title', () => {
      const state = useNameStore.getState();
      const listId = state.lists[0].id;

      state.updateListTitle(listId, 'Updated Title');

      expect(useNameStore.getState().lists[0].title).toBe('Updated Title');
    });

    it('should use default title if empty', () => {
      const state = useNameStore.getState();
      const listId = state.lists[0].id;

      state.updateListTitle(listId, '   ');

      expect(useNameStore.getState().lists[0].title).toBe('Untitled List');
    });
  });

  describe('toggleNameExclusion', () => {
    it('should toggle exclusion status to true', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.toggleNameExclusion(nameId);

      const updatedState = useNameStore.getState();
      const name = updatedState.lists[0].names.find((n) => n.id === nameId);
      expect(name?.isExcluded).toBe(true);
    });

    it('should toggle exclusion status back to false', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;

      state.toggleNameExclusion(nameId);
      state.toggleNameExclusion(nameId);

      const updatedState = useNameStore.getState();
      const name = updatedState.lists[0].names.find((n) => n.id === nameId);
      expect(name?.isExcluded).toBe(false);
    });
  });

  describe('clearSelections', () => {
    it('should reset selectionCount and lastSelectedAt for all names', () => {
      const state = useNameStore.getState();
      state.markSelected(state.lists[0].names[0].id);
      state.markSelected(state.lists[0].names[1].id);

      state.clearSelections();

      const updatedState = useNameStore.getState();
      const activeList = updatedState.lists.find(
        (l) => l.id === updatedState.activeListId
      );
      activeList?.names.forEach((name) => {
        expect(name.selectionCount).toBe(0);
        expect(name.lastSelectedAt).toBeNull();
      });
    });

    it('should not affect isExcluded status', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;
      state.toggleNameExclusion(nameId);
      state.markSelected(nameId);

      state.clearSelections();

      const updatedState = useNameStore.getState();
      const name = updatedState.lists[0].names.find((n) => n.id === nameId);
      expect(name?.isExcluded).toBe(true);
      expect(name?.selectionCount).toBe(0);
    });
  });

  describe('resetList', () => {
    it('should reset all names in the active list', () => {
      const state = useNameStore.getState();
      const nameId = state.lists[0].names[0].id;
      state.markSelected(nameId);
      state.toggleNameExclusion(nameId);

      state.resetList();

      const updatedState = useNameStore.getState();
      const resetName = updatedState.lists[0].names.find((n) => n.id === nameId);
      expect(resetName?.selectionCount).toBe(0);
      expect(resetName?.lastSelectedAt).toBeNull();
      expect(resetName?.isExcluded).toBe(false);
    });

    it('should reset all names including selections and exclusions', () => {
      const state = useNameStore.getState();
      state.markSelected(state.lists[0].names[0].id);
      state.markSelected(state.lists[0].names[1].id);
      state.toggleNameExclusion(state.lists[0].names[0].id);
      state.toggleNameExclusion(state.lists[0].names[1].id);

      state.resetList();

      const updatedState = useNameStore.getState();
      const activeList = updatedState.lists.find(
        (l) => l.id === updatedState.activeListId
      );
      activeList?.names.forEach((name) => {
        expect(name.selectionCount).toBe(0);
        expect(name.lastSelectedAt).toBeNull();
        expect(name.isExcluded).toBe(false);
      });
    });
  });

  describe('bulkAddNames', () => {
    it('should add multiple names at once', () => {
      const initialLength = useNameStore.getState().lists[0].names.length;

      useNameStore.getState().bulkAddNames(['Emma', 'Frank', 'Grace']);

      const state = useNameStore.getState();
      expect(state.lists[0].names.length).toBe(initialLength + 3);
      expect(state.lists[0].names[initialLength].value).toBe('EMMA');
      expect(state.lists[0].names[initialLength + 1].value).toBe('FRANK');
      expect(state.lists[0].names[initialLength + 2].value).toBe('GRACE');
    });

    it('should filter out invalid names', () => {
      const initialLength = useNameStore.getState().lists[0].names.length;

      useNameStore
        .getState()
        .bulkAddNames(['Valid', '   ', 'A'.repeat(101), 'Another']);

      const state = useNameStore.getState();
      expect(state.lists[0].names.length).toBe(initialLength + 2);
    });

    it('should trim and uppercase names', () => {
      const initialLength = useNameStore.getState().lists[0].names.length;

      useNameStore.getState().bulkAddNames(['  henry  ', '  iris  ']);

      const state = useNameStore.getState();
      expect(state.lists[0].names[initialLength].value).toBe('HENRY');
      expect(state.lists[0].names[initialLength + 1].value).toBe('IRIS');
    });

    it('should handle empty array', () => {
      const initialLength = useNameStore.getState().lists[0].names.length;

      useNameStore.getState().bulkAddNames([]);

      expect(useNameStore.getState().lists[0].names.length).toBe(
        initialLength
      );
    });
  });

  describe('multi-list scenarios', () => {
    it('should operate on active list only', () => {
      const state = useNameStore.getState();
      const firstListId = state.lists[0].id;
      state.createList('Second List');
      const secondListId = useNameStore.getState().lists[1].id;

      useNameStore.getState().addName('Name in Second List');

      expect(
        useNameStore
          .getState()
          .lists.find((l) => l.id === firstListId)?.names.length
      ).toBe(2);
      expect(
        useNameStore
          .getState()
          .lists.find((l) => l.id === secondListId)?.names.length
      ).toBe(1);
    });

    it('should maintain separate selection states', () => {
      const state = useNameStore.getState();
      const firstListId = state.lists[0].id;
      const firstNameId = state.lists[0].names[0].id;

      state.markSelected(firstNameId);

      state.createList('Second List');
      const secondListId = useNameStore.getState().lists[1].id;
      state.setActiveList(secondListId);
      state.addName('Test');
      const secondListNameId = useNameStore
        .getState()
        .lists.find((l) => l.id === secondListId)?.names[0].id;

      state.markSelected(secondListNameId!);

      const updatedState = useNameStore.getState();
      const firstName = updatedState.lists
        .find((l) => l.id === firstListId)
        ?.names.find((n) => n.id === firstNameId);
      const secondName = updatedState.lists
        .find((l) => l.id === secondListId)
        ?.names.find((n) => n.id === secondListNameId);

      expect(firstName?.selectionCount).toBe(1);
      expect(secondName?.selectionCount).toBe(1);
    });
  });
});
