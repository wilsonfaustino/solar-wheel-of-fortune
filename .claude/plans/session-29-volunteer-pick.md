# Session 29: Volunteer Pick Feature

## Session Context

**Session Number**: 29
**Branch Name**: `feat/volunteer-pick`
**Type**: New feature (manual selection bypass)
**Previous Session**: Session 28 (CI E2E Path Filtering)

## Context

Educators need a way to let someone **volunteer** (bypass the wheel) and be directly marked as selected + excluded. Currently all selections require a wheel spin. This adds a manual pick shortcut via a Hand icon button on active names -- reuses existing store mechanics without disrupting the spin flow.

## Behavior

- Hand icon button on each **active** (non-excluded) NameListItem
- Click = immediate `markSelected` + `isExcluded = true` (no spin, no timer)
- History records the pick tagged as `selectionMethod: 'volunteer'` with a Star icon
- No volunteer button on excluded names (guard in NameListItem)
- No toast -- visual feedback (name moving to excluded section) is sufficient
- Last active name CAN be volunteered -- wheel already handles empty state

## Implementation Plan

### Phase 1: Foundation (sequential, blocks everything)

**Goal**: Add type + store changes that all UI depends on

#### Step 1.1: Add SelectionMethod to types

**File**: `src/types/name.ts`

```
+ export type SelectionMethod = 'wheel' | 'volunteer'
+ selectionMethod: SelectionMethod  (new field on SelectionRecord)
```

Backward compat: existing localStorage records lack this field. HistoryItem guard `=== 'volunteer'` handles gracefully (old records show no tag).

#### Step 1.2: Update store -- recordSelection + new volunteerName action

**File**: `src/stores/useNameStore.ts`

**recordSelection**: add 3rd param `selectionMethod: SelectionMethod`, set on record.

**volunteerName(nameId)**: single Immer `set()` call that:
- Finds name in active list, guards `!name || name.isExcluded`
- `name.selectionCount++`, `name.lastSelectedAt = new Date()`
- `name.isExcluded = true`, `activeList.updatedAt = new Date()`
- Pushes `SelectionRecord` with `selectionMethod: 'volunteer'` to `draft.history` (100-item FIFO cap)

#### Step 1.3: Update App.tsx call site

**File**: `src/App.tsx`

Pass `'wheel'` as 3rd arg: `recordSelection(name.value, name.id, 'wheel')`

**Commit 1**: `feat(types): add selectionMethod to SelectionRecord`
**Commit 2**: `feat(store): add volunteerName action and update recordSelection`

---

### Phase 2: UI Changes (parallel tracks)

**Track A: Sidebar volunteer button**

**Files**:
- `src/components/sidebar/NameListItem.tsx` -- new prop `onVolunteer`, `Hand` icon (lucide-react), `variant="tech-ghost"`, `size="icon-sm"`, visible only when `!name.isExcluded`, placed before Eye toggle
- `src/components/sidebar/NameListDisplay.tsx` -- thread `onVolunteer` prop to NameListItem
- `src/components/sidebar/NameManagementSidebar.tsx` -- pull `volunteerName` from store, pass as `onVolunteer`

**Commit 3**: `feat(sidebar): add volunteer button to NameListItem`

**Track B: History volunteer tag** (independent of Track A)

**File**: `src/components/sidebar/HistoryItem.tsx` -- import `Star` from lucide-react, render star icon + "VOLUNTEER" label in `text-accent/60` when `record.selectionMethod === 'volunteer'`

**Commit 4**: `feat(sidebar): show volunteer tag in HistoryItem`

---

### Phase 3: Tests (parallel tracks)

**Track C: Unit tests**

**Files**:
- `src/stores/useNameStore.test.ts` -- new `describe('volunteerName')` block:
  - Increments selectionCount + sets lastSelectedAt
  - Sets isExcluded = true immediately
  - Records history with selectionMethod: 'volunteer'
  - No-op for missing or already-excluded names
- `src/stores/useNameStore.integration.test.ts` -- update existing `recordSelection` calls to pass `'wheel'` (signature change)

**Commit 5**: `test(store): add volunteerName tests and update recordSelection calls`

**Track D: E2E tests** (independent of Track C)

**Files**:
- `e2e/pages/SidebarPage.ts` -- add `clickVolunteer(name: string)` helper (hover + click Hand button)
- `e2e/specs/12-volunteer-pick.spec.ts`:
  - Volunteer button visible on active name, absent on excluded
  - Click volunteer: name moves to excluded section
  - History tab shows star + VOLUNTEER tag

**Commit 6**: `test(e2e): add volunteer pick E2E tests`

---

### Phase 4: Verification (sequential)

```bash
bun run tsc -b        # Type check (catches missing 3rd arg in recordSelection calls)
bun test:run          # All unit/integration tests
bun run test:e2e      # E2E suite including new spec
bun dev               # Manual: hover name, click Hand, verify exclusion + history star
```

## Files Summary

### Modified (7)
1. `src/types/name.ts` -- SelectionMethod type + field
2. `src/stores/useNameStore.ts` -- volunteerName action + recordSelection update
3. `src/App.tsx` -- recordSelection call site
4. `src/components/sidebar/NameListItem.tsx` -- Hand button + onVolunteer prop
5. `src/components/sidebar/NameListDisplay.tsx` -- thread onVolunteer prop
6. `src/components/sidebar/NameManagementSidebar.tsx` -- wire store action
7. `src/components/sidebar/HistoryItem.tsx` -- Star icon + VOLUNTEER label

### Modified (tests)
8. `src/stores/useNameStore.test.ts` -- volunteerName unit tests
9. `src/stores/useNameStore.integration.test.ts` -- update recordSelection calls

### Created (1)
10. `e2e/specs/12-volunteer-pick.spec.ts` -- E2E tests

### Modified (E2E infrastructure)
11. `e2e/pages/SidebarPage.ts` -- clickVolunteer helper

## Atomic Commits (6)

1. `feat(types): add selectionMethod to SelectionRecord`
2. `feat(store): add volunteerName action and update recordSelection`
3. `feat(sidebar): add volunteer button to NameListItem`
4. `feat(sidebar): show volunteer tag in HistoryItem`
5. `test(store): add volunteerName tests and update recordSelection calls`
6. `test(e2e): add volunteer pick E2E tests`

## Decisions

- **Last active name**: Allow volunteering even the last name. Wheel already handles empty state.
- **No toast on volunteer**: Visual feedback (name moving to excluded) is sufficient.
- **Button placement**: Hand icon before Eye toggle in button group (volunteer > exclude > edit > delete).
- **Single set() for volunteerName**: Atomic Immer mutation avoids 3 separate Zustand notifications.
- **selectionMethod field**: New field on SelectionRecord (cleaner than reusing unused sessionId/spinDuration).
