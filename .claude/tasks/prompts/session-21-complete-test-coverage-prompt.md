# Session 21: Complete Test Coverage - Execution Prompt

## Session Goal
Achieve comprehensive test coverage by completing E2E tests (fix 3 skipped tests), adding component tests for wheel components (17+ tests), and creating integration tests for critical user workflows (3+ tests). Target: 65% overall coverage.

## Pre-Session Setup

**Verify Current State**:
```bash
# Check current test status
bun test:run              # Should show 30 passing unit tests
bun run test:e2e          # Should show 21 passing, 4 skipped E2E tests

# Check current coverage
bun test:coverage         # Should show ~45% overall coverage
open coverage/index.html  # Review coverage gaps

# Verify clean state
git status                # Should be on main branch, clean working tree
bun run tsc -b            # Should pass with no errors
bun run ci                # Should pass (lint + format check)
```

**Create Feature Branch**:
```bash
git checkout -b test/complete-test-coverage
```

---

## Phase 1: Fix Skipped List Management E2E Tests (30 min)

**Goal**: Complete 3 skipped tests in `03-list-management.spec.ts` to achieve 100% E2E test coverage.

**File to Modify**: `e2e/specs/03-list-management.spec.ts`

**Current State** (1 passing test):
```typescript
test('should create a new list', async ({ sidebarPage }) => {
  await sidebarPage.createList('Grocery Items');
  const listName = await sidebarPage.getActiveListName();
  expect(listName).toBe('Grocery Items');
});

test.skip('should rename a list', async ({ sidebarPage }) => {
  // TODO: Implement
});

test.skip('should delete a list', async ({ sidebarPage }) => {
  // TODO: Implement
});

test.skip('should switch between lists', async ({ sidebarPage }) => {
  // TODO: Implement
});
```

**Implementation Tasks**:

1. **Implement "should rename a list" test**:
   - Create a list via `sidebarPage.createList()`
   - Rename it using `sidebarPage.renameList()` (verify method exists in SidebarPage)
   - Assert new name appears in dropdown

2. **Implement "should delete a list" test**:
   - Create a list
   - Delete it using `sidebarPage.deleteList()`
   - Assert list no longer appears in dropdown
   - Assert app switches to default list

3. **Implement "should switch between lists" test**:
   - Create 2 lists with different names
   - Switch to first list using `sidebarPage.switchToList()`
   - Add a name to first list
   - Switch to second list
   - Verify name from first list not visible

**Verification**:
```bash
bun run test:e2e e2e/specs/03-list-management.spec.ts
# Expected: 4/4 tests passing (was 1/4, 3 skipped)

bun run test:e2e
# Expected: 24/25 total tests passing (up from 21/25)
```

**Note**: If `SidebarPage` is missing `renameList()`, `deleteList()`, or `switchToList()` methods, add them to `e2e/pages/SidebarPage.ts` based on existing patterns.

---

## Phase 2: Add Wheel Component Tests (60 min)

**Goal**: Create component tests for 3 core wheel components with 17+ total tests.

### 2.1: RadialWheel Component Tests (20 min)

**File to Create**: `src/components/wheel/RadialWheel.test.tsx`

**Template**:
```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RadialWheel } from './RadialWheel';
import { useNameStore } from '../../stores/useNameStore';

// Mock Framer Motion to avoid animation complexity
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('RadialWheel', () => {
  beforeEach(() => {
    // Reset store to default state
    useNameStore.setState({
      lists: {
        default: {
          id: 'default',
          title: 'Default List',
          names: [
            { id: '1', text: 'Alice', selected: false, excluded: false },
            { id: '2', text: 'Bob', selected: false, excluded: false },
          ],
        },
      },
      activeListId: 'default',
    });
  });

  test('renders with default names', () => {
    render(<RadialWheel />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('positions names radially with correct transform', () => {
    // TODO: Test that NameLabel receives correct angle prop
  });

  test('handles spin animation via ref', () => {
    // TODO: Create ref, call spinWheel(), verify animation triggered
  });

  test('shows selected name after spin', () => {
    // TODO: Mock random selection, verify selected name highlighted
  });

  test('respects excluded names', () => {
    // TODO: Exclude a name, verify it's not rendered
  });

  test('updates when active list changes', () => {
    // TODO: Change activeListId, verify new names rendered
  });

  test('handles empty name list gracefully', () => {
    // TODO: Set names to empty array, verify no crash
  });

  test('applies correct rotation calculations', () => {
    // TODO: Verify angleIncrement = 360 / nameCount
  });
});
```

