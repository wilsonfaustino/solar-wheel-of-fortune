# Session 25 Prompt: SettingsPanel E2E Tests

**Copy this entire prompt to start Session 25**

---

## Session Goal

Add comprehensive E2E tests for the SettingsPanel feature implemented in Session 24. This closes the testing gap by validating settings persistence, UI interactions, and integration with wheel behavior in a real browser environment.

---

## Pre-Session Setup

Before starting this session, verify the following:

### 1. Clean Working State
```bash
git status
# Should show: "nothing to commit, working tree clean"
# If not: commit or stash changes before proceeding
```

### 2. Tests Passing
```bash
bun test:run
# All unit tests should pass (expect 216+ tests)

bun run test:e2e
# All E2E tests should pass (expect 27 tests passing, 3 skipped)
```

### 3. Review Current Implementation
Read these files to understand context:
- `src/components/sidebar/SettingsPanel.tsx` - SettingsPanel implementation
- `src/stores/useSettingsStore.ts` - Settings store with localStorage persistence
- `src/App.tsx` - Integration logic (lines 33-74)
- `e2e/pages/ThemePage.ts` - Similar settings component pattern
- `e2e/specs/06-theme-switching.spec.ts` - Similar test patterns
- `e2e/specs/10-auto-exclude-selection.spec.ts` - Auto-exclusion behavior tests

### 4. Review Planning Artifacts
- Plan: `.claude/plans/distributed-purring-hammock.md`
- This prompt: `.claude/tasks/prompts/session-25-settings-panel-e2e-prompt.md`
- Session 24 summary: `.claude/tasks/sessions/session-24-auto-exclude.md`

---

## Session Tasks

### Phase 1: Create SettingsPage Object (30 minutes)

#### Task 1.1: Create Feature Branch
```bash
git checkout -b test/settings-panel-e2e
```

#### Task 1.2: Create SettingsPage File

**New file**: `e2e/pages/SettingsPage.ts`

**Implementation**:
```typescript
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  readonly settingsTab: Locator;
  readonly autoExcludeSwitch: Locator;
  readonly clearSelectionSwitch: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsTab = page.getByRole('button', { name: /settings tab/i });
    // Use IDs from SettingsPanel component
    this.autoExcludeSwitch = page.locator('#auto-exclude');
    this.clearSelectionSwitch = page.locator('#clear-selection-after-exclude');
  }

  async switchToSettingsTab() {
    await this.settingsTab.click();
  }

  async toggleAutoExclude() {
    await this.autoExcludeSwitch.click();
  }

  async toggleClearSelection() {
    await this.clearSelectionSwitch.click();
  }

  async isAutoExcludeEnabled(): Promise<boolean> {
    return await this.autoExcludeSwitch.isChecked();
  }

  async isClearSelectionEnabled(): Promise<boolean> {
    return await this.clearSelectionSwitch.isChecked();
  }

  async isClearSelectionVisible(): Promise<boolean> {
    return await this.clearSelectionSwitch.isVisible();
  }

  async getSettingsFromStorage(): Promise<{
    autoExcludeEnabled: boolean;
    clearSelectionAfterExclude: boolean;
  }> {
    return await this.page.evaluate(() => {
      const stored = localStorage.getItem('settings-storage');
      if (!stored) {
        return { autoExcludeEnabled: true, clearSelectionAfterExclude: false };
      }
      const parsed = JSON.parse(stored);
      return {
        autoExcludeEnabled: parsed.state.autoExcludeEnabled,
        clearSelectionAfterExclude: parsed.state.clearSelectionAfterExclude,
      };
    });
  }
}
```

**Key points**:
- Extends `BasePage` for common functionality (goto, keyboard shortcuts)
- Uses semantic role selectors where possible (`getByRole`)
- Uses IDs for Switch components (`#auto-exclude`, `#clear-selection-after-exclude`)
- Includes localStorage verification method
- Follows ThemePage pattern from Session 14

#### Task 1.3: Verify TypeScript Compilation
```bash
bun run tsc -b
# Should pass with 0 errors
```

