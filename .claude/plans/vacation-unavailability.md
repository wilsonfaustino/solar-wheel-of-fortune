# Session 35: Vacation unavailability (date range)

Branch: `wilsonfaustino/manage-people-unavailable-on-vacations` (existing worktree branch, no new branch)

## Goal

Mark person unavailable for date range (FROM/TO). Replace today-only mark. Row icon opens modal.

## Decisions (from interview)

- One range per person. New range replaces old.
- Model: replace `unavailableOn` with `unavailableFrom?` + `unavailableUntil?` (local ISO days `YYYY-MM-DD`).
- Legacy `unavailableOn` data: dropped, no migration.
- Existing UserCheck/UserX icon opens Radix Dialog (no direct toggle).
- Modal: TODAY ONLY button (saves today..today, closes), FROM/TO inputs, SAVE, MARK AVAILABLE, CANCEL.
- Existing range still active (`until >= today`): inputs prefilled, MARK AVAILABLE shown. Includes future ranges (modal = only place to see them).
- Ended range (`until < today`): treat as none. Prefill today/today, hide MARK AVAILABLE.
- Future range: no row indicator. Row available, wheel unaffected until FROM.
- Active range: grey row + UserX (as now) + badge `BACK <until + 1>`.
- Validation, SAVE disabled + one-line reason:
  - TO >= FROM
  - TO >= today
  - span <= 30 days, inclusive (Oct 1..Oct 30 = 30 ok, Oct 1..Oct 31 = 31 fail). Span via `Date.UTC(y, m-1, d)` diff, DST-safe.
  - FROM in past allowed.
- Native `min`/`max` on inputs = UX hint only. SAVE gates on util.

## No change needed (keep `isUnavailableToday(name, today)` signature)

`RadialWheel.tsx`, `NameLabel.tsx`, `App.tsx` auto-exclude, store `volunteerName`, `NameListDisplay` counts.

## Steps

1. Type + util + store (one commit, fixtures updated same commit so suite passes)
   - `types/name.ts`: `unavailableFrom?`, `unavailableUntil?`
   - `utils/name.ts`: `isUnavailableToday` body -> `from <= today && today <= until` (string compare). Add `validateUnavailabilityRange(from, until, today)` -> reason string or null.
   - `useNameStore.ts`: replace `toggleUnavailableToday` with `setUnavailability(nameId, from, until)` + `clearUnavailability(nameId)`. `resetList` clears both.
   - Tests: `utils/name.test.ts` (range edges, cap 30/31, DST month, past FROM), `useNameStore.test.ts`, fixtures in `App.test.tsx`, `RadialWheel.test.tsx`, `NameListDisplay.test.tsx`.
   - -> verify: `bun test:run`, `bun run tsc -b` pass
   - commit: `feat(names): replace unavailable-today with date range`

2. Space shortcut guard
   - `useKeyboardShortcuts.ts`: skip Space when target inside `[role="dialog"]`. Today Space on dialog button spins wheel and blocks button click (also hits ExportModal).
   - Test in hook test file.
   - -> verify: new test fails before, passes after
   - commit: `fix(shortcuts): ignore space inside dialogs`

3. Dialog component
   - New `sidebar/UnavailabilityDialog.tsx`. Copy `ExportModal` structure (Portal, Overlay, Title, sr-only `Dialog.Description`). Buttons use `Button` tech variants.
   - New `UnavailabilityDialog.test.tsx`: prefill active, prefill ended, TODAY ONLY, SAVE, MARK AVAILABLE, each validation reason. Coverage threshold 92.
   - -> verify: `bun test:run` pass, coverage >= thresholds
   - commit: `feat(sidebar): add unavailability dialog`

4. Wire row
   - `NameListItem.tsx`: icon opens dialog. aria-label `Set availability for <name>`. Badge `BACK MM/DD` when active. Props `onSetUnavailability`, `onClearUnavailability` replace `onToggleUnavailable`.
   - `NameListDisplay.tsx`, `NameManagementSidebar.tsx`: pass new props.
   - Update `NameListItem.test.tsx`, `NameListDisplay.test.tsx`.
   - -> verify: `bun test:run`, `bun run ci`
   - commit: `feat(sidebar): open unavailability dialog from name rows`

5. E2E
   - `e2e/pages/SidebarPage.ts`: new locators (aria-label change), helpers `markUnavailableToday`, `setUnavailability(from, to)`.
   - Rename/extend `14-unavailable-today.spec.ts` -> `14-unavailability.spec.ts`: today only, range skips wheel, MARK AVAILABLE restores.
   - -> verify: `bun run test:e2e` pass
   - commit: `test(e2e): cover unavailability date range`

6. Docs
   - CLAUDE.md store action list, session prompt + session doc (Session 35).
   - commit: `docs(session): document Session 35 vacation unavailability`

## Resolved questions

1. Badge date format: browser locale (`toLocaleDateString`, month + day).
2. TODAY ONLY shows `BACK <tomorrow>` badge: keep.
3. Step 2 Space fix stays in this PR.