**Implementation**: Complete all 8 test cases using React Testing Library patterns.

### 2.2: CenterButton Component Tests (15 min)

**File to Create**: `src/components/wheel/CenterButton.test.tsx`

**Template**:
```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CenterButton } from './CenterButton';

describe('CenterButton', () => {
  test('renders with correct text', () => {
    render(<CenterButton onClick={vi.fn()} disabled={false} />);
    expect(screen.getByText('SPIN')).toBeInTheDocument();
  });

  test('triggers spin on click', async () => {
    const handleClick = vi.fn();
    render(<CenterButton onClick={handleClick} disabled={false} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disables during spin animation', () => {
    render(<CenterButton onClick={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('shows pulse animation when idle', () => {
    // TODO: Check for pulse animation class when disabled=false
  });

  test('accessible with aria-label and keyboard', async () => {
    // TODO: Verify aria-label, test Enter key press
  });
});
```

**Implementation**: Complete all 5 test cases.

### 2.3: NameLabel Component Tests (15 min)

**File to Create**: `src/components/wheel/NameLabel.test.tsx`

**Template**:
```typescript
import { render, screen } from '@testing-library/react';
import { NameLabel } from './NameLabel';

describe('NameLabel', () => {
  test('renders name text correctly', () => {
    render(<NameLabel name="Alice" angle={0} isSelected={false} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('positions at correct angle', () => {
    const { container } = render(<NameLabel name="Bob" angle={90} isSelected={false} />);
    // TODO: Verify transform style includes correct x/y coordinates
  });

  test('applies selected styles when isSelected=true', () => {
    render(<NameLabel name="Charlie" angle={0} isSelected={true} />);
    // TODO: Check for selected class or style
  });

  test('handles long names with text truncation', () => {
    const longName = 'A'.repeat(100);
    render(<NameLabel name={longName} angle={0} isSelected={false} />);
    // TODO: Verify truncation class applied
  });
});
```

**Implementation**: Complete all 4 test cases.

### 2.4: Verification

```bash
bun test src/components/wheel/
# Expected: 17 tests passing (8 + 5 + 4)

bun test:coverage
# Expected: Coverage for wheel/ directory >80%
```

---

## Phase 3: Add Integration Tests (30 min)

**Goal**: Create 3 integration tests validating end-to-end user workflows.

**File to Create**: `src/__tests__/integration/user-workflows.test.tsx`

**Template**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { useNameStore } from '../../stores/useNameStore';

describe('User Workflows Integration', () => {
  beforeEach(() => {
    // Clear localStorage and reset store
    localStorage.clear();
    useNameStore.setState({
      lists: {
        default: {
          id: 'default',
          title: 'Default List',
          names: [],
        },
      },
      activeListId: 'default',
    });
  });

  test('Add Name → Spin → Check History', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Add new name via sidebar
    const input = screen.getByPlaceholderText(/add name/i);
    await user.type(input, 'Alice');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Verify name added
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Trigger spin (click center button or press Space)
    const spinButton = screen.getByRole('button', { name: /spin/i });
    await user.click(spinButton);

    // Wait for spin animation to complete
    await waitFor(() => {
      // TODO: Verify selected name appears in history panel
      // TODO: Verify selection count increments
    }, { timeout: 5000 });
  });

  test('Exclude Name → Spin → Verify Not Selected', async () => {
    // TODO: Add 3 names
    // TODO: Exclude 1 name via sidebar toggle
    // TODO: Spin wheel 10 times
    // TODO: Assert excluded name never selected
    // TODO: Verify excluded name not visible on wheel
  });

  test('Create List → Add Names → Export CSV', async () => {
    // TODO: Create new list via dropdown
    // TODO: Add 5 names
    // TODO: Spin and select 2 names
    // TODO: Click export button
    // TODO: Verify CSV download triggered (check download event)
  });
});
```

**Implementation**: Complete all 3 integration tests using full `<App />` render.

**Verification**:
```bash
bun test src/__tests__/integration/
# Expected: 3 tests passing

