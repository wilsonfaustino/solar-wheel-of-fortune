# Session 17: Playwright E2E Testing - Phase 1 (Foundation)

## Session Goal

Set up Playwright E2E testing infrastructure and implement 6 critical tests covering wheel spin animation and name management workflows.

## Model Recommendation

**Recommended Model**: **Sonnet 4.5** (current model)

**Rationale**:
- This is a foundational infrastructure task with clear implementation steps
- Involves creating configuration files, Page Object Model architecture, and test specs
- Requires understanding of TypeScript, Playwright API, and React Testing Library patterns
- Sonnet 4.5 provides excellent balance of accuracy and cost for this systematic implementation
- Task is well-scoped with detailed plan - no need for Opus-level reasoning

**Alternative**: Haiku for faster iteration if you're familiar with Playwright setup, but Sonnet 4.5 is recommended for first-time E2E infrastructure to ensure correctness.

---

## Pre-Session Setup

Before starting, verify the following:

```bash
# 1. Ensure you're on a clean main branch
git status  # Should show clean working tree

# 2. Run tests to ensure baseline passes
bun test:run

# 3. Run type check
bun run tsc

# 4. Run build to ensure no errors
bun build

# 5. Create feature branch
git checkout -b feat/playwright-e2e-testing
```

**Expected Output**: All checks pass, new branch created.

---

## Session Tasks

### Phase 1: Install Playwright and Configure (15-20 min)

**Goal**: Install dependencies and create Playwright configuration.

#### Task 1.1: Install Dependencies

```bash
# Install Playwright test framework
bun add -d @playwright/test

# Install Chromium browser with system dependencies
bunx playwright install chromium --with-deps
```

**Verification**:
```bash
bunx playwright --version  # Should show version 1.51+
```

#### Task 1.2: Create playwright.config.ts

**File**: `playwright.config.ts` (root level)

