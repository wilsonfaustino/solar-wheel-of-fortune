# Session 22: Integration Tests for User Workflows

## Session Context

**Session Number**: 22
**Branch Name**: `test/integration-tests-workflows`
**Estimated Duration**: 3 hours
**Type**: Testing enhancement (integration tests)
**Previous Session**: Session 21 (Test Coverage Analysis & Threshold Update)

## Background

Session 21 analyzed test coverage and identified that while we have excellent unit test coverage (50% overall, 94% for stores, 88% for utils), we lack integration tests for critical user workflows. The session recommended adding 5-10 integration tests focusing on multi-component interactions rather than forcing component tests for SVG/animation components (which are better tested via E2E).

**Current State**:
- 190 unit tests (stores, hooks, utilities, isolated components)
- 22/25 E2E tests passing (88% coverage)
- 49.78% overall code coverage
- Major gaps: Sidebar workflows (AddNameForm, ListSelector, NameManagementSidebar)

**Goal**: Add 8-10 integration tests for complete user workflows to increase coverage to ~55% and prevent regressions in critical user paths.

## Decision Rationale

**Why Integration Tests Over Component Tests?**

1. **Higher ROI**: Integration tests catch real-world bugs (state sync, timing issues, prop passing)
2. **Realistic Coverage**: Tests how components actually work together (not in isolation)
3. **Better Documentation**: Integration tests serve as living documentation of user flows
4. **Avoid SVG Testing**: Don't force unit tests on wheel components (SVG rendering is better tested via E2E)

**Why Not Continue With Component Tests?**
- Session 21 discovered SVG components don't render properly in happy-dom/jsdom
- Radix UI components have complex internal state (hard to test in isolation)
- E2E tests already provide comprehensive coverage for these components
- 50% meaningful coverage > 65% meaningless coverage

## Implementation Plan

### Phase 1: Test Infrastructure Setup (30 min)

**Goal**: Create test utilities and helpers for integration testing

**Tasks**:
1. Create `src/test/integration-helpers.ts` with test utilities:
   - `renderWithStore()` - Render component tree with Zustand store
   - `mockLocalStorage()` - Mock localStorage for persistence tests
   - `waitForStoreUpdate()` - Wait for Zustand state updates
   - `clearPersistedState()` - Clean up localStorage between tests

2. Create `src/test/test-data.ts` with realistic test data:
   - Sample name lists (default, multi-list scenarios)
   - Selection history records
   - Theme configurations

**Files to Create**:
- `src/test/integration-helpers.ts` (new)
- `src/test/test-data.ts` (new)

**Verification**:
```bash
bun run tsc -b  # No type errors
```

---

### Phase 2: Sidebar Workflow Integration Tests (60 min)

**Goal**: Test multi-component interactions in sidebar (AddNameForm → ListSelector → NameListItem)

**Test File**: `src/components/sidebar/NameManagementSidebar.integration.test.tsx`

**Tests to Add**:

1. **Full Name Management Flow** (add → edit → delete)
   - Render NameManagementSidebar
   - Add name via AddNameForm
   - Verify name appears in NameListDisplay
   - Edit name inline via NameListItem
   - Delete name with confirmation
   - Verify store state updates at each step

