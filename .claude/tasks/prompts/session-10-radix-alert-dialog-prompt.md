# Session 10 Prompt: Radix AlertDialog Migration

**Copy this entire prompt to start Session 10**

---

## Session Goal

Replace browser `confirm()` and `alert()` dialogs with Radix AlertDialog for better UX, theme consistency, and accessibility.

---

## Pre-Session Setup

1. Ensure Session 9 PR is merged to `main`
2. Pull latest changes: `git pull origin main`
3. Verify all tests pass: `bun test:run`
4. Review current browser dialog usage:
   - `src/components/sidebar/ListSelector.tsx` (lines 52-69 - delete confirmation)

---

## Session Tasks

### Phase 1: Setup & Installation (10 min)

**Task 1.1**: Create feature branch
```bash
git checkout -b feat/radix-alert-dialog
```

**Task 1.2**: Install Radix AlertDialog
```bash
bun add @radix-ui/react-alert-dialog
```

**Task 1.3**: Verify installation
```bash
bun run tsc  # Should pass with 0 errors
```

**Commit 1**: `chore(deps): add Radix AlertDialog for confirmation dialogs`

---

### Phase 2: Create Reusable ConfirmDialog Component (20 min)

**Task 2.1**: Create shared AlertDialog component

**File**: `src/components/shared/ConfirmDialog.tsx` (NEW)

```typescript
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { memo } from 'react';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

function ConfirmDialogComponent({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-md w-full bg-black border border-border-light z-50 focus:outline-none">
          <AlertDialog.Title className="font-mono text-lg tracking-wider text-accent mb-3">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="font-mono text-sm text-text/70 mb-6">
            {description}
          </AlertDialog.Description>

          <div className="flex gap-2">
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  'flex-1 px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors border',
                  variant === 'danger' &&
                    'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
                  variant === 'warning' &&
                    'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
                  variant === 'info' &&
                    'bg-accent-10 border-border-light text-accent hover:bg-accent-20'
                )}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>

            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors hover:bg-white/5"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
```

**Task 2.2**: Create barrel export

**File**: `src/components/shared/index.ts` (NEW)

```typescript
export { ConfirmDialog } from './ConfirmDialog';
```

**Commit 2**: `feat(shared): create reusable ConfirmDialog component with Radix AlertDialog`

---

### Phase 3: Replace Browser confirm() in ListSelector (15 min)

**Task 3.1**: Update ListSelector to use ConfirmDialog

**File**: `src/components/sidebar/ListSelector.tsx`

**Changes to make**:

1. Add imports:
```typescript
import { ConfirmDialog } from '../shared';
```

2. Add state for confirmation dialog:
```typescript
// After line 24 (after editingId state)
const [deleteConfirm, setDeleteConfirm] = useState<{ listId: string; title: string } | null>(
  null
);
```

3. Replace handleDeleteClick function (lines 52-69):
```typescript
// BEFORE
const handleDeleteClick = (listId: string) => {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;

  if (lists.length === 1) {
    alert('Cannot delete the only list');
    return;
  }

  if (list.names.length > 5) {
    const confirmed = confirm(
      `Delete "${list.title}" with ${list.names.length} names? This cannot be undone.`
    );
    if (!confirmed) return;
  }

  onDeleteList(listId);
};

// AFTER
const handleDeleteClick = (listId: string) => {
  const list = lists.find((l) => l.id === listId);
  if (!list) return;

  if (lists.length === 1) {
    // Show info alert instead of browser alert()
    setDeleteConfirm({
      listId: 'error',
      title: 'Cannot delete the only list',
    });
    return;
  }

  // Show confirmation for lists with many names
  if (list.names.length > 5) {
    setDeleteConfirm({
      listId: list.id,
      title: list.title,
    });
  } else {
    // Delete immediately for small lists
    onDeleteList(listId);
  }
};

const handleConfirmDelete = () => {
  if (deleteConfirm && deleteConfirm.listId !== 'error') {
    onDeleteList(deleteConfirm.listId);
  }
  setDeleteConfirm(null);
};
```

4. Add ConfirmDialog component at the end (before closing DropdownMenu.Root):
```typescript
{/* Add after DropdownMenu.Portal but before closing </DropdownMenu.Root> */}

<ConfirmDialog
  open={deleteConfirm !== null}
  onOpenChange={(open) => !open && setDeleteConfirm(null)}
  title={
    deleteConfirm?.listId === 'error'
      ? 'Cannot Delete List'
      : 'Delete List?'
  }
  description={
    deleteConfirm?.listId === 'error'
      ? 'You must have at least one list. Create another list before deleting this one.'
      : `Delete "${deleteConfirm?.title}" with names? This action cannot be undone.`
  }
  confirmLabel={deleteConfirm?.listId === 'error' ? undefined : 'Delete'}
  onConfirm={handleConfirmDelete}
  variant={deleteConfirm?.listId === 'error' ? 'info' : 'danger'}
/>
```

**Task 3.2**: Test delete confirmations
```bash
bun dev
```

Manual test:
- [ ] Click delete on list with >5 names → Shows custom AlertDialog
- [ ] Click "Delete" → List is deleted
- [ ] Click "Cancel" → Dialog closes, list preserved
- [ ] Try to delete only remaining list → Shows "Cannot Delete" AlertDialog
- [ ] Press Escape → Dialog closes

**Commit 3**: `feat(sidebar): replace browser confirm() with AlertDialog in ListSelector`

---

### Phase 4: Testing & Verification (15 min)

**Task 4.1**: Create ConfirmDialog tests