**Content**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'playwright-results.xml' }],
        ['github'],
      ]
    : [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Key Configuration Notes**:
- `testDir: './e2e'` - E2E tests separate from Vitest unit tests
- `workers: 1` in CI - Avoid localStorage race conditions
- `retries: 2` in CI - Handle flakiness gracefully
- `webServer` - Auto-start Vite dev server (no manual server needed)
- `trace: 'on-first-retry'` - Debugging without performance overhead

#### Task 1.3: Update .gitignore

**File**: `.gitignore`

**Add** (at the end):
```
# Playwright
playwright-report/
playwright-results.xml
test-results/
.playwright/
```

#### Task 1.4: Add Test Scripts to package.json

**File**: `package.json`

**Add** to `scripts` section:
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report",
  "test:e2e:codegen": "playwright codegen http://localhost:5173"
}
```

**Verification**:
```bash
bun run test:e2e --version  # Should show Playwright version
```

**Commit**:
```bash
git add playwright.config.ts .gitignore package.json
git commit -m "chore(e2e): install Playwright and configure test runner"
```

---

### Phase 2: Create Page Object Model Foundation (20-30 min)

**Goal**: Establish Page Object Model architecture with base classes and fixtures.

#### Task 2.1: Create BasePage

**File**: `e2e/pages/BasePage.ts`

**Content**:
```typescript
import { type Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async waitForToast(text: string) {
    await this.page.getByRole('status').getByText(text).waitFor();
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async pressSpace() {
    await this.page.keyboard.press('Space');
  }
}
```

#### Task 2.2: Create WheelPage

**File**: `e2e/pages/WheelPage.ts`

**Content**:
```typescript
import { type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class WheelPage extends BasePage {
  readonly centerButton: Locator;
  readonly wheelContainer: Locator;
  readonly nameLabels: Locator;

  constructor(page) {
    super(page);
    this.centerButton = page.getByRole('button', { name: /click to randomize/i });
    this.wheelContainer = page.locator('svg').filter({ hasText: 'Wheel of Fortune' });
    this.nameLabels = page.locator('text[data-index]');
  }

  async spin() {
    await this.centerButton.click();
    // Wait for 5s spring animation + 1s buffer
    await this.page.waitForTimeout(6000);
  }

  async spinViaKeyboard() {
    await this.pressSpace();
    await this.page.waitForTimeout(6000);
  }

  async waitForSpinComplete() {
    // Wait for rotation animation to complete
    await this.page.waitForTimeout(6000);
  }

  async getSelectedName(): Promise<string | null> {
    const toast = this.page.getByRole('status').first();
    const text = await toast.textContent();
    return text;
  }

  async verifyNamesDisplayed(count: number) {
    await expect(this.nameLabels).toHaveCount(count);
  }

  async isSpinning(): Promise<boolean> {
    return await this.centerButton.isDisabled();
  }
}
```

**Note**: `data-index` attribute may need to be added to NameLabel component. Alternative: Use CSS selector for text elements inside SVG.

#### Task 2.3: Create SidebarPage

**File**: `e2e/pages/SidebarPage.ts`

**Content**:
```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SidebarPage extends BasePage {
  readonly addNameInput: Locator;
  readonly addButton: Locator;
  readonly bulkImportButton: Locator;
  readonly listSelector: Locator;
  readonly nameItems: Locator;

  constructor(page) {
    super(page);
    this.addNameInput = page.getByPlaceholder(/enter name/i);
    this.addButton = page.getByRole('button', { name: /^add$/i });
    this.bulkImportButton = page.getByRole('button', { name: /bulk import/i });
    this.listSelector = page.getByRole('button', { name: /default list/i }).first();
    this.nameItems = page.getByRole('listitem');
  }

  async addName(name: string) {
    await this.addNameInput.fill(name);
    await this.addButton.click();
  }

  async bulkImport(names: string[]) {
    await this.bulkImportButton.click();
    const textarea = this.page.getByRole('textbox', { name: /paste names/i });
    await textarea.fill(names.join('\n'));
    const importButton = this.page.getByRole('button', { name: /^import$/i });
    await importButton.click();
  }

  async deleteName(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async editName(oldName: string, newName: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: oldName });
    const editButton = item.getByRole('button', { name: /edit/i });
    await editButton.click();
    const input = item.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
  }

  async excludeName(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    const excludeButton = item.getByRole('button', { name: /exclude/i });
    await excludeButton.click();
  }

  async getNameCount(): Promise<number> {
    return await this.nameItems.count();
  }
}
```

#### Task 2.4: Create localStorage Fixture

**File**: `e2e/fixtures/localStorage.fixture.ts`

**Content**:
```typescript
import { test as base } from '@playwright/test';
import { WheelPage } from '../pages/WheelPage';
import { SidebarPage } from '../pages/SidebarPage';

type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
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
});

export { expect } from '@playwright/test';

// Clear localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
```

**Verification**:
```bash
bun run tsc  # TypeScript should compile without errors
```

**Commit**:
```bash
git add e2e/pages/ e2e/fixtures/
git commit -m "feat(e2e): add Page Object Model base classes and fixtures"
```

---

### Phase 3: Write Wheel Spin Tests (20-30 min)

**Goal**: Implement 4 tests for wheel spin animation workflow.

#### Task 3.1: Create Wheel Spin Test Spec

**File**: `e2e/specs/01-wheel-spin.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Wheel Spin Animation', () => {
  test('should spin wheel on center button click', async ({ wheelPage }) => {
    // Default list has 8 names
    await wheelPage.verifyNamesDisplayed(8);

    // Click center button to spin
    await wheelPage.spin();

    // Verify toast notification appears with selected name
    const selectedName = await wheelPage.getSelectedName();
    expect(selectedName).toBeTruthy();
    expect(selectedName).toMatch(/selected/i);
  });

  test('should spin wheel on Space key press', async ({ wheelPage }) => {
    // Press Space to trigger spin
    await wheelPage.spinViaKeyboard();

    // Verify toast appears
    const toast = wheelPage.page.getByRole('status').first();
    await expect(toast).toBeVisible();
  });

  test('should disable button during spin', async ({ wheelPage }) => {
    // Start spin without awaiting completion
    const spinPromise = wheelPage.centerButton.click();

    // Immediately check if button is disabled
    await expect(wheelPage.centerButton).toBeDisabled();

    // Wait for spin to complete
    await wheelPage.waitForSpinComplete();

    // Button should be enabled again
    await expect(wheelPage.centerButton).toBeEnabled();
  });

  test('should show toast notification after spin', async ({ wheelPage }) => {
    await wheelPage.spin();

    // Verify toast is visible
    const toast = wheelPage.page.getByRole('status');
    await expect(toast).toBeVisible();

    // Verify toast contains "selected" text
    await expect(toast).toContainText(/selected/i);
  });
});
```

#### Task 3.2: Run Wheel Spin Tests

```bash
# Run E2E tests (headless)
bun run test:e2e