2. **Multi-List Operations Flow** (create → switch → delete)
   - Create new list via ListSelector
   - Verify active list changes
   - Add names to new list
   - Switch back to default list
   - Verify list isolation (names don't leak)
   - Delete list with confirmation
   - Verify active list reverts to default

3. **Name Exclusion Flow** (exclude → spin → verify skipped)
   - Add 3 names
   - Exclude 1 name via NameListItem
   - Mock wheel spin selection
   - Verify excluded name is not selectable
   - Re-include name
   - Verify name is selectable again

4. **Bulk Import Flow** (open modal → paste → add → verify)
   - Open bulk import modal via AddNameForm
   - Paste CSV-formatted names
   - Submit form
   - Verify all names added to store
   - Verify count matches
   - Close modal with Escape

**Coverage Impact**: NameManagementSidebar (0% → 80%), AddNameForm (0% → 70%), ListSelector (0% → 60%), NameListItem (0% → 75%)

---

### Phase 3: History & Export Integration Tests (45 min)

**Goal**: Test selection recording, history management, and export workflows

**Test File**: `src/components/sidebar/HistoryPanel.integration.test.tsx`

**Tests to Add**:

1. **Selection History Recording Flow** (spin → record → display)
   - Mock wheel spin selection
   - Trigger `markSelected()` store action
   - Verify history record created with timestamp
   - Verify HistoryPanel displays new entry
   - Verify FIFO limit (max 50 entries)

2. **History Export Flow** (multiple spins → export CSV/JSON)
   - Add 5 names
   - Mock 3 spins (create 3 history records)
   - Open ExportModal
   - Switch to CSV tab
   - Trigger download
   - Verify CSV format (headers, escaping, timestamps)
   - Switch to JSON tab
   - Trigger download
   - Verify JSON structure and metadata

3. **History Management Flow** (delete → clear all)
   - Create 5 history records
   - Delete single record via HistoryItem
   - Verify store updates
   - Clear all history
   - Verify empty state displayed

**Coverage Impact**: HistoryPanel (92% → 98%), ExportModal (improvements to edge cases)

---

### Phase 4: Theme & Persistence Integration Tests (30 min)

**Goal**: Test theme switching, localStorage persistence, and reload behavior

**Test File**: `src/stores/useNameStore.integration.test.ts`

**Tests to Add**:

1. **Theme Persistence Flow** (switch → reload → verify)
   - Set theme to "neon"
   - Trigger localStorage save
   - Clear React state (simulate reload)
   - Re-hydrate from localStorage
   - Verify theme persists
   - Verify localStorage key/value structure

2. **Multi-List Persistence Flow** (create lists → reload → verify)
   - Create 3 lists with names
   - Mark 2 selections
   - Trigger localStorage save
   - Clear React state
   - Re-hydrate from localStorage
   - Verify all lists persist
   - Verify active list persists
   - Verify selection history persists

**Coverage Impact**: Store persistence logic (edge cases), ThemeSwitcher (integration with store)

---

### Phase 5: Keyboard Shortcuts Integration Tests (30 min)

**Goal**: Test keyboard shortcuts in multi-component scenarios (Space, Escape)

**Test File**: `src/hooks/useKeyboardShortcuts.integration.test.tsx`

**Tests to Add**:

1. **Space Key in Complex UI Flow** (modal open → Space suppressed)
   - Render full app (App.tsx)
   - Open bulk import modal (input field focused)
   - Press Space
   - Verify wheel does NOT spin (input field has focus)
   - Close modal
   - Press Space
   - Verify wheel DOES spin

2. **Escape Key Coordination Flow** (multiple modals/dropdowns)
   - Open ListSelector dropdown
   - Press Escape
   - Verify dropdown closes
   - Open bulk import modal
   - Press Escape
   - Verify modal closes
   - Open ExportModal
   - Press Escape
   - Verify modal closes

**Coverage Impact**: useKeyboardShortcuts (edge cases), keyboard event handling in App.tsx

---

### Phase 6: Documentation & Verification (15 min)

**Goal**: Update documentation and verify all tests pass

**Tasks**:
1. Update `.claude/tasks/CODE_REFERENCE.md` with integration test patterns
2. Run full test suite and verify coverage increase
3. Create session documentation

**Documentation Updates**:
- Add "Integration Testing Patterns" section to CODE_REFERENCE.md
- Document `renderWithStore()` pattern
- Document localStorage mocking pattern
- Document multi-component test structure

**Verification**:
```bash
bun run tsc -b           # No type errors
bun test:run             # All tests passing (expect ~200 tests)
bun test:coverage        # Coverage: 54-56% (up from 49.78%)
bun run ci               # Biome check passes
bun run build            # Build succeeds
```

---

## Success Criteria

### Functional Requirements
- [ ] 8-10 integration tests added (targeting 10 for buffer)
- [ ] All tests pass in CI (no flaky tests)
- [ ] Coverage increases from 49.78% to 54-56%
- [ ] Branch coverage increases from 37% to 42%+
- [ ] No type errors
- [ ] All existing tests still pass

### Quality Requirements
- [ ] Integration tests follow established patterns (renderWithStore, waitFor)
- [ ] Tests document user workflows (readable, clear intent)
- [ ] Tests are deterministic (no timeouts, no race conditions)
- [ ] Test helpers are reusable across files
- [ ] Mock data is realistic and comprehensive

### Documentation Requirements
- [ ] CODE_REFERENCE.md updated with integration test patterns
- [ ] Session documentation created (session-22-integration-tests.md)
- [ ] Session prompt created for reusability

---

## Files to Create/Modify

### New Files (5)
1. `src/test/integration-helpers.ts` - Test utilities for integration tests
2. `src/test/test-data.ts` - Realistic test data fixtures
3. `src/components/sidebar/NameManagementSidebar.integration.test.tsx` - 4 integration tests
4. `src/components/sidebar/HistoryPanel.integration.test.tsx` - 3 integration tests
5. `src/hooks/useKeyboardShortcuts.integration.test.tsx` - 2 integration tests

### Modified Files (3)
1. `.claude/tasks/CODE_REFERENCE.md` - Add integration test patterns section
2. `.claude/tasks/sessions/session-22-integration-tests.md` - Session documentation
3. `.claude/tasks/README.md` - Add Session 22 entry

### No Changes Required
- `vitest.config.ts` - Coverage thresholds will be updated AFTER coverage increase verified
- Store files - No implementation changes needed (only tests)

---

## Atomic Commit Strategy

**Commit 1**: `test(infrastructure): add integration test helpers and fixtures`
- src/test/integration-helpers.ts
- src/test/test-data.ts

**Commit 2**: `test(sidebar): add name management workflow integration tests`
- src/components/sidebar/NameManagementSidebar.integration.test.tsx (4 tests)

**Commit 3**: `test(history): add history and export workflow integration tests`
- src/components/sidebar/HistoryPanel.integration.test.tsx (3 tests)

**Commit 4**: `test(theme): add theme persistence integration tests`
- src/stores/useNameStore.integration.test.ts (2 tests)

**Commit 5**: `test(shortcuts): add keyboard shortcuts integration tests`
- src/hooks/useKeyboardShortcuts.integration.test.tsx (2 tests)

**Commit 6**: `chore(test): update coverage thresholds to new baseline`
- vitest.config.ts (update thresholds to 54%)

**Commit 7**: `docs(test): add integration testing patterns to CODE_REFERENCE`
- .claude/tasks/CODE_REFERENCE.md

**Total**: 7 atomic commits

---

## Risk Analysis

### Low Risk
- Integration tests use same testing library as existing tests (familiar patterns)
- Store already has excellent unit test coverage (94%) - integration tests add layer on top
- Test helpers can be reused across multiple test files

### Medium Risk
- localStorage mocking may have timing issues (use `waitFor` utilities)
- Zustand store rehydration may be async (need proper cleanup between tests)
- Multi-component rendering may be slower (monitor test execution time)

### Mitigation Strategies
1. Use `afterEach` to clear localStorage and reset store state
2. Use `waitFor` for async state updates
3. Mock timers if tests become slow
4. Skip flaky tests if needed (document reason)

---

## Alternative Approaches Considered

### Option A: Force Component Tests for Wheel Components
**Rejected**: Session 21 demonstrated SVG components don't render in happy-dom/jsdom. E2E tests provide better coverage for these components.

### Option B: Add More E2E Tests Instead
**Rejected**: E2E tests are slower and flakier. Integration tests provide faster feedback and better coverage for business logic.

### Option C: Focus on Branch Coverage (Trivial Tests)
**Rejected**: Adding tests just to hit branches (e.g., `if (foo) return bar`) adds no value. Integration tests naturally improve branch coverage while testing real scenarios.

---

## Expected Outcomes

### Coverage Improvements
- **Overall**: 49.78% → 54-56% (5-6% increase)
- **Branches**: 37% → 42%+ (5%+ increase)
- **Sidebar Components**: 24.28% → 60%+ (35% increase)
- **Hooks**: 42.85% → 70%+ (27% increase)

### Quality Improvements
- Regression protection for critical user workflows
- Living documentation of how components interact
- Faster feedback loop (integration tests run in <5s vs E2E 30-60s)
- Confidence in refactoring sidebar components

### Test Count
- Before: 190 tests
- After: 200-205 tests (10-15 new integration tests)

---

## Next Session Recommendations

**Session 23 Options**:

1. **Complete Bulk Import CSV Feature** (High Priority)
   - Already 80% scaffolded (modal UI exists)
   - Needs CSV parsing logic integration
   - Integration tests already added in this session (Phase 2, Test 4)
   - Estimated: 2 hours

2. **Fix Flaky E2E Test** (History Deletion)
   - 1 history deletion test fails due to overlay intercept
   - Investigate proper wait strategy
   - Estimated: 1 hour

3. **Performance Optimization**
   - Bundle size analysis (current: ~150kb)
   - Lazy loading for ExportModal/HistoryPanel
   - Consider migration from framer-motion to motion/mini
   - Estimated: 2-3 hours

**Recommendation**: Session 23 should complete Bulk Import CSV (delivers user value, completes MVP roadmap item)

---

## Session Documentation Template

After session completion, create:
- `.claude/tasks/sessions/session-22-integration-tests.md`
- `.claude/tasks/prompts/session-22-integration-tests-prompt.md`

Update:
- `.claude/tasks/README.md` with Session 22 entry
- `.claude/tasks/CODE_REFERENCE.md` with integration test patterns