#### Task 1.4: Create First Atomic Commit
```bash
git add e2e/pages/SettingsPage.ts

git commit -m "$(cat <<'EOF'
test(e2e): add SettingsPage page object

Add page object for SettingsPanel with methods for:
- Toggle auto-exclude and clear-selection switches
- Verify toggle states and visibility
- Read settings from localStorage

Part of Session 25 E2E test coverage for SettingsPanel feature.
EOF
)"
```

---

### Phase 2: Create E2E Test Spec (45 minutes)

#### Task 2.1: Create Test Spec File

**New file**: `e2e/specs/11-settings-panel.spec.ts`

**Implementation**:
```typescript
import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('SettingsPanel', () => {
  test('should disable auto-exclusion when toggled OFF', async ({
    settingsPage,
    wheelPage,
    page,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Verify auto-exclude is ON by default
    const initialState = await settingsPage.isAutoExcludeEnabled();
    expect(initialState).toBe(true);

    // Verify initial localStorage state
    const initialStorage = await settingsPage.getSettingsFromStorage();
    expect(initialStorage.autoExcludeEnabled).toBe(true);

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Verify toggle state changed
    const toggledState = await settingsPage.isAutoExcludeEnabled();
    expect(toggledState).toBe(false);

    // Verify localStorage updated
    const updatedStorage = await settingsPage.getSettingsFromStorage();
    expect(updatedStorage.autoExcludeEnabled).toBe(false);

    // Get initial wheel count
    const initialCount = await page.locator('g[data-index] text').count();
    expect(initialCount).toBe(12);

    // Spin wheel
    await wheelPage.spin();

    // Wait 2.5 seconds (auto-exclusion timer would fire at 2s)
    await page.waitForTimeout(2500);

    // Verify name NOT excluded (count still 12)
    const finalCount = await page.locator('g[data-index] text').count();
    expect(finalCount).toBe(12);
  });

  test('should clear selection after exclusion when enabled', async ({
    settingsPage,
    wheelPage,
    page,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Auto-exclude should be ON by default, enable clear-selection
    await settingsPage.toggleClearSelection();

    // Verify clear-selection enabled
    const clearSelectionState = await settingsPage.isClearSelectionEnabled();
    expect(clearSelectionState).toBe(true);

    // Verify localStorage updated
    const settings = await settingsPage.getSettingsFromStorage();
    expect(settings.clearSelectionAfterExclude).toBe(true);

    // Spin wheel
    await wheelPage.spin();

    // Wait 2.5 seconds for auto-exclusion (and clear selection)
    await page.waitForTimeout(2500);

    // Verify selection was cleared by checking that no name has data-selected attribute
    const selectedNames = await page.locator('[data-selected="true"]').count();
    expect(selectedNames).toBe(0);
  });

  test('should persist settings across reloads', async ({ settingsPage, page }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Verify toggle state
    const beforeReload = await settingsPage.isAutoExcludeEnabled();
    expect(beforeReload).toBe(false);

    // Verify localStorage
    const storageBeforeReload = await settingsPage.getSettingsFromStorage();
    expect(storageBeforeReload.autoExcludeEnabled).toBe(false);

    // Reload page
    await page.reload();

    // Switch to Settings tab again
    await settingsPage.switchToSettingsTab();

    // Verify auto-exclude still OFF (UI)
    const afterReload = await settingsPage.isAutoExcludeEnabled();
    expect(afterReload).toBe(false);

    // Verify localStorage persisted
    const storageAfterReload = await settingsPage.getSettingsFromStorage();
    expect(storageAfterReload.autoExcludeEnabled).toBe(false);
  });

  test('should show/hide clear-selection toggle based on auto-exclude', async ({
    settingsPage,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Auto-exclude ON by default, clear-selection should be visible
    const initialVisibility = await settingsPage.isClearSelectionVisible();
    expect(initialVisibility).toBe(true);

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Clear-selection toggle should be hidden
    const hiddenState = await settingsPage.isClearSelectionVisible();
    expect(hiddenState).toBe(false);

    // Toggle auto-exclude back ON
    await settingsPage.toggleAutoExclude();

    // Clear-selection toggle should be visible again
    const visibleAgain = await settingsPage.isClearSelectionVisible();
    expect(visibleAgain).toBe(true);
  });
});
```