# Or run with UI for debugging
bun run test:e2e:ui
```

**Expected Output**: 4 tests passing

**Troubleshooting**:
- If name labels selector fails, inspect SVG structure and update `nameLabels` locator
- If animation timeout fails, increase `waitForTimeout` to 7000ms
- If toast doesn't appear, check Sonner toast duration settings

**Commit**:
```bash
git add e2e/specs/01-wheel-spin.spec.ts
git commit -m "test(e2e): add wheel spin animation tests"
```

---

### Phase 4: Write Name Management Tests (15-20 min)

**Goal**: Implement 2 tests for adding names (single and bulk).

#### Task 4.1: Create Name Management Test Spec

**File**: `e2e/specs/02-name-management.spec.ts`

**Content**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test.describe('Name Management', () => {
  test('should add single name via form', async ({ sidebarPage, wheelPage }) => {
    // Get initial name count (default list has 8 names)
    const initialCount = await sidebarPage.getNameCount();
    expect(initialCount).toBe(8);

    // Add new name
    await sidebarPage.addName('Alice');

    // Verify name was added
    const newCount = await sidebarPage.getNameCount();
    expect(newCount).toBe(9);

    // Verify name appears in list
    const nameItem = sidebarPage.page.getByRole('listitem').filter({ hasText: 'Alice' });
    await expect(nameItem).toBeVisible();

    // Verify name appears on wheel
    await wheelPage.verifyNamesDisplayed(9);
  });

  test('should bulk import multiple names', async ({ sidebarPage, wheelPage }) => {
    // Initial count: 8 names
    const initialCount = await sidebarPage.getNameCount();
    expect(initialCount).toBe(8);

    // Bulk import 3 names
    const newNames = ['Charlie', 'David', 'Eve'];
    await sidebarPage.bulkImport(newNames);

    // Verify all names were added (8 + 3 = 11)
    const newCount = await sidebarPage.getNameCount();
    expect(newCount).toBe(11);

    // Verify each name appears in list
    for (const name of newNames) {
      const nameItem = sidebarPage.page.getByRole('listitem').filter({ hasText: name });
      await expect(nameItem).toBeVisible();
    }

    // Verify wheel has 11 names
    await wheelPage.verifyNamesDisplayed(11);
  });
});
```

#### Task 4.2: Run Name Management Tests

```bash
bun run test:e2e
```

**Expected Output**: 6 total tests passing (4 wheel spin + 2 name management)

**Troubleshooting**:
- If bulk import modal doesn't open, check button selector
- If import button is disabled, verify textarea accepts input
- If name count mismatch, check localStorage state clearing in fixture

**Commit**:
```bash
git add e2e/specs/02-name-management.spec.ts
git commit -m "test(e2e): add name management tests (add, bulk import)"
```

---

### Phase 5: CI Integration (15-20 min)

**Goal**: Add Playwright as 6th quality gate in GitHub Actions CI.

#### Task 5.1: Update CI Workflow

**File**: `.github/workflows/ci.yml`

**Add new job** (after `build` job, before `sonarqube`):

```yaml
  e2e:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - name: Checkout code
        uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@735343b667d3e6f658f44d0eca948eb6282f2b76 # v2
        with:
          bun-version: 1.1.26

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Playwright browsers
        run: bunx playwright install chromium --with-deps

      - name: Run Playwright tests
        run: bun run test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: playwright-results
          path: playwright-results.xml
          retention-days: 30
```

#### Task 5.2: Update SonarQube Job Dependency

**File**: `.github/workflows/ci.yml`

**Change** (around line 102):
```yaml
  sonarqube:
    name: SonarQube Analysis
    runs-on: ubuntu-latest
    needs: [test, e2e]  # Add e2e dependency
```

