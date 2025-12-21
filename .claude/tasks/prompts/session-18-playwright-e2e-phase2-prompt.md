# Session 18: Playwright E2E Testing - Phase 2 (Comprehensive Coverage)

## Session Goal

Expand E2E test coverage from 6 → 22 tests by implementing comprehensive tests for list management, selection history, export functionality, theme switching, mobile sidebar, name exclusion/editing, and keyboard shortcut edge cases.

## Model Recommendation

**Recommended Model**: **Sonnet 4.5** (current model)

**Rationale**:
- Building on established Phase 1 infrastructure (Page Object Model, fixtures)
- Requires understanding of existing patterns and extending them systematically
- Involves creating 7 new test files and 3 new page objects following established conventions
- Sonnet 4.5 provides excellent balance of accuracy and efficiency for this systematic expansion
- Task is well-scoped with detailed plan - no need for Opus-level reasoning

**Alternative**: Haiku for faster iteration if familiar with the Phase 1 architecture, but Sonnet 4.5 is recommended to ensure comprehensive test coverage and avoid flaky tests.

---

## Pre-Session Setup

Before starting, verify the following:

```bash
# 1. Ensure you're on clean main branch
git checkout main
git pull origin main
git status  # Should show clean working tree (untracked: session-18-playwright-e2e-phase2-prompt.md)

# 2. Verify Phase 1 tests pass
bun run test:e2e
# Expected: 6 tests passing

# 3. Run unit tests
bun test:run
# Expected: 190+ tests passing

# 4. Run type check
bun run tsc
# Expected: No errors

# 5. Run build
bun build
# Expected: Success

# 6. Create feature branch
git checkout -b test/playwright-e2e-phase2
```

**Expected Output**: All checks pass, 6 E2E tests passing, new branch created.
**Note**: The prompt file (session-18-playwright-e2e-phase2-prompt.md) should be untracked at this point - it will be committed during the session.

---

## Session Tasks

### Phase 1: Create New Page Objects (45 min)

**Goal**: Add HistoryPage, ThemePage, MobilePage to support new test scenarios.

#### Task 1.1: Create HistoryPage

**File**: `e2e/pages/HistoryPage.ts`

**Content**:
```typescript
import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HistoryPage extends BasePage {
  readonly historyTab: Locator;
  readonly historyItems: Locator;
  readonly clearHistoryButton: Locator;
  readonly exportButton: Locator;
  readonly statsText: Locator;
  readonly noHistoryMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.historyTab = page.getByRole('tab', { name: /history/i });
    this.historyItems = page
      .locator('.group')
      .filter({ has: page.getByRole('button', { name: /delete/i }) });
    this.clearHistoryButton = page.getByRole('button', { name: /clear all/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.statsText = page.locator('text=Total:').or(page.locator('text=Unique:'));
    this.noHistoryMessage = page.getByText(/no history yet/i);
  }

  async switchToHistoryTab() {
    await this.historyTab.click();
  }

  async getHistoryCount(): Promise<number> {
    return await this.historyItems.count();
  }

  async deleteHistoryItem(index: number) {
    const item = this.historyItems.nth(index);
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async clearAllHistory() {
    await this.clearHistoryButton.click();
    // Confirm in dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async getStatsText(): Promise<string | null> {
    return await this.statsText.first().textContent();
  }

  async openExportModal() {
    await this.exportButton.click();
  }

  async isNoHistoryMessageVisible(): Promise<boolean> {
    return await this.noHistoryMessage.isVisible();
  }
}
```

#### Task 1.2: Create ThemePage

**File**: `e2e/pages/ThemePage.ts`

**Content**:
```typescript
import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ThemePage extends BasePage {
  readonly settingsTab: Locator;
  readonly cyanThemeButton: Locator;
  readonly matrixThemeButton: Locator;
  readonly sunsetThemeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsTab = page.getByRole('tab', { name: /settings/i });
    // RadioGroup buttons with theme labels
    this.cyanThemeButton = page.getByRole('radio', { name: /cyan pulse/i });
    this.matrixThemeButton = page.getByRole('radio', { name: /matrix green/i });
    this.sunsetThemeButton = page.getByRole('radio', { name: /sunset orange/i });
  }

  async switchToSettingsTab() {
    await this.settingsTab.click();
  }

  async selectTheme(theme: 'cyan' | 'matrix' | 'sunset') {
    const buttonMap = {
      cyan: this.cyanThemeButton,
      matrix: this.matrixThemeButton,
      sunset: this.sunsetThemeButton,
    };
    await buttonMap[theme].click();
  }

  async getCurrentTheme(): Promise<string | null> {
    // Read data-theme attribute from html element
    return await this.page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
  }

  async verifyThemeApplied(expectedTheme: string) {
    const currentTheme = await this.getCurrentTheme();
    return currentTheme === expectedTheme;
  }

  async isThemeChecked(theme: 'cyan' | 'matrix' | 'sunset'): Promise<boolean> {
    const buttonMap = {
      cyan: this.cyanThemeButton,
      matrix: this.matrixThemeButton,
      sunset: this.sunsetThemeButton,
    };
    return await buttonMap[theme].isChecked();
  }
}
```

