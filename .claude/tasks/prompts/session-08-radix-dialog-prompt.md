# Session 8 Prompt: Radix Dialog Migration

**Copy this entire prompt to start Session 8**

---

## Session Goal

Migrate ExportModal and BulkImportModal from manual `div` implementations to Radix Dialog primitives for improved accessibility and maintainability.

---

## Pre-Session Setup

1. Ensure you're on `main` branch with latest changes pulled
2. Verify all tests pass: `bun test:run`
3. Verify type check passes: `bun run tsc`
4. Review current modal implementations:
   - `src/components/sidebar/ExportModal.tsx`
   - `src/components/sidebar/AddNameForm.tsx` (BulkImportModal at lines 105-164)

---

## Session Tasks

### Phase 1: Setup & Installation (10 min)

**Task 1.1**: Create feature branch
```bash
git checkout -b feat/radix-dialog-migration
```

**Task 1.2**: Install Radix Dialog
```bash
bun add @radix-ui/react-dialog
```

**Task 1.3**: Verify installation
```bash
bun run tsc  # Should pass with 0 errors
```

**Commit 1**: `chore(deps): add Radix Dialog primitive for accessible modals`

---

### Phase 2: Migrate ExportModal (25 min)

**Task 2.1**: Update ExportModal component

**File**: `src/components/sidebar/ExportModal.tsx`

**Changes to make**:

1. Add import:
```typescript
import * as Dialog from '@radix-ui/react-dialog';
```

2. Replace root structure:
```typescript
// BEFORE (lines 43-56)
<div
  role="presentation"
  className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-black/80"
  onClick={onClose}
  onKeyDown={handleKeyDown}
  tabIndex={-1}
>
  <div
    role="dialog"
    aria-label="Export selection history"
    className="p-6 max-w-lg w-full bg-black border border-border-light"
    onClick={(e) => e.stopPropagation()}
  >

// AFTER
<Dialog.Root open onOpenChange={onClose}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-50 bg-black/80" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-lg w-full bg-black border border-border-light z-50 focus:outline-none">
```

3. Replace heading with Dialog.Title:
```typescript
// BEFORE (line 57-58)
<h3 className="font-mono text-lg tracking-wider text-accent">EXPORT HISTORY</h3>

// AFTER
<Dialog.Title className="font-mono text-lg tracking-wider text-accent">
  EXPORT HISTORY
</Dialog.Title>
```

4. Replace close button with Dialog.Close:
```typescript
// BEFORE (lines 59-66)
<button
  type="button"
  onClick={onClose}
  className="transition-colors text-accent/50 bg-transparent hover:text-accent"
  aria-label="Close modal"
>
  <X className="size-5" />
</button>

// AFTER
<Dialog.Close asChild>
  <button
    type="button"
    className="transition-colors text-accent/50 bg-transparent hover:text-accent"
    aria-label="Close modal"
  >
    <X className="size-5" />
  </button>
</Dialog.Close>
```

5. Remove manual keyboard handler:
```typescript
// DELETE lines 34-41 (handleKeyDown callback)
// DELETE onKeyDown prop from input element (line 115)
```

6. Close Dialog.Content, Dialog.Portal, and Dialog.Root at the end

**Task 2.2**: Update ExportModal tests

**File**: `src/components/sidebar/ExportModal.test.tsx`

Add/update tests:
```typescript
it('should have proper ARIA attributes', () => {
  render(<ExportModal records={[]} onClose={vi.fn()} />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect(dialog).toHaveAttribute('aria-labelledby'); // Radix auto-links title
});

it('should close on Escape key', async () => {
  const onClose = vi.fn();
  render(<ExportModal records={[]} onClose={onClose} />);

  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});
```

**Task 2.3**: Test ExportModal
```bash
bun test ExportModal.test.tsx
bun dev  # Manual visual check
```

**Commit 2**: `feat(export): migrate ExportModal to Radix Dialog primitive`

---

### Phase 3: Migrate BulkImportModal (25 min)

**Task 3.1**: Update BulkImportModal in AddNameForm

**File**: `src/components/sidebar/AddNameForm.tsx`

**Changes to make** (lines 105-164):

1. Add import at top:
```typescript
import * as Dialog from '@radix-ui/react-dialog';
```

2. Replace modal structure:
```typescript
// BEFORE (lines 105-121)
{showBulkImport && (
  <div
    role="presentation"
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => {
      setShowBulkImport(false);
      setBulkText('');
      setError('');
    }}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        setShowBulkImport(false);
        setBulkText('');
        setError('');
      }
    }}
  >
    <div
      role="dialog"
      aria-label="Bulk import names"
      className="p-6 max-w-lg w-full bg-black border border-border-light"
      onClick={(e) => e.stopPropagation()}
    >

// AFTER
{showBulkImport && (
  <Dialog.Root open onOpenChange={() => {
    setShowBulkImport(false);
    setBulkText('');
    setError('');
  }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-lg w-full bg-black border border-border-light z-50 focus:outline-none">
```

3. Replace heading with Dialog.Title:
```typescript
// BEFORE (line 128)
<h3 className="font-mono text-lg mb-4 tracking-wider text-accent">BULK IMPORT</h3>

// AFTER
<Dialog.Title className="font-mono text-lg mb-4 tracking-wider text-accent">
  BULK IMPORT
</Dialog.Title>
```

4. Remove onKeyDown from textarea (lines 132-138):
```typescript
// DELETE this from textarea:
onKeyDown={(e) => {
  if (e.key === 'Escape') {
    setShowBulkImport(false);
    setBulkText('');
    setError('');
  }
}}
```