**Key test patterns**:
- Test 1: Disables auto-exclusion and verifies name NOT excluded after spin
- Test 2: Enables clear-selection and verifies visual selection cleared
- Test 3: Toggles settings and verifies persistence across page reload
- Test 4: Tests conditional visibility of clear-selection toggle

**Verification methods**:
- `page.locator('g[data-index] text').count()` - Wheel name count
- `page.locator('[data-selected="true"]')` - Selected name check
- `settingsPage.getSettingsFromStorage()` - localStorage verification

#### Task 2.2: Verify TypeScript Compilation
```bash
bun run tsc -b
# Should pass with 0 errors
```

#### Task 2.3: Create Second Atomic Commit
```bash
git add e2e/specs/11-settings-panel.spec.ts

git commit -m "$(cat <<'EOF'
test(e2e): add comprehensive SettingsPanel E2E tests

Add 4 E2E tests covering:
1. Disable auto-exclusion and verify behavior change
2. Enable clear-selection and verify visual clearing
3. Settings persistence across page reloads
4. Conditional visibility of clear-selection toggle

Closes testing gap from Session 24 (Phase 5).
E2E test count: 27 → 31 tests.
EOF
)"
```

---

### Phase 3: Update Fixtures and Exports (10 minutes)

#### Task 3.1: Update localStorage Fixture

**File**: `e2e/fixtures/localStorage.fixture.ts`

**Before** (line 4-10):
```typescript
type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
  historyPage: HistoryPage;
  themePage: ThemePage;
  mobilePage: MobilePage;
};
```

**After**:
```typescript
type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
  historyPage: HistoryPage;
  themePage: ThemePage;
  mobilePage: MobilePage;
  settingsPage: SettingsPage;
};
```

**Before** (line 1-2):
```typescript
import { test as base } from '@playwright/test';
import { HistoryPage, MobilePage, SidebarPage, ThemePage, WheelPage } from '../pages';
```

**After**:
```typescript
import { test as base } from '@playwright/test';
import {
  HistoryPage,
  MobilePage,
  SettingsPage,
  SidebarPage,
  ThemePage,
  WheelPage,
} from '../pages';
```

**Add new fixture** (after mobilePage fixture, around line 41):
```typescript
settingsPage: async ({ page }, use) => {
  const settingsPage = new SettingsPage(page);
  await settingsPage.goto();
  await use(settingsPage);
},
```

#### Task 3.2: Update Page Object Exports

**File**: `e2e/pages/index.ts`

**Add export**:
```typescript
export { SettingsPage } from './SettingsPage';
```

**Expected file after change**:
```typescript
export { BasePage } from './BasePage';
export { HistoryPage } from './HistoryPage';
export { MobilePage } from './MobilePage';
export { SettingsPage } from './SettingsPage';
export { SidebarPage } from './SidebarPage';
export { ThemePage } from './ThemePage';
export { WheelPage } from './WheelPage';
```

#### Task 3.3: Verify TypeScript Compilation
```bash
bun run tsc -b
# Should pass with 0 errors
```

#### Task 3.4: Create Third Atomic Commit
```bash
git add e2e/fixtures/localStorage.fixture.ts e2e/pages/index.ts

git commit -m "$(cat <<'EOF'
test(e2e): add SettingsPage to fixtures and exports

- Add SettingsPage fixture to localStorage.fixture.ts
- Export SettingsPage from pages/index.ts

Enables SettingsPage usage in E2E test specs.
EOF
)"
```

---

### Phase 4: Run Tests and Verify (15 minutes)

#### Task 4.1: Run E2E Tests Once
```bash
bun run test:e2e
```

**Expected output**:
- 31 tests passing (27 existing + 4 new)
- 3 tests skipped
- 0 failures

**If tests fail**:
- Check locator selectors match actual DOM structure
- Verify Switch component IDs in SettingsPanel.tsx
- Check localStorage key ("settings-storage")
- Review browser console for errors

#### Task 4.2: Run E2E Tests 3 Times (Flake Check)
```bash
for i in {1..3}; do echo "Run $i:"; bun run test:e2e; done
```

**Expected**: All 3 runs pass with 31 tests (0% flake rate)

**If flaky**:
- Add waits for visibility: `await settingsPage.settingsTab.waitFor()`
- Increase timeout buffer if auto-exclusion timing is tight
- Check for race conditions in localStorage updates