bun test:run
# Expected: All tests passing (30 unit + 17 component + 3 integration = 50 tests)
```

---

## Phase 4: Coverage Analysis & Gap Filling (15 min)

**Goal**: Identify coverage gaps and add targeted tests to reach 65% overall coverage.

**Steps**:

1. **Generate Coverage Report**:
```bash
bun test:coverage
open coverage/index.html
```

2. **Identify Low-Coverage Files** (likely candidates):
   - `src/stores/useNameStore.ts` - Edge cases, error handling
   - `src/components/sidebar/ListSelector.tsx` - Dropdown interactions
   - `src/components/sidebar/AddNameForm.tsx` - Validation edge cases
   - `src/hooks/useKeyboardShortcuts.ts` - Event handler edge cases

3. **Add Targeted Tests** (examples):

**Add to `src/stores/useNameStore.test.ts`**:
- Test `addName()` with duplicate name (should allow)
- Test `addName()` with empty string (should reject)
- Test `deleteName()` with non-existent ID (should no-op)
- Test `updateListTitle()` with empty string (should reject)

**Create `src/hooks/useKeyboardShortcuts.test.ts`**:
- Test Space key during input focus (should suppress)
- Test Space key on wheel (should trigger spin)
- Test Escape key closes modal
- Test shortcuts cleanup on unmount

4. **Update Coverage Threshold**:

**File**: `vitest.config.ts`

**Change**:
```typescript
// Before
coverage: {
  lines: 45,
  functions: 45,
  branches: 30,
  statements: 45,
}

// After
coverage: {
  lines: 65,
  functions: 65,
  branches: 50,
  statements: 65,
}
```

**Verification**:
```bash
bun test:coverage
# Expected: Overall coverage ≥65%
# Expected: No critical files below 50%
```

---

## Phase 5: Documentation & Verification (15 min)

**Goal**: Document testing patterns and create session summary.

### 5.1: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

**Add New Section** (after "Button Component Usage"):

```markdown
## Testing Patterns

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Template

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { useNameStore } from '../../stores/useNameStore';

describe('Workflow Name', () => {
  beforeEach(() => {
    localStorage.clear();
    useNameStore.setState({ /* initial state */ });
  });

  test('completes workflow successfully', async () => {
    render(<App />);
    // Arrange: Set up initial state
    // Act: Perform user actions
    // Assert: Verify expected outcomes
  });
});
```

### Coverage Commands

```bash
bun test:coverage           # Generate coverage report
open coverage/index.html    # View HTML report
bun test:coverage:ui        # Coverage with Vitest UI
```

### Coverage Thresholds

- **Minimum**: 65% lines/functions/statements, 50% branches
- **SonarQube Quality Gate**: 80% (future target)
- **CI Requirement**: Tests must pass coverage thresholds to merge
```

### 5.2: Create Session Summary

**File to Create**: `.claude/tasks/sessions/session-21-complete-test-coverage.md`