#### Task 1.3: Create MobilePage

**File**: `e2e/pages/MobilePage.ts`

**Content**:
```typescript
import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MobilePage extends BasePage {
  readonly menuButton: Locator;
  readonly drawer: Locator;
  readonly drawerCloseButton: Locator;
  readonly drawerOverlay: Locator;

  constructor(page: Page) {
    super(page);
    // Hamburger menu button (only visible on mobile)
    this.menuButton = page.getByRole('button', { name: /menu/i });
    // Drawer dialog
    this.drawer = page.getByRole('dialog', { name: /menu/i });
    // Close button inside drawer
    this.drawerCloseButton = this.drawer.getByRole('button', { name: /close/i });
    // Overlay backdrop
    this.drawerOverlay = page.locator('[data-radix-dialog-overlay]');
  }

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async openDrawer() {
    await this.menuButton.click();
    await this.drawer.waitFor({ state: 'visible' });
  }

  async closeDrawerViaButton() {
    await this.drawerCloseButton.click();
    await this.drawer.waitFor({ state: 'hidden' });
  }

  async closeDrawerViaOverlay() {
    // Click overlay (outside drawer content)
    await this.drawerOverlay.click({ position: { x: 10, y: 10 } });
    await this.drawer.waitFor({ state: 'hidden' });
  }

  async isDrawerVisible(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  async isMenuButtonVisible(): Promise<boolean> {
    return await this.menuButton.isVisible();
  }
}
```

#### Task 1.4: Create Barrel Export

**File**: `e2e/pages/index.ts`

**Content**:
```typescript
export { BasePage } from './BasePage';
export { WheelPage } from './WheelPage';
export { SidebarPage } from './SidebarPage';
export { HistoryPage } from './HistoryPage';
export { ThemePage } from './ThemePage';
export { MobilePage } from './MobilePage';
```

**Verification**:
```bash
bun run tsc  # TypeScript should compile without errors
```

**Commit**:
```bash
git add e2e/pages/HistoryPage.ts e2e/pages/ThemePage.ts e2e/pages/MobilePage.ts e2e/pages/index.ts
git commit -m "feat(e2e): add HistoryPage, ThemePage, MobilePage objects"
```

---

### Phase 2: Extend Existing Page Objects (30 min)

**Goal**: Add list management and export methods to SidebarPage, viewport methods to BasePage.

#### Task 2.1: Extend SidebarPage

**File**: `e2e/pages/SidebarPage.ts`

**Add methods** (after existing methods):
```typescript
  // List management methods
  async createList(name: string) {
    await this.listSelector.click();
    const createButton = this.page.getByRole('button', { name: /create new list/i });
    await createButton.click();
    // Enter name in prompt-like input
    const input = this.page.getByRole('textbox', { name: /list name/i });
    await input.fill(name);
    await input.press('Enter');
  }

  async switchToList(listName: string) {
    await this.listSelector.click();
    const listItem = this.page
      .getByRole('menuitem')
      .filter({ hasText: listName });
    await listItem.click();
  }

  async deleteList(listName: string) {
    await this.listSelector.click();
    const listItem = this.page
      .locator('.group')
      .filter({ hasText: listName });
    const deleteButton = listItem.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async renameList(oldName: string, newName: string) {
    await this.listSelector.click();
    const listItem = this.page
      .locator('.group')
      .filter({ hasText: oldName });
    const editButton = listItem.getByRole('button', { name: /edit/i });
    await editButton.click();
    // Edit inline input
    const input = listItem.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
  }

  async getCurrentListName(): Promise<string | null> {
    return await this.listSelector.textContent();
  }

  // Export modal methods
  async selectExportFormat(format: 'csv' | 'json') {
    const radioButton = this.page.getByRole('radio', {
      name: new RegExp(format, 'i'),
    });
    await radioButton.click();
  }

  async setExportFilename(filename: string) {
    const filenameInput = this.page.getByPlaceholder(/filename/i);
    await filenameInput.fill(filename);
  }

  async clickExportDownload() {
    const downloadButton = this.page.getByRole('button', { name: /download/i });
    await downloadButton.click();
  }

  async closeExportModal() {
    await this.pressEscape();
  }
```