#### Task 4.3: Run All Unit Tests
```bash
bun test:run
```

**Expected**: 216+ tests passing (no regressions)

#### Task 4.4: Type Check
```bash
bun run tsc -b
```

**Expected**: 0 errors

#### Task 4.5: Lint Check
```bash
bun run ci
```

**Expected**: 0 issues

#### Task 4.6: Build Production Bundle
```bash
bun run build
```

**Expected**: Build succeeds, bundle ~520 kB

---

### Phase 5: Documentation (15 minutes)

#### Task 5.1: Update CLAUDE.md

**File**: `CLAUDE.md`

**Add to "Session Progress" section** (around line 358):
```markdown
### Session 25: SettingsPanel E2E Tests (Completed)
- [x] Create SettingsPage page object with toggle and verification methods
- [x] Add 4 comprehensive E2E tests for SettingsPanel feature
- [x] Test auto-exclusion toggle and behavior verification
- [x] Test clear-selection toggle and visual verification
- [x] Test settings persistence across page reloads
- [x] Test conditional visibility of clear-selection toggle
- [x] Update fixtures and exports for SettingsPage
- [x] Verify 0% flake rate (3 consecutive runs)
- [x] Total test count: 257 tests (226 unit + 31 E2E)

**Commits**:
- test(e2e): add SettingsPage page object
- test(e2e): add comprehensive SettingsPanel E2E tests
- test(e2e): add SettingsPage to fixtures and exports
- docs(tasks): document Session 25 SettingsPanel E2E tests
```

#### Task 5.2: Update tasks/README.md

**File**: `.claude/tasks/README.md`

**Update Session 25 entry** (around line 382):
```markdown
| 25 | ✅ Complete | SettingsPanel E2E tests (4 tests, closes Session 24 gap) - 257 tests |
```

**Update "Last updated" line** (line 462):
```markdown
Last updated: Session 25 Complete (January 25, 2026) - E2E tests for SettingsPanel. 257 tests passing (226 unit + 31 E2E). Closes testing gap from Session 24 auto-exclusion feature. 0% flake rate maintained.
```

#### Task 5.3: Create Session Documentation

**New file**: `.claude/tasks/sessions/session-25-settings-panel-e2e.md`

**Template** (use this structure):
```markdown
# Session 25: SettingsPanel E2E Tests

**Date**: January 25, 2026
**Status**: Completed
**Branch**: `test/settings-panel-e2e`
**PR**: TBD
**Duration**: ~1.5 hours
**Test Count**: 257 tests (226 unit + 31 E2E, +4 new E2E)

## Overview

Session 25 closed the E2E testing gap from Session 24 by adding comprehensive browser tests for the SettingsPanel feature. The 4 new E2E tests validate settings persistence, UI interactions, and integration with wheel behavior, ensuring the auto-exclusion and clear-selection features work correctly in real browser environments.

This session maintains the project's high testing standards (0% E2E flake rate from Session 20) and brings total test coverage to 257 tests.

## What Was Done

### Phase 1: SettingsPage Object

**Goal**: Create page object for SettingsPanel interactions

**File Created**: [e2e/pages/SettingsPage.ts](../../e2e/pages/SettingsPage.ts) (~80 lines)

**Methods Implemented**:
- `switchToSettingsTab()` - Navigate to Settings tab
- `toggleAutoExclude()` - Click auto-exclude switch
- `toggleClearSelection()` - Click clear-selection switch
- `isAutoExcludeEnabled()` - Check switch state (isChecked)
- `isClearSelectionEnabled()` - Check switch state (isChecked)
- `isClearSelectionVisible()` - Check conditional visibility
- `getSettingsFromStorage()` - Read localStorage directly

**Locator Strategy**:
- Settings tab: `getByRole('button', { name: /settings tab/i })`
- Auto-exclude switch: `#auto-exclude` (ID from SettingsPanel)
- Clear-selection switch: `#clear-selection-after-exclude` (ID from SettingsPanel)

**Pattern**: Follows ThemePage pattern from Session 14

**Impact**: Reusable page object for all future SettingsPanel E2E tests

### Phase 2: E2E Test Spec

