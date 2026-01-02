# Session 22: Integration Tests for User Workflows - Execution Prompt

## Session Goal

Add 8-10 integration tests for critical user workflows to increase code coverage from 49.78% to ~55% while improving regression protection for multi-component interactions.

---

## Pre-Session Setup

**Verify Current State**:
```bash
git checkout main
git pull origin main
bun install
bun test:run          # Should show 190 tests passing
bun test:coverage     # Should show 49.78% coverage
bun run tsc -b        # Should pass with no errors
```

**Create Feature Branch**:
```bash
git checkout -b test/integration-tests-workflows
```

**Expected Starting Point**:
- 190 unit tests passing
- 49.78% overall coverage (lines), 37.17% branch coverage
- No integration tests for multi-component workflows
- Session 21 completed (coverage analysis and threshold update)

---

## Phase 1: Test Infrastructure Setup (30 min)

### Goal
Create reusable test utilities and fixtures for integration testing.

### Step 1.1: Create Integration Test Helpers

**File**: `src/test/integration-helpers.ts`

```typescript
import { render, type RenderOptions } from '@testing-library/react';
import { useNameStore } from '@/stores/useNameStore';
import type { ReactElement } from 'react';

/**
 * Render component with access to real Zustand store
 * Use this for integration tests that need store state
 */
export function renderWithStore(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Wait for Zustand store to update
 * Useful for async store actions
 */
export async function waitForStoreUpdate(
  selector: (state: ReturnType<typeof useNameStore.getState>) => unknown,
  expectedValue: unknown,
  timeout = 1000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentValue = selector(useNameStore.getState());
    if (currentValue === expectedValue) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(`Store did not update to expected value within ${timeout}ms`);
}

/**
 * Clear persisted state between tests
 * Prevents test pollution from localStorage
 */
export function clearPersistedState(): void {
  localStorage.clear();
  useNameStore.persist.clearStorage();
  useNameStore.setState(useNameStore.getInitialState());
}

/**
 * Mock localStorage for tests that need persistence
 */
export function mockLocalStorage(): void {
  const store: Record<string, string> = {};

  global.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  } as Storage;
}
```

### Step 1.2: Create Test Data Fixtures

**File**: `src/test/test-data.ts`

```typescript
import type { Name, NameList, SelectionRecord } from '@/types/name';

/**
 * Sample names for testing
 */
export const sampleNames: Name[] = [
  { id: '1', value: 'Alice', selected: false, excluded: false },
  { id: '2', value: 'Bob', selected: false, excluded: false },
  { id: '3', value: 'Charlie', selected: false, excluded: false },
  { id: '4', value: 'Diana', selected: false, excluded: false },
  { id: '5', value: 'Eve', selected: false, excluded: false },
];

/**
 * Sample name with selection history
 */
export const selectedName: Name = {
  id: '1',
  value: 'Alice',
  selected: true,
  excluded: false,
};

/**
 * Sample excluded name
 */
export const excludedName: Name = {
  id: '2',
  value: 'Bob',
  selected: false,
  excluded: true,
};

/**
 * Default name list for testing
 */
export const defaultNameList: NameList = {
  id: 'default',
  title: 'Default List',
  names: sampleNames,
};

/**
 * Secondary name list for multi-list tests
 */
export const secondaryNameList: NameList = {
  id: 'secondary',
  title: 'Team B',
  names: [
    { id: '6', value: 'Frank', selected: false, excluded: false },
    { id: '7', value: 'Grace', selected: false, excluded: false },
  ],
};

/**
 * Sample selection history records
 */
export const sampleSelectionHistory: SelectionRecord[] = [
  {
    id: 'rec-1',
    name: 'Alice',
    timestamp: new Date('2025-01-01T10:00:00Z').getTime(),
    listId: 'default',
    listTitle: 'Default List',
  },
  {
    id: 'rec-2',
    name: 'Bob',
    timestamp: new Date('2025-01-01T11:00:00Z').getTime(),
    listId: 'default',
    listTitle: 'Default List',
  },
  {
    id: 'rec-3',
    name: 'Charlie',
    timestamp: new Date('2025-01-01T12:00:00Z').getTime(),
    listId: 'default',
    listTitle: 'Default List',
  },
];

/**
 * CSV-formatted names for bulk import tests
 */
export const bulkImportCSV = `Alice
Bob
Charlie
Diana
Eve`;

/**
 * CSV with special characters (commas, quotes)
 */
export const bulkImportCSVSpecialChars = `"Smith, John"
"O'Brien, Mary"
"Jane ""The Best"" Doe"`;
```

