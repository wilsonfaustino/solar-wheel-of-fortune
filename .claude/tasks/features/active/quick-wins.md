# Quick Wins Backlog

**Status**: Active (scoped, not yet implemented)
**Branch**: `wilsonfaustino/quick_wins`
**Context**: Post-MVP scan of the codebase for low-effort, high-payoff items. Repo is MVP-complete, tests green, no lint debt, so these are cleanup and reach items rather than new features.

---

## 1. Un-skip list-management E2E tests

**Files**: `e2e/specs/03-list-management.spec.ts`, `e2e/pages/SidebarPage.ts`
**Effort**: ~45 min

Three tests are skipped:
- `03-list-management.spec.ts:13` - switch between lists (marked flaky)
- `03-list-management.spec.ts:33` - delete list with confirmation
- `03-list-management.spec.ts:53` - rename list inline

Root cause is the page object, not the tests. `SidebarPage.createList()` still installs a native `window.prompt` dialog handler (`SidebarPage.ts:75`), but list creation moved to a Radix dialog during the Radix migration. The `switchToList`/`deleteList`/`renameList` helpers each open with an "if dropdown is stuck open, press Escape" workaround, which is the flakiness the TODO refers to.

**Steps**:
- Replace the prompt handler in `createList` with Radix dialog interaction
- Fix confirm-button and inline-edit locators for `deleteList` / `renameList`
- Remove the Escape-if-stuck workarounds once locators wait on real dialog state
- Drop the three `test.skip` markers and their TODO comments
- Verify 0% flake over 3 consecutive runs (Session 25 precedent)

## 2. Un-skip stale sidebar integration test

**File**: `src/components/sidebar/NameManagementSidebar.integration.test.tsx`
**Effort**: ~20 min

`it.skip` at line 82 is blocked by an obsolete TODO at line 80: "Replace window.prompt() with proper Dialog component in NameManagementSidebar". That work is already done - `window.prompt` no longer appears anywhere in `src/`, and `ListSelector` uses `ConfirmDialog`.

**Steps**:
- Remove the `window.prompt` mock (line 12) and the stale TODO
- Remove `.skip`, rewrite assertions against the dialog
- Confirm the list isolation assertions still hold

## 3. Ship spin sound out of the feature flag

**Files**: `src/hooks/useSpinSound.ts`, `src/stores/useNameStore.ts`, SettingsPanel
**Effort**: ~40 min

Session 33 shipped the spin sound gated behind `?ff=sound` (`useSpinSound.ts:6`). It is unreachable for normal users. SettingsPanel already has the toggle pattern from Session 24/25 (auto-exclusion, clear-selection).

**Steps**:
- Add a persisted `soundEnabled` setting to the store
- Add one Switch to SettingsPanel
- Keep `?ff=sound` as an override or remove it once the toggle lands
- Unit tests for the new setting, E2E toggle test following `SettingsPage` page object

## 4. Migrate framer-motion to motion/react

**Files**: `src/App.tsx`, `src/components/sidebar/MobileSidebar.tsx`, `src/components/wheel/RadialWheel.tsx`, plus their tests
**Effort**: ~15 min

Already tracked in CLAUDE.md tech debt. `framer-motion` is the old name for the same codebase.

**Steps**:
- `bun remove framer-motion && bun add motion`
- Swap `from 'framer-motion'` to `from 'motion/react'` in 5 files
- Type check, test, build

## 5. Ratchet coverage thresholds

**File**: `vitest.config.ts:24-29`
**Effort**: ~10 min

Thresholds sit at lines 49 / functions 51 / branches 37 / statements 49, below actual coverage. Regressions can land without failing CI.

**Steps**:
- Run `bun test:coverage`, read actual numbers
- Set thresholds to actual minus 1 point of headroom
- Confirm CI still passes

---

## Sequencing

- 1 and 2 pair naturally: both restore list-management coverage, one branch
- 4 and 5 are mechanical and can ride along with any branch
- 3 is the only item that changes user-facing behavior, so it deserves its own PR

## Explicitly out of scope

- No TODO/FIXME debt elsewhere in `src/` or `e2e/`
- No native dialogs left to replace (ConfirmDialog migration complete)
- Pre-existing `act(...)` warnings in unit tests: noisy but non-blocking, not a quick win