**Goal**: Comprehensive E2E coverage for SettingsPanel

**File Created**: [e2e/specs/11-settings-panel.spec.ts](../../e2e/specs/11-settings-panel.spec.ts) (~150 lines)

**Tests Implemented** (4 tests):
1. ✅ Disable auto-exclusion and verify behavior change
   - Toggle auto-exclude OFF
   - Spin wheel, wait 2.5s
   - Verify name NOT excluded (count stays 12)
   - Validates setting affects wheel behavior

2. ✅ Enable clear-selection and verify visual clearing
   - Enable clear-selection toggle
   - Spin wheel, wait 2.5s for auto-exclusion
   - Verify no `[data-selected="true"]` attributes
   - Validates visual selection cleared after exclusion

3. ✅ Settings persist across page reloads
   - Toggle auto-exclude OFF
   - Verify localStorage updated
   - Reload page
   - Verify auto-exclude still OFF (UI + localStorage)
   - Validates Zustand persist middleware works

4. ✅ Conditional visibility of clear-selection toggle
   - Verify clear-selection visible when auto-exclude ON
   - Toggle auto-exclude OFF
   - Verify clear-selection hidden
   - Toggle auto-exclude ON
   - Verify clear-selection visible again
   - Validates conditional UI logic from SettingsPanel.tsx:72

**Test Pattern**:
- Uses localStorage.fixture for automatic cleanup
- Combines SettingsPage, WheelPage fixtures
- Verifies both UI state AND localStorage state
- Uses 2.5s wait for auto-exclusion timer (2s + 500ms buffer)

**Impact**: Complete E2E coverage for SettingsPanel feature

### Phase 3: Fixtures and Exports

**Goal**: Integrate SettingsPage into E2E infrastructure

**Files Modified**:

1. [e2e/fixtures/localStorage.fixture.ts](../../e2e/fixtures/localStorage.fixture.ts)
   - Added `SettingsPage` import
   - Added `settingsPage` to MyFixtures type
   - Added `settingsPage` fixture with goto and cleanup

2. [e2e/pages/index.ts](../../e2e/pages/index.ts)
   - Added `export { SettingsPage } from './SettingsPage';`

**Impact**: SettingsPage available in all E2E test specs via fixture

### Phase 4: Documentation

**Goal**: Update project documentation with Session 25 details

**Files Modified**:
- [CLAUDE.md](../../CLAUDE.md) - Session 25 summary in "Session Progress"
- [.claude/tasks/README.md](./README.md) - Session tracking table update
- [.claude/tasks/sessions/session-25-settings-panel-e2e.md](./sessions/session-25-settings-panel-e2e.md) - Full session doc

**Impact**: Complete knowledge transfer for future sessions

## Files Modified

### New Files
- [e2e/pages/SettingsPage.ts](../../e2e/pages/SettingsPage.ts) - Page object (~80 lines)
- [e2e/specs/11-settings-panel.spec.ts](../../e2e/specs/11-settings-panel.spec.ts) - E2E tests (~150 lines)
- [.claude/tasks/sessions/session-25-settings-panel-e2e.md](./sessions/session-25-settings-panel-e2e.md) - Session doc

### Modified Files
- [e2e/fixtures/localStorage.fixture.ts](../../e2e/fixtures/localStorage.fixture.ts) - Add SettingsPage fixture (+8 lines)
- [e2e/pages/index.ts](../../e2e/pages/index.ts) - Export SettingsPage (+1 line)
- [CLAUDE.md](../../CLAUDE.md) - Session 25 summary (+10 lines)
- [.claude/tasks/README.md](./README.md) - Session tracking (+5 lines)

## Commits

**Commit 1**: `test(e2e): add SettingsPage page object` (SettingsPage.ts)
- Create page object with toggle and verification methods
- ~80 lines

**Commit 2**: `test(e2e): add comprehensive SettingsPanel E2E tests` (11-settings-panel.spec.ts)
- Add 4 E2E tests for settings functionality
- Closes Session 24 testing gap
- ~150 lines

**Commit 3**: `test(e2e): add SettingsPage to fixtures and exports` (fixture + index)
- Update localStorage.fixture.ts with SettingsPage fixture
- Export SettingsPage from pages/index.ts
- ~9 lines

