# Session 23: UI Component Integration Tests

## Session Context

**Session Number**: 23
**Branch Name**: `test/ui-integration-tests`
**Estimated Duration**: 3 hours
**Type**: Testing enhancement (UI integration tests)
**Previous Session**: Session 22 (Integration Tests for User Workflows)

## Background

Session 22 successfully added 8 store integration tests and established reusable test infrastructure (helpers, fixtures, patterns). However, the original plan included UI component integration tests that were deferred to focus on higher-ROI store tests first.

**Current State**:
- 198 unit tests (190 existing + 8 store integration tests from Session 22)
- Test infrastructure ready: `renderWithStore()`, `waitForStoreUpdate()`, `clearPersistedState()`
- Centralized test data: `sampleNames`, `defaultNameList`, `mockInitialState`
- 22/25 E2E tests passing (88% coverage)
- ~50% overall code coverage

**Goal**: Add 10-12 UI integration tests for sidebar, history, and keyboard shortcut workflows to increase coverage to ~55% and provide regression protection for user-facing interactions.

## Decision Rationale

**Why UI Integration Tests Now?**

1. **Complete Session 22 Initiative**: Original plan included UI tests, now we have infrastructure to support them
2. **Test Infrastructure Ready**: `renderWithStore()` and helpers make UI integration tests straightforward
3. **Coverage Gaps**: Sidebar components (NameManagementSidebar, AddNameForm, ListSelector) have 0% coverage
4. **User Workflow Protection**: Integration tests catch bugs that unit tests miss (timing, event coordination, prop passing)
5. **E2E Complement**: Integration tests run faster (seconds vs minutes) and provide better debugging

**Why Three Phases?**

- **Phase 1**: Sidebar workflows (most complex, highest value)
- **Phase 2**: History & Export workflows (medium complexity)
- **Phase 3**: Keyboard shortcuts (edge cases, coordination)

Each phase is independently valuable and can be committed separately.

## Pre-Session Tasks (15 min)

**Goal**: Commit Session 22 documentation before starting new work

### Task 0.1: Stage and Commit Session 22 Documentation

**Files to Commit**:
- `.claude/tasks/sessions/session-22-integration-tests.md` (new, 21KB)
- `.claude/tasks/README.md` (modified, Session 22 entry added)

**Commit Message**:
```bash
docs(session): add Session 22 documentation for integration tests

- Added comprehensive session documentation (21KB)
- Documented 8 store integration tests and test infrastructure
- Updated README.md with Session 22 entry
- Captured key learnings and deviations from plan
```

**Verification**:
```bash
git status                    # Verify clean working directory
git log --oneline -1          # Verify commit created
```

**Note**: This documentation task is from Session 22 but was not committed yet. We complete it before starting Session 23.

---

## Implementation Plan

### Phase 1: Sidebar Workflow Integration Tests (75 min)

**Goal**: Test multi-component interactions in sidebar (AddNameForm → ListSelector → NameListItem)

**Test File**: `src/components/sidebar/NameManagementSidebar.integration.test.tsx`

**Tests to Add** (4 tests):

#### Test 1.1: Full Name Management Flow (add → edit → delete)
**Steps**:
1. Render NameManagementSidebar
2. Add name via AddNameForm input
3. Verify name appears in NameListDisplay
4. Double-click name to enter edit mode
5. Update name inline
6. Verify store updated
7. Delete name with confirmation dialog
8. Verify name removed from store

**What It Catches**:
- Input validation and form submission
- Inline editing state management
- ConfirmDialog integration
- Store synchronization across components

**Coverage**: AddNameForm (0% → 60%), NameListItem (0% → 70%), NameManagementSidebar (0% → 50%)

---