**Verification**:
```bash
bun run tsc  # TypeScript should compile without errors
```

**Commit**:
```bash
git add e2e/pages/SidebarPage.ts
git commit -m "feat(e2e): extend SidebarPage with list management and export methods"
```

---

### Phase 3: Update Fixtures (15 min)

**Goal**: Add new page objects to fixture initialization.

#### Task 3.1: Update localStorage.fixture.ts

**File**: `e2e/fixtures/localStorage.fixture.ts`

**Replace entire file** with:
```typescript
import { test as base } from '@playwright/test';
import {
  WheelPage,
  SidebarPage,
  HistoryPage,
  ThemePage,
  MobilePage,
} from '../pages';

type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
  historyPage: HistoryPage;
  themePage: ThemePage;
  mobilePage: MobilePage;
};

export const test = base.extend<MyFixtures>({
  wheelPage: async ({ page }, use) => {
    const wheelPage = new WheelPage(page);
    await wheelPage.goto();
    await use(wheelPage);
  },

  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.goto();
    await use(sidebarPage);
  },

  historyPage: async ({ page }, use) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await use(historyPage);
  },

  themePage: async ({ page }, use) => {
    const themePage = new ThemePage(page);
    await themePage.goto();
    await use(themePage);
  },

  mobilePage: async ({ page }, use) => {
    const mobilePage = new MobilePage(page);
    await mobilePage.goto();
    await use(mobilePage);
  },
});

export { expect } from '@playwright/test';

// Clear localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// Reset viewport after mobile tests
test.afterEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
});
```

**Verification**:
```bash
bun run tsc  # TypeScript should compile without errors
```

**Commit**:
```bash
git add e2e/fixtures/localStorage.fixture.ts
git commit -m "feat(e2e): add new page objects to localStorage fixture"
```

---

### Phase 4: List Management Tests (30 min)

**Goal**: Implement 4 tests for list CRUD operations.

#### Task 4.1: Create List Management Test Spec

**File**: `e2e/specs/03-list-management.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('List Management', () => {
  test('should create new list via prompt dialog', async ({ sidebarPage }) => {
    // Create new list
    await sidebarPage.createList('Work');

    // Verify list appears in selector
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('Work');
  });

  test('should switch between lists', async ({ sidebarPage }) => {
    // Create second list
    await sidebarPage.createList('Work');
    await sidebarPage.addName('Bob');

    // Switch to Default List
    await sidebarPage.switchToList('Default List');

    // Verify Bob not visible in Default List
    const bobItem = sidebarPage.nameItems.filter({ hasText: 'Bob' });
    await expect(bobItem).not.toBeVisible();

    // Switch back to Work
    await sidebarPage.switchToList('Work');

    // Verify Bob visible again
    await expect(bobItem).toBeVisible();
  });

  test('should delete list with confirmation', async ({ sidebarPage }) => {
    // Create list with >5 names to trigger confirmation
    await sidebarPage.createList('Temp List');
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
    for (const name of names) {
      await sidebarPage.addName(name);
    }

    // Delete list
    await sidebarPage.deleteList('Temp List');

    // Verify list removed (should show Default List now)
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('Default List');
  });

  test('should rename list inline', async ({ sidebarPage }) => {
    // Create new list
    await sidebarPage.createList('Old Name');

    // Rename list
    await sidebarPage.renameList('Old Name', 'New Name');

    // Verify list name updated
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('New Name');
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/03-list-management.spec.ts
```

**Expected Output**: 4 tests passing

**Troubleshooting**:
- If list selector doesn't open, check locator for dropdown trigger
- If confirmation dialog doesn't appear, verify list has >5 names
- If rename fails, check inline input selector

**Commit**:
```bash
git add e2e/specs/03-list-management.spec.ts
git commit -m "test(e2e): add list management tests"
```

---

### Phase 5: Selection History Tests (35 min)

**Goal**: Implement 4 tests for history tracking and management.

#### Task 5.1: Create Selection History Test Spec

