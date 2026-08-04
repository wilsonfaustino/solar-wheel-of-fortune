# Spin Sound Setting (replaces URL feature flag)

Date: 2026-08-04
Branch: `wilsonfaustino/Add-sound-fx-toggle-in-Settings`

## Problem

Spin sound is gated by a URL query param (`?ff=sound`, Session 33). The flag is
undiscoverable, does not persist across navigation, and has no UI. Users cannot
turn spin sound on or off.

## Goal

Gate spin sound on a persisted global setting exposed as a toggle in the
Settings tab. Remove the URL feature flag.

## Decisions

- Toggle lives in a new `AUDIO` section in `SettingsPanel`, not under
  `WHEEL BEHAVIOR`. Sound is not wheel behavior.
- The URL flag is removed entirely, not kept as an override. No user for it.
- Default is `false`, matching current behavior (flag off unless opted in).
  Existing users get no surprise audio.

## Design

### Store: `src/stores/useSettingsStore.ts`

Add to `SettingsState`:

- `soundEnabled: boolean` — initial value `false`
- `setSoundEnabled: (enabled: boolean) => void`

Persisted under the existing `settings-storage` key. Zustand `persist` merges
the persisted object over the initial state, so users with an existing
`settings-storage` entry (which lacks `soundEnabled`) fall back to `false`. No
migration or version bump needed.

### Hook: `src/hooks/useSpinSound.ts`

- Delete `isSoundEnabled()` and the `URLSearchParams` read.
- Inside `playSpinSound`, read `useSettingsStore.getState().soundEnabled` and
  return early when false.

Reading via `getState()` rather than a selector keeps `playSpinSound`'s identity
stable, so toggling the setting does not re-render `RadialWheel`. The value is
only needed at call time, never during render.

The lazy `new Audio(...)` construction, `currentTime = 0` reset, and swallowed
`play()` rejection are unchanged.

### UI: `src/components/sidebar/SettingsPanel.tsx`

- Rename the local `SwitchSettings` props `autoExcludeEnabled` → `checked` and
  `setAutoExclude` → `onCheckedChange`. The component is generic; the current
  names describe only its first caller and become actively misleading with a
  third caller. Update both existing call sites.
- Add a second section below `WHEEL BEHAVIOR`, header `AUDIO`, matching the
  existing header markup and spacing.
- One `SwitchSettings` inside it:
  - name: `sound-enabled`
  - title / aria-label: `Spin sound`
  - description: `Play a sound effect when the wheel spins`
- Extend the `useShallow` selector with `soundEnabled` and `setSoundEnabled`.

No other component changes. `RadialWheel` keeps calling `playSpinSound()`.

## Testing

- `src/stores/useSettingsStore.test.ts` — `soundEnabled` defaults to `false`;
  `setSoundEnabled` updates it.
- `src/hooks/useSpinSound.test.ts` — replace the URL-flag cases: plays when
  `soundEnabled` is true, does not construct or play `Audio` when false. Keep
  the existing Audio constructor stub (regular function, not arrow, with the
  Biome suppression) and the play-rejection case.
- `src/components/sidebar/SettingsPanel.test.tsx` — sound switch renders,
  toggling calls `setSoundEnabled`.
- `e2e/pages/SettingsPage.ts` + spec — toggle sound on, reload, assert it stayed
  on.

## Out of scope

- Volume control, per-sound settings, additional sound effects.
- A generic feature-flag framework. The `?ff=` convention loses its only
  consumer here; note that in project docs rather than building around it.

## Commits

1. `feat(settings): add soundEnabled to settings store`
2. `refactor(sound): gate spin sound on settings store instead of url flag`
3. `feat(settings): add audio section with spin sound toggle`
4. `test(e2e): cover spin sound toggle persistence`
5. `docs(tasks): document sound setting session`