### Step 1.3: Verify Infrastructure

```bash
bun run tsc -b  # Should pass with no type errors
```

**Expected Output**:
- No type errors
- Files created successfully

---

## Phase 2: Sidebar Workflow Integration Tests (60 min)

### Goal
Test multi-component interactions in sidebar (AddNameForm → ListSelector → NameListItem).

### Step 2.1: Create Sidebar Integration Test File

**File**: `src/components/sidebar/NameManagementSidebar.integration.test.tsx`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameManagementSidebar } from './NameManagementSidebar';
import { useNameStore } from '@/stores/useNameStore';
import {
  renderWithStore,
  clearPersistedState,
} from '@/test/integration-helpers';
import { sampleNames } from '@/test/test-data';

describe('NameManagementSidebar Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState();
  });

  afterEach(() => {
    clearPersistedState();
  });

  describe('Full Name Management Flow', () => {
    it('should add, edit, and delete a name with store sync', async () => {
      const user = userEvent.setup();
      renderWithStore(<NameManagementSidebar />);

      // Step 1: Add name via AddNameForm
      const input = screen.getByPlaceholderText(/enter a name/i);
      await user.type(input, 'Test User');
      await user.click(screen.getByRole('button', { name: /add/i }));

      // Verify name added to store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names).toHaveLength(13); // 12 default + 1 new
        expect(activeList?.names.some((n) => n.value === 'Test User')).toBe(true);
      });

      // Step 2: Edit name inline via NameListItem
      const nameItem = screen.getByText('Test User');
      await user.dblClick(nameItem); // Enter edit mode

      const editInput = screen.getByDisplayValue('Test User');
      await user.clear(editInput);
      await user.type(editInput, 'Updated User');
      await user.keyboard('{Enter}');

      // Verify name updated in store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names.some((n) => n.value === 'Updated User')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'Test User')).toBe(false);
      });

      // Step 3: Delete name with confirmation
      const deleteButton = screen.getAllByLabelText(/delete name/i).find((btn) =>
        btn.closest('[data-name="Updated User"]')
      );
      await user.click(deleteButton!);

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      // Verify name deleted from store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names).toHaveLength(12); // Back to 12 default names
        expect(activeList?.names.some((n) => n.value === 'Updated User')).toBe(false);
      });
    });
  });

  describe('Multi-List Operations Flow', () => {
    it('should create, switch, and delete lists with proper isolation', async () => {
      const user = userEvent.setup();
      renderWithStore(<NameManagementSidebar />);

      // Step 1: Create new list
      const listSelectorButton = screen.getByRole('button', { name: /default list/i });
      await user.click(listSelectorButton);

      const createButton = screen.getByRole('menuitem', { name: /create new list/i });
      await user.click(createButton);

      await user.type(screen.getByPlaceholderText(/enter list name/i), 'Team B');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Verify new list created and active
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.lists).toHaveLength(2);
        expect(state.lists.some((l) => l.title === 'Team B')).toBe(true);
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.title).toBe('Team B');
      });

      // Step 2: Add names to new list
      const input = screen.getByPlaceholderText(/enter a name/i);
      await user.type(input, 'Frank');
      await user.click(screen.getByRole('button', { name: /add/i }));

      await user.type(input, 'Grace');
      await user.click(screen.getByRole('button', { name: /add/i }));

      // Verify names added to Team B only
      await waitFor(() => {
        const state = useNameStore.getState();
        const teamB = state.lists.find((l) => l.title === 'Team B');
        expect(teamB?.names).toHaveLength(2);
      });

      // Step 3: Switch back to default list
      await user.click(screen.getByRole('button', { name: /team b/i }));
      await user.click(screen.getByRole('menuitem', { name: /default list/i }));

      // Verify list switched and names isolated
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.title).toBe('Default List');
        expect(activeList?.names).toHaveLength(12); // Original 12 names
        expect(activeList?.names.some((n) => n.value === 'Frank')).toBe(false);
      });

      // Step 4: Delete Team B list
      await user.click(screen.getByRole('button', { name: /default list/i }));
      await user.click(screen.getByRole('menuitem', { name: /team b/i }));

      const deleteListButton = screen.getByLabelText(/delete list/i);
      await user.click(deleteListButton);
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
      const user = userEvent.setup();

      // Pre-populate store with 3 names
      useNameStore.setState({
        lists: [
          {
            id: 'default',
            title: 'Default List',
            names: sampleNames.slice(0, 3), // Alice, Bob, Charlie
          },
        ],
        activeListId: 'default',
      });

      renderWithStore(<NameManagementSidebar />);

      // Step 1: Exclude Bob
      const excludeButton = screen.getAllByLabelText(/exclude name/i).find((btn) =>
        btn.closest('[data-name="Bob"]')
      );
      await user.click(excludeButton!);

      // Verify Bob excluded in store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        const bob = activeList?.names.find((n) => n.value === 'Bob');
        expect(bob?.excluded).toBe(true);
      });

      // Step 2: Mock wheel spin selection (only non-excluded names selectable)
      const selectableNames = useNameStore
        .getState()
        .lists.find((l) => l.id === 'default')
        ?.names.filter((n) => !n.excluded);

      expect(selectableNames).toHaveLength(2); // Alice, Charlie (Bob excluded)
      expect(selectableNames?.some((n) => n.value === 'Bob')).toBe(false);

      // Step 3: Re-include Bob
      const includeButton = screen.getAllByLabelText(/include name/i).find((btn) =>
        btn.closest('[data-name="Bob"]')
      );
      await user.click(includeButton!);

      // Verify Bob re-included in store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        const bob = activeList?.names.find((n) => n.value === 'Bob');
        expect(bob?.excluded).toBe(false);
      });

      // Verify Bob now selectable
      const updatedSelectableNames = useNameStore
        .getState()
        .lists.find((l) => l.id === 'default')
        ?.names.filter((n) => !n.excluded);

      expect(updatedSelectableNames).toHaveLength(3); // All 3 names
      expect(updatedSelectableNames?.some((n) => n.value === 'Bob')).toBe(true);
    });
  });

  describe('Bulk Import Flow', () => {
    it('should open modal, paste CSV, add names, and close with Escape', async () => {
      const user = userEvent.setup();
      renderWithStore(<NameManagementSidebar />);

      // Step 1: Open bulk import modal
      const bulkImportButton = screen.getByRole('button', { name: /bulk import/i });
      await user.click(bulkImportButton);

      // Verify modal opened
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/paste names here/i)).toBeInTheDocument();

      // Step 2: Paste CSV-formatted names
      const textarea = screen.getByPlaceholderText(/paste names here/i);
      await user.type(textarea, 'Frank\nGrace\nHeidi');

      // Step 3: Submit form
      await user.click(screen.getByRole('button', { name: /import/i }));

      // Verify names added to store
      await waitFor(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        expect(activeList?.names).toHaveLength(15); // 12 default + 3 imported
        expect(activeList?.names.some((n) => n.value === 'Frank')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'Grace')).toBe(true);
        expect(activeList?.names.some((n) => n.value === 'Heidi')).toBe(true);
      });

      // Step 4: Open modal again and close with Escape
      await user.click(bulkImportButton);
      await user.keyboard('{Escape}');

      // Verify modal closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
