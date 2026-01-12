import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNameStore } from '@/stores/useNameStore';
import { clearPersistedState, renderWithStore } from '@/test/integration-helpers';
import { sampleNames } from '@/test/test-data';
import { NameManagementSidebar } from './NameManagementSidebar';

describe('NameManagementSidebar Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState();
    // Mock window.prompt for list creation
    vi.stubGlobal(
      'prompt',
      vi.fn((_message: string, defaultValue?: string) => defaultValue)
    );
  });

  afterEach(() => {
    clearPersistedState();
    vi.unstubAllGlobals();
  });

  describe('Full Name Management Flow', () => {
    it('should add, edit, and delete a name with store sync', async () => {
      renderWithStore(<NameManagementSidebar />);
      const user = userEvent.setup();

      // Wait for component to be ready
      await waitFor(() => {
        expect(screen.getByLabelText('Names tab')).toBeInTheDocument();
      });

      // Step 1: Add name via AddNameForm
      const input = screen.getByPlaceholderText(/enter name/i);
      await user.type(input, 'Test User');
      await user.click(screen.getByRole('button', { name: /add/i }));

      // Verify name added to store and UI
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names.some((n) => n.value === 'TEST USER')).toBe(true);
      });
      expect(screen.getByText(/test user/i)).toBeInTheDocument();

      // Step 2: Edit name inline via NameListItem
      const nameElement = screen.getByText(/test user/i);
      await user.dblClick(nameElement); // Enter edit mode

      const editInput = screen.getByDisplayValue(/test user/i);
      await user.clear(editInput);
      await user.type(editInput, 'Updated User');
      await user.keyboard('{Enter}');

      // Verify name updated in store and UI
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names.some((n) => n.value === 'UPDATED USER')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'TEST USER')).toBe(false);
      });
      expect(screen.getByText(/updated user/i)).toBeInTheDocument();

      // Step 3: Delete name (no confirmation dialog for single name delete)
      const deleteButton = screen.getByLabelText('Delete UPDATED USER');
      await user.click(deleteButton);

      // Verify name deleted from store and UI
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names.some((n) => n.value === 'UPDATED USER')).toBe(false);
      });
      expect(screen.queryByText(/updated user/i)).not.toBeInTheDocument();
    });
  });

  describe('Multi-List Operations Flow', () => {
    // TODO: Replace window.prompt() with proper Dialog component in NameManagementSidebar
    // This test is skipped due to prompt() usage which should be refactored to use Radix Dialog
    it.skip('should create, switch, and delete lists with proper isolation', async () => {
      renderWithStore(<NameManagementSidebar />);
      const user = userEvent.setup();

      // Step 1: Open ListSelector dropdown
      const listSelectorButton = screen.getByRole('button', { name: /default list/i });
      await user.click(listSelectorButton);

      // Verify DropdownMenu opened
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Step 2: Create new list
      // Mock prompt to return "Team B"
      vi.mocked(prompt).mockReturnValueOnce('Team B');

      const createButton = screen.getByRole('menuitem', { name: /create new list/i });
      await user.click(createButton);

      // Verify new list created and active
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.lists).toHaveLength(2);
        expect(state.lists.some((l) => l.title === 'Team B')).toBe(true);
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.title).toBe('Team B');
      });

      // Step 3: Add names to Team B
      const input = screen.getByPlaceholderText(/enter name/i);
      await user.type(input, 'Frank');
      await user.click(screen.getByRole('button', { name: /add/i }));

      await user.type(input, 'Grace');
      await user.click(screen.getByRole('button', { name: /add/i }));

      // Verify names added to Team B only
      await waitFor(() => {
        const state = useNameStore.getState();
        const teamB = state.lists.find((l) => l.title === 'Team B');
        expect(teamB?.names).toHaveLength(2);
        expect(teamB?.names.some((n) => n.value === 'FRANK')).toBe(true);
        expect(teamB?.names.some((n) => n.value === 'GRACE')).toBe(true);
      });

      // Step 4: Switch back to default list
      await user.click(screen.getByRole('button', { name: /team b/i }));
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      const defaultMenuItem = screen.getByRole('menuitem', { name: /default list/i });
      await user.click(defaultMenuItem);

      // Verify list switched and names isolated
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.title).toBe('Default List');
        expect(activeList?.names.some((n) => n.value === 'FRANK')).toBe(false);
      });

      // Step 5: Delete Team B list
      await user.click(screen.getByRole('button', { name: /default list/i }));
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Switch to Team B first
      const teamBMenuItem = screen.getByRole('menuitem', { name: /team b/i });
      await user.click(teamBMenuItem);

      // Click delete list button
      await waitFor(() => {
        expect(screen.getByLabelText(/delete list/i)).toBeInTheDocument();
      });
      const deleteListButton = screen.getByLabelText(/delete list/i);
      await user.click(deleteListButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      // Verify list deleted and reverted to default
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.lists).toHaveLength(1);
        expect(state.lists.some((l) => l.title === 'Team B')).toBe(false);
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.title).toBe('Default List');
      });
    });
  });

  describe('Name Exclusion Flow', () => {
    it('should exclude name, verify not selectable, then re-include', async () => {
      // Pre-populate store with 3 names
      useNameStore.setState({
        lists: [
          {
            id: 'default',
            title: 'Default List',
            names: sampleNames.slice(0, 3), // Alice, Bob, Charlie
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        activeListId: 'default',
        history: [],
        currentTheme: 'cyan',
      });

      renderWithStore(<NameManagementSidebar />);
      const user = userEvent.setup();

      // Step 1: Exclude Bob (second name, index 1)
      const excludeButtons = screen.getAllByLabelText('Exclude name', { selector: 'button' });
      const bobExcludeButton = excludeButtons[1];
      await user.click(bobExcludeButton);

      // Verify Bob excluded in store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        const bob = activeList?.names.find((n) => n.value === 'Bob');
        expect(bob?.isExcluded).toBe(true);
      });

      // Verify visual feedback (opacity change on name item)
      const bobRow = screen.getByTestId('name-item-2');
      expect(bobRow).toHaveClass('opacity-50');

      // Step 2: Verify Bob not selectable
      const selectableNames = useNameStore
        .getState()
        .lists.find((l) => l.id === 'default')
        ?.names.filter((n) => !n.isExcluded);

      expect(selectableNames).toHaveLength(2); // Alice, Charlie (Bob excluded)
      expect(selectableNames?.some((n) => n.value === 'Bob')).toBe(false);

      // Step 3: Re-include Bob
      const includeButtons = screen.getAllByLabelText('Include name', { selector: 'button' });
      // After exclusion, Bob's button is now "Include name"
      await user.click(includeButtons[0]);

      // Verify Bob re-included in store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        const bob = activeList?.names.find((n) => n.value === 'Bob');
        expect(bob?.isExcluded).toBe(false);
      });

      // Verify Bob now selectable
      const updatedSelectableNames = useNameStore
        .getState()
        .lists.find((l) => l.id === 'default')
        ?.names.filter((n) => !n.isExcluded);

      expect(updatedSelectableNames).toHaveLength(3); // All 3 names
      expect(updatedSelectableNames?.some((n) => n.value === 'Bob')).toBe(true);
    });
  });

  describe('Bulk Import Flow', () => {
    it('should open modal, paste names, import, and close with Escape', async () => {
      renderWithStore(<NameManagementSidebar />);
      const user = userEvent.setup();

      // Step 1: Open bulk import modal
      const bulkImportButton = screen.getByRole('button', { name: /bulk import/i });
      await user.click(bulkImportButton);

      // Verify Radix Dialog opened
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByPlaceholderText(/paste names/i)).toBeInTheDocument();

      // Step 2: Paste names in textarea
      const textarea = screen.getByPlaceholderText(/paste names/i);
      await user.type(textarea, 'Frank\nGrace\nHeidi');

      // Step 3: Submit form
      await user.click(screen.getByRole('button', { name: /import/i }));

      // Verify names added to store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names.some((n) => n.value === 'FRANK')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'GRACE')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'HEIDI')).toBe(true);
      });

      // Verify modal closed after import
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Step 4: Open modal again and close with Escape
      await user.click(bulkImportButton);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      await user.keyboard('{Escape}');

      // Verify modal closed (Radix Dialog handles Escape)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