**Template**:
```markdown
# Session 21: Complete Test Coverage

**Date**: 2025-01-XX
**Status**: Completed
**Duration**: 2.5 hours
**Test Count**: 30 → 53+ tests (77% increase)
**Coverage**: 45% → 65% (44% increase)

## Overview

Achieved comprehensive test coverage by completing all E2E tests (100% coverage), adding component tests for wheel components (17 tests), and creating integration tests for critical user workflows (3 tests). Coverage increased from 45% to 65%, bringing the project closer to SonarQube's 80% quality gate.

## What Was Done

### Phase 1: E2E Test Completion
- Fixed 3 skipped list management tests (rename, delete, switch)
- Achieved 100% E2E test coverage (25/25 tests passing)

### Phase 2: Component Tests
- Added RadialWheel.test.tsx (8 tests)
- Added CenterButton.test.tsx (5 tests)
- Added NameLabel.test.tsx (4 tests)
- Total: 17 new component tests

### Phase 3: Integration Tests
- Created user-workflows.test.tsx
- Add Name → Spin → History workflow (1 test)
- Exclude Name → Verify Not Selected workflow (1 test)
- Create List → Export CSV workflow (1 test)

### Phase 4: Coverage Improvements
- Added edge case tests to useNameStore.test.ts
- Created useKeyboardShortcuts.test.ts (4 tests)
- Updated coverage threshold to 65% in vitest.config.ts

### Phase 5: Documentation
- Added testing patterns to CODE_REFERENCE.md
- Created component and integration test templates
- Updated README.md with session summary

## Files Modified

**E2E Tests**:
- `e2e/specs/03-list-management.spec.ts` - Implemented 3 skipped tests

**Component Tests** (new files):
- `src/components/wheel/RadialWheel.test.tsx` - 8 tests for wheel rendering/animation
- `src/components/wheel/CenterButton.test.tsx` - 5 tests for spin button interactions
- `src/components/wheel/NameLabel.test.tsx` - 4 tests for label positioning/styling

**Integration Tests** (new file):
- `src/__tests__/integration/user-workflows.test.tsx` - 3 end-to-end workflow tests

**Unit Tests** (enhanced):
- `src/stores/useNameStore.test.ts` - Added 4 edge case tests
- `src/hooks/useKeyboardShortcuts.test.ts` - NEW, 4 tests for keyboard events

**Configuration**:
- `vitest.config.ts` - Updated coverage threshold from 45% to 65%

**Documentation**:
- `.claude/tasks/CODE_REFERENCE.md` - Added testing patterns section
- `.claude/tasks/sessions/session-21-complete-test-coverage.md` - This file
- `.claude/tasks/README.md` - Added Session 21 entry

## Commits

1. `test(e2e): complete list management E2E tests`
2. `test(wheel): add component tests for wheel components`
3. `test(integration): add user workflow integration tests`
4. `test(coverage): fill coverage gaps and update thresholds`
5. `docs(testing): document testing patterns and templates`

## Verification

```bash
bun run test:e2e          # 25/25 tests passing
bun test:run              # 53 tests passing
bun test:coverage         # 65% overall coverage
bun run tsc -b            # No type errors
bun run ci                # All checks passing
bun run build             # Production build successful
```

## Key Learnings

1. **Framer Motion Mocking**: Mocking `framer-motion` simplifies component tests by avoiding animation complexity
2. **Integration vs Component Tests**: Integration tests validate real workflows, component tests validate isolated behavior
3. **Coverage Gaps**: Hooks and utilities often have lower coverage than components (easy to forget)
4. **Test Organization**: Placing component tests next to source files improves discoverability

## Next Steps

**Option 1: Reach 80% Coverage** (SonarQube Quality Gate)
- Add component tests for sidebar components
- Add tests for theme system and export modal
- Target: 80% lines/functions, 65% branches

**Option 2: Complete MVP with Bulk Import CSV**
- Implement CSV parsing (Papa Parse library)
- Add validation and duplicate detection
- Complete bulk import modal functionality

**Option 3: Performance Optimization**
- Migrate `framer-motion` → `motion/mini` (save ~20kb)
- Add error boundaries for graceful failures
- Analyze bundle size with Vite build analyzer

**Recommended**: Option 2 (Bulk Import CSV) to achieve 100% MVP feature completion.

## Related Files

- **Plan**: `.claude/plans/session-21-complete-test-coverage.md`
- **Prompt**: `.claude/tasks/prompts/session-21-complete-test-coverage-prompt.md`
- **Code Patterns**: `.claude/tasks/CODE_REFERENCE.md` (Testing Patterns section)
- **Previous Session**: `.claude/tasks/sessions/session-20-e2e-test-fixes.md`
```

### 5.3: Update README.md

**File**: `.claude/tasks/README.md`

**Add Entry** (in Sessions table):
```markdown
| 21 | [Complete Test Coverage](sessions/session-21-complete-test-coverage.md) | Completed E2E tests (100%), added component tests (17), integration tests (3), increased coverage to 65% | 2.5h |
```

**Verification**:
```bash
# All documentation files created/updated
ls -la .claude/tasks/sessions/session-21-complete-test-coverage.md
ls -la .claude/tasks/CODE_REFERENCE.md
ls -la .claude/tasks/README.md
```