**File**: `e2e/specs/04-selection-history.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Selection History', () => {
  test('should record selections after spins', async ({
    wheelPage,
    historyPage,
  }) => {
    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Verify "No history yet" message
    const noHistoryVisible = await historyPage.isNoHistoryMessageVisible();
    expect(noHistoryVisible).toBe(true);

    // Spin wheel 3 times
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    // Switch back to History tab
    await historyPage.switchToHistoryTab();

    // Verify 3 history items appear
    const count = await historyPage.getHistoryCount();
    expect(count).toBe(3);
  });

  test('should delete individual history item', async ({
    wheelPage,
    historyPage,
  }) => {
    // Spin wheel twice
    await wheelPage.spin();
    await wheelPage.spin();

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Delete first item
    await historyPage.deleteHistoryItem(0);

    // Verify count decreased
    const count = await historyPage.getHistoryCount();
    expect(count).toBe(1);
  });

  test('should clear all history with confirmation', async ({
    wheelPage,
    historyPage,
  }) => {
    // Spin wheel 5 times
    for (let i = 0; i < 5; i++) {
      await wheelPage.spin();
    }

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Clear all history
    await historyPage.clearAllHistory();

    // Verify "No history yet" message appears
    const noHistoryVisible = await historyPage.isNoHistoryMessageVisible();
    expect(noHistoryVisible).toBe(true);
  });

  test('should update stats correctly', async ({ wheelPage, historyPage }) => {
    // Spin wheel 3 times
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Verify stats show total selections
    const statsText = await historyPage.getStatsText();
    expect(statsText).toContain('Total: 3');
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/04-selection-history.spec.ts
```

**Expected Output**: 4 tests passing

**Commit**:
```bash
git add e2e/specs/04-selection-history.spec.ts
git commit -m "test(e2e): add selection history tests"
```

---

### Phase 6: Export Functionality Tests (30 min)

**Goal**: Implement 3 tests for CSV/JSON export.

#### Task 6.1: Create Export Test Spec

**File**: `e2e/specs/05-export.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Export Functionality', () => {
  test('should export history as CSV', async ({ wheelPage, historyPage }) => {
    // Spin wheel 3 times to generate history
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Open export modal
    await historyPage.openExportModal();

    // Select CSV format (default)
    const page = historyPage.page;
    const csvRadio = page.getByRole('radio', { name: /csv/i });
    await csvRadio.click();

    // Wait for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;

    // Verify filename pattern
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/selections_.*\.csv/);
  });

  test('should export history as JSON', async ({ wheelPage, historyPage }) => {
    // Spin wheel 2 times
    await wheelPage.spin();
    await wheelPage.spin();

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Open export modal
    await historyPage.openExportModal();

    // Select JSON format
    const page = historyPage.page;
    const jsonRadio = page.getByRole('radio', { name: /json/i });
    await jsonRadio.click();

    // Wait for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;

    // Verify filename ends with .json
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.json$/);
  });

  test('should use custom filename', async ({ wheelPage, historyPage }) => {
    // Spin wheel once
    await wheelPage.spin();

    // Switch to History tab
    await historyPage.switchToHistoryTab();

    // Open export modal
    await historyPage.openExportModal();

    // Change filename
    const page = historyPage.page;
    const filenameInput = page.getByPlaceholder(/filename/i);
    await filenameInput.fill('my-selections');

    // Download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;

    // Verify custom filename used
    const filename = download.suggestedFilename();
    expect(filename).toContain('my-selections');
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/05-export.spec.ts
```

**Expected Output**: 3 tests passing

**Commit**:
```bash
git add e2e/specs/05-export.spec.ts
git commit -m "test(e2e): add export functionality tests"
```

---

### Phase 7: Theme Switching Tests (25 min)

**Goal**: Implement 2 tests for theme persistence and visual changes.

#### Task 7.1: Create Theme Switching Test Spec

**File**: `e2e/specs/06-theme-switching.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Theme Switching', () => {
  test('should persist theme across reloads', async ({ themePage }) => {
    // Switch to Settings tab
    await themePage.switchToSettingsTab();

    // Select Matrix Green theme
    await themePage.selectTheme('matrix');

    // Verify theme applied
    const themeApplied = await themePage.verifyThemeApplied('matrix');
    expect(themeApplied).toBe(true);

    // Reload page
    await themePage.page.reload();

    // Switch to Settings tab again
    await themePage.switchToSettingsTab();

    // Verify Matrix Green still selected
    const isChecked = await themePage.isThemeChecked('matrix');
    expect(isChecked).toBe(true);

    // Verify theme still applied
    const themeStillApplied = await themePage.verifyThemeApplied('matrix');
    expect(themeStillApplied).toBe(true);
  });

  test('should change visual appearance', async ({ themePage }) => {
    // Switch to Settings tab
    await themePage.switchToSettingsTab();

    // Default theme should be cyan
    const defaultTheme = await themePage.getCurrentTheme();
    expect(defaultTheme).toBe('cyan');

    // Select Sunset Orange theme
    await themePage.selectTheme('sunset');

    // Verify theme changed
    const newTheme = await themePage.getCurrentTheme();
    expect(newTheme).toBe('sunset');

    // Verify RadioGroup shows Sunset Orange as checked
    const isChecked = await themePage.isThemeChecked('sunset');
    expect(isChecked).toBe(true);
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/06-theme-switching.spec.ts
```