**Commit 4**: `docs(tasks): document Session 25 SettingsPanel E2E tests` (documentation)
- Update CLAUDE.md, README.md, session doc
- ~200 lines documentation

## Verification

**E2E Tests** (Single Run):
```bash
bun run test:e2e
```
✅ 31 tests passing (27 existing + 4 new), 3 skipped

**E2E Tests** (Flake Check - 3 runs):
```bash
for i in {1..3}; do echo "Run $i:"; bun run test:e2e; done
```
✅ All 3 runs passed (0% flake rate)

**Unit Tests**:
```bash
bun test:run
```
✅ 226 tests passing (no regressions)

**Type Check**:
```bash
bun run tsc -b
```
✅ 0 errors

**Lint**:
```bash
bun run ci
```
✅ 0 issues

**Build**:
```bash
bun run build
```
✅ Production build succeeded (~520 kB)

## Key Learnings

### 1. Switch Component Testing
- Radix Switch uses `isChecked()` for state verification
- IDs are the most reliable locators for toggle switches
- Conditional visibility requires `isVisible()` checks, not `isEnabled()`

### 2. localStorage Testing
- Direct localStorage reads via `page.evaluate()` provide ground truth
- Zustand persist stores data under `{ state: {...} }` wrapper
- Always verify both UI state AND localStorage state for persistence tests

### 3. Auto-Exclusion Testing Integration
- 2.5s wait (2s timer + 500ms buffer) is reliable for auto-exclusion
- Verifying "NOT excluded" requires checking wheel count stays same
- Clear selection verified by absence of `[data-selected="true"]`

### 4. Conditional UI Testing
- Test both appearance AND disappearance of conditional elements
- Toggle parent setting multiple times to verify reactivity
- SettingsPanel pattern: Clear-selection only visible when auto-exclude ON

### 5. Page Object Best Practices
- Group related methods (toggles, state checks, storage verification)
- Return booleans for state checks (enables direct `expect()` usage)
- Include localStorage methods for persistence verification
- Follow established patterns (ThemePage, WheelPage)

## Bundle Impact

No bundle size change - E2E tests run separately from production build.

## Next Steps

### Completed in Session 25
- [x] Create SettingsPage page object
- [x] Add 4 comprehensive E2E tests
- [x] Verify 0% flake rate
- [x] Update fixtures and exports
- [x] Document session

### Future Enhancements
- [ ] E2E test for configurable auto-exclusion delay (if added in future)
- [ ] E2E test for per-list settings (if added in future)
- [ ] Visual regression testing for switch components

### Session 26 Candidates
- [ ] CSV import enhancement (preview before import) - High UX value
- [ ] Performance optimization audit (React.memo, bundle size)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Mobile touch gestures for wheel spin

## Related Files

- **Plan**: [.claude/plans/distributed-purring-hammock.md](../../plans/distributed-purring-hammock.md)
- **Prompt**: [.claude/tasks/prompts/session-25-settings-panel-e2e-prompt.md](../prompts/session-25-settings-panel-e2e-prompt.md)
- **Previous Session**: [Session 24 - Auto-Exclude Selected Names](session-24-auto-exclude.md)
- **Reference Session**: [Session 14 - Radix RadioGroup Migration](session-14-radix-radiogroup.md) (ThemePage pattern)
- **Reference Session**: [Session 20 - Fix Flaky E2E Tests](session-20-fix-flaky-e2e-tests.md) (0% flake rate)

## Notes

**Testing Gap Closure**: Session 24 implemented SettingsPanel with 10 unit tests but noted E2E tests as "out of scope". Session 25 closes this gap with 4 E2E tests that validate the full feature in a browser environment.

**Flake Rate**: Maintained 0% flake rate from Session 20 by using established wait patterns (2.5s for auto-exclusion) and reliable locator strategies (IDs for switches, semantic roles for buttons).

**Coverage**: Total test count now 257 tests (226 unit + 31 E2E), maintaining the project's high testing standards.
```

#### Task 5.4: Create Fourth Atomic Commit
```bash
git add CLAUDE.md .claude/tasks/README.md .claude/tasks/sessions/session-25-settings-panel-e2e.md

