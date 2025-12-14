# Session 11 Prompt: Radix Mobile Drawer Enhancement

**Copy this entire prompt to start Session 11**

---

## Session Goal

Enhance MobileSidebar drawer component with Radix Dialog for improved accessibility, focus management, and consistency with other modals.

---

## Pre-Session Setup

1. Ensure Session 10 PR is merged to `main`
2. Pull latest changes: `git pull origin main`
3. Verify all tests pass: `bun test:run`
4. Review current drawer implementation:
   - `src/components/sidebar/MobileSidebar.tsx` (lines 1-72)

---

## Session Tasks

### Phase 1: Setup (5 min)

**Task 1.1**: Create feature branch
```bash
git checkout main
git pull origin main
git checkout -b feat/radix-mobile-drawer
```

**Task 1.2**: Verify Radix Dialog is installed
```bash
# Should already be installed from Session 8
bun list | grep @radix-ui/react-dialog
```

**Note**: No new dependencies needed (reuses Dialog from Session 8)

---

### Phase 2: Migrate MobileSidebar to Radix Dialog (20 min)

**Task 2.1**: Refactor MobileSidebar component

**File**: `src/components/sidebar/MobileSidebar.tsx`

**Current implementation analysis**:
- Uses Framer Motion for drawer animation
- Manual Escape key handling (lines 12-28)
- Manual body scroll lock (lines 21-26)
- Backdrop and drawer as separate Motion components

**Changes to make**:

1. Add import:
```typescript
import * as Dialog from '@radix-ui/react-dialog';
```

2. Remove manual Escape handler (lines 12-28):
```typescript
// DELETE this entire useEffect (Radix handles Escape and body scroll lock)
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
  }

  return () => {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = 'unset';
  };
}, [isOpen, onClose]);
```

3. Wrap in Dialog.Root (replace lines 30-72):
```typescript
// BEFORE
return (
  <>
    {/* Backdrop */}
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
    )}

    {/* Drawer */}
    <motion.div
      className="fixed top-0 left-0 h-screen z-40 border-r flex flex-col overflow-hidden bg-black/90 border-r-(--color-border-light)"
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* ... drawer content ... */}
    </motion.div>
  </>
);

// AFTER
return (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      {/* Backdrop */}
      <Dialog.Overlay asChild>
        <motion.div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </Dialog.Overlay>

      {/* Drawer */}
      <Dialog.Content asChild>
        <motion.div
          className="fixed top-0 left-0 h-screen z-40 border-r flex flex-col overflow-hidden bg-black/90 border-r-(--color-border-light) focus:outline-none"
          initial={{ x: '-100%' }}
          animate={{ x: isOpen ? 0 : '-100%' }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Drawer Header */}
          <div className="px-4 py-4 border-b flex items-center justify-between border-b-(--color-border-light)">
            <Dialog.Title className="font-mono text-sm tracking-widest font-light text-(--color-accent)">
              MENU
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded transition-colors text-accent bg-transparent hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto scrollbar-themed">{children}</div>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

**Key changes**:
- Wrap in `Dialog.Root` with `open` and `onOpenChange` props
- Use `Dialog.Overlay asChild` for backdrop (preserves Framer Motion animation)
- Use `Dialog.Content asChild` for drawer (preserves Framer Motion slide animation)
- Replace `<h2>` with `Dialog.Title` for accessibility
- Wrap close button in `Dialog.Close asChild`
- Remove manual Escape handler (Radix handles it)
- Remove manual body scroll lock (Radix handles it)
- Add `focus:outline-none` to drawer content
- Add `exit` animation to Motion drawer for smooth close

**Task 2.2**: Test mobile drawer
```bash
bun dev
```

Manual test (resize browser to mobile width or use DevTools):
- [ ] Drawer opens when hamburger menu clicked
- [ ] Drawer closes on Escape key
- [ ] Drawer closes on backdrop click
- [ ] Drawer closes on X button click
- [ ] Drawer animation smooth (slide in/out)
- [ ] Body scroll locked when drawer open
- [ ] Focus trapped within drawer when open
- [ ] Focus returns to hamburger button after close

**Commit 1**: `feat(mobile): enhance MobileSidebar with Radix Dialog primitive`

---

### Phase 3: Testing & Verification (15 min)

**Task 3.1**: Create/update MobileSidebar tests

**File**: `src/components/sidebar/MobileSidebar.test.tsx` (create if doesn't exist)

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MobileSidebar } from './MobileSidebar';

describe('MobileSidebar', () => {
  it('should render drawer when open', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Drawer Content</div>
      </MobileSidebar>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('MENU')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('should not render drawer when closed', () => {
    render(
      <MobileSidebar isOpen={false} onClose={vi.fn()}>
        <div>Drawer Content</div>
      </MobileSidebar>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const onClose = vi.fn();
    render(
      <MobileSidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </MobileSidebar>
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('should close when X button clicked', async () => {
    const onClose = vi.fn();
    render(
      <MobileSidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </MobileSidebar>
    );

    const closeButton = screen.getByLabelText(/close sidebar/i);
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </MobileSidebar>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby'); // Radix auto-links title
  });
});
```

**Task 3.2**: Run all tests
```bash
bun test:run  # All 96+ tests should pass
```

**Task 3.3**: Type check
```bash
bun run tsc  # Should pass with 0 errors
```

**Task 3.4**: Build verification
```bash
bun run build  # Should succeed
```