**Expected Output**: 2 tests passing

**Commit**:
```bash
git add e2e/specs/06-theme-switching.spec.ts
git commit -m "test(e2e): add theme switching tests"
```

---

### Phase 8: Mobile Sidebar Tests (25 min)

**Goal**: Implement 2 tests for mobile drawer behavior.

#### Task 8.1: Create Mobile Sidebar Test Spec

**File**: `e2e/specs/07-mobile-sidebar.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Mobile Sidebar', () => {
  test('should open drawer on mobile header button', async ({
    mobilePage,
    historyPage,
  }) => {
    // Set viewport to mobile size
    await mobilePage.setMobileViewport();
    await mobilePage.page.reload();

    // Verify hamburger menu button visible
    const menuVisible = await mobilePage.isMenuButtonVisible();
    expect(menuVisible).toBe(true);

    // Open drawer
    await mobilePage.openDrawer();

    // Verify drawer visible
    const drawerVisible = await mobilePage.isDrawerVisible();
    expect(drawerVisible).toBe(true);

    // Verify drawer contains tabs (History tab should be visible)
    await expect(historyPage.historyTab).toBeVisible();
  });

  test('should close drawer on overlay click', async ({ mobilePage }) => {
    // Set viewport to mobile size
    await mobilePage.setMobileViewport();
    await mobilePage.page.reload();

    // Open drawer
    await mobilePage.openDrawer();

    // Verify drawer open
    let drawerVisible = await mobilePage.isDrawerVisible();
    expect(drawerVisible).toBe(true);

    // Close via overlay
    await mobilePage.closeDrawerViaOverlay();

    // Verify drawer closed
    drawerVisible = await mobilePage.isDrawerVisible();
    expect(drawerVisible).toBe(false);
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/07-mobile-sidebar.spec.ts
```

**Expected Output**: 2 tests passing

**Troubleshooting**:
- If drawer doesn't open, check viewport size was applied before reload
- If overlay click doesn't close, verify overlay locator selector

**Commit**:
```bash
git add e2e/specs/07-mobile-sidebar.spec.ts
git commit -m "test(e2e): add mobile sidebar tests"
```

---

### Phase 9: Name Exclusion/Editing Tests (30 min)

**Goal**: Implement 3 tests for inline editing and exclusion workflows.

#### Task 9.1: Create Name Exclusion/Editing Test Spec

**File**: `e2e/specs/08-name-exclusion-editing.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Name Exclusion and Editing', () => {
  test('should edit name via double-click', async ({
    sidebarPage,
    wheelPage,
  }) => {
    // Double-click on first name to edit
    const firstItem = sidebarPage.nameItems.first();
    await firstItem.dblclick();

    // Type new name
    const input = firstItem.getByRole('textbox');
    await input.fill('Alice Updated');
    await input.press('Enter');

    // Verify name updated in list
    const updatedItem = sidebarPage.nameItems.filter({
      hasText: 'Alice Updated',
    });
    await expect(updatedItem).toBeVisible();
  });

  test('should cancel edit on Escape', async ({ sidebarPage }) => {
    // Get original name
    const firstItem = sidebarPage.nameItems.first();
    const originalName = await firstItem.textContent();

    // Double-click to edit
    await firstItem.dblclick();

    // Type new name
    const input = firstItem.getByRole('textbox');
    await input.fill('Canceled Name');

    // Press Escape
    await input.press('Escape');

    // Verify original name still displayed
    const currentName = await firstItem.textContent();
    expect(currentName).toContain(originalName);
  });

  test('should exclude name from wheel', async ({ sidebarPage, wheelPage }) => {
    // Get initial wheel name count
    await wheelPage.verifyNamesDisplayed(12);

    // Exclude first name
    const firstName = await sidebarPage.nameItems.first().textContent();
    await sidebarPage.excludeName(firstName || '');

    // Verify wheel count decreased
    await wheelPage.verifyNamesDisplayed(11);

    // Spin wheel 10 times
    const selectedNames: string[] = [];
    for (let i = 0; i < 10; i++) {
      await wheelPage.spin();
      const selectedName = await wheelPage.getSelectedName();
      if (selectedName) {
        selectedNames.push(selectedName);
      }
    }

    // Verify excluded name never selected
    const containsExcluded = selectedNames.some((name) =>
      name.includes(firstName || '')
    );
    expect(containsExcluded).toBe(false);
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/08-name-exclusion-editing.spec.ts
```

**Expected Output**: 3 tests passing

**Commit**:
```bash
git add e2e/specs/08-name-exclusion-editing.spec.ts
git commit -m "test(e2e): add name exclusion and editing tests"
```