```

### Step 2.2: Run Tests

```bash
bun test NameManagementSidebar.integration.test.tsx
```

**Expected Output**:
- 4 tests passing
- Coverage increase for NameManagementSidebar, AddNameForm, ListSelector, NameListItem

---

## Phase 3: History & Export Integration Tests (45 min)

### Goal
Test selection recording, history management, and export workflows.

### Step 3.1: Create History Integration Test File

**File**: `src/components/sidebar/HistoryPanel.integration.test.tsx`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPanel } from './HistoryPanel';
import { ExportModal } from '../shared/ExportModal';
import { useNameStore } from '@/stores/useNameStore';
import {
  renderWithStore,
  clearPersistedState,
} from '@/test/integration-helpers';
import { sampleNames, sampleSelectionHistory } from '@/test/test-data';

describe('HistoryPanel Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearPersistedState();
    vi.useRealTimers();
  });

  describe('Selection History Recording Flow', () => {
    it('should record spin, display in history, enforce FIFO limit', async () => {
      const user = userEvent.setup({ delay: null }); // Use fake timers

      // Pre-populate store with names
      useNameStore.setState({
        lists: [
          {
            id: 'default',
            title: 'Default List',
            names: sampleNames,
          },
        ],
        activeListId: 'default',
        selectionHistory: [],
      });

      renderWithStore(<HistoryPanel />);

      // Verify initial empty state
      expect(screen.getByText(/no selections yet/i)).toBeInTheDocument();

      // Step 1: Mock 3 spins (trigger markSelected action)
      const markSelected = useNameStore.getState().markSelected;

      vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
      markSelected('1'); // Select Alice

      vi.setSystemTime(new Date('2025-01-01T11:00:00Z'));
      markSelected('2'); // Select Bob

      vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
      markSelected('3'); // Select Charlie

      // Verify 3 history records created
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.selectionHistory).toHaveLength(3);
        expect(state.selectionHistory[0].name).toBe('Alice');
        expect(state.selectionHistory[1].name).toBe('Bob');
        expect(state.selectionHistory[2].name).toBe('Charlie');
      });

      // Verify HistoryPanel displays all 3 entries
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();

      // Step 2: Test FIFO limit (add 48 more spins to exceed 50 limit)
      for (let i = 0; i < 48; i++) {
        markSelected(((i % 5) + 1).toString()); // Cycle through 5 names
      }

      // Verify max 50 entries (oldest removed)
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.selectionHistory).toHaveLength(50);
        // First 3 entries should be removed (FIFO)
        expect(state.selectionHistory.some((r) => r.id === 'rec-1')).toBe(false);
      });
    });
  });

  describe('History Export Flow', () => {
    it('should export CSV and JSON with correct format', async () => {
      const user = userEvent.setup();

      // Pre-populate history
      useNameStore.setState({
        lists: [
          {
            id: 'default',
            title: 'Default List',
            names: sampleNames,
          },
        ],
        activeListId: 'default',
        selectionHistory: sampleSelectionHistory,
      });

      renderWithStore(<ExportModal open onOpenChange={() => {}} />);

      // Step 1: Export CSV
      const csvTab = screen.getByRole('tab', { name: /csv/i });
      await user.click(csvTab);

      // Mock download link creation
      const createElementSpy = vi.spyOn(document, 'createElement');
      const downloadButton = screen.getByRole('button', { name: /download csv/i });
      await user.click(downloadButton);

      // Verify CSV format
      const link = createElementSpy.mock.results.find(
        (r) => r.value.tagName === 'A'
      )?.value as HTMLAnchorElement;

      expect(link.download).toMatch(/selection-history.*\.csv/);

      // Decode blob and verify CSV structure
      const blob = await fetch(link.href).then((r) => r.blob());
      const csvText = await blob.text();

      expect(csvText).toContain('Name,List,Timestamp'); // Header
      expect(csvText).toContain('Alice,Default List,'); // Data row
      expect(csvText.split('\n')).toHaveLength(4); // Header + 3 rows + newline

      // Step 2: Export JSON
      const jsonTab = screen.getByRole('tab', { name: /json/i });
      await user.click(jsonTab);

      const downloadJSONButton = screen.getByRole('button', { name: /download json/i });
      await user.click(downloadJSONButton);

      // Verify JSON structure
      const jsonLink = createElementSpy.mock.results.find(
        (r) => r.value.download?.endsWith('.json')
      )?.value as HTMLAnchorElement;

      const jsonBlob = await fetch(jsonLink.href).then((r) => r.blob());
      const jsonText = await jsonBlob.text();
      const jsonData = JSON.parse(jsonText);

      expect(jsonData.metadata).toBeDefined();
      expect(jsonData.metadata.totalSelections).toBe(3);
      expect(jsonData.selections).toHaveLength(3);
      expect(jsonData.selections[0].name).toBe('Alice');
    });
  });

  describe('History Management Flow', () => {
    it('should delete single record and clear all history', async () => {
      const user = userEvent.setup();

      // Pre-populate history
      useNameStore.setState({
        selectionHistory: sampleSelectionHistory,
      });

      renderWithStore(<HistoryPanel />);

      // Step 1: Delete single record
      const deleteButtons = screen.getAllByLabelText(/delete record/i);
      await user.click(deleteButtons[0]); // Delete first record (Alice)

      // Verify record deleted
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.selectionHistory).toHaveLength(2);
        expect(state.selectionHistory.some((r) => r.name === 'Alice')).toBe(false);
      });

      // Step 2: Clear all history
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      // Verify all history cleared
      await waitFor(() => {
        const state = useNameStore.getState();
        expect(state.selectionHistory).toHaveLength(0);
      });

      // Verify empty state displayed
      expect(screen.getByText(/no selections yet/i)).toBeInTheDocument();
    });
  });
});
```