---

## Post-Session Checklist

**Run Full Verification**:
```bash
bun run ci                # Biome lint (CI mode)
bun run tsc -b            # Type check
bun test:run              # All unit + component + integration tests
bun run test:e2e          # All E2E tests
bun test:coverage         # Verify ≥65% coverage
bun run build             # Production build
```

**Expected Results**:
- ✅ Biome check passes
- ✅ TypeScript compilation successful
- ✅ 53+ tests passing (30 unit + 17 component + 3 integration + 4 hooks)
- ✅ 25/25 E2E tests passing (0 skipped)
- ✅ Coverage ≥65% overall
- ✅ Production build successful

**Commit & Push**:
```bash
git status                         # Review all changes
git add -A                         # Stage all files
git commit -m "test(e2e): complete list management E2E tests"
git commit -m "test(wheel): add component tests for wheel components"
git commit -m "test(integration): add user workflow integration tests"
git commit -m "test(coverage): fill coverage gaps and update thresholds"
git commit -m "docs(testing): document testing patterns and templates"
git push origin test/complete-test-coverage
```

---

## Create Pull Request

```bash
gh pr create --title "test: complete test coverage to 65%" --body "$(cat <<'EOF'
## Summary
- Completed all E2E tests (25/25 passing, 0 skipped)
- Added component tests for wheel components (17 tests)
- Added integration tests for user workflows (3 tests)
- Increased overall coverage from 45% to 65%

## Test Results
- E2E: 25/25 passing
- Unit: 30 tests
- Component: 17 tests
- Integration: 3 tests
- Hooks: 4 tests
- **Total**: 53+ tests passing

## Coverage
- Before: 45% overall
- After: 65% overall
- Threshold updated in vitest.config.ts

## Files Changed
- Fixed 3 skipped E2E tests in list management
- Created 3 new component test files (wheel components)
- Created 1 new integration test file (user workflows)
- Enhanced useNameStore.test.ts with edge cases
- Created useKeyboardShortcuts.test.ts
- Updated CODE_REFERENCE.md with testing patterns
- Session documentation complete

## Verification
\`\`\`bash
bun run ci          # Passing
bun run tsc -b      # Passing
bun test:run        # 53 tests passing
bun run test:e2e    # 25 tests passing
bun test:coverage   # 65% coverage
bun run build       # Success
\`\`\`

## Next Steps
- Option 1: Increase coverage to 80% (SonarQube quality gate)
- Option 2: Complete MVP with Bulk Import CSV feature
- Option 3: Performance optimization (bundle size, error boundaries)
EOF
)"
```

---

## Troubleshooting

**Issue**: E2E tests fail with "method not found" on SidebarPage
**Solution**: Add missing methods to `e2e/pages/SidebarPage.ts` (renameList, deleteList, switchToList)

**Issue**: Component tests fail with Framer Motion errors
**Solution**: Mock framer-motion in test setup or individual test files

**Issue**: Integration tests timeout waiting for animations
**Solution**: Increase `waitFor` timeout to 5000ms for spin animations

**Issue**: Coverage below 65% after all tests
**Solution**: Run `bun test:coverage` and review HTML report, add targeted tests for uncovered branches

**Issue**: localStorage not clearing between tests
**Solution**: Add `localStorage.clear()` to `beforeEach()` hooks

---

## Success Criteria

- [ ] All 25 E2E tests passing (0 skipped)
- [ ] 17+ component tests for wheel components
- [ ] 3+ integration tests for user workflows
- [ ] Overall coverage ≥65%
- [ ] No files below 50% coverage
- [ ] All CI checks passing
- [ ] Production build successful
- [ ] Documentation complete (CODE_REFERENCE, session summary, README)
- [ ] 5 atomic commits created
- [ ] Pull request created

---

## Estimated Timeline

- Phase 1: E2E Tests (30 min)
- Phase 2: Component Tests (60 min)
- Phase 3: Integration Tests (30 min)
- Phase 4: Coverage Analysis (15 min)
- Phase 5: Documentation (15 min)

**Total**: 2.5 hours