**File**: `src/components/shared/ConfirmDialog.test.tsx` (NEW)

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('should render with title and description', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Item?"
        description="This action cannot be undone."
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Item?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        description="Are you sure?"
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should close when cancel button clicked', async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render danger variant styling', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete"
        description="Delete this?"
        onConfirm={vi.fn()}
        variant="danger"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('text-red-400');
  });
});
```

**Task 4.2**: Update ListSelector tests

**File**: `src/components/sidebar/ListSelector.test.tsx`

Add tests for AlertDialog integration:
```typescript
it('should show AlertDialog when deleting list with many names', async () => {
  const list = {
    id: '1',
    title: 'Big List',
    names: Array(10).fill({ id: 'x', value: 'Name' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  render(<ListSelector lists={[list]} ... />);

  // Open dropdown, click delete
  // ... (implementation details)

  expect(screen.getByText(/delete "big list"/i)).toBeInTheDocument();
});
```

**Task 4.3**: Run all tests
```bash
bun test:run  # All 96+ tests should pass
```

**Task 4.4**: Type check
```bash
bun run tsc  # Should pass with 0 errors
```

**Task 4.5**: Build verification
```bash
bun run build  # Should succeed
```

**Commit 4**: `test(shared): add comprehensive tests for ConfirmDialog component`

---

### Phase 5: Documentation (10 min)

**Task 5.1**: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add new section after DropdownMenu pattern:

```markdown
### AlertDialog Pattern
**Components**: ConfirmDialog (shared), ListSelector
**Package**: `@radix-ui/react-alert-dialog`

**Basic structure**:
```typescript
import * as AlertDialog from '@radix-ui/react-alert-dialog';

<AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
    <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-md w-full bg-black border border-border-light z-50 focus:outline-none">
      <AlertDialog.Title className="font-mono text-lg text-accent">
        Confirm Action?
      </AlertDialog.Title>
      <AlertDialog.Description className="font-mono text-sm text-text/70 mb-6">
        This action cannot be undone.
      </AlertDialog.Description>

      <div className="flex gap-2">
        <AlertDialog.Action asChild>
          <button onClick={handleConfirm}>Confirm</button>
        </AlertDialog.Action>
        <AlertDialog.Cancel asChild>
          <button>Cancel</button>
        </AlertDialog.Cancel>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

**Shared Component** (`src/components/shared/ConfirmDialog.tsx`):
- Reusable AlertDialog wrapper
- Props: `title`, `description`, `onConfirm`, `variant`
- Variants: `danger` (red), `warning` (yellow), `info` (cyan)
- Handles confirm action and close automatically

**Usage**:
```typescript
import { ConfirmDialog } from '../shared';

const [confirmState, setConfirmState] = useState<{ id: string } | null>(null);

<ConfirmDialog
  open={confirmState !== null}
  onOpenChange={(open) => !open && setConfirmState(null)}
  title="Delete Item?"
  description="This cannot be undone."
  onConfirm={() => deleteItem(confirmState.id)}
  variant="danger"
/>
```
```

**Task 5.2**: Create session summary

**File**: `.claude/tasks/sessions/session-10-radix-alert-dialog.md`

Follow the pattern from previous sessions:
- Date, status, duration, test count
- What was implemented (ConfirmDialog component, ListSelector migration)
- Atomic commits created
- Verification results
- Key learnings (AlertDialog vs Dialog differences)
- Next steps

**Commit 5**: `docs(radix): add AlertDialog pattern and session summary`

---

## Post-Session Checklist

- [ ] All tests passing (`bun test:run`)
- [ ] Type check passing (`bun run tsc`)
- [ ] Build successful (`bun run build`)
- [ ] 5 atomic commits created
- [ ] Documentation updated
- [ ] Branch pushed to remote
- [ ] Ready for PR review

---

## Create Pull Request

```bash
git push -u origin feat/radix-alert-dialog

gh pr create --title "feat: replace browser confirm() with Radix AlertDialog (Session 10)" --body "$(cat <<'EOF'
## Summary
- Create reusable ConfirmDialog component with Radix AlertDialog
- Replace browser confirm() in ListSelector with custom AlertDialog
- Improve UX with theme-consistent confirmation dialogs
- Add variant styling (danger, warning, info)

## Changes
- New component: ConfirmDialog (src/components/shared/ConfirmDialog.tsx)
- Updated ListSelector to use AlertDialog instead of confirm()
- Removed browser dialog dependencies

## Components Created
- ConfirmDialog (shared reusable component)

## Components Updated
- ListSelector (uses ConfirmDialog for delete confirmations)

## Testing
- All 96+ tests passing
- New ConfirmDialog tests added
- Updated ListSelector tests for AlertDialog
- Manual testing completed

## Bundle Impact
- +8kb gzipped

## UX Improvements
- Theme-consistent dialogs (no more browser-native confirm())
- Better visual feedback (color-coded variants)
- Keyboard navigation (Escape, Tab, Enter)
- Accessible (WCAG 2.1 AA)

## Related
- Part of Radix UI Migration (Sessions 8-11)
- See: .claude/tasks/features/active/radix-ui-migration.md
EOF
)"
```

---

## Success Criteria

- ✅ ConfirmDialog component created and reusable
- ✅ No browser `confirm()` or `alert()` calls
- ✅ All confirmations use AlertDialog
- ✅ Variant styling works (danger, warning, info)
- ✅ All tests pass
- ✅ No visual regressions
- ✅ Documentation updated
- ✅ 5 atomic commits created

---

## Next Session

After merging this PR, proceed to **Session 11: Radix Mobile Drawer Enhancement**
- Prompt: `.claude/tasks/prompts/session-11-radix-mobile-drawer-prompt.md`
- Feature: Enhance MobileSidebar with Radix Dialog
