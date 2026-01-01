# Session 21: Complete Test Coverage

## Branch
`test/complete-test-coverage`

## Session Info
- **Estimated Duration**: 2.5 hours
- **Session Number**: 21
- **Type**: Testing & Quality
- **Status**: Ready for Implementation

## Context

The project currently has:
- **E2E Tests**: 21 passing, 4 skipped (in `03-list-management.spec.ts`)
- **Unit Tests**: 30 tests for store only
- **Coverage**: 45% (baseline threshold)
- **SonarQube Quality Gate**: Requires 80% coverage

**Problem**:
- Incomplete E2E coverage (3 skipped list management tests)
- No component tests for wheel components (core feature)
- No integration tests for user workflows
- Coverage below SonarQube threshold (80%)

**Goal**:
Achieve comprehensive test coverage by completing E2E tests, adding component tests for wheel components, and creating integration tests for critical user workflows.

## Decision Rationale

**Why Testing Before New Features?**
1. Only 3 skipped tests - low-hanging fruit for 100% E2E coverage
2. Prevents regressions as codebase grows
3. SonarQube quality gate blocks merges at <80% coverage
4. Better to establish testing patterns now than retrofit later
5. CI pipeline already configured - just need more tests

**Why These Specific Tests?**
- **List Management E2E**: Only incomplete spec, blocks 100% E2E coverage
- **Wheel Component Tests**: Core feature with 0% component test coverage
- **Integration Tests**: Validates end-to-end user workflows (add → spin → history)

## Implementation Phases

### Phase 1: Fix Skipped List Management E2E Tests (30 min)

**File**: `e2e/specs/03-list-management.spec.ts`

**Tasks**:
1. Implement "should rename a list" test
2. Implement "should delete a list" test
3. Implement "should switch between lists" test
4. Verify all 4 tests pass (1 existing + 3 new)

**Acceptance**:
- `bun run test:e2e` shows 24/25 tests passing (was 21/25)
- No skipped tests in `03-list-management.spec.ts`

### Phase 2: Add Wheel Component Tests (60 min)

**Files to Create**:
- `src/components/wheel/RadialWheel.test.tsx`
- `src/components/wheel/CenterButton.test.tsx`
- `src/components/wheel/NameLabel.test.tsx`

**Test Cases**:

**RadialWheel.test.tsx** (8 tests):
1. Renders with default names
2. Positions names radially (check transform styles)
3. Handles spin animation via ref
4. Shows selected name after spin
5. Respects excluded names (not shown on wheel)
6. Updates when active list changes
7. Handles empty name list gracefully
8. Applies correct rotation calculations

**CenterButton.test.tsx** (5 tests):
1. Renders with correct text
2. Triggers spin on click
3. Disables during spin animation
4. Shows pulse animation when idle
5. Accessible (aria-label, keyboard)

**NameLabel.test.tsx** (4 tests):
1. Renders name text correctly
2. Positions at correct angle
3. Applies selected styles when isSelected=true
4. Handles long names with text truncation

**Acceptance**:
- 17 new component tests passing
- Coverage for wheel components >80%
- `bun test:run` passes all tests

### Phase 3: Add Integration Tests (30 min)

**File to Create**: `src/__tests__/integration/user-workflows.test.tsx`

**Test Cases** (3 workflows):

1. **Add Name → Spin → Check History**
   - Add new name via sidebar
   - Trigger spin (Space key or button click)
   - Verify name appears in history panel
   - Verify selection count increments

2. **Exclude Name → Spin → Verify Not Selected**
   - Exclude a name in sidebar
   - Spin wheel multiple times
   - Assert excluded name never selected
   - Verify excluded name not visible on wheel

3. **Create List → Add Names → Export CSV**
   - Create new list via dropdown
   - Add 5 names
   - Spin and select 2 names
   - Export to CSV
   - Verify CSV contains list name and selections

**Acceptance**:
- 3 integration tests passing
- Tests use real store (not mocked)
- Tests validate cross-component interactions

### Phase 4: Coverage Analysis & Gap Filling (15 min)

**Tasks**:
1. Run `bun test:coverage` and review HTML report
2. Identify files with <80% coverage
3. Add targeted tests for uncovered branches
4. Focus on: error handling, edge cases, conditional logic

**Priority Files** (likely gaps):
- `src/stores/useNameStore.ts` - error paths, edge cases
- `src/components/sidebar/ListSelector.tsx` - dropdown interactions
- `src/components/sidebar/AddNameForm.tsx` - validation edge cases
- `src/hooks/useKeyboardShortcuts.ts` - event handler edge cases

**Acceptance**:
- Overall coverage ≥65% (up from 45%)
- No critical files below 50% coverage
- SonarQube code smells addressed

### Phase 5: Documentation & Verification (15 min)

**Tasks**:
1. Update `CODE_REFERENCE.md` with testing patterns
2. Add component test template example
3. Add integration test template example
4. Document coverage thresholds and CI requirements
5. Update `.claude/tasks/README.md` with Session 21 summary

