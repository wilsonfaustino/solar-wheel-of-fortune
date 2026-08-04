# Spin Sound Setting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `?ff=sound` URL feature flag with a persisted `soundEnabled` setting, exposed as a toggle in a new AUDIO section of the Settings tab.

**Architecture:** `useSettingsStore` (Zustand + `persist`) gains a `soundEnabled` boolean defaulting to `false`. `useSpinSound` reads it via `useSettingsStore.getState()` at call time instead of parsing the URL, keeping its returned callback identity stable. `SettingsPanel` renders a third `SwitchSettings` under a new AUDIO header.

**Tech Stack:** React 19, TypeScript strict, Zustand (persist middleware), Vitest + React Testing Library, Playwright, Biome, Bun.

**Spec:** `docs/superpowers/specs/2026-08-04-sound-setting-design.md`

## Global Constraints

- Package manager is Bun. Run tests with `bun test:run`, type check with `bun run tsc -b`, lint with `bun run ci`.
- Conventional commits, title under 100 chars, format `<type>(<scope>): <description>`.
- Never add `Co-Authored-By` trailers. Never use `git add -A` or `git add .` — stage named files only.
- Vitest globals are enabled (`describe`, `it`, `test`, `expect`, `vi`, `beforeEach` need no import in most files; `useSettingsStore.test.ts` imports them explicitly — keep that file's existing import style).
- The persisted localStorage key is `settings-storage`. Do not rename it and do not add a `version`/`migrate` — Zustand's default merge fills missing keys from initial state.
- Setting default for sound is `false`.
- No emojis anywhere. Comment only non-obvious logic.

---

### Task 1: Add `soundEnabled` to the settings store

**Files:**
- Modify: `src/stores/useSettingsStore.ts`
- Test: `src/stores/useSettingsStore.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `useSettingsStore` state gains `soundEnabled: boolean` (default `false`) and `setSoundEnabled: (enabled: boolean) => void`. Tasks 2 and 3 both depend on these exact names.

- [ ] **Step 1: Write the failing tests**

In `src/stores/useSettingsStore.test.ts`, add `soundEnabled: false` to the reset block in `beforeEach` so it reads:

```typescript
  beforeEach(() => {
    // Reset store to default state before each test
    const state = useSettingsStore.getState();
    state.autoExcludeEnabled = true;
    state.clearSelectionAfterExclude = false;
    state.soundEnabled = false;
  });
```

Add this test inside the existing `describe('initial state', ...)` block:

```typescript
    test('should have soundEnabled set to false by default', () => {
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);
    });