git commit -m "$(cat <<'EOF'
docs(tasks): document Session 25 SettingsPanel E2E tests

- Add session summary to CLAUDE.md
- Update session tracking in tasks/README.md
- Create session documentation file

Session 25 closes E2E testing gap for SettingsPanel feature.
Total test count: 257 tests (226 unit + 31 E2E).
EOF
)"
```

---

## Post-Session Checklist

### Verification Summary
- ✅ 4 new E2E tests created
- ✅ Total E2E tests: 27 → 31 (4 new)
- ✅ Total tests: 253 → 257 (226 unit + 31 E2E)
- ✅ 0% flake rate (3 consecutive runs)
- ✅ Type-check passing (0 errors)
- ✅ Lint passing (0 issues)
- ✅ Build succeeds (~520 kB)
- ✅ 4 atomic commits created
- ✅ Documentation complete

### Create Pull Request

**If ready to merge**, create PR:

```bash
# Push branch
git push origin test/settings-panel-e2e

# Create PR with gh CLI
gh pr create \
  --title "test: add E2E tests for SettingsPanel" \
  --body "$(cat <<'EOF'
## Summary

Adds comprehensive E2E tests for the SettingsPanel feature implemented in Session 24.

## Changes

- Create SettingsPage page object (~80 lines)
- Add 4 E2E tests covering settings functionality (~150 lines)
- Update fixtures and exports for SettingsPage integration
- Document Session 25 in task documentation

## Test Coverage

**New E2E Tests** (4):
1. Disable auto-exclusion and verify behavior change
2. Enable clear-selection and verify visual clearing
3. Settings persistence across page reloads
4. Conditional visibility of clear-selection toggle

**Test Count**: 257 tests (226 unit + 31 E2E, +4 new E2E)

**Flake Rate**: 0% (verified with 3 consecutive runs)

## Verification

- Type-check: 0 errors
- Lint: 0 issues
- Build: Succeeds (~520 kB)
- E2E tests: 31 passing, 3 skipped
- Unit tests: 226 passing

## Related

- Closes testing gap from Session 24 (Phase 5)
- Follows E2E patterns from Session 14 (ThemePage)
- Maintains 0% flake rate from Session 20

EOF
)" \
  --base main
```

---

## Troubleshooting

### E2E Tests Failing

**Issue**: SettingsPage locators not found

**Solution**:
- Verify Switch component IDs in `SettingsPanel.tsx` (lines 29, 76)
- Check Settings tab button text matches `/settings tab/i`
- Ensure app is running on `http://localhost:5173`

**Issue**: Auto-exclusion tests flaky

**Solution**:
- Increase wait timeout to 3000ms if needed
- Add explicit wait: `await wheelPage.centerButton.waitFor({ state: 'attached' })`
- Check browser console for errors

**Issue**: localStorage verification fails

**Solution**:
- Verify storage key is "settings-storage" in useSettingsStore.ts
- Check localStorage structure: `{ state: { autoExcludeEnabled, clearSelectionAfterExclude } }`
- Use `console.log()` in page.evaluate() to debug

### TypeScript Errors

**Issue**: Type errors in SettingsPage.ts

**Solution**:
- Verify all imports from `@playwright/test`
- Ensure BasePage is exported correctly
- Check return types match method signatures

**Issue**: Fixture type errors

**Solution**:
- Verify SettingsPage added to MyFixtures type
- Check import statement includes SettingsPage
- Ensure fixture uses correct pattern (async, use callback)

---

## Success Criteria

At the end of this session, you should have:

✅ Created SettingsPage page object (~80 lines)
✅ Created 11-settings-panel.spec.ts with 4 tests (~150 lines)
✅ Updated fixtures and exports for SettingsPage
✅ 31 E2E tests passing (27 existing + 4 new)
✅ 257 total tests passing (226 unit + 31 E2E)
✅ 0% E2E flake rate (3 consecutive runs)
✅ 0 type errors
✅ 0 lint issues
✅ Production build succeeds
✅ 4 atomic commits created
✅ Documentation complete (CLAUDE.md, README.md, session doc)

---

**Estimated Session Time**: 1.5-2 hours

**Next Session**: CSV Import Enhancement (preview modal) or Performance Optimization Audit