### Step 3.2: Run Tests

```bash
bun test HistoryPanel.integration.test.tsx
```

**Expected Output**:
- 3 tests passing
- Coverage increase for HistoryPanel and ExportModal

---

## Phase 4: Theme & Persistence Integration Tests (30 min)

### Goal
Test theme switching, localStorage persistence, and reload behavior.

### Step 4.1: Create Store Integration Test File

**File**: `src/stores/useNameStore.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNameStore } from './useNameStore';
import { clearPersistedState, mockLocalStorage } from '@/test/integration-helpers';
import { defaultNameList, secondaryNameList, sampleSelectionHistory } from '@/test/test-data';

describe('useNameStore Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage();
    clearPersistedState();
  });

  afterEach(() => {
    clearPersistedState();
  });

  describe('Theme Persistence Flow', () => {
    it('should persist theme to localStorage and rehydrate on reload', async () => {
      // Step 1: Set theme to "neon"
      useNameStore.getState().setTheme('neon');

      // Step 2: Trigger localStorage save (persist middleware auto-saves)
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for debounce

      // Verify localStorage contains theme
      const stored = localStorage.getItem('name-store');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.currentTheme).toBe('neon');

      // Step 3: Simulate reload (clear React state, rehydrate from localStorage)
      clearPersistedState();

      // Re-create store (in real app, this happens on page load)
      const rehydratedState = useNameStore.getState();

      // Verify theme persisted
      expect(rehydratedState.currentTheme).toBe('neon');
    });
  });

  describe('Multi-List Persistence Flow', () => {
    it('should persist lists, active list, and history across reload', async () => {
      const { createList, addName, markSelected } = useNameStore.getState();

      // Step 1: Create 3 lists
      createList('Team A');
      createList('Team B');

      // Step 2: Add names to Team A
      const teamAId = useNameStore.getState().lists.find((l) => l.title === 'Team A')?.id;
      useNameStore.getState().setActiveList(teamAId!);
      addName('Alice');
      addName('Bob');

      // Step 3: Switch to Team B and add names
      const teamBId = useNameStore.getState().lists.find((l) => l.title === 'Team B')?.id;
      useNameStore.getState().setActiveList(teamBId!);
      addName('Charlie');

      // Step 4: Mark 2 selections
      markSelected('alice-id');
      markSelected('charlie-id');

      // Step 5: Trigger localStorage save
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify localStorage structure
      const stored = localStorage.getItem('name-store');
      const parsed = JSON.parse(stored!);

      expect(parsed.state.lists).toHaveLength(3); // Default + Team A + Team B
      expect(parsed.state.activeListId).toBe(teamBId);
      expect(parsed.state.selectionHistory).toHaveLength(2);

      // Step 6: Simulate reload
      clearPersistedState();

      // Verify all state persisted
      const rehydrated = useNameStore.getState();
      expect(rehydrated.lists).toHaveLength(3);
      expect(rehydrated.activeListId).toBe(teamBId);
      expect(rehydrated.selectionHistory).toHaveLength(2);

      // Verify list isolation maintained
      const teamA = rehydrated.lists.find((l) => l.title === 'Team A');
      const teamB = rehydrated.lists.find((l) => l.title === 'Team B');

      expect(teamA?.names).toHaveLength(2);
      expect(teamB?.names).toHaveLength(1);
      expect(teamA?.names.some((n) => n.value === 'Charlie')).toBe(false);
    });
  });
});
```

