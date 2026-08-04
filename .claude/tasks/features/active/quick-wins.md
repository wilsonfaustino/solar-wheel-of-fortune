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

## 2. Un-skip stale sidebar integration test (DONE)

**File**: `src/components/sidebar/NameManagementSidebar.integration.test.tsx`
**Effort**: ~20 min

`it.skip` at line 82 was blocked by a TODO claiming `window.prompt` needed replacing first. The skip was unnecessary: the test already stubs `prompt` in `beforeEach`, so it runs as-is. Two assertions were stale against the post-Radix `ListSelector`:

- Switching lists clicks the inner button inside the `menuitem`, not the `menuitem` itself (`ListSelector.tsx:124`, `onSelect` is preventDefault'd)
- Delete actions only render for *inactive* lists (`ListSelector.tsx:137`), and `ConfirmDialog` only appears when the list has more than 5 names, so deleting a 2-name list is immediate with no dialog

**Correction to the original scoping**: `prompt()` is *still* live at `NameManagementSidebar.tsx:61`. The mock stays until that refactor lands - see item 6.

## 6. Replace list-creation `prompt()` with a Radix dialog (DONE)

**Files**: `src/components/sidebar/NameManagementSidebar.tsx:61`, `e2e/pages/SidebarPage.ts`
**Effort**: ~40 min

The only native dialog left in `src/`. Blocks removing the `prompt` stub from the sidebar integration test, and item 1's `createList` page-object fix depends on which direction this goes.

**How it landed**: the dialog lives inside `ListSelector` rather than as a shared component - it has one call site, and `ListSelector` already owns the delete `ConfirmDialog`. `NameManagementSidebar` now passes the `createList` store action straight through, so its `prompt` callback is gone. `prompt(` no longer appears anywhere in `src/` or `e2e/`.

**Correction to the original scoping**: item 1's `createList` page-object fix is done as part of this - `SidebarPage.createList()` drives the dialog and its E2E test passes. The three `test.skip` markers in `03-list-management.spec.ts` are still open.

## 3. Ship spin sound out of the feature flag (DONE)

**Files**: `src/hooks/useSpinSound.ts`, `src/stores/useNameStore.ts`, SettingsPanel
**Effort**: ~40 min

Session 33 shipped the spin sound gated behind `?ff=sound` (`useSpinSound.ts:6`). It is unreachable for normal users. SettingsPanel already has the toggle pattern from Session 24/25 (auto-exclusion, clear-selection).

**Steps**:
- Add a persisted `soundEnabled` setting to the store
- Add one Switch to SettingsPanel
- Keep `?ff=sound` as an override or remove it once the toggle lands
- Unit tests for the new setting, E2E toggle test following `SettingsPage` page object

**How it landed**: The `?ff=sound` flag was removed outright rather than kept as an override. Sound is now gated on a persisted `soundEnabled` setting that is toggled from the AUDIO section of the Settings tab (default off).

## 4. Migrate framer-motion to motion/react (DONE)

**Files**: `src/App.tsx`, `src/components/sidebar/MobileSidebar.tsx`, `src/components/wheel/RadialWheel.tsx`, plus their tests
**Effort**: ~15 min

Already tracked in CLAUDE.md tech debt. `framer-motion` is the old name for the same codebase.

**Steps**:
- `bun remove framer-motion && bun add motion`
- Swap `from 'framer-motion'` to `from 'motion/react'` in 5 files
- Type check, test, build

**How it landed**: `motion@12.43.0` replaced `framer-motion@12.23.25`. Seven files touched - five import sites plus the two `vi.mock('framer-motion')` targets in `MobileSidebar.test.tsx` and `RadialWheel.test.tsx`, which the original scoping missed. Biome re-sorted one import. No API changes, all 323 unit tests and 34 E2E tests pass.

## 5. Ratchet coverage thresholds (DONE)

**File**: `vitest.config.ts:24-29`
**Effort**: ~10 min

Thresholds sit at lines 49 / functions 51 / branches 37 / statements 49, below actual coverage. Regressions can land without failing CI.

**Steps**:
- Run `bun test:coverage`, read actual numbers
- Set thresholds to actual minus 1 point of headroom
- Confirm CI still passes

**How it landed**: actual coverage was statements 92.9 / branches 81.69 / functions 93.33 / lines 93.5, roughly 45 points above the configured floor. Thresholds now sit at lines 92, functions 92, branches 80, statements 91. CLAUDE.md claimed "45% threshold" in two places against a config that read 49 - both corrected.

---

## Sequencing

- 1 and 2 pair naturally: both restore list-management coverage, one branch
- ~~4 and 5 are mechanical and can ride along with any branch~~ - shipped together
- 3 is the only item that changes user-facing behavior, so it deserves its own PR

**Remaining**: item 1 only.

## Explicitly out of scope

- No TODO/FIXME debt elsewhere in `src/` or `e2e/`
- ~~No native dialogs left to replace (ConfirmDialog migration complete)~~ - wrong, see item 6
- Pre-existing `act(...)` warnings in unit tests: noisy but non-blocking, not a quick win