**Commit 2**: `test(mobile): add comprehensive tests for MobileSidebar drawer`

---

### Phase 4: Documentation (10 min)

**Task 4.1**: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add new section after AlertDialog pattern:

```markdown
### Dialog with Framer Motion (Drawer Pattern)
**Components**: MobileSidebar
**Packages**: `@radix-ui/react-dialog` + `framer-motion`

**Combining Radix Dialog with Framer Motion animations**:

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';

<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <Dialog.Portal>
    {/* Animated Overlay */}
    <Dialog.Overlay asChild>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </Dialog.Overlay>

    {/* Animated Drawer */}
    <Dialog.Content asChild>
      <motion.div
        className="fixed top-0 left-0 h-screen z-40 bg-black/90 focus:outline-none"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <Dialog.Title>Drawer Title</Dialog.Title>
        <Dialog.Close asChild>
          <button>Close</button>
        </Dialog.Close>
        {/* Drawer content */}
      </motion.div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Key points**:
- Use `asChild` prop to combine Radix + Framer Motion
- Radix handles accessibility, focus, keyboard
- Motion handles visual animations
- Best of both worlds: accessible + animated
- Add `exit` animation for smooth close transition
```

**Task 4.2**: Create session summary

**File**: `.claude/tasks/sessions/session-11-radix-mobile-drawer.md`

Follow the pattern from previous sessions:
- Date, status, duration, test count
- What was implemented (MobileSidebar enhancement)
- Atomic commits created
- Verification results
- Key learnings (combining Radix + Framer Motion with asChild)
- Next steps (Radix UI migration complete!)

**Commit 3**: `docs(radix): add Drawer pattern and session summary`

---

### Phase 5: Final Migration Review (10 min)

**Task 5.1**: Verify all Radix migrations complete

Check that all 6 components now use Radix primitives:
- [ ] ExportModal (Dialog) - Session 8
- [ ] BulkImportModal (Dialog) - Session 8
- [ ] ListSelector (DropdownMenu) - Session 9
- [ ] Delete confirmations (AlertDialog) - Session 10
- [ ] MobileSidebar (Dialog) - Session 11

**Task 5.2**: Update master plan

**File**: `.claude/tasks/features/active/radix-ui-migration.md`

Move to completed:
```bash
mv .claude/tasks/features/active/radix-ui-migration.md .claude/tasks/features/completed/radix-ui-migration.md
```

Update status from "Active" to "Completed" in the file.

**Task 5.3**: Update README.md

**File**: `.claude/tasks/README.md`

Update session tracking table to include Sessions 8-11.

**Commit 4**: `docs(radix): finalize Radix UI migration documentation`

---

## Post-Session Checklist

- [ ] All tests passing (`bun test:run`)
- [ ] Type check passing (`bun run tsc`)
- [ ] Build successful (`bun run build`)
- [ ] 4 atomic commits created
- [ ] Documentation updated
- [ ] Migration master plan moved to completed
- [ ] Branch pushed to remote
- [ ] Ready for PR review

---

## Create Pull Request

```bash
git push -u origin feat/radix-mobile-drawer

gh pr create --title "feat: enhance MobileSidebar with Radix Dialog (Session 11)" --body "$(cat <<'EOF'
## Summary
- Enhance MobileSidebar with Radix Dialog primitive
- Combine Radix accessibility with Framer Motion animations
- Complete Radix UI migration (Sessions 8-11)

## Changes
- Wrap MobileSidebar in Radix Dialog.Root
- Use Dialog.Overlay/Content with asChild for Motion animations
- Remove manual Escape key handler (Radix handles it)
- Remove manual body scroll lock (Radix handles it)
- Add Dialog.Title and Dialog.Close for accessibility

## Components Updated
- MobileSidebar (src/components/sidebar/MobileSidebar.tsx)

## Testing
- All 96+ tests passing
- New MobileSidebar tests added
- Keyboard navigation tested (Escape, Tab)
- Focus management tested
- Manual testing completed on mobile

## Bundle Impact
- 0kb (reuses Dialog from Session 8)

## Code Reduction
- Removed ~15 lines of manual event handler code

## Migration Complete
This completes the Radix UI migration across all 6 components:
- ✅ ExportModal (Session 8)
- ✅ BulkImportModal (Session 8)
- ✅ ListSelector (Session 9)
- ✅ Delete confirmations (Session 10)
- ✅ MobileSidebar (Session 11)

Total impact: +35kb gzipped, ~200 lines of code removed, WCAG 2.1 AA compliant

## Related
- Final session of Radix UI Migration (Sessions 8-11)
- See: .claude/tasks/features/completed/radix-ui-migration.md
EOF
)"
```

---

## Success Criteria

- ✅ MobileSidebar uses Radix Dialog
- ✅ Framer Motion animations preserved
- ✅ Escape key handling works
- ✅ Body scroll lock works
- ✅ Focus management works
- ✅ All tests pass
- ✅ No visual regressions
- ✅ Documentation updated
- ✅ Migration master plan completed
- ✅ 4 atomic commits created

---

## Celebration

**Radix UI Migration Complete! 🎉**

All 6 components now use Radix primitives:
- Better accessibility (WCAG 2.1 AA)
- Improved focus management
- Reduced maintenance burden
- Standardized keyboard navigation
- ~200 lines of code removed

**Next Steps**: Consider future enhancements (Toast, Tooltip, Popover)