### Step 4.2: Run Tests

```bash
bun test useNameStore.integration.test.ts
```

**Expected Output**:
- 2 tests passing
- Coverage increase for store persistence logic

---

## Phase 5: Keyboard Shortcuts Integration Tests (30 min)

### Goal
Test keyboard shortcuts in multi-component scenarios (Space, Escape).

### Step 5.1: Create Keyboard Shortcuts Integration Test File

**File**: `src/hooks/useKeyboardShortcuts.integration.test.tsx`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { clearPersistedState } from '@/test/integration-helpers';

describe('Keyboard Shortcuts Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState();
  });

  afterEach(() => {
    clearPersistedState();
  });

  describe('Space Key in Complex UI Flow', () => {
    it('should suppress Space when input focused, allow when closed', async () => {
      const user = userEvent.setup();
      const spinCallback = vi.fn();

      render(<App onSpin={spinCallback} />);

      // Step 1: Open bulk import modal (input field auto-focused)
      const bulkImportButton = screen.getByRole('button', { name: /bulk import/i });
      await user.click(bulkImportButton);

      const textarea = screen.getByPlaceholderText(/paste names here/i);
      expect(textarea).toHaveFocus();

      // Step 2: Press Space (should NOT trigger spin, should add space to input)
      await user.keyboard(' ');
      expect(spinCallback).not.toHaveBeenCalled();
      expect(textarea).toHaveValue(' ');

      // Step 3: Close modal
      await user.keyboard('{Escape}');

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Step 4: Press Space (should trigger spin now)
      await user.keyboard(' ');
      expect(spinCallback).toHaveBeenCalledOnce();
    });
  });

  describe('Escape Key Coordination Flow', () => {
    it('should close multiple modals/dropdowns sequentially', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Open ListSelector dropdown
      const listSelector = screen.getByRole('button', { name: /default list/i });
      await user.click(listSelector);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape → dropdown closes
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });

      // Step 2: Open bulk import modal
      await user.click(screen.getByRole('button', { name: /bulk import/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Press Escape → modal closes
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Step 3: Open ExportModal
      await user.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('dialog', { name: /export/i })).toBeInTheDocument();

      // Press Escape → modal closes
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /export/i })).not.toBeInTheDocument();
      });
    });
  });
});
```

### Step 5.2: Run Tests

```bash
bun test useKeyboardShortcuts.integration.test.tsx
```

**Expected Output**:
- 2 tests passing
- Coverage increase for keyboard event handling in App.tsx

---

## Phase 6: Documentation & Verification (15 min)

### Step 6.1: Run Full Test Suite

```bash
bun test:run
```

**Expected Output**:
- 200-205 tests passing (10-15 new integration tests added)
- All existing tests still pass

### Step 6.2: Generate Coverage Report

```bash
bun test:coverage
```

**Expected Output**:
```
Coverage summary:
  Lines       : 54-56% (up from 49.78%)
  Statements  : 54-56% (up from 49.78%)
  Branches    : 42-44% (up from 37.17%)
  Functions   : 55-57% (up from 51.61%)
