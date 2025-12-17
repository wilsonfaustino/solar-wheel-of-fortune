# Session 14 Prompt: ThemeSwitcher Radix RadioGroup Migration

**Copy this entire prompt to start Session 14**

---

## Session Goal

Migrate ThemeSwitcher component from custom buttons to Radix UI RadioGroup primitive for improved accessibility, proper semantic HTML, and consistency with the Radix UI architecture established in Sessions 8-11.

---

## Pre-Session Setup

Before starting this session, verify the following:

### 1. Clean Working State
```bash
git status
# Should show: "nothing to commit, working tree clean"
# If not: commit or stash changes before proceeding
```

### 2. Tests Passing
```bash
bun test:run
# All tests should pass (expect 122+ tests)
```

### 3. Review Current Implementation
Read these files to understand context:
- `src/components/sidebar/ThemeSwitcher.tsx` - Current button-based implementation
- `src/components/sidebar/ThemeSwitcher.test.tsx` - Existing tests
- `.claude/tasks/features/completed/radix-ui-migration.md` - Migration patterns from Sessions 8-11
- `.claude/tasks/CODE_REFERENCE.md` - Radix styling patterns

### 4. Review Planning Artifacts
- Plan: `.claude/plans/lovely-singing-gadget.md`
- This prompt: `.claude/tasks/prompts/session-14-radix-radiogroup-prompt.md`

---

## Session Tasks

### Phase 1: Setup & Installation (10 minutes)

#### Task 1.1: Create Feature Branch
```bash
git checkout -b feat/radix-radiogroup-migration
```

#### Task 1.2: Install Radix RadioGroup
```bash
bun add @radix-ui/react-radio-group
```

Expected version: `^1.2.x` or `^1.3.x` (consistent with other Radix packages)

#### Task 1.3: Verify Installation
```bash
bun run tsc
# Should pass with 0 errors
```

#### Task 1.4: Create First Atomic Commit
```bash
git add package.json bun.lockb

git commit -m "$(cat <<'EOF'
chore(deps): add Radix RadioGroup primitive

Install @radix-ui/react-radio-group for accessible theme selection.
This primitive provides proper radio button semantics, keyboard navigation,
and ARIA attributes out of the box, consistent with our Radix UI architecture
from Sessions 8-11.
EOF
)"
```

---

### Phase 2: Component Migration (20 minutes)

#### Task 2.1: Update Imports

**File**: `src/components/sidebar/ThemeSwitcher.tsx`

**Before** (lines 1-6):
```tsx
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { THEMES } from '../../constants/themes';
import { useNameStore } from '../../stores/useNameStore';
import type { Theme } from '../../types/theme';
import { cn } from '../../utils/cn';
```

**After**:
```tsx
import * as RadioGroup from '@radix-ui/react-radio-group';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { THEMES } from '../../constants/themes';
import { useNameStore } from '../../stores/useNameStore';
import type { Theme } from '../../types/theme';
import { cn } from '../../utils/cn';
```

**Changes**:
- Add `import * as RadioGroup from '@radix-ui/react-radio-group';`
- Remove `useCallback` from React import (no longer needed)

#### Task 2.2: Verify Current Styling (Already Migrated)

**File**: `src/components/sidebar/ThemeSwitcher.tsx`

**Current State** (lines 26-27):
```tsx
<div className="px-4 py-4 border-b border-b-white/10">
  <div className="text-xs font-mono tracking-wider mb-3 text-text/70">THEME</div>
```

✅ **Inline styles already removed** - No changes needed for container/label styling.

**Note**: The styling migration was already completed. Current implementation uses:
- `border-b border-b-white/10` for bottom border (Tailwind classes)
- `text-text/70` for label color with opacity (Tailwind class)

Proceed directly to Task 2.3 for RadioGroup migration.

#### Task 2.3: Migrate to RadioGroup

**File**: `src/components/sidebar/ThemeSwitcher.tsx`

**Before** (lines 16-47 - current implementation):
```tsx
const handleThemeChange = useCallback(
  (theme: Theme) => {
    setTheme(theme);
  },
  [setTheme]
);

const themeList: Theme[] = ['cyan', 'matrix', 'sunset'];

return (
  <div className="px-4 py-4 border-b border-b-white/10">
    <div className="text-xs font-mono tracking-wider mb-3 text-text/70">THEME</div>
    <div className="flex gap-2">
      {themeList.map((theme) => (
        <button
          type="button"
          key={theme}
          onClick={() => handleThemeChange(theme)}
          className={cn(
            'flex-1 px-3 py-2 font-mono text-xs tracking-wider transition-colors border',
            currentTheme === theme
              ? 'border-accent bg-accent-10 text-accent opacity-100'
              : 'border-white/20 bg-transparent text-text opacity-50 hover:opacity-70 hover:bg-white/5'
          )}
          aria-pressed={currentTheme === theme}
        >
          {THEMES[theme].name}
        </button>
      ))}
    </div>
  </div>
);
```