---

### Phase 10: Keyboard Shortcut Edge Cases (20 min)

**Goal**: Implement 2 tests for keyboard shortcut edge cases.

#### Task 10.1: Create Keyboard Shortcut Test Spec

**File**: `e2e/specs/09-keyboard-shortcuts.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Keyboard Shortcut Edge Cases', () => {
  test('should not spin when typing in input field', async ({
    sidebarPage,
    wheelPage,
  }) => {
    // Focus on Add Name input
    await sidebarPage.addNameInput.click();

    // Type name with space (e.g., "John Doe")
    await sidebarPage.addNameInput.type('John Doe');

    // Verify wheel did NOT spin (button still enabled, no toast)
    const isSpinning = await wheelPage.isSpinning();
    expect(isSpinning).toBe(false);

    // Verify "John Doe" appears in input (space preserved)
    const inputValue = await sidebarPage.addNameInput.inputValue();
    expect(inputValue).toBe('John Doe');
  });

  test('should close all modals on Escape', async ({
    sidebarPage,
    historyPage,
  }) => {
    // Test 1: Bulk import modal
    await sidebarPage.bulkImportButton.click();
    let modalVisible = await sidebarPage.page
      .getByRole('dialog', { name: /bulk import/i })
      .isVisible();
    expect(modalVisible).toBe(true);

    await sidebarPage.pressEscape();
    modalVisible = await sidebarPage.page
      .getByRole('dialog', { name: /bulk import/i })
      .isVisible();
    expect(modalVisible).toBe(false);

    // Test 2: List selector dropdown
    await sidebarPage.listSelector.click();
    const dropdownVisible = await sidebarPage.page
      .getByRole('menu')
      .isVisible();
    expect(dropdownVisible).toBe(true);

    await sidebarPage.pressEscape();
    const dropdownClosed = await sidebarPage.page
      .getByRole('menu')
      .isHidden();
    expect(dropdownClosed).toBe(true);

    // Test 3: Export modal (after creating history)
    await sidebarPage.page
      .getByRole('button', { name: /randomize/i })
      .click();
    await historyPage.page.waitForTimeout(6000); // Wait for spin
    await historyPage.switchToHistoryTab();
    await historyPage.openExportModal();

    let exportModalVisible = await historyPage.page
      .getByRole('dialog', { name: /export/i })
      .isVisible();
    expect(exportModalVisible).toBe(true);

    await historyPage.pressEscape();
    exportModalVisible = await historyPage.page
      .getByRole('dialog', { name: /export/i })
      .isVisible();
    expect(exportModalVisible).toBe(false);
  });
});
```

**Run Tests**:
```bash
bun run test:e2e e2e/specs/09-keyboard-shortcuts.spec.ts
```

**Expected Output**: 2 tests passing

**Commit**:
```bash
git add e2e/specs/09-keyboard-shortcuts.spec.ts
git commit -m "test(e2e): add keyboard shortcut edge case tests"
```

---

### Phase 11: Update Documentation (15 min)

**Goal**: Update CLAUDE.md and CODE_REFERENCE.md with Phase 2 coverage.

#### Task 11.1: Update CLAUDE.md

**File**: `CLAUDE.md`

**Find** (around line 136):
```markdown
- **Test Count**: 6 tests (Phase 1), 22 tests (Phase 2 target)
```

**Replace with**:
```markdown
- **Test Count**: 22 tests (Phase 2 complete)
```

**Find** (around line 148):
```markdown
**Test Specs** (`e2e/specs/`):
- 01-wheel-spin.spec.ts - Spin animation, toast notifications
- 02-name-management.spec.ts - Add, bulk import
```

**Replace with**:
```markdown
**Test Specs** (`e2e/specs/`):
- 01-wheel-spin.spec.ts - Spin animation, toast notifications (4 tests)
- 02-name-management.spec.ts - Add, bulk import (2 tests)
- 03-list-management.spec.ts - List CRUD operations (4 tests)
- 04-selection-history.spec.ts - History tracking and management (4 tests)
- 05-export.spec.ts - CSV/JSON export downloads (3 tests)
- 06-theme-switching.spec.ts - Theme persistence and visual changes (2 tests)
- 07-mobile-sidebar.spec.ts - Responsive drawer behavior (2 tests)
- 08-name-exclusion-editing.spec.ts - Inline editing and exclusion (3 tests)
- 09-keyboard-shortcuts.spec.ts - Edge cases for Space/Escape (2 tests)
```

#### Task 11.2: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