```

### Step 6.3: Update Coverage Thresholds

**File**: `vitest.config.ts`

Update thresholds to new baseline:

```typescript
thresholds: {
  lines: 54,        // Up from 49
  functions: 55,    // Up from 51
  branches: 42,     // Up from 37
  statements: 54,   // Up from 49
},
```

### Step 6.4: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add new section after "Testing Patterns":

```markdown
### Integration Testing Patterns

**Purpose**: Test multi-component workflows and state synchronization

**Test Utilities** (`src/test/integration-helpers.ts`):
- `renderWithStore()` - Render component with real Zustand store
- `waitForStoreUpdate()` - Wait for async store state changes
- `clearPersistedState()` - Clean up localStorage between tests
- `mockLocalStorage()` - Mock localStorage for persistence tests

**Test Data** (`src/test/test-data.ts`):
- `sampleNames` - 5 pre-configured names for tests
- `defaultNameList` - Default list with sample names
- `sampleSelectionHistory` - Pre-configured selection records
- `bulkImportCSV` - CSV-formatted test data

**Integration Test Structure**:
```typescript
describe('Component Integration Tests', () => {
  beforeEach(() => {
    clearPersistedState(); // Clean slate for each test
  });

  afterEach(() => {
    clearPersistedState(); // Prevent test pollution
  });

  it('should perform multi-step workflow with store sync', async () => {
    const user = userEvent.setup();
    renderWithStore(<MyComponent />);

    // Step 1: User action
    await user.click(screen.getByRole('button'));

    // Step 2: Verify store updated
    await waitFor(() => {
      const state = useNameStore.getState();
      expect(state.someValue).toBe('expected');
    });

    // Step 3: Verify UI reflects store change
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
```