**Files to Update**:
- `.claude/tasks/CODE_REFERENCE.md` - Add testing section
- `.claude/tasks/sessions/session-21-complete-test-coverage.md` - Session summary
- `.claude/tasks/README.md` - Add Session 21 entry

**Acceptance**:
- Documentation includes copy-paste test templates
- Testing patterns clearly documented
- Session summary complete

## Atomic Commit Strategy

**Commit 1**: `test(e2e): complete list management E2E tests`
- Fix 3 skipped tests in `03-list-management.spec.ts`
- All 25 E2E tests passing

**Commit 2**: `test(wheel): add component tests for wheel components`
- Add RadialWheel.test.tsx (8 tests)
- Add CenterButton.test.tsx (5 tests)
- Add NameLabel.test.tsx (4 tests)
- 17 new tests passing

**Commit 3**: `test(integration): add user workflow integration tests`
- Create `user-workflows.test.tsx`
- Add 3 integration tests for critical workflows
- Tests validate cross-component interactions

**Commit 4**: `test(coverage): fill coverage gaps and update thresholds`
- Add targeted tests for uncovered branches
- Update coverage threshold to 65% in `vitest.config.ts`
- Address SonarQube code smells

**Commit 5**: `docs(testing): document testing patterns and templates`
- Update CODE_REFERENCE.md with test templates
- Add Session 21 summary
- Update README.md with session entry

## Success Criteria

- [ ] All 25 E2E tests passing (0 skipped)
- [ ] 17+ new component tests for wheel components
- [ ] 3+ integration tests for user workflows
- [ ] Overall test coverage ≥65%
- [ ] No files below 50% coverage
- [ ] `bun run ci` passes (lint, type-check, tests)
- [ ] `bun run build` succeeds
- [ ] Documentation updated with test patterns
- [ ] 5 atomic commits created

## Files to Modify/Create

**E2E Tests**:
- `e2e/specs/03-list-management.spec.ts` - Fix 3 skipped tests

**Component Tests** (new files):
- `src/components/wheel/RadialWheel.test.tsx`
- `src/components/wheel/CenterButton.test.tsx`
- `src/components/wheel/NameLabel.test.tsx`

**Integration Tests** (new file):
- `src/__tests__/integration/user-workflows.test.tsx`

**Coverage Improvements**:
- Add tests to `src/stores/useNameStore.test.ts` (edge cases)
- Possibly add tests for other uncovered components (TBD after coverage report)

**Configuration**:
- `vitest.config.ts` - Update coverage threshold from 45% to 65%

**Documentation**:
- `.claude/tasks/CODE_REFERENCE.md` - Add testing patterns section
- `.claude/tasks/sessions/session-21-complete-test-coverage.md` - Session summary
- `.claude/tasks/README.md` - Add Session 21 entry

## Testing Strategy

**Test Organization**:
- Component tests next to source files (e.g., `RadialWheel.test.tsx` next to `RadialWheel.tsx`)
- Integration tests in `src/__tests__/integration/` directory
- E2E tests remain in `e2e/specs/`

**Test Patterns to Follow**:
- Use Vitest globals (no imports needed)
- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interactions
- Mock external dependencies, use real store for integration tests
- Follow AAA pattern (Arrange, Act, Assert)

**Coverage Verification**:
```bash
bun test:coverage           # Generate coverage report
open coverage/index.html    # Review HTML report
```

## Potential Challenges

1. **Framer Motion Testing**: RadialWheel uses Framer Motion animations
   - Solution: Mock `framer-motion` or test final state after animation
   - Reference: https://www.frammish.org/testing-framer-motion/

2. **Ref Forwarding**: RadialWheel uses `forwardRef` for keyboard shortcuts
   - Solution: Create wrapper component in tests to capture ref

3. **Integration Test Complexity**: Full workflows touch multiple components
   - Solution: Use `render()` from RTL with full component tree, not isolated tests

4. **Coverage Threshold Jump**: Going from 45% to 65% may require many tests
   - Solution: Focus on high-impact files first, accept incremental progress

## Next Session Recommendations

After Session 21, consider:

**Option 1**: Increase coverage to 80% (SonarQube requirement)
- Add more component tests for sidebar components
- Add tests for hooks and utilities
- Aim for full SonarQube quality gate compliance

**Option 2**: Complete MVP with Bulk Import CSV
- Implement CSV parsing (Papa Parse library)
- Add validation and duplicate detection
- Complete bulk import modal functionality

**Option 3**: Performance & Bundle Optimization
- Migrate `framer-motion` → `motion/mini` (save ~20kb)
- Analyze bundle with `bun run build --analyze`
- Add error boundaries and loading states

**Recommended**: Option 2 (Bulk Import CSV) to achieve 100% MVP completion, then return to Option 1 for 80% coverage.