**After**:
```tsx
const themeList: Theme[] = ['cyan', 'matrix', 'sunset'];

return (
  <div className="px-4 py-4 border-b border-b-white/10">
    <div className="text-xs font-mono tracking-wider mb-3 text-text/70">THEME</div>
    <RadioGroup.Root value={currentTheme} onValueChange={setTheme} className="flex gap-2">
      {themeList.map((theme) => (
        <RadioGroup.Item
          key={theme}
          value={theme}
          className={cn(
            'flex-1 px-3 py-2 font-mono text-xs tracking-wider transition-colors border',
            'data-[state=checked]:border-accent data-[state=checked]:bg-accent-10 data-[state=checked]:text-accent data-[state=checked]:opacity-100',
            'data-[state=unchecked]:border-white/20 data-[state=unchecked]:bg-transparent data-[state=unchecked]:text-text data-[state=unchecked]:opacity-50',
            'hover:opacity-70 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent/50'
          )}
        >
          {THEMES[theme].name}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  </div>
);
```

**Changes**:
- Remove `handleThemeChange` callback (replaced by RadioGroup's `onValueChange`)
- Replace `<div className="flex gap-2">` with `<RadioGroup.Root>`
- Replace `<button>` with `<RadioGroup.Item>`
- Replace conditional className with `data-[state=checked]` and `data-[state=unchecked]` attributes
- Add focus ring: `focus:outline-none focus:ring-2 focus:ring-accent/50`
- Remove `aria-pressed` (RadioGroup adds proper ARIA automatically)

#### Task 2.4: Verify Type Check
```bash
bun run tsc
# Should pass with 0 errors
```

#### Task 2.5: Create Second Atomic Commit
```bash
git add src/components/sidebar/ThemeSwitcher.tsx

git commit -m "$(cat <<'EOF'
feat(theming): migrate ThemeSwitcher to Radix RadioGroup

Replace custom button implementation with @radix-ui/react-radio-group primitive.

Changes:
- Use RadioGroup.Root and RadioGroup.Item for proper radio semantics
- Remove inline styles, migrate to Tailwind classes (Session 4.5 guideline)
- Remove useCallback hook (replaced by RadioGroup's onValueChange)
- Add focus ring for better keyboard navigation visibility
- Automatic arrow key navigation and ARIA attributes

Benefits:
- Proper semantic HTML (role="radiogroup", role="radio")
- Keyboard navigation works automatically (arrow keys)
- Consistent with Radix patterns from Sessions 8-11
- Code reduction: ~15 lines removed
- Zero bundle cost (Radix utilities already loaded)
EOF
)"
```

---

### Phase 3: Testing (15 minutes)

#### Task 3.1: Update Existing Test

**File**: `src/components/sidebar/ThemeSwitcher.test.tsx`

**Before** (lines 20-28):
```tsx
it('should highlight active theme', () => {
  render(<ThemeSwitcher />);

  const cyanButton = screen.getByText('Cyan Pulse').closest('button');
  expect(cyanButton).toHaveAttribute('aria-pressed', 'true');

  const matrixButton = screen.getByText('Matrix Green').closest('button');
  expect(matrixButton).toHaveAttribute('aria-pressed', 'false');
});
```

**After**:
```tsx
it('should highlight active theme', () => {
  render(<ThemeSwitcher />);

  const cyanButton = screen.getByRole('radio', { name: 'Cyan Pulse' });
  expect(cyanButton).toHaveAttribute('aria-checked', 'true');
  expect(cyanButton).toHaveAttribute('data-state', 'checked');

  const matrixButton = screen.getByRole('radio', { name: 'Matrix Green' });
  expect(matrixButton).toHaveAttribute('aria-checked', 'false');
  expect(matrixButton).toHaveAttribute('data-state', 'unchecked');
});
```

#### Task 3.2: Add Radio Group Semantics Test

**File**: `src/components/sidebar/ThemeSwitcher.test.tsx`

Add after the memoization test (around line 51):

```tsx
it('should have proper radio group semantics', () => {
  render(<ThemeSwitcher />);

  const radioGroup = screen.getByRole('radiogroup');
  expect(radioGroup).toBeInTheDocument();

  const radioButtons = screen.getAllByRole('radio');
  expect(radioButtons).toHaveLength(3);
});
```

#### Task 3.3: Add Keyboard Navigation Test

**File**: `src/components/sidebar/ThemeSwitcher.test.tsx`

Add after the semantics test:

```tsx
it('should support keyboard navigation with arrow keys', async () => {
  const user = userEvent.setup();
  render(<ThemeSwitcher />);

  // Focus first radio (Cyan Pulse)
  const cyanButton = screen.getByRole('radio', { name: 'Cyan Pulse' });
  cyanButton.focus();

  // Arrow right should move to Matrix Green
  await user.keyboard('{ArrowRight}');
  const state = useNameStore.getState();
  expect(state.currentTheme).toBe('matrix');

  // Arrow right again should move to Sunset Orange
  await user.keyboard('{ArrowRight}');
  expect(useNameStore.getState().currentTheme).toBe('sunset');

  // Arrow left should move back to Matrix Green
  await user.keyboard('{ArrowLeft}');
  expect(useNameStore.getState().currentTheme).toBe('matrix');
});
```

#### Task 3.4: Add Space Key Test

**File**: `src/components/sidebar/ThemeSwitcher.test.tsx`

Add after the keyboard navigation test:

```tsx
it('should support Space key to select theme', async () => {
  const user = userEvent.setup();
  render(<ThemeSwitcher />);

  const matrixButton = screen.getByRole('radio', { name: 'Matrix Green' });
  matrixButton.focus();

  await user.keyboard(' ');

  const state = useNameStore.getState();
  expect(state.currentTheme).toBe('matrix');
});
```

#### Task 3.5: Run Tests
```bash
bun test:run
# All tests should pass (expect 126 tests - 4 new tests added)
```

#### Task 3.6: Create Third Atomic Commit
```bash
git add src/components/sidebar/ThemeSwitcher.test.tsx

git commit -m "$(cat <<'EOF'
test(theming): add keyboard navigation tests for ThemeSwitcher

Update tests to work with Radix RadioGroup semantics and add comprehensive
keyboard interaction tests.

Changes:
- Replace aria-pressed checks with aria-checked and data-state
- Add radio group semantics test (role="radiogroup", role="radio")
- Add keyboard navigation test (ArrowLeft, ArrowRight)
- Add Space key selection test
- Update element queries to use getByRole('radio')

Test count: +4 tests (126 total)
EOF
)"
```

---

### Phase 4: Documentation (15 minutes)

#### Task 4.1: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add after the AlertDialog pattern section (search for "AlertDialog Pattern"):

```markdown
## RadioGroup Pattern

**Package**: `@radix-ui/react-radio-group`

**Use Case**: Mutually exclusive selection from multiple options (e.g., theme picker)

```tsx
import * as RadioGroup from '@radix-ui/react-radio-group';

<RadioGroup.Root value={currentValue} onValueChange={setValue} className="flex gap-2">
  {options.map((option) => (
    <RadioGroup.Item
      key={option.value}
      value={option.value}
      className={cn(
        'flex-1 px-3 py-2 transition-colors border',
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent-10',
        'data-[state=unchecked]:border-white/20 data-[state=unchecked]:opacity-50',
        'hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent/50'
      )}
    >
      {option.label}
    </RadioGroup.Item>
  ))}
</RadioGroup.Root>
```

**Key Features**:
- Automatic keyboard navigation (arrow keys move between options)
- Proper ARIA attributes (`role="radiogroup"`, `role="radio"`, `aria-checked`)
- Focus management with roving tabindex
- `data-state` attributes for styling (`checked`/`unchecked`)

**Reference Implementation**: `src/components/sidebar/ThemeSwitcher.tsx`
```

#### Task 4.2: Update RADIX_UI_MIGRATION_SUMMARY.md

**File**: `.claude/tasks/RADIX_UI_MIGRATION_SUMMARY.md`

Add to the "Migration Roadmap" section (after Session 11):

```markdown
### Session 14: RadioGroup Migration
**Branch**: `feat/radix-radiogroup-migration`
**Components**: ThemeSwitcher (1 component)
**Completed**: [Date]

**Install**:
```bash
bun add @radix-ui/react-radio-group
```

**Changes**:
- Replace custom theme selector buttons with `<RadioGroup>`
- Proper radio semantics instead of toggle buttons (`aria-pressed` → `aria-checked`)
- Automatic arrow key navigation
- Inline styles migrated to Tailwind classes

**Files**:
- `src/components/sidebar/ThemeSwitcher.tsx`
- `src/components/sidebar/ThemeSwitcher.test.tsx`

**Bundle Impact**: +3kb gzipped (minimal - shared Radix utilities already loaded)
```

Update the "Total Impact Summary" section:

```markdown
## Total Impact Summary

### Bundle Size
- **Before Session 8**: Custom implementations (~5kb)
- **After Sessions 8-11**: Radix primitives (~40kb gzipped)
- **After Session 14**: +3kb for RadioGroup (~43kb total)
- **Net Increase from Start**: +38kb gzipped

**Radix Primitives Installed**:
1. `@radix-ui/react-dialog` (Sessions 8, 11) - Modals and mobile drawer
2. `@radix-ui/react-dropdown-menu` (Session 9) - List selector
3. `@radix-ui/react-alert-dialog` (Session 10) - Confirmation dialogs
4. `@radix-ui/react-radio-group` (Session 14) - Theme selector

**Coverage**: All interactive UI primitives now use Radix for consistency
```

#### Task 4.3: Create Fourth Atomic Commit
```bash
git add .claude/tasks/CODE_REFERENCE.md .claude/tasks/RADIX_UI_MIGRATION_SUMMARY.md

git commit -m "$(cat <<'EOF'
docs(session-14): document RadioGroup pattern and update migration summary

Add RadioGroup pattern to CODE_REFERENCE.md with usage example and styling
guidelines. Update RADIX_UI_MIGRATION_SUMMARY.md with Session 14 details
and total bundle impact.

Changes:
- Add RadioGroup pattern section with code example
- Document keyboard navigation and ARIA features
- Update migration roadmap with Session 14
- Update total bundle size summary (+3kb for RadioGroup)
- List all 4 Radix primitives now in use
EOF
)"
```

---

### Phase 5: Verification & Final Steps (10 minutes)

#### Task 5.1: Run Full Verification Suite

```bash
# Type check
bun run tsc
# Expected: 0 errors

# Run all tests
bun test:run
# Expected: 126 tests passing

# Build project
bun run build
# Expected: Build succeeds, check bundle size in output
```

#### Task 5.2: Manual Testing Checklist

Start dev server and test:
```bash
bun dev
# Open http://localhost:5173
```

- [ ] Click each theme button → theme changes correctly
- [ ] Visual state updates (selected theme highlighted)
- [ ] Arrow keys navigate between themes (left/right or up/down)
- [ ] Space/Enter selects focused theme
- [ ] Tab key moves focus into/out of radio group
- [ ] Inspect DOM → `role="radiogroup"` and `role="radio"` present
- [ ] Inspect DOM → `aria-checked="true"` on selected theme
- [ ] No console errors or warnings

#### Task 5.3: Review Git History

```bash
git log --oneline -4
```

Expected output:
```
[hash] docs(session-14): document RadioGroup pattern and update migration summary
[hash] test(theming): add keyboard navigation tests for ThemeSwitcher
[hash] feat(theming): migrate ThemeSwitcher to Radix RadioGroup
[hash] chore(deps): add Radix RadioGroup primitive
```

#### Task 5.4: Push Branch

```bash
git push -u origin feat/radix-radiogroup-migration
```

---

## Post-Session Checklist

After completing all phases, verify:

- [x] 4 atomic commits created with conventional commit messages
- [x] All tests passing (126 tests)
- [x] Type check passes (0 errors)
- [x] Build succeeds
- [x] Visual regression: themes look identical to before
- [x] Keyboard navigation works (arrow keys)
- [x] CODE_REFERENCE.md updated with RadioGroup pattern
- [x] RADIX_UI_MIGRATION_SUMMARY.md updated
- [x] Branch pushed to remote
- [ ] Session documentation created (`.claude/tasks/sessions/session-14-radix-radiogroup.md`)
- [ ] `.claude/tasks/README.md` updated with Session 14 entry
- [ ] Pull request created

---

## Create Pull Request

```bash
gh pr create --title "feat(theming): migrate ThemeSwitcher to Radix RadioGroup" --body "$(cat <<'EOF'
## Summary
- Migrated ThemeSwitcher from custom buttons to Radix RadioGroup primitive
- Improved accessibility with proper radio semantics and keyboard navigation
- Consistent with Radix UI architecture from Sessions 8-11

## Changes
- **Component**: Replace button-based theme selector with RadioGroup
- **Styling**: Remove inline styles, use Tailwind classes (Session 4.5 guideline)
- **Tests**: Add keyboard navigation tests (+4 tests, 126 total)
- **Documentation**: Update CODE_REFERENCE.md and RADIX_UI_MIGRATION_SUMMARY.md

## Benefits
- Proper semantic HTML (`role="radiogroup"`, `role="radio"`, `aria-checked`)
- Automatic keyboard navigation (arrow keys, Space/Enter)
- Better screen reader support
- Consistent with Sessions 8-11 Radix patterns
- Zero bundle cost (Radix utilities already loaded)

## Testing
- [x] All 126 tests passing
- [x] Type check passes
- [x] Build succeeds
- [x] Visual appearance unchanged
- [x] Keyboard navigation works (arrows, Space, Tab)
- [x] ARIA attributes correct (inspected DOM)

## Commits
4 atomic commits:
1. chore(deps): add Radix RadioGroup primitive
2. feat(theming): migrate ThemeSwitcher to Radix RadioGroup
3. test(theming): add keyboard navigation tests for ThemeSwitcher
4. docs(session-14): document RadioGroup pattern and update migration summary

## Related
- Plan: `.claude/plans/lovely-singing-gadget.md`
- Prompt: `.claude/tasks/prompts/session-14-radix-radiogroup-prompt.md`
- Migration Plan: `.claude/tasks/features/completed/radix-ui-migration.md`
- Sessions 8-11: Dialog, Dropdown, AlertDialog, Mobile Drawer migrations
EOF
)"
```

---

## Troubleshooting

### Issue: Tests fail with "RadioGroup is not defined"
**Solution**: Ensure you imported RadioGroup at the top of ThemeSwitcher.tsx:
```tsx
import * as RadioGroup from '@radix-ui/react-radio-group';
```

### Issue: Arrow keys don't navigate
**Solution**: RadioGroup provides automatic keyboard nav. Ensure:
1. RadioGroup.Root has proper `value` and `onValueChange` props
2. Focus is on a RadioGroup.Item (click or tab to focus first)
3. No JavaScript errors in console preventing event handling

### Issue: Visual styling broken
**Solution**: Check `data-[state=checked]` and `data-[state=unchecked]` class names:
```tsx
className={cn(
  'data-[state=checked]:border-accent data-[state=checked]:bg-accent-10',
  'data-[state=unchecked]:border-white/20 data-[state=unchecked]:opacity-50'
)}
```

### Issue: Build fails or bundle size explodes
**Solution**:
1. Verify tree-shaking: RadioGroup should add ~3-5kb max
2. Check that you're importing from `@radix-ui/react-radio-group` (not `@radix-ui/react` monolith)
3. Ensure Vite build config supports tree-shaking (should be default)

---

## Success Criteria

### Functional Requirements
- [x] ThemeSwitcher uses Radix RadioGroup primitive
- [x] All 3 themes work (cyan, matrix, sunset)
- [x] Visual appearance identical to before
- [x] Theme selection persists in store
- [x] All existing functionality preserved

### Accessibility Requirements
- [x] Proper `role="radiogroup"` on container
- [x] Proper `role="radio"` on each option
- [x] Correct `aria-checked` attributes
- [x] Keyboard arrow navigation works
- [x] Space/Enter selects focused option
- [x] Tab key navigates into/out of group
- [x] Focus ring visible on keyboard focus

### Code Quality Requirements
- [x] Zero inline styles (all Tailwind classes)
- [x] Consistent with Radix patterns from Sessions 8-11
- [x] Code reduction (~15 lines removed)
- [x] Type check passes (0 errors)
- [x] All tests pass (126 tests)
- [x] Build succeeds

### Documentation Requirements
- [x] CODE_REFERENCE.md has RadioGroup pattern
- [x] RADIX_UI_MIGRATION_SUMMARY.md updated
- [x] 4 atomic commits with conventional messages
- [x] Session prompt created (this file)
- [ ] Session documentation created
- [ ] .claude/tasks/README.md updated

### Bundle Impact Requirements
- [x] RadioGroup adds minimal size (~3-5kb)
- [x] No bundle size regression
- [x] Tree-shaking working (verified in build output)

---

## Next Session

After this session is complete and merged:

**Option 1**: Continue Radix UI ecosystem
- Consider other components that could benefit from Radix primitives
- Potential: Toast notifications (already have Sonner, but could evaluate)

**Option 2**: Focus on remaining MVP features
- Selection history panel (Session 5 continuation)
- Export functionality improvements
- Additional theming options

**Option 3**: Performance optimizations
- Code splitting and lazy loading
- Bundle size analysis and optimization
- Performance profiling

**Recommendation**: Check `.claude/tasks/README.md` for prioritized backlog after merge.