#### Test 1.2: Multi-List Operations Flow (create → switch → delete)
**Steps**:
1. Open ListSelector dropdown
2. Create new list via "Create New List" menuitem
3. Verify active list changes
4. Add names to new list
5. Switch back to default list via dropdown
6. Verify list isolation (names don't leak)
7. Delete new list with confirmation
8. Verify active list reverts to default

**What It Catches**:
- Radix DropdownMenu integration
- List creation modal flow
- Active list state management
- List deletion with active list reversion

**Coverage**: ListSelector (0% → 65%), DropdownMenu interactions

---

#### Test 1.3: Name Exclusion Flow (exclude → verify → re-include)
**Steps**:
1. Pre-populate store with 3 names
2. Click exclude button on one name
3. Verify excluded state in UI (opacity change)
4. Verify store updated (isExcluded flag)
5. Verify name not in selectable names
6. Click include button
7. Verify name re-included in store and UI

**What It Catches**:
- Toggle button state changes
- Visual feedback (opacity/strikethrough)
- Store exclusion logic
- Selectable names filtering

**Coverage**: NameListItem exclusion logic, visual states

---

#### Test 1.4: Bulk Import Flow (modal → paste → import → verify)
**Steps**:
1. Click "Bulk Import" button
2. Verify Radix Dialog opens
3. Type in textarea (multi-line names)
4. Click "Import" button
5. Verify names added to store
6. Verify modal closes
7. Open modal again and press Escape
8. Verify modal closes without import

**What It Catches**:
- Radix Dialog integration
- Textarea input handling
- Bulk name parsing
- Escape key coordination with Dialog
- Form reset on close

**Coverage**: AddNameForm modal logic (0% → 75%), BulkImportModal integration

---

**Files to Create**:
1. `src/components/sidebar/NameManagementSidebar.integration.test.tsx` (4 tests, ~300 lines)

**Expected Coverage Increase**:
- NameManagementSidebar: 0% → 50%
- AddNameForm: 0% → 65%
- ListSelector: 0% → 65%
- NameListItem: 0% → 70%

---

### Phase 2: History & Export Integration Tests (60 min)

**Goal**: Test selection recording, history management, and export workflows

**Test File**: `src/components/sidebar/HistoryPanel.integration.test.tsx`

**Tests to Add** (4 tests):

#### Test 2.1: Selection History Recording Flow (spin → record → display)
**Steps**:
1. Pre-populate store with names
2. Render HistoryPanel
3. Verify initial empty state ("No selections yet")
4. Trigger `recordSelection()` action (mock wheel spin)
5. Verify history item appears in HistoryPanel
6. Trigger 2 more selections
7. Verify all 3 items displayed with timestamps
8. Verify most recent at top (reverse chronological)

**What It Catches**:
- History recording integration
- HistoryItem component rendering
- Timestamp formatting
- Empty state conditional rendering

**Coverage**: HistoryPanel (92% → 96%), HistoryItem rendering

---

#### Test 2.2: History Export CSV Flow (open modal → export → verify format)
**Steps**:
1. Pre-populate history with 3 records
2. Click "Export" button
3. Verify ExportModal opens (Radix Dialog)
4. Click "CSV" tab (Radix Tabs)
5. Mock `document.createElement('a')` for download
6. Click "Download CSV" button
7. Verify CSV blob created with correct format
8. Verify headers: "Name,List,Timestamp"
9. Verify data rows match history records

**What It Catches**:
- Radix Tabs integration
- CSV generation logic
- Download link creation
- Data formatting (escaping, timestamps)

**Coverage**: ExportModal CSV tab logic, formatCSV utility

---

#### Test 2.3: History Export JSON Flow (switch tab → export → verify structure)
**Steps**:
1. Pre-populate history with 3 records
2. Open ExportModal
3. Click "JSON" tab
4. Mock download link
5. Click "Download JSON" button
6. Parse JSON blob
7. Verify metadata (totalSelections, exportDate)
8. Verify selections array structure
9. Verify timestamps are ISO strings

**What It Catches**:
- Tab switching state
- JSON generation logic
- Metadata inclusion
- Date formatting

**Coverage**: ExportModal JSON tab logic, formatJSON utility

---

#### Test 2.4: History Management Flow (delete → clear all)
**Steps**:
1. Pre-populate history with 5 records
2. Render HistoryPanel
3. Click delete button on first item
4. Verify ConfirmDialog appears
5. Click "Confirm"
6. Verify item deleted from store and UI
7. Click "Clear All History" button
8. Verify ConfirmDialog appears
9. Click "Confirm"
10. Verify all history cleared
11. Verify empty state displayed

**What It Catches**:
- ConfirmDialog integration in HistoryPanel
- Single record deletion
- Bulk deletion (clear all)
- Empty state after clear

**Coverage**: HistoryPanel management logic (96% → 98%)

---

**Files to Create**:
1. `src/components/sidebar/HistoryPanel.integration.test.tsx` (4 tests, ~280 lines)

**Expected Coverage Increase**:
- HistoryPanel: 92% → 98%
- ExportModal: edge cases for CSV/JSON formatting
- HistoryItem: delete button interactions

---

### Phase 3: Keyboard Shortcuts Integration Tests (45 min)

**Goal**: Test keyboard shortcuts in multi-component scenarios (Space, Escape coordination)

**Test File**: `src/hooks/useKeyboardShortcuts.integration.test.tsx`

**Tests to Add** (4 tests):

#### Test 3.1: Space Key Suppression in Input Fields
**Steps**:
1. Render full App component
2. Click on AddNameForm input (focus input)
3. Press Space key
4. Verify wheel does NOT spin (mock onSpin callback)
5. Verify Space character added to input value
6. Blur input (click outside)
7. Press Space key
8. Verify wheel DOES spin

**What It Catches**:
- Input field detection logic
- Space key suppression during text entry
- Event delegation in App.tsx
- Focus/blur event coordination

**Coverage**: useKeyboardShortcuts edge cases, App.tsx keyboard handling

---

#### Test 3.2: Space Key Suppression in Textarea (Bulk Import)
**Steps**:
1. Render App component
2. Open bulk import modal
3. Textarea auto-focused
4. Press Space key
5. Verify wheel does NOT spin
6. Verify Space added to textarea
7. Close modal with Escape
8. Press Space key
9. Verify wheel DOES spin

**What It Catches**:
- Textarea detection (not just input)
- Modal focus management
- Escape key closes modal before Space works

**Coverage**: useKeyboardShortcuts textarea handling

---

#### Test 3.3: Escape Key Priority (Multiple Dialogs Open)
**Steps**:
1. Open ExportModal (Radix Dialog)
2. Verify modal open
3. Press Escape
4. Verify ExportModal closes
5. Open ListSelector dropdown (Radix DropdownMenu)
6. Press Escape
7. Verify dropdown closes
8. Open ConfirmDialog (delete name)
9. Press Escape
10. Verify ConfirmDialog closes

**What It Catches**:
- Radix primitives handle Escape correctly
- No Escape key conflicts between components
- Modal close order (last opened closes first)

**Coverage**: Escape key coordination across Radix primitives

---

#### Test 3.4: Keyboard Shortcuts During Animation
**Steps**:
1. Render App component
2. Trigger wheel spin (Space key)
3. Immediately press Space again (during animation)
4. Verify second spin does NOT trigger (button disabled)
5. Wait for animation complete
6. Press Space
7. Verify wheel spins again

**What It Catches**:
- Button disabled state during spin
- Keyboard shortcut respects disabled state
- Animation completion detection

**Coverage**: useKeyboardShortcuts disabled state handling

---

**Files to Create**:
1. `src/hooks/useKeyboardShortcuts.integration.test.tsx` (4 tests, ~240 lines)

**Expected Coverage Increase**:
- useKeyboardShortcuts: 42% → 75%
- App.tsx keyboard handling: 0% → 60%

---

### Phase 4: Documentation & Verification (30 min)

**Goal**: Update documentation and verify all tests pass

#### Step 4.1: Run Full Test Suite

```bash
bun test:run
```

**Expected Output**:
- 210-212 tests passing (198 existing + 12 new integration tests)
- All existing tests still pass

---

#### Step 4.2: Generate Coverage Report

```bash
bun test:coverage
```

**Expected Output**:
```
Coverage summary:
  Lines       : 54-56% (up from 50%)
  Statements  : 54-56% (up from 50%)
  Branches    : 42-44% (up from ~38%)
  Functions   : 56-58% (up from ~52%)
```

---

#### Step 4.3: Update Coverage Thresholds

**File**: `vitest.config.ts`

Update thresholds to new baseline:

```typescript
thresholds: {
  lines: 54,        // Up from 49
  functions: 56,    // Up from 51
  branches: 42,     // Up from 37
  statements: 54,   // Up from 49
},
```

---

#### Step 4.4: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add UI integration test examples to existing "Integration Testing Patterns" section:

```markdown
### UI Integration Test Examples

**NameManagementSidebar Integration**:
```typescript
it('should add, edit, and delete name with UI sync', async () => {
  const user = userEvent.setup();
  renderWithStore(<NameManagementSidebar />);

  // Add name
  await user.type(screen.getByPlaceholderText(/enter a name/i), 'Alice');
  await user.click(screen.getByRole('button', { name: /add/i }));

  // Edit name
  await user.dblClick(screen.getByText('Alice'));
  const input = screen.getByDisplayValue('Alice');
  await user.clear(input);
  await user.type(input, 'Bob');
  await user.keyboard('{Enter}');

  // Delete name
  const deleteBtn = screen.getByLabelText(/delete name/i);
  await user.click(deleteBtn);
  await user.click(screen.getByRole('button', { name: /confirm/i }));

  // Verify store
  await waitFor(() => {
    const state = useNameStore.getState();
    expect(state.lists[0].names.some(n => n.value === 'BOB')).toBe(false);
  });
});
```

**Keyboard Shortcut Integration**:
```typescript
it('should suppress Space in input fields', async () => {
  const onSpin = vi.fn();
  const user = userEvent.setup();
  render(<App onSpin={onSpin} />);

  const input = screen.getByPlaceholderText(/enter a name/i);
  await user.click(input); // Focus
  await user.keyboard(' ');

  expect(onSpin).not.toHaveBeenCalled();
  expect(input).toHaveValue(' ');
});
```
```

---

#### Step 4.5: Create Session Documentation

**File**: `.claude/tasks/sessions/session-23-ui-integration-tests.md`

Follow the session documentation template with:
- Overview (what was accomplished)
- Files Created (3 new test files + 2 modified files)
- Commits (4 atomic commits: 1 pre-task + 3 phases)
- Verification (test output, coverage results)
- Key Learnings (UI integration test patterns)
- Next Steps (Session 24 recommendations)

---

#### Step 4.6: Update README.md

**File**: `.claude/tasks/README.md`

Add Session 23 entry after Session 22:
```markdown
### Session 23: UI Component Integration Tests (Completed)
- Added 12 UI integration tests for sidebar, history, and keyboard workflows
- Coverage increased from 50% to 55%
- Completed Session 22 deferred UI tests
- [Session Doc](sessions/session-23-ui-integration-tests.md)
- [Prompt](prompts/session-23-ui-integration-tests-prompt.md)
```

---

#### Step 4.7: Verify Build

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

## Success Criteria

### Functional Requirements
- [ ] 12 UI integration tests added (4 sidebar + 4 history + 4 keyboard)
- [ ] All tests pass in CI (210+ tests total)
- [ ] Coverage increases from ~50% to 54-56%
- [ ] Branch coverage increases from ~38% to 42%+
- [ ] No type errors
- [ ] All existing tests still pass

### Quality Requirements
- [ ] Tests use established patterns (renderWithStore, waitFor, userEvent)
- [ ] Tests document complete user workflows
- [ ] Tests are deterministic (no flaky failures)
- [ ] Radix primitives tested (Dialog, DropdownMenu, Tabs, AlertDialog)
- [ ] Keyboard event coordination tested (Space, Escape)

### Documentation Requirements
- [ ] Session 22 documentation committed (pre-task)
- [ ] CODE_REFERENCE.md updated with UI integration test examples
- [ ] Session 23 documentation created
- [ ] README.md updated with Session 23 entry
- [ ] Coverage thresholds updated to new baseline

---

## Files to Create/Modify

### Pre-Task: Session 22 Documentation
1. `.claude/tasks/sessions/session-22-integration-tests.md` (stage and commit)
2. `.claude/tasks/README.md` (stage and commit)

### New Test Files (3)
1. `src/components/sidebar/NameManagementSidebar.integration.test.tsx` (~300 lines, 4 tests)
2. `src/components/sidebar/HistoryPanel.integration.test.tsx` (~280 lines, 4 tests)
3. `src/hooks/useKeyboardShortcuts.integration.test.tsx` (~240 lines, 4 tests)

### Modified Files (3)
1. `vitest.config.ts` - Update coverage thresholds
2. `.claude/tasks/CODE_REFERENCE.md` - Add UI integration test examples
3. `.claude/tasks/README.md` - Add Session 23 entry

### Documentation Files (2)
1. `.claude/tasks/sessions/session-23-ui-integration-tests.md` - Session documentation
2. `.claude/tasks/prompts/session-23-ui-integration-tests-prompt.md` - Execution prompt (this file)

---

## Atomic Commit Strategy

**Commit 0** (Pre-task): `docs(session): add Session 22 documentation for integration tests`
- `.claude/tasks/sessions/session-22-integration-tests.md`
- `.claude/tasks/README.md` (Session 22 entry)

**Commit 1**: `test(sidebar): add NameManagementSidebar integration tests`
- `src/components/sidebar/NameManagementSidebar.integration.test.tsx` (4 tests)

**Commit 2**: `test(history): add HistoryPanel and export integration tests`
- `src/components/sidebar/HistoryPanel.integration.test.tsx` (4 tests)

**Commit 3**: `test(shortcuts): add keyboard shortcuts integration tests`
- `src/hooks/useKeyboardShortcuts.integration.test.tsx` (4 tests)

**Commit 4**: `chore(test): update coverage thresholds to 54% baseline`
- `vitest.config.ts`

**Commit 5**: `docs(test): add UI integration test patterns to CODE_REFERENCE`
- `.claude/tasks/CODE_REFERENCE.md`

**Commit 6**: `docs(session): add Session 23 documentation`
- `.claude/tasks/sessions/session-23-ui-integration-tests.md`
- `.claude/tasks/README.md` (Session 23 entry)

**Total**: 7 atomic commits (1 pre-task + 3 test files + 1 config + 2 docs)

---

## Risk Analysis

### Low Risk
- Test infrastructure already proven in Session 22
- Patterns established (renderWithStore, waitFor, userEvent)
- Components already tested via E2E (smoke test confidence)

### Medium Risk
- Radix primitives may have complex internal state (mocking challenges)
- Keyboard event simulation may need special handling
- Modal/dropdown timing issues (Radix animations)

### Mitigation Strategies
1. Use `waitFor()` for Radix primitive state changes
2. Use `userEvent.setup()` for realistic keyboard events
3. Mock `document.createElement('a')` for download tests
4. Use `vi.useFakeTimers()` if timing issues arise
5. Reference E2E tests for expected behavior

---

## Alternative Approaches Considered

### Option A: Force Component Unit Tests Instead
**Rejected**: UI integration tests provide better ROI by testing real interactions (not mocked)

### Option B: Add More Store Tests
**Rejected**: Store already has excellent coverage (94%). UI components are the gap.

### Option C: Only Add E2E Tests
**Rejected**: E2E tests are slower (30-60s vs 2-3s) and harder to debug

---

## Expected Outcomes

### Coverage Improvements
- **Overall**: 50% → 54-56% (4-6% increase)
- **Branches**: ~38% → 42-44% (4-6% increase)
- **Sidebar Components**: 0-24% → 60-75% (50%+ increase)
- **Hooks**: 42% → 70%+ (28% increase)

### Quality Improvements
- Regression protection for critical UI workflows
- Living documentation of user interactions
- Faster feedback than E2E tests (seconds vs minutes)
- Confidence in refactoring sidebar components

### Test Count
- Before: 198 tests
- After: 210-212 tests (12 new UI integration tests)

---

## Next Session Recommendations

**Session 24 Options**:

1. **Complete Bulk Import CSV Feature** (High Priority)
   - Already scaffolded (modal UI exists)
   - Integration test added in Session 23 (Test 1.4)
   - Just need CSV parsing logic
   - Estimated: 2 hours

2. **Fix Flaky E2E Test** (History Deletion)
   - 1 test still failing due to overlay intercept
   - Use Session 20's smart wait strategies
   - Estimated: 1 hour

3. **Performance Optimization**
   - Bundle size analysis (current: ~150kb gzipped)
   - Lazy loading improvements
   - Consider `framer-motion` → `motion/mini` migration
   - Estimated: 2-3 hours

**Recommendation**: Session 24 should complete Bulk Import CSV (delivers user value, completes MVP feature)

---

## Session Documentation Template

After session completion, create:
- `.claude/tasks/sessions/session-23-ui-integration-tests.md`

Update:
- `.claude/tasks/README.md` with Session 23 entry
- `.claude/tasks/CODE_REFERENCE.md` with UI integration test examples