5. Wrap CANCEL button with Dialog.Close:
```typescript
// BEFORE (lines 150-157)
<button
  type="button"
  onClick={() => {
    setShowBulkImport(false);
    setBulkText('');
    setError('');
  }}
  className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors"
>
  CANCEL
</button>

// AFTER
<Dialog.Close asChild>
  <button
    type="button"
    className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors"
  >
    CANCEL
  </button>
</Dialog.Close>
```

6. Close Dialog.Content, Dialog.Portal, and Dialog.Root

**Task 3.2**: Test BulkImportModal
```bash
bun dev  # Manual test: Click BULK IMPORT button
# Verify: Opens, closes on Escape, closes on Cancel, closes on backdrop click
```

**Commit 3**: `feat(names): migrate BulkImportModal to Radix Dialog primitive`

---

### Phase 4: Testing & Verification (15 min)

**Task 4.1**: Run all tests
```bash
bun test:run  # All 96 tests should pass
```

**Task 4.2**: Type check
```bash
bun run tsc  # Should pass with 0 errors
```

**Task 4.3**: Build verification
```bash
bun run build  # Should succeed
```

**Task 4.4**: Manual testing checklist
- [ ] ExportModal opens/closes correctly
- [ ] ExportModal closes on Escape key
- [ ] ExportModal closes on backdrop click
- [ ] ExportModal closes on X button click
- [ ] ExportModal download button works
- [ ] BulkImportModal opens/closes correctly
- [ ] BulkImportModal closes on Escape key
- [ ] BulkImportModal closes on backdrop click
- [ ] BulkImportModal import button works
- [ ] BulkImportModal cancel button works
- [ ] Tab navigation works in both modals
- [ ] Focus returns to trigger button after close
- [ ] No visual regressions (same appearance as before)

---

### Phase 5: Documentation (10 min)

**Task 5.1**: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add new section after line 346 (after "## Useful Links"):
```markdown
---

## Radix UI Patterns

### Dialog (Modal) Pattern
**Components**: ExportModal, BulkImportModal (AddNameForm)
**Package**: `@radix-ui/react-dialog`

**Basic structure**:
```typescript
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-lg w-full bg-black border border-border-light z-50 focus:outline-none">
      <Dialog.Title className="font-mono text-lg text-accent">
        MODAL TITLE
      </Dialog.Title>

      {/* Modal content */}

      <Dialog.Close asChild>
        <button>Close</button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Key features**:
- Automatic Escape key handling (no manual `onKeyDown` needed)
- Automatic focus trapping
- Automatic focus restoration on close
- Automatic ARIA attributes (`role="dialog"`, `aria-labelledby`)
- Portal rendering (outside DOM hierarchy)
- Backdrop click to close (via `onOpenChange`)
- Use `asChild` prop to render custom trigger/close buttons
```

**Task 5.2**: Create session summary

**File**: `.claude/tasks/sessions/session-08-radix-dialog.md`

Create a summary following the pattern from `session-07-responsive.md`:
- Date, status, duration, test count
- What was implemented (detailed)
- Atomic commits created
- Verification results
- Key learnings
- Next steps

**Commit 4**: `docs(radix): add Dialog pattern to CODE_REFERENCE and session summary`

---

## Post-Session Checklist

- [ ] All tests passing (`bun test:run`)
- [ ] Type check passing (`bun run tsc`)
- [ ] Build successful (`bun run build`)
- [ ] 4 atomic commits created
- [ ] Documentation updated (CODE_REFERENCE.md, session summary)
- [ ] Branch pushed to remote
- [ ] Ready for PR review

---

## Create Pull Request

```bash
git push -u origin feat/radix-dialog-migration

gh pr create --title "feat: migrate modals to Radix Dialog primitives" --body "$(cat <<'EOF'
## Summary
- Migrate ExportModal to Radix Dialog
- Migrate BulkImportModal to Radix Dialog
- Improve accessibility with WCAG 2.1 AA compliance
- Add automatic keyboard navigation and focus management

## Changes
- Replace manual div modals with Radix Dialog primitives
- Remove manual keyboard event handlers (Radix handles Escape)
- Add automatic focus trapping and restoration
- Add proper ARIA attributes (auto-generated by Radix)

## Components Updated
- ExportModal (src/components/sidebar/ExportModal.tsx)
- BulkImportModal (src/components/sidebar/AddNameForm.tsx)

## Testing
- All 96 tests passing
- Keyboard navigation tested (Escape, Tab)
- Focus management tested (auto-focus, restoration)
- Manual testing completed

## Bundle Impact
- +15kb gzipped (acceptable for accessibility improvements)

## Related
- Part of Radix UI Migration (Sessions 8-11)
- See: .claude/tasks/features/active/radix-ui-migration.md
EOF
)"
```

---

## Troubleshooting

### Issue: Focus not trapping in modal
**Solution**: Ensure `Dialog.Content` has `focus:outline-none` class

### Issue: Escape key not working
**Solution**: Verify `onOpenChange` prop is set on `Dialog.Root`

### Issue: Modal not centering
**Solution**: Check `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` classes on `Dialog.Content`

### Issue: Tests failing
**Solution**: Import `@testing-library/user-event` and use `screen.getByRole('dialog')`

---

## Success Criteria

- ✅ ExportModal uses Radix Dialog
- ✅ BulkImportModal uses Radix Dialog
- ✅ All tests pass
- ✅ No visual regressions
- ✅ Keyboard navigation works (Escape, Tab)
- ✅ Focus management works (auto-focus, restoration)
- ✅ ARIA attributes present
- ✅ Documentation updated
- ✅ 4 atomic commits created

---

## Next Session

After merging this PR, proceed to **Session 9: Radix Dropdown Migration**
- Prompt: `.claude/tasks/prompts/session-09-radix-dropdown-prompt.md`
- Feature: Migrate ListSelector to Radix DropdownMenu