```

Add this new describe block after `describe('setClearSelectionAfterExclude', ...)`:

```typescript
  describe('setSoundEnabled', () => {
    test('should enable sound when set to true', () => {
      const { setSoundEnabled } = useSettingsStore.getState();

      setSoundEnabled(true);

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
    });

    test('should disable sound when set to false', () => {
      const { setSoundEnabled } = useSettingsStore.getState();

      setSoundEnabled(true);
      setSoundEnabled(false);

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);
    });

    test('changing sound should not affect autoExclude', () => {
      const { setSoundEnabled } = useSettingsStore.getState();

      setSoundEnabled(true);

      const state = useSettingsStore.getState();
      expect(state.autoExcludeEnabled).toBe(true);
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test:run src/stores/useSettingsStore.test.ts`
Expected: FAIL. TypeScript/runtime errors on `state.soundEnabled` being undefined and `setSoundEnabled is not a function`.

- [ ] **Step 3: Write the implementation**

Replace the whole contents of `src/stores/useSettingsStore.ts` with:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoExcludeEnabled: boolean;
  clearSelectionAfterExclude: boolean;
  soundEnabled: boolean;

  setAutoExclude: (enabled: boolean) => void;
  setClearSelectionAfterExclude: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoExcludeEnabled: true,
      clearSelectionAfterExclude: false,
      soundEnabled: false,

      setAutoExclude: (enabled) => set({ autoExcludeEnabled: enabled }),
      setClearSelectionAfterExclude: (enabled) => set({ clearSelectionAfterExclude: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    }),
    { name: 'settings-storage' }
  )
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test:run src/stores/useSettingsStore.test.ts`
Expected: PASS, all tests in the file.

- [ ] **Step 5: Type check**

Run: `bun run tsc -b`
Expected: no output, exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/stores/useSettingsStore.ts src/stores/useSettingsStore.test.ts
git commit -m "feat(settings): add soundEnabled to settings store"
```

---

### Task 2: Gate spin sound on the setting, remove the URL flag

**Files:**
- Modify: `src/hooks/useSpinSound.ts`
- Test: `src/hooks/useSpinSound.test.ts`

**Interfaces:**
- Consumes: `useSettingsStore` with `soundEnabled` and `setSoundEnabled` from Task 1.
- Produces: `useSpinSound()` still returns `{ playSpinSound: () => void }` with an unchanged signature. `RadialWheel` needs no edit.

Background: today the hook decides via `new URLSearchParams(window.location.search).get('ff')`. That helper is deleted. The new read uses `useSettingsStore.getState().soundEnabled` **inside** the callback rather than a `useSettingsStore((state) => state.soundEnabled)` selector, so `playSpinSound` keeps a stable identity and toggling the setting does not re-render `RadialWheel`. The value is only needed at call time.

- [ ] **Step 1: Rewrite the test file**

Replace the whole contents of `src/hooks/useSpinSound.test.ts` with:

```typescript
import { renderHook } from '@testing-library/react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useSpinSound } from './useSpinSound';

describe('useSpinSound', () => {
  const playMock = vi.fn();
  let audioInstances: Array<{ src: string; play: typeof playMock; currentTime: number }>;

  beforeEach(() => {
    playMock.mockReset().mockResolvedValue(undefined);
    audioInstances = [];
    vi.stubGlobal(
      'Audio',
      // biome-ignore lint/complexity/useArrowFunction: mock must be constructable (called with `new Audio(...)`)
      vi.fn(function (src: string) {
        const audioInstance = { src, play: playMock, currentTime: -1 };
        audioInstances.push(audioInstance);
        return audioInstance;
      })
    );
    useSettingsStore.setState({ soundEnabled: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useSettingsStore.setState({ soundEnabled: false });
  });

  it('does not create or play audio when the sound setting is off', () => {
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });

  it('creates audio with the sound URL and plays when the sound setting is on', () => {
    useSettingsStore.setState({ soundEnabled: true });
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/roletrando.mp3');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('picks up a setting change without re-rendering the hook', () => {
    const { result } = renderHook(() => useSpinSound());
    const initialCallback = result.current.playSpinSound;

    result.current.playSpinSound();
    expect(playMock).not.toHaveBeenCalled();

    useSettingsStore.setState({ soundEnabled: true });
    result.current.playSpinSound();

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(result.current.playSpinSound).toBe(initialCallback);
  });

  it('reuses a single audio instance and resets currentTime on replay', () => {
    useSettingsStore.setState({ soundEnabled: true });
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does not throw when play is rejected by the browser', () => {
    useSettingsStore.setState({ soundEnabled: true });
    playMock.mockRejectedValue(new Error('autoplay blocked'));
    const { result } = renderHook(() => useSpinSound());
    expect(() => result.current.playSpinSound()).not.toThrow();
  });

  it('ignores the legacy ff=sound url flag', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(playMock).not.toHaveBeenCalled();
    window.history.replaceState(null, '', '/');
  });
});
```

Note the third test asserts callback stability — that is the whole reason for the `getState()` read, so it is worth locking in.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test:run src/hooks/useSpinSound.test.ts`
Expected: FAIL. The "plays when the sound setting is on" and "picks up a setting change" tests fail because the implementation still reads the URL, so `playMock` is never called.

- [ ] **Step 3: Write the implementation**

Replace the whole contents of `src/hooks/useSpinSound.ts` with:

```typescript
import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

const SPIN_SOUND_URL = '/sounds/roletrando.mp3';

export function useSpinSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpinSound = useCallback(() => {
    // read at call time so the callback identity stays stable across setting changes
    if (!useSettingsStore.getState().soundEnabled) return;
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test:run src/hooks/useSpinSound.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Confirm the flag is gone**

Run: `grep -rn "ff=sound\|isSoundEnabled" src e2e`
Expected: no matches.

- [ ] **Step 6: Type check and lint**

Run: `bun run tsc -b && bun run ci`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useSpinSound.ts src/hooks/useSpinSound.test.ts
git commit -m "refactor(sound): gate spin sound on settings store instead of url flag"
```

---

### Task 3: Add the AUDIO section toggle to SettingsPanel

**Files:**
- Modify: `src/components/sidebar/SettingsPanel.tsx`
- Test: `src/components/sidebar/SettingsPanel.test.tsx`

**Interfaces:**
- Consumes: `soundEnabled` / `setSoundEnabled` from Task 1.
- Produces: a switch with `id="sound-enabled"` and accessible name `Spin sound`. Task 4's Playwright page object locates it by that id.

Two changes here. First, the local `SwitchSettings` helper has props named `autoExcludeEnabled` and `setAutoExclude` even though it is a generic switch row; with a third, unrelated caller those names actively mislead, so rename them to `checked` and `onCheckedChange`. Second, add the AUDIO section.

- [ ] **Step 1: Write the failing tests**

In `src/components/sidebar/SettingsPanel.test.tsx`, add `soundEnabled: false` to the `beforeEach` reset so it reads:

```typescript
  beforeEach(() => {
    // Reset store to default state before each test
    useSettingsStore.setState({
      autoExcludeEnabled: true,
      clearSelectionAfterExclude: false,
      soundEnabled: false,
    });
  });
```

Add these tests inside the existing `describe('rendering', ...)` block:

```typescript
    it('should render the audio section header', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('AUDIO')).toBeInTheDocument();
    });

    it('should render the spin sound toggle', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Spin sound')).toBeInTheDocument();
      expect(screen.getByText('Play a sound effect when the wheel spins')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Spin sound' })).toBeInTheDocument();
    });
```

Add this new describe block after `describe('clear selection toggle interactions', ...)`:

```typescript
  describe('spin sound toggle interactions', () => {
    it('should be off by default', () => {
      render(<SettingsPanel />);

      expect(screen.getByRole('switch', { name: 'Spin sound' })).toHaveAttribute(
        'data-state',
        'unchecked'
      );
    });

    it('should enable sound when clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const soundSwitch = screen.getByRole('switch', { name: 'Spin sound' });
      await user.click(soundSwitch);

      expect(useSettingsStore.getState().soundEnabled).toBe(true);
      expect(soundSwitch).toHaveAttribute('data-state', 'checked');
    });

    it('should disable sound when clicked while enabled', async () => {
      useSettingsStore.setState({ soundEnabled: true });
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const soundSwitch = screen.getByRole('switch', { name: 'Spin sound' });
      expect(soundSwitch).toHaveAttribute('data-state', 'checked');

      await user.click(soundSwitch);

      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });

    it('should be clickable via label', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByText('Spin sound'));

      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('should stay visible when auto-exclude is off', () => {
      useSettingsStore.setState({ autoExcludeEnabled: false });
      render(<SettingsPanel />);

      expect(screen.getByRole('switch', { name: 'Spin sound' })).toBeInTheDocument();
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test:run src/components/sidebar/SettingsPanel.test.tsx`
Expected: FAIL. `Unable to find an element with the text: AUDIO` and `Unable to find an accessible element with the role "switch" and name "Spin sound"`.

- [ ] **Step 3: Write the implementation**

Replace the whole contents of `src/components/sidebar/SettingsPanel.tsx` with:

```typescript
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface SwitchSettingsProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  name: string;
  a11yLabel: string;
  title: string;
  description: string;
}

function SwitchSettings({
  checked,
  onCheckedChange,
  name,
  a11yLabel,
  title,
  description,
}: SwitchSettingsProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group" htmlFor={name}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={a11yLabel}
        id={name}
      />
      <div className="flex-1">
        <div className="text-sm font-mono text-text group-hover:text-accent transition-colors">
          {title}
        </div>
        <div className="text-xs text-text/50 mt-0.5">{description}</div>
      </div>
    </label>
  );
}

function SettingsPanelComponent() {
  const {
    autoExcludeEnabled,
    clearSelectionAfterExclude,
    soundEnabled,
    setAutoExclude,
    setClearSelectionAfterExclude,
    setSoundEnabled,
  } = useSettingsStore(
    useShallow((state) => ({
      autoExcludeEnabled: state.autoExcludeEnabled,
      clearSelectionAfterExclude: state.clearSelectionAfterExclude,
      soundEnabled: state.soundEnabled,
      setAutoExclude: state.setAutoExclude,
      setClearSelectionAfterExclude: state.setClearSelectionAfterExclude,
      setSoundEnabled: state.setSoundEnabled,
    }))
  );

  return (
    <div className="px-4 py-4 border-b border-b-white/10">
      <div className="text-xs font-mono tracking-wider mb-4 text-text/70">WHEEL BEHAVIOR</div>

      <div className="space-y-4">
        {/* Auto-exclude toggle */}
        <SwitchSettings
          checked={autoExcludeEnabled}
          onCheckedChange={setAutoExclude}
          name="auto-exclude"
          a11yLabel="Auto-exclude after selection"
          title="Auto-exclude after selection"
          description="Automatically exclude selected names from future spins"
        />

        {/* Clear selection toggle - only visible when auto-exclude is enabled */}
        {autoExcludeEnabled && (
          <SwitchSettings
            checked={clearSelectionAfterExclude}
            onCheckedChange={setClearSelectionAfterExclude}
            name="clear-selection-after-exclude"
            a11yLabel="Clear selection after exclusion"
            title="Clear selection after exclusion"
            description="Deselect names automatically after they are excluded"
          />
        )}
      </div>

      <div className="text-xs font-mono tracking-wider mt-6 mb-4 text-text/70">AUDIO</div>

      <div className="space-y-4">
        <SwitchSettings
          checked={soundEnabled}
          onCheckedChange={setSoundEnabled}
          name="sound-enabled"
          a11yLabel="Spin sound"
          title="Spin sound"
          description="Play a sound effect when the wheel spins"
        />
      </div>
    </div>
  );
}

export const SettingsPanel = memo(SettingsPanelComponent);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test:run src/components/sidebar/SettingsPanel.test.tsx`
Expected: PASS. Every test in the file, including the pre-existing `should support tab navigation between switches` (the sound switch is appended after the two existing ones, so the first two tab stops are unchanged).

- [ ] **Step 5: Run the whole unit suite**

Run: `bun test:run`
Expected: PASS. Ignore pre-existing React `act(...)` warnings from `ThemeSwitcher.test.tsx` and `NameManagementSidebar.integration.test.tsx` — they are known and non-blocking.

- [ ] **Step 6: Type check, lint, build**

Run: `bun run tsc -b && bun run ci && bun run build`
Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/sidebar/SettingsPanel.tsx src/components/sidebar/SettingsPanel.test.tsx
git commit -m "feat(settings): add audio section with spin sound toggle"
```

---

### Task 4: E2E coverage for the sound toggle

**Files:**
- Modify: `e2e/pages/SettingsPage.ts`
- Modify: `e2e/specs/11-settings-panel.spec.ts`

**Interfaces:**
- Consumes: the `#sound-enabled` switch from Task 3, and the `settings-storage` localStorage key.
- Produces: `SettingsPage.soundSwitch`, `toggleSound()`, `isSoundEnabled()`, plus `soundEnabled` on the object returned by `getSettingsFromStorage()`.

- [ ] **Step 1: Extend the page object**

In `e2e/pages/SettingsPage.ts`, add the locator field after `clearSelectionSwitch`:

```typescript
  readonly soundSwitch: Locator;
```

Add to the constructor after the `clearSelectionSwitch` assignment:

```typescript
    this.soundSwitch = page.locator('#sound-enabled');
```

Add these methods after `isClearSelectionVisible()`:

```typescript
  async toggleSound() {
    await this.soundSwitch.click();
  }

  async isSoundEnabled(): Promise<boolean> {
    return await this.soundSwitch.isChecked();
  }
```

Replace `getSettingsFromStorage()` with:

```typescript
  async getSettingsFromStorage(): Promise<{
    autoExcludeEnabled: boolean;
    clearSelectionAfterExclude: boolean;
    soundEnabled: boolean;
  }> {
    return await this.page.evaluate(() => {
      const stored = localStorage.getItem('settings-storage');
      if (!stored) {
        return {
          autoExcludeEnabled: true,
          clearSelectionAfterExclude: false,
          soundEnabled: false,
        };
      }
      const parsed = JSON.parse(stored);
      return {
        autoExcludeEnabled: parsed.state.autoExcludeEnabled,
        clearSelectionAfterExclude: parsed.state.clearSelectionAfterExclude,
        soundEnabled: parsed.state.soundEnabled,
      };
    });
  }
```

- [ ] **Step 2: Write the failing E2E test**

Append this test to the `test.describe('SettingsPanel', ...)` block in `e2e/specs/11-settings-panel.spec.ts`, before its closing `});`:

```typescript
  test('should persist the spin sound toggle across reloads', async ({ settingsPage, page }) => {
    await settingsPage.switchToSettingsTab();

    expect(await settingsPage.isSoundEnabled()).toBe(false);

    await settingsPage.toggleSound();
    expect(await settingsPage.isSoundEnabled()).toBe(true);
    expect((await settingsPage.getSettingsFromStorage()).soundEnabled).toBe(true);

    await page.reload();
    await settingsPage.switchToSettingsTab();

    expect(await settingsPage.isSoundEnabled()).toBe(true);
  });
```

- [ ] **Step 3: Run the E2E spec**

Run: `bun run test:e2e e2e/specs/11-settings-panel.spec.ts`
Expected: PASS, including the new test.

If the new test is the only one you want to run while iterating, use
`bun run test:e2e e2e/specs/11-settings-panel.spec.ts -g "spin sound"`.

- [ ] **Step 4: Run the full E2E suite**

Run: `bun run test:e2e`
Expected: PASS, no regressions in the other specs.

- [ ] **Step 5: Commit**

```bash
git add e2e/pages/SettingsPage.ts e2e/specs/11-settings-panel.spec.ts
git commit -m "test(e2e): cover spin sound toggle persistence"
```

---

### Task 5: Documentation

**Files:**
- Create: `.claude/tasks/sessions/session-34-sound-setting.md`
- Modify: `.claude/tasks/README.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the finished behavior from Tasks 1-4.
- Produces: nothing code depends on.

- [ ] **Step 1: Confirm the session number**

Run: `ls .claude/tasks/sessions/`
Use the next unused number. The filename below assumes 34 — rename it if the directory shows a different highest number.

- [ ] **Step 2: Write the session doc**

Create `.claude/tasks/sessions/session-34-sound-setting.md` following the structure of the newest existing session file in that directory. It must cover:

- Overview: the `?ff=sound` URL flag was replaced with a persisted `soundEnabled` setting and an AUDIO toggle in the Settings tab.
- What was done: store field, hook rewrite, `SwitchSettings` prop rename, AUDIO section, unit and E2E tests.
- Files modified: `src/stores/useSettingsStore.ts`, `src/hooks/useSpinSound.ts`, `src/components/sidebar/SettingsPanel.tsx`, their test files, `e2e/pages/SettingsPage.ts`, `e2e/specs/11-settings-panel.spec.ts`.
- Commits: the four from Tasks 1-4 plus this one.
- Verification: paste the actual final counts from `bun test:run` and `bun run test:e2e`.
- Key learnings: reading Zustand state via `getState()` inside a `useCallback` keeps the callback identity stable, so consumers do not re-render when the setting flips; Zustand `persist` backfills newly added keys from initial state, so no migration was needed.
- Note that the `?ff=` query-param feature-flag convention (Session 33) now has no consumer in the codebase.

- [ ] **Step 3: Update the tasks README**

Add a row/entry for the new session to `.claude/tasks/README.md`, matching the format already used for the surrounding sessions.

- [ ] **Step 4: Update CLAUDE.md**

In the "Session Progress" section, add a completed-session entry matching the existing format:

```markdown
### Session 34: Spin Sound Setting (Completed)
- [x] Add `soundEnabled` to `useSettingsStore` (persisted, default off)
- [x] Gate `useSpinSound` on the setting, remove the `?ff=sound` URL flag
- [x] Add AUDIO section with spin sound toggle to SettingsPanel
- [x] Rename generic `SwitchSettings` props to `checked` / `onCheckedChange`
- [x] Unit tests for store, hook, and panel; E2E persistence test
```

- [ ] **Step 5: Final verification**

Run: `bun run ci && bun run tsc -b && bun test:run && bun run build`
Expected: all exit 0.

- [ ] **Step 6: Commit**

```bash
git add .claude/tasks/sessions/session-34-sound-setting.md .claude/tasks/README.md CLAUDE.md
git commit -m "docs(tasks): document spin sound setting session"
```

---

## Verification Summary

After all tasks:

- `grep -rn "ff=sound\|isSoundEnabled" src e2e` returns nothing outside the "ignores the legacy ff=sound url flag" test.
- Sound is silent by default for a fresh profile and for an existing profile with a pre-existing `settings-storage` entry.
- Toggling `Spin sound` on in Settings makes the wheel play `/sounds/roletrando.mp3` on spin, and survives a reload.
- `bun run ci`, `bun run tsc -b`, `bun test:run`, `bun run test:e2e`, `bun run build` all pass.