**Verification**:
```bash
# Validate YAML syntax
cat .github/workflows/ci.yml | grep -A 5 "e2e:"
```

**Commit**:
```bash
git add .github/workflows/ci.yml
git commit -m "chore(ci): add Playwright E2E tests as 6th quality gate"
```

---

### Phase 6: Update Documentation (15-20 min)

**Goal**: Document E2E testing setup and usage patterns.

#### Task 6.1: Update CLAUDE.md

**File**: `CLAUDE.md`

**Add section** after "## Testing Strategy" (around line 129):

```markdown
## E2E Testing (Playwright)

### Overview
- **Framework**: Playwright 1.51+ with TypeScript
- **Architecture**: Page Object Model (POM)
- **Browser**: Chromium only (fastest CI execution)
- **Test Directory**: `/e2e/` (separate from Vitest unit tests)
- **Test Count**: 6 tests (Phase 1), 22 tests (Phase 2 target)
- **CI Integration**: 6th quality gate (runs after lint + typecheck)

### Running E2E Tests

```bash
bun run test:e2e          # Run all tests (headless)
bun run test:e2e:ui       # Run with Playwright UI (best for writing tests)
bun run test:e2e:headed   # Run with browser visible
bun run test:e2e:debug    # Debug with Playwright Inspector
bun run test:e2e:report   # View last test report
bun run test:e2e:codegen  # Generate test code via browser interaction
```

### Test Organization

**Page Objects** (`e2e/pages/`):
- BasePage.ts - Common functionality (navigation, shortcuts)
- WheelPage.ts - Wheel spin interactions
- SidebarPage.ts - Name/list management

**Test Specs** (`e2e/specs/`):
- 01-wheel-spin.spec.ts - Spin animation, toast notifications
- 02-name-management.spec.ts - Add, bulk import

### Writing E2E Tests

Use fixtures for automatic localStorage cleanup:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test('should add name', async ({ sidebarPage }) => {
  await sidebarPage.addName('Alice');
  const count = await sidebarPage.getNameCount();
  expect(count).toBe(9);
});
```

### Debugging E2E Tests

1. **Run with UI mode**: `bun run test:e2e:ui`
2. **Check trace viewer**: Open `test-results/*/trace.zip`
3. **Increase timeouts**: Modify `waitForTimeout` in page objects
4. **Use pause**: Add `await page.pause()` for live debugging

### VSCode Integration

Install Playwright extension: `ms-playwright.playwright`
- Run/debug tests from sidebar
- Pick locators with browser tool
- View trace files inline
```

#### Task 6.2: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

**Add section** under "## Testing":

```markdown
### E2E Testing (Playwright)

**Location**: `e2e/` directory

**Page Object Model Architecture**:
- **BasePage** (`e2e/pages/BasePage.ts`) - Common functionality for all pages
  - Methods: `goto()`, `clearLocalStorage()`, `waitForToast(text)`, `pressEscape()`, `pressSpace()`
- **WheelPage** (`e2e/pages/WheelPage.ts`) - Wheel spin interactions
  - Methods: `spin()`, `spinViaKeyboard()`, `getSelectedName()`, `verifyNamesDisplayed(count)`
- **SidebarPage** (`e2e/pages/SidebarPage.ts`) - Name/list management
  - Methods: `addName(name)`, `bulkImport(names[])`, `deleteName(name)`, `editName(old, new)`

**Fixture Pattern**:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test('test name', async ({ wheelPage, sidebarPage }) => {
  // Auto-initialized page objects
  // localStorage cleared before each test
});
```

**Locator Strategy**:
- Prefer role-based selectors: `page.getByRole('button', { name: /add/i })`
- Use filters for specificity: `page.getByRole('listitem').filter({ hasText: 'Alice' })`
- Avoid data-testid unless role-based selectors fail

**Animation Handling**:
- Wheel spin takes 5s (spring animation) + 1s buffer
- Use `page.waitForTimeout(6000)` in WheelPage methods
- Check disabled state during spin: `expect(button).toBeDisabled()`

**Test Files**:
- Numbered prefixes (01-, 02-) for logical execution order
- Kebab-case naming: `01-wheel-spin.spec.ts`
- One file per feature workflow
```