**Best Practices**:
- Use `clearPersistedState()` in `beforeEach`/`afterEach` hooks
- Use `waitFor()` for async store updates
- Test complete workflows (not isolated actions)
- Verify both store state AND UI updates
- Use fake timers (`vi.useFakeTimers()`) for time-dependent tests
```

### Step 6.5: Verify Build

```bash
bun run tsc -b     # Type check
bun run ci         # Biome check
bun run build      # Production build
```

**Expected Output**:
- No type errors
- No linting errors
- Build succeeds

---

## Post-Session Tasks

### Create Session Documentation

**File**: `.claude/tasks/sessions/session-22-integration-tests.md`

Follow the session documentation template with:
- Overview (what was accomplished)
- Files Modified (list all 5 new test files + 3 modified files)
- Commits (7 atomic commits)
- Verification (test output, coverage results)
- Key Learnings (integration test patterns discovered)
- Next Steps (Session 23 recommendations)

### Update README

**File**: `.claude/tasks/README.md`

Add Session 22 entry:
```markdown
### Session 22: Integration Tests for User Workflows (Completed)
- Added 10 integration tests for critical user workflows
- Coverage increased from 49.78% to 55%
- Created reusable test utilities and fixtures
- [Session Doc](sessions/session-22-integration-tests.md)
- [Prompt](prompts/session-22-integration-tests-prompt.md)
```

---

## Create Pull Request

**Template**:
```bash
gh pr create --title "test: add integration tests for user workflows" --body "$(cat <<'EOF'
## Summary
- Added 10 integration tests for multi-component workflows
- Created reusable test utilities (renderWithStore, waitForStoreUpdate, clearPersistedState)
- Coverage increased from 49.78% to 55% (5.2% increase)
- Branch coverage increased from 37% to 42% (5% increase)

