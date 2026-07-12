# Plan: Spin Sound Effect Behind Feature Flag (Session 33)

**Branch**: `feat/spin-sound-ff`
**Session**: 33
**Estimated Duration**: 45-60 min
**Executor**: Sonnet session via `.claude/tasks/prompts/session-33-spin-sound-prompt.md`

## Context

Play the "Roletrando" sound (Silvio Santos: "roda a roleta!" + roulette jingle) when the wheel starts spinning, gated behind a query-param feature flag `?ff=sound`. Asset already prepared in pre-session setup: `public/sounds/roletrando.mp3` (5.0s, 81KB, fade-out at 4.6s).

## Decisions (approved in planning session)

- **Sound**: Roletrando clip, first 5 seconds of source video, fade-out applied.
- **Playback**: play once on spin start. No cut-off at winner reveal, no looping.
- **Flag**: `?ff=sound` query param, comma-list tolerant (`?ff=sound,other` works). Read at play time, no reactivity, no settings-store integration.
- **Approach**: dedicated `useSpinSound` hook in `src/hooks/` (project pattern), unit tests with mocked `Audio`. No E2E (asserting audio in Playwright is flaky and low-value).
- **Autoplay policy**: spin is always a user gesture (click or Space), so `play()` is allowed; rejection is swallowed anyway.

## Implementation Phases

### Phase 1: Hook + tests
- Create `src/hooks/useSpinSound.ts`:
  - `isSoundEnabled()` module helper reading `window.location.search`
  - lazy `Audio` init in `useRef` on first play (no mp3 fetch for flag-off users)
  - `currentTime = 0` reset before each play (rapid respins)
  - `.play().catch(() => {})` so autoplay rejection never breaks the spin
- Export from `src/hooks/index.ts` barrel
- Create `src/hooks/useSpinSound.test.ts` (5 tests, mocked `Audio` constructor)

### Phase 2: Wiring
- `src/components/wheel/RadialWheel.tsx`: call `playSpinSound()` inside `handleSpin` after the guard clause (single call site covers click and Space)

### Phase 3: Docs
- Session doc `.claude/tasks/sessions/session-33-spin-sound.md`
- Update `.claude/tasks/README.md`

## Files

| File | Change |
|------|--------|
| `public/sounds/roletrando.mp3` | New asset (pre-created) |
| `src/hooks/useSpinSound.ts` | New hook |
| `src/hooks/useSpinSound.test.ts` | New tests |
| `src/hooks/index.ts` | Barrel export |
| `src/components/wheel/RadialWheel.tsx` | Call hook in `handleSpin` |
| `.claude/tasks/sessions/session-33-spin-sound.md` | Session doc |
| `.claude/tasks/README.md` | Session entry |

## Atomic Commits

1. `feat(sound): add roletrando spin sound asset`
2. `feat(hooks): add useSpinSound hook behind ff query flag`
3. `feat(wheel): play spin sound on spin start`
4. `docs(tasks): document session 33 spin sound feature`

## Success Criteria

- [ ] `bun run tsc -b` clean
- [ ] `bun run ci` clean
- [ ] `bun test:run` all green (existing + 4 new)
- [ ] `bun run build` succeeds
- [ ] Manual: `bun dev`, open `http://localhost:5173/?ff=sound`, spin plays sound; without param, silent
- [ ] Coverage does not drop below thresholds

## Explicitly Out of Scope (YAGNI)

- Settings panel toggle / volume control
- Generic feature-flag utility (add when a second flag exists)
- E2E test for audio
- Preload hints, sound sprite, multiple sounds
- Stopping sound at winner reveal

## Unresolved Questions

None. All decisions approved in planning session (2026-07-12).