#### Task 6.3: Add VSCode Extension Recommendation

**File**: `.vscode/extensions.json`

**Add** (create file if doesn't exist):
```json
{
  "recommendations": [
    "ms-playwright.playwright"
  ]
}
```

**Commit**:
```bash
git add CLAUDE.md .claude/tasks/CODE_REFERENCE.md .vscode/extensions.json
git commit -m "docs(e2e): add Playwright testing documentation and VSCode extension"
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

# 4. E2E tests pass (headless)
bun run test:e2e

# 5. E2E tests pass (UI mode, manual verification)
bun run test:e2e:ui
```

**Expected Results**:
- ✅ TypeScript: No errors
- ✅ Build: Success
- ✅ Unit tests: 163 passing
- ✅ E2E tests: 6 passing

**Visual Verification** (via `test:e2e:ui`):
1. Wheel spin animation completes in ~5 seconds
2. Toast notification appears after spin
3. Names added via form appear in list
4. Bulk import modal opens and imports names
5. All tests run in isolation (localStorage cleared)

---

## Create Pull Request

Once all checks pass:

```bash
# 1. Push feature branch
git push -u origin feat/playwright-e2e-testing

# 2. Create PR using GitHub CLI
gh pr create --title "feat(e2e): add Playwright E2E testing infrastructure (Phase 1)" --body "$(cat <<'EOF'
## Summary
- Installed Playwright test framework with Chromium-only configuration
- Created Page Object Model architecture (BasePage, WheelPage, SidebarPage)
- Implemented localStorage fixture for automatic state cleanup
- Added 6 E2E tests covering critical workflows (wheel spin, name management)
- Integrated as 6th quality gate in CI pipeline
- Updated documentation with E2E testing guidelines

## Test Coverage (Phase 1)
**Wheel Spin (4 tests)**:
- Spin on center button click
- Spin on Space key press
- Button disabled during spin
- Toast notification after spin

**Name Management (2 tests)**:
- Add single name via form
- Bulk import multiple names

## CI Integration
- Runs after lint + typecheck (parallel with build)
- Uploads HTML report on failure
- Uploads JUnit results for analysis
- Retries flaky tests 2x in CI

## Test Infrastructure
**Page Object Model**:
- BasePage - Common functionality (navigation, shortcuts, localStorage)
- WheelPage - Wheel spin interactions with animation handling
- SidebarPage - Name/list management
- localStorage.fixture.ts - Auto-cleanup before each test

**Configuration**:
- Chromium-only (fastest execution)
- Serial execution in CI (workers: 1) to avoid localStorage race conditions
- Auto-start dev server via webServer config
- Trace/screenshot on first retry only

## Files Added
- `playwright.config.ts` - Playwright configuration
- `e2e/pages/BasePage.ts` - Base page object
- `e2e/pages/WheelPage.ts` - Wheel page object
- `e2e/pages/SidebarPage.ts` - Sidebar page object
- `e2e/fixtures/localStorage.fixture.ts` - Test fixture
- `e2e/specs/01-wheel-spin.spec.ts` - 4 wheel tests
- `e2e/specs/02-name-management.spec.ts` - 2 name management tests
- `.vscode/extensions.json` - Playwright extension recommendation

## Files Modified
- `package.json` - Add Playwright dependency + scripts
- `.gitignore` - Ignore Playwright artifacts
- `.github/workflows/ci.yml` - Add E2E job + update SonarQube dependency
- `CLAUDE.md` - Document E2E testing
- `.claude/tasks/CODE_REFERENCE.md` - Document POM architecture

## CI Time Impact
- E2E job: ~2-3 minutes (6 tests with animation waits)
- Runs in parallel with build job
- Critical path increase: ~1-2 minutes

## Test Plan
- [x] Type check passes (bun run tsc)
- [x] Build succeeds (bun build)
- [x] Unit tests pass (bun test:run)
- [x] E2E tests pass locally (bun run test:e2e)
- [x] E2E tests pass in CI (GitHub Actions)
- [x] Playwright report generates on failure
- [x] Dev server auto-starts via webServer config
- [x] LocalStorage cleared before each test

## Phase 2 (Next Session)
Expand to 22 tests covering:
- List management (create, switch, delete)
- Selection history tracking
- Export (CSV, JSON)
- Keyboard shortcuts (Space during input, Escape)
- Theme switching
- Mobile sidebar drawer
- Name exclusion
- Bulk actions

## Breaking Changes
None - E2E tests are additive.

## Related Documentation
- Plan: `.claude/plans/staged-splashing-forest.md`
- Prompt: `.claude/tasks/prompts/session-17-playwright-e2e-prompt.md`

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Troubleshooting

### Issue 1: Playwright install fails on Chromium

**Symptom**: `bunx playwright install chromium --with-deps` fails with permissions error.

**Solution**:
```bash
# Use sudo for system dependencies (Linux/macOS)
sudo bunx playwright install-deps chromium

# Or install without system deps (requires pre-installed browser dependencies)
bunx playwright install chromium
```

### Issue 2: Tests fail with "page.goto: timeout"

**Symptom**: Dev server doesn't start before tests run.

**Solution**:
- Increase `webServer.timeout` to 180000 (3 minutes) in `playwright.config.ts`
- Check dev server runs manually: `bun run dev`
- Verify port 5173 is not already in use

### Issue 3: Name label locator fails

**Symptom**: `verifyNamesDisplayed()` throws "no elements match selector".

**Solution**:
- Inspect SVG structure in browser DevTools
- Update `nameLabels` locator to match actual DOM
- Alternative: Add `data-testid="name-label"` to NameLabel component

### Issue 4: localStorage not clearing between tests

**Symptom**: Tests pass individually but fail when run together.

**Solution**:
- Verify `beforeEach` hook in `localStorage.fixture.ts` runs
- Add `await page.reload()` after `localStorage.clear()`
- Use `workers: 1` in `playwright.config.ts` to avoid parallel execution issues

### Issue 5: Toast notification not found

**Symptom**: `getByRole('status')` throws "no elements found".

**Solution**:
- Check Sonner toast duration (may disappear before assertion)
- Increase wait timeout: `await page.getByRole('status').waitFor({ timeout: 10000 })`
- Verify toast actually renders (check dev tools during manual test)

### Issue 6: Bun compatibility warning

**Symptom**: Playwright shows warning about Bun not being supported.

**Solution**:
- This is expected - Playwright runs via Node.js, not Bun
- Use Bun for package management only (`bun add`, `bun install`)
- Tests execute correctly despite warning

---

## Success Criteria

- [x] Playwright installed and configured
- [x] 6 E2E tests passing locally
- [x] Page Object Model architecture established
- [x] LocalStorage fixture working
- [x] CI job runs successfully (green check)
- [x] Test report generates on failure
- [x] Dev server auto-starts via webServer config
- [x] Documentation updated (CLAUDE.md, CODE_REFERENCE.md)
- [x] VSCode extension recommended
- [x] 6 atomic commits created
- [x] Pull request created with detailed description
- [x] CI time under 6 minutes total

---

## Next Session: Phase 2 (Comprehensive Coverage)

**Session 18 Goals**:
- Complete remaining page objects (HistoryPanelPage, ExportModalPage, ThemeSwitcherPage)
- Write 16 additional tests (list management, history, export, shortcuts, theming, mobile)
- Achieve 22 total E2E tests (100% workflow coverage)
- Enforce E2E gate in branch protection
- Zero flaky tests across 3 consecutive CI runs

**Estimated Duration**: 3-4 hours

---

## Estimated Timeline

- **Phase 1**: Install & configure (15-20 min)
- **Phase 2**: Page Object Model (20-30 min)
- **Phase 3**: Wheel spin tests (20-30 min)
- **Phase 4**: Name management tests (15-20 min)
- **Phase 5**: CI integration (15-20 min)
- **Phase 6**: Documentation (15-20 min)
- **Post-session**: Testing and PR creation (20 min)

**Total**: 2-3 hours

---

## Related Files

- **Plan**: `.claude/plans/staged-splashing-forest.md`
- **Session Doc**: `.claude/tasks/sessions/session-17-playwright-e2e-phase1.md` (create after session)
- **Code Reference**: `.claude/tasks/CODE_REFERENCE.md`
- **Project Docs**: `CLAUDE.md`