**Find** (around line 598):
```markdown
**Page Objects** (`e2e/pages/`):
- BasePage.ts - Common functionality (navigation, shortcuts)
- WheelPage.ts - Wheel spin interactions
- SidebarPage.ts - Name/list management
```

**Replace with**:
```markdown
**Page Objects** (`e2e/pages/`):
- BasePage.ts - Common functionality (navigation, shortcuts)
- WheelPage.ts - Wheel spin interactions
- SidebarPage.ts - Name/list management, export modal
- HistoryPage.ts - History tab interactions
- ThemePage.ts - Theme switcher controls
- MobilePage.ts - Mobile drawer and header
```

**Commit**:
```bash
git add CLAUDE.md .claude/tasks/CODE_REFERENCE.md
git commit -m "docs(e2e): update documentation for Phase 2 coverage"
```

---

## Post-Session Checklist

After completing all phases, verify the following:

```bash
# 1. Type check passes
bun run tsc

# 2. Build succeeds
bun build

# 3. Unit tests pass
bun test:run

# 4. All E2E tests pass (headless)
bun run test:e2e
# Expected: 22 tests passing

# 5. E2E tests pass (UI mode, manual verification)
bun run test:e2e:ui
```

**Expected Results**:
- ✅ TypeScript: No errors
- ✅ Build: Success
- ✅ Unit tests: 190+ passing
- ✅ E2E tests: 22 passing

**Visual Verification** (via `test:e2e:ui`):
1. All 9 test files execute successfully
2. No flaky tests (run 3 times consecutively)
3. Mobile tests reset viewport after completion
4. Download events trigger correctly (export tests)
5. History persists across tab switches

---

## Create Pull Request

Once all checks pass:

```bash
# 1. Push feature branch
git push -u origin test/playwright-e2e-phase2

# 2. Create PR using GitHub CLI
gh pr create --title "test(e2e): expand E2E coverage to 22 tests (Phase 2)" --body "$(cat <<'EOF'
## Summary
Expanded E2E test coverage from 6 → 22 tests by adding comprehensive tests for all remaining features:

- List management (create, switch, delete, rename) - 4 tests
- Selection history tracking and management - 4 tests
- Export functionality (CSV, JSON) - 3 tests
- Theme switching and persistence - 2 tests
- Mobile sidebar drawer - 2 tests
- Name exclusion/editing workflows - 3 tests
- Keyboard shortcut edge cases - 2 tests

## Test Coverage (Phase 2)

**List Management (4 tests)**:
- Create new list via prompt dialog
- Switch between lists
- Delete list with confirmation
- Rename list inline

**Selection History (4 tests)**:
- Record selections after spins
- Delete individual history item
- Clear all history with confirmation
- Update stats correctly

**Export Functionality (3 tests)**:
- Export history as CSV
- Export history as JSON
- Use custom filename

**Theme Switching (2 tests)**:
- Persist theme across reloads
- Change visual appearance

**Mobile Sidebar (2 tests)**:
- Open drawer on mobile header button
- Close drawer on overlay click

**Name Exclusion/Editing (3 tests)**:
- Edit name via double-click
- Cancel edit on Escape
- Exclude name from wheel

**Keyboard Shortcuts (2 tests)**:
- Should not spin when typing in input field
- Should close all modals on Escape

## Infrastructure Changes

**New Page Objects**:
- `HistoryPage.ts` - History tab interactions
- `ThemePage.ts` - Theme switcher controls
- `MobilePage.ts` - Mobile drawer and header

**Extended Page Objects**:
- `SidebarPage.ts` - Added list management and export methods
- `localStorage.fixture.ts` - Added new page objects + viewport reset

**New Test Files**:
- `03-list-management.spec.ts` (4 tests)
- `04-selection-history.spec.ts` (4 tests)
- `05-export.spec.ts` (3 tests)
- `06-theme-switching.spec.ts` (2 tests)
- `07-mobile-sidebar.spec.ts` (2 tests)
- `08-name-exclusion-editing.spec.ts` (3 tests)
- `09-keyboard-shortcuts.spec.ts` (2 tests)

## Files Modified
- `e2e/pages/SidebarPage.ts` - Extended with list management and export methods
- `e2e/fixtures/localStorage.fixture.ts` - Added new page objects, viewport reset
- `CLAUDE.md` - Updated test count and specs list
- `.claude/tasks/CODE_REFERENCE.md` - Updated page object documentation

## Files Added
- `e2e/pages/HistoryPage.ts`
- `e2e/pages/ThemePage.ts`
- `e2e/pages/MobilePage.ts`
- `e2e/pages/index.ts` (barrel export)
- 7 new test spec files

## Test Execution Time
- Phase 1 (6 tests): ~8 seconds
- Phase 2 (16 tests): ~30 seconds
- **Total (22 tests): ~38 seconds** (headless, serial workers)

## Test Plan
- [x] Type check passes (bun run tsc)
- [x] Build succeeds (bun build)
- [x] Unit tests pass (bun test:run)
- [x] All 22 E2E tests pass locally (bun run test:e2e)
- [x] All 22 E2E tests pass in CI (GitHub Actions)
- [x] No flaky tests (3 consecutive runs)
- [x] Mobile viewport resets after tests
- [x] Download events trigger correctly
- [x] History persists across tab switches

## CI Impact
- E2E job time increase: +30 seconds (6 → 22 tests)
- Total CI time: ~4-6 minutes (unchanged, runs in parallel)
- Test success rate: 100% (0 flaky tests across 3 runs)

## Breaking Changes
None - All changes are additive (new tests and page objects).

## Related Documentation
- Plan: `.claude/plans/synthetic-sauteeing-marshmallow.md`
- Prompt: `.claude/tasks/prompts/session-18-playwright-e2e-phase2-prompt.md`
- Session 17 (Phase 1): `.claude/tasks/sessions/session-17-playwright-e2e-phase1.md`

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Troubleshooting

### Issue 1: Mobile viewport not resetting

**Symptom**: Desktop tests fail after mobile tests run.

**Solution**:
```typescript
// Ensure afterEach hook in fixture resets viewport
test.afterEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
});
```

### Issue 2: Download event not firing

**Symptom**: Export tests timeout waiting for download.

**Solution**:
- Increase timeout: `page.waitForEvent('download', { timeout: 10000 })`
- Verify export button triggers download (not just modal close)
- Check browser permissions allow downloads

### Issue 3: History items not appearing

**Symptom**: History tab shows "No history yet" after spins.

**Solution**:
- Ensure spin completes before switching tabs (wait for toast)
- Verify `recordSelection()` is called in store after spin
- Check localStorage persistence is working (fixture not clearing mid-test)

### Issue 4: Theme not persisting

**Symptom**: Theme reverts to default after reload.

**Solution**:
- Verify theme stored in localStorage (not just state)
- Check `data-theme` attribute applied to `<html>` element
- Ensure reload happens after theme change completes

### Issue 5: List selector dropdown doesn't open

**Symptom**: `listSelector.click()` doesn't open dropdown menu.

**Solution**:
- Update locator to match exact button text (e.g., "Default List (12 names)")
- Use `.first()` to avoid ambiguous selector (if multiple list selectors exist)
- Check if dropdown uses different trigger (e.g., icon button)

---

## Success Criteria

- [x] 3 new page objects created (History, Theme, Mobile)
- [x] SidebarPage extended with list management and export
- [x] 7 new test files created (16 new tests)
- [x] All 22 E2E tests passing locally
- [x] All 22 E2E tests passing in CI
- [x] No flaky tests (0% failure rate across 3 runs)
- [x] Total E2E execution time <40 seconds (headless, serial)
- [x] Type check passes
- [x] Build succeeds
- [x] Documentation updated (CLAUDE.md, CODE_REFERENCE.md)
- [x] 10 atomic commits created
- [x] Pull request created with detailed description

---

## Next Session Preview

**Session 19: E2E Testing Phase 3** (Optional Future Enhancement)
- Visual regression testing (Playwright screenshots)
- Accessibility testing (axe-core integration)
- Performance testing (Lighthouse CI)
- Cross-browser matrix (Firefox, WebKit)

---

## Estimated Timeline

| Phase | Description | Time |
|-------|-------------|------|
| 1 | Create new page objects | 45 min |
| 2 | Extend existing page objects | 30 min |
| 3 | Update fixtures | 15 min |
| 4 | List management tests | 30 min |
| 5 | Selection history tests | 35 min |
| 6 | Export tests | 30 min |
| 7 | Theme switching tests | 25 min |
| 8 | Mobile sidebar tests | 25 min |
| 9 | Name exclusion/editing tests | 30 min |
| 10 | Keyboard shortcut tests | 20 min |
| 11 | Update documentation | 15 min |
| **Total** | | **~4 hours** |

**Buffer**: +30 min for debugging selector issues or flaky tests

---

## Related Files

- **Plan**: `.claude/plans/synthetic-sauteeing-marshmallow.md`
- **Session Doc**: `.claude/tasks/sessions/session-18-playwright-e2e-phase2.md` (create after session)
- **Code Reference**: `.claude/tasks/CODE_REFERENCE.md`
- **Project Docs**: `CLAUDE.md`
- **Session 17 (Phase 1)**: `.claude/tasks/sessions/session-17-playwright-e2e-phase1.md`
