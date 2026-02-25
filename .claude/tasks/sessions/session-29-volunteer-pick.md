# Session 29: Volunteer Pick

**Date**: February 24, 2026
**Status**: Completed
**Branch**: `feat/volunteer-pick`
**Duration**: ~60 minutes
**Unit Tests**: 255 passing (+5 new)
**E2E Tests**: +3 new specs (12-volunteer-pick.spec.ts)

## Overview

Session 29 adds a "volunteer" shortcut that lets educators bypass the wheel and directly mark a name as selected + excluded. Clicking the Hand icon on any active name performs an immediate `volunteerName` store action — no spin, no timer — and tags the history record with `selectionMethod: 'volunteer'`, surfaced in HistoryItem as a Star icon + "VOLUNTEER" label.

## What Was Done

### Phase 1: Foundation

**`src/types/name.ts`**
- Added `export type SelectionMethod = 'wheel' | 'volunteer'`
- Added `selectionMethod?: SelectionMethod` to `SelectionRecord` (optional for backward compat with stored records that predate this field)

**`src/stores/useNameStore.ts`**
- Updated `recordSelection` signature: added required 3rd param `selectionMethod: SelectionMethod`
- Added `volunteerName(nameId: string)` action — single Immer `set()` call:
  - Guards `!name || name.isExcluded` (no-op for missing or already-excluded names)
  - Increments `selectionCount`, sets `lastSelectedAt`, sets `isExcluded = true`
  - Updates `activeList.updatedAt`
  - Pushes a `SelectionRecord` with `selectionMethod: 'volunteer'` to `draft.history` (100-item FIFO cap)

**`src/components/wheel/RadialWheel.tsx`**
- Updated the `recordSelection` call site: `recordSelection(selectedName.value, selectedName.id, 'wheel')`

### Phase 2: UI

**`src/components/sidebar/NameListItem.tsx`**
- Added `onVolunteer: (nameId: string) => void` prop
- Imported `Hand` from `lucide-react`
- Added Hand button before the Eye toggle, rendered only when `!name.isExcluded`
- Button uses `variant="tech-ghost"`, `size="icon-sm"`, `aria-label="Volunteer {name.value}"`

**`src/components/sidebar/NameListDisplay.tsx`**
- Added `onVolunteer` to `NameListDisplayProps`
- Threaded `onVolunteer` to both the active and excluded `NameListItem` render paths

**`src/components/sidebar/NameManagementSidebar.tsx`**
- Pulled `volunteerName` from store
- Passed as `onVolunteer` to `NameListDisplay`

**`src/components/sidebar/HistoryItem.tsx`**
- Imported `Star` from `lucide-react`
- Replaced flat timestamp line with a flex row: timestamp + conditional volunteer tag
- Volunteer tag: `Star` icon + "VOLUNTEER" text in `text-accent/60`, visible when `record.selectionMethod === 'volunteer'`

### Phase 3: Tests

**`src/stores/useNameStore.test.ts`**
- Updated all `recordSelection` calls to include `'wheel'` as 3rd arg
- Added new `describe('volunteerName')` block with 5 tests:
  - Increments `selectionCount` and sets `lastSelectedAt`
  - Sets `isExcluded = true` immediately
  - Records history with `selectionMethod: 'volunteer'`
  - No-op for a missing name
  - No-op for an already-excluded name

**`src/stores/useNameStore.integration.test.ts`**
- Updated all `recordSelection` calls to include `'wheel'` as 3rd arg

**`src/components/sidebar/HistoryPanel.test.tsx`**
- Updated all `recordSelection` calls to include `'wheel'` as 3rd arg

**`e2e/pages/SidebarPage.ts`**
- Added `clickVolunteer(name: string)` helper: hovers the item, then clicks the volunteer button by `aria-label`

**`e2e/specs/12-volunteer-pick.spec.ts`** (new file)
- Volunteer button visible on active name, absent on excluded name
- Clicking volunteer moves name to excluded section
- History tab shows Star + "VOLUNTEER" tag after volunteer pick

## Files Modified

| File | Change |
|---|---|
| `src/types/name.ts` | `SelectionMethod` type + optional `selectionMethod` on `SelectionRecord` |
| `src/stores/useNameStore.ts` | Updated `recordSelection` signature, added `volunteerName` action |
| `src/components/wheel/RadialWheel.tsx` | Updated `recordSelection` call with `'wheel'` |
| `src/components/sidebar/NameListItem.tsx` | `onVolunteer` prop + Hand icon button |
| `src/components/sidebar/NameListDisplay.tsx` | Thread `onVolunteer` prop |
| `src/components/sidebar/NameManagementSidebar.tsx` | Wire `volunteerName` from store |
| `src/components/sidebar/HistoryItem.tsx` | Star icon + VOLUNTEER label |
| `src/stores/useNameStore.test.ts` | 5 new `volunteerName` tests, updated `recordSelection` calls |
| `src/stores/useNameStore.integration.test.ts` | Updated `recordSelection` calls |
| `src/components/sidebar/HistoryPanel.test.tsx` | Updated `recordSelection` calls |
| `e2e/pages/SidebarPage.ts` | `clickVolunteer` helper |
| `e2e/specs/12-volunteer-pick.spec.ts` | New E2E spec (3 tests) |

## Commits

1. `feat(types): add selectionMethod to SelectionRecord`
2. `feat(store): add volunteerName action and update recordSelection`
3. `feat(sidebar): add volunteer button to NameListItem`
4. `feat(sidebar): show volunteer tag in HistoryItem`
5. `test(store): add volunteerName tests and update recordSelection calls`
6. `test(e2e): add volunteer pick E2E tests`

## Verification

```
bun run tsc -b   → 0 errors
bun test:run     → 255 passed | 1 skipped (256 total)
```

Pre-commit hook (Biome) ran cleanly on all commits.

## Key Decisions

- **`selectionMethod` optional on `SelectionRecord`**: Stored records predating this session lack the field. The `=== 'volunteer'` check in HistoryItem handles `undefined` gracefully (no tag shown for old records).
- **`recordSelection` 3rd param required**: Forces all new call sites to be explicit. All existing call sites updated to `'wheel'`.
- **Single `set()` for `volunteerName`**: Atomic Immer mutation — one Zustand notification covers all state changes (count, date, exclusion, history).
- **No toast on volunteer**: Moving the name to the excluded section is sufficient visual feedback.
- **Last active name allowed**: The plan explicitly permits volunteering the last name — the wheel already handles the empty state.
- **Plan said App.tsx call site**: `recordSelection` is actually called in `RadialWheel.tsx`. Updated that file instead.

## Next Steps

- [ ] Open PR for `feat/volunteer-pick` against `main`
- [ ] Run E2E suite locally to verify the 3 new specs pass
- [ ] Consider adding a `HistoryItem.test.tsx` coverage case for the volunteer tag render

## Related Files

- **Plan**: [.claude/plans/session-29-volunteer-pick.md](../../plans/session-29-volunteer-pick.md)
- **Previous Session**: [Session 28 - CI E2E Path Filtering](session-28-ci-e2e-path-filtering.md)
