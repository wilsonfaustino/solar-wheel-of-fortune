# Session 33: Spin Sound Effect Behind Feature Flag

**Branch**: `feat/spin-sound-ff`
**Plan**: `.claude/plans/spin-sound-ff.md`
**Estimated Duration**: 45-60 min

## Session Goal

Play the Roletrando sound clip when the wheel starts spinning, gated behind a `?ff=sound` query-param feature flag. Hook-based implementation with unit tests. No E2E, no settings integration.

## Pre-Session Setup

```bash
git checkout main && git pull
git checkout -b feat/spin-sound-ff
bun test:run          # confirm baseline green
ls public/sounds/roletrando.mp3   # asset must exist (5.0s, ~81KB, created in planning session)
```

If the asset is missing, STOP and ask the user; do not attempt to download it.

## Phase 1: Commit the asset (5 min)

The asset was pre-created. Commit it alone:

```bash
git add public/sounds/roletrando.mp3
git commit -m "feat(sound): add roletrando spin sound asset"
```

## Phase 2: Hook + tests (25 min)

### 2a. Create `src/hooks/useSpinSound.ts`

```typescript
import { useCallback, useRef } from 'react';

const SPIN_SOUND_URL = '/sounds/roletrando.mp3';

function isSoundEnabled(): boolean {
  const featureFlags = new URLSearchParams(window.location.search).get('ff');
  return featureFlags?.split(',').includes('sound') ?? false;
}

export function useSpinSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpinSound = useCallback(() => {
    if (!isSoundEnabled()) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(SPIN_SOUND_URL);
    }
    audioRef.current.currentTime = 0;
    // rejection swallowed: sound must never break the spin
    audioRef.current.play().catch(() => {});
  }, []);

  return { playSpinSound };
}
```

Design constraints (do not "improve" these):
- `Audio` is created lazily on first play so flag-off users never fetch the mp3.
- Flag is read at play time, not mount time. No state, no reactivity.
- No volume/settings options. Out of scope.

### 2b. Export from barrel `src/hooks/index.ts`

Follow the existing export style in that file (check how `useKeyboardShortcuts` is exported).

### 2c. Create `src/hooks/useSpinSound.test.ts`

Vitest globals are enabled (no imports for `describe`/`it`/`vi`). Follow this structure:

```typescript
import { renderHook } from '@testing-library/react';
import { useSpinSound } from './useSpinSound';

describe('useSpinSound', () => {
  const playMock = vi.fn();
  let audioInstances: Array<{ src: string; play: typeof playMock; currentTime: number }>;

  beforeEach(() => {
    playMock.mockReset().mockResolvedValue(undefined);
    audioInstances = [];
    vi.stubGlobal(
      'Audio',
      vi.fn((src: string) => {
        const audioInstance = { src, play: playMock, currentTime: -1 };
        audioInstances.push(audioInstance);
        return audioInstance;
      })
    );
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('does not create or play audio when flag is absent', () => {
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });

  it('creates audio with the sound URL and plays when ?ff=sound', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/roletrando.mp3');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('recognizes the flag inside a comma-separated list', () => {
    window.history.replaceState(null, '', '/?ff=other,sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('reuses a single audio instance and resets currentTime on replay', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does not throw when play is rejected by the browser', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    playMock.mockRejectedValue(new Error('autoplay blocked'));
    const { result } = renderHook(() => useSpinSound());
    expect(() => result.current.playSpinSound()).not.toThrow();
  });
});
```

### 2d. Verify and commit

```bash
bun test:run
bun run tsc -b
git add src/hooks/useSpinSound.ts src/hooks/useSpinSound.test.ts src/hooks/index.ts
git commit -m "feat(hooks): add useSpinSound hook behind ff query flag"
```

## Phase 3: Wire into RadialWheel (10 min)

Edit `src/components/wheel/RadialWheel.tsx`:

1. Import `useSpinSound` from the hooks barrel.
2. Inside the component, near the existing hooks: `const { playSpinSound } = useSpinSound();`
3. In `handleSpin` (around line 29), call `playSpinSound();` immediately after the guard clause:

```typescript
const handleSpin = useCallback(() => {
  if (isSpinning || names.length === 0) return;
  playSpinSound();
  // ... existing spin logic unchanged
}, [isSpinning, names, rotation, playSpinSound]);
```

4. Add `playSpinSound` to the dependency array.

This is the single spin entry point; it covers both the center button click and the Space shortcut (ref-based). Do NOT touch `handleSelect` in `App.tsx`.

```bash
bun test:run && bun run tsc -b && bun run build
git add src/components/wheel/RadialWheel.tsx
git commit -m "feat(wheel): play spin sound on spin start"
```

## Phase 4: Manual verification (5 min)

```bash
bun dev
```

- Open `http://localhost:5173/?ff=sound`, spin: sound plays once, spin unaffected.
- Open `http://localhost:5173/`, spin: silent.
- Network tab with no flag: `roletrando.mp3` is NOT fetched.

## Phase 5: Docs + PR (10 min)

1. Create `.claude/tasks/sessions/session-33-spin-sound.md` following the template of `session-32-coverage-improvements.md` (overview, what was done, files modified, commits, verification, key learnings, next steps).
2. Add the session entry to `.claude/tasks/README.md`.

```bash
git add .claude/tasks/sessions/session-33-spin-sound.md .claude/tasks/README.md
git commit -m "docs(tasks): document session 33 spin sound feature"
```

Ask the user before pushing or opening a PR. Suggested PR title: `feat: spin sound effect behind ff query flag`.

## Post-Session Checklist

- [ ] `bun run ci` clean
- [ ] `bun run tsc -b` clean
- [ ] `bun test:run` green (baseline + 5 new tests)
- [ ] `bun run build` succeeds
- [ ] Manual check done with and without `?ff=sound`
- [ ] 4 atomic commits as listed
- [ ] Coverage thresholds still met (`bun test:coverage`)

## Troubleshooting

- **`window.location.search` empty in tests**: use `window.history.replaceState(null, '', '/?ff=sound')` BEFORE `renderHook`; jsdom supports same-origin URL changes.
- **Unhandled rejection warning in rejection test**: the `.catch(() => {})` inside the hook must be attached synchronously to the `play()` promise; if the warning appears, check the hook, not the test.
- **Biome complains about empty arrow function**: keep `catch(() => {})`; if the rule fires, add the inline comment shown in the hook code (comment already justifies it).
- **Coverage drop**: hook is fully covered by the 5 tests; if thresholds fail, something else regressed; investigate before lowering thresholds.

## Out of Scope (do not add)

Settings toggle, volume control, generic feature-flag utility, E2E audio test, preload hints, stopping sound at winner reveal.

## Next Session

None planned for this feature. If the flag graduates to a real user setting, integrate with `useSettingsStore` + `SettingsPanel` in a future session.