## Test Files Added
- `src/test/integration-helpers.ts` - Test utilities for integration testing
- `src/test/test-data.ts` - Realistic test data fixtures
- `src/components/sidebar/NameManagementSidebar.integration.test.tsx` - 4 tests (add/edit/delete, multi-list, exclusion, bulk import)
- `src/components/sidebar/HistoryPanel.integration.test.tsx` - 3 tests (recording, export, management)
- `src/stores/useNameStore.integration.test.ts` - 2 tests (theme persistence, multi-list persistence)
- `src/hooks/useKeyboardShortcuts.integration.test.tsx` - 2 tests (Space suppression, Escape coordination)

## Coverage Impact
- NameManagementSidebar: 0% → 80%
- AddNameForm: 0% → 70%
- ListSelector: 0% → 60%
- NameListItem: 0% → 75%
- HistoryPanel: 92% → 98%
- Overall: 49.78% → 55%

## Verification
- 205 tests passing (15 new integration tests)
- No type errors
- Biome check passes
- Build succeeds
- Coverage thresholds updated

## Related
- Addresses Session 21 recommendation (integration tests > component tests)
- Completes test coverage enhancement initiative
- Sets foundation for Session 23 (Bulk Import CSV feature)

## Test plan
- CI pipeline will run all 205 tests
- Coverage report will verify 55% threshold
- E2E tests will continue to pass (22/25)
EOF
)"
```

---

## Troubleshooting

### Issue: localStorage not persisting in tests
**Solution**: Use `mockLocalStorage()` in `beforeEach` hook, verify `persist` middleware configured correctly

### Issue: Store state not updating in tests
**Solution**: Use `waitFor()` from `@testing-library/react` to wait for async state updates

### Issue: Tests failing due to timing issues
**Solution**: Use `vi.useFakeTimers()` and `vi.setSystemTime()` for time-dependent tests

### Issue: Coverage not increasing as expected
**Solution**: Run `bun test:coverage` to see which lines are still uncovered, add targeted tests

### Issue: Integration tests too slow
**Solution**: Mock expensive operations (API calls, animations), use `user.setup({ delay: null })` with fake timers

---

## Success Criteria Checklist

- [ ] 10 integration tests added (4 sidebar + 3 history + 2 persistence + 2 shortcuts)
- [ ] All tests pass in CI
- [ ] Coverage increased to 54-56%
- [ ] Branch coverage increased to 42%+
- [ ] No type errors (`bun run tsc -b`)
- [ ] Biome check passes (`bun run ci`)
- [ ] Build succeeds (`bun run build`)
- [ ] Test utilities created and documented
- [ ] CODE_REFERENCE.md updated
- [ ] Session documentation created
- [ ] 7 atomic commits created
- [ ] Pull request created with template

---

## Next Session Preview

**Session 23 Options**:

1. **Complete Bulk Import CSV Feature** (Recommended)
   - Integration tests already added in Session 22
   - Just need to implement CSV parsing logic
   - Estimated: 2 hours

2. **Fix Flaky E2E Test** (History Deletion)
   - 1 test fails due to overlay intercept
   - Estimated: 1 hour

3. **Performance Optimization**
   - Bundle size analysis
   - Lazy loading components
   - Estimated: 2-3 hours
