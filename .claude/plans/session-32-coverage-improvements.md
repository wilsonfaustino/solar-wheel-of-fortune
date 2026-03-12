# Session 32: Coverage Improvements

## Context

Five files have coverage below project quality standards. Goal: bring each to ≥70% (lines/funcs/stmts) to improve overall project coverage and SonarQube quality gate scores.

## Branch

`test/coverage-improvements`

## Files & Targets

| File | Current | Target | Action |
|------|---------|--------|--------|
| `src/components/MobileHeader.tsx` | 0% | ~90% | New test file |
| `src/hooks/useMediaQuery.ts` | 0% | ~80% | New test file |
| `src/components/sidebar/ListSelector.tsx` | 25% | ~70% | New test file |
| `src/components/wheel/RadialWheel.tsx` | 43% | ~70% | Extend existing tests |
| `src/components/toast/showSelectionToast.tsx` | 50% | ~80% | Extend existing tests |

## Implementation

### 1. `src/components/MobileHeader.test.tsx` (new)

Uncovered: lines 9-46 (entire component).

Tests:
- renders title "SOLAR WHEEL"
- renders menu button with aria-label "Open menu"
- calls `onToggleSidebar` on click

### 2. `src/hooks/useMediaQuery.test.ts` (new)

Uncovered: lines 10-42 (entire hook body).

Setup: mock `window.matchMedia` via `vi.fn()` — happy-dom doesn't implement it.

Tests:
- returns `{ isSmallScreen: false, isMediumScreen: false, isLargeScreen: true }` by default (≥1024px)
- updates `isSmallScreen` when media query matches (<640px)
- updates `isMediumScreen` when media query matches (640-1023px)
- adds event listener on mount; removes on unmount

Pattern: mock `window.matchMedia` in `beforeEach`, restore in `afterEach`; trigger listener callback manually to simulate resize.

### 3. `src/components/sidebar/ListSelector.test.tsx` (new)

Uncovered: lines 41,44,47 (small state branches), 56-59 (edit mode enter/exit), 103-187 (create list, delete flow, rename flow).

Setup: `useNameStore.setState(...)` with 2+ lists in `beforeEach`.

Tests (targeting uncovered lines):
- renders active list title in trigger button
- shows all lists in dropdown when opened
- calls `setActiveList` when non-active list clicked
- enters edit mode when edit button clicked (line 56-59)
- saves rename on blur / Enter key (line ~103)
- cancels rename on Escape (line ~44)
- creates new list when "CREATE NEW LIST" clicked (line ~120)
- shows delete confirmation dialog when delete clicked on list with names (line ~140)
- prevents deleting last remaining list (line ~150)
- deletes list when confirmed (line ~160)

Note: Radix DropdownMenu uses portals — check if happy-dom handles them or if `vi.mock` is needed.

### 4. `src/components/wheel/RadialWheel.test.tsx` (extend existing)

Uncovered: lines 30-38 (imperative `spinWheel` handle), 43-45 (reduce motion branch), 67-73 (post-spin `onSelect` callback).

Tests to add:
- `spinWheel` ref method triggers rotation update — use `createRef` + `act()`
- `prefersReducedMotion` true → duration 0 — mock `useReducedMotion` from `framer-motion`
- after spin completes, `onSelect` called with correct name index

### 5. `src/components/toast/showSelectionToast.test.tsx` (extend existing)

Uncovered: line 10 (specific branch in `toast()` call). Read existing file first to identify gap, then add missing case.

## Commit Strategy

```
test(mobile-header): add unit tests for MobileHeader component
test(hooks): add unit tests for useMediaQuery hook
test(list-selector): add unit tests for ListSelector component
test(wheel): extend RadialWheel tests for spin handle and callbacks
test(toast): cover missing branch in showSelectionToast
docs(tasks): add session-32 coverage improvements documentation
```

## Verification

```bash
bun test:run        # all tests pass
bun test:coverage   # confirm per-file coverage improved
```

Success criteria: each file reaches ≥70% lines/funcs/stmts; overall coverage increases from 82.84%.

## Unresolved Questions

1. `ListSelector.tsx` — Radix DropdownMenu portal rendering: does happy-dom handle it or is `vi.mock` needed?
2. `RadialWheel.tsx` lines 43-45 — confirm `useReducedMotion` is mockable via `vi.mock('framer-motion', ...)`.
3. `showSelectionToast.tsx` line 10 — read existing test file before implementing to identify exact uncovered branch.
