# Session 9 Prompt: Radix Dropdown Menu Migration

**Copy this entire prompt to start Session 9**

---

## Session Goal

Migrate ListSelector dropdown from manual implementation to Radix DropdownMenu primitive for improved accessibility, keyboard navigation, and maintainability.

---

## Pre-Session Setup

1. Ensure Session 8 PR is merged to `main`
2. Pull latest changes: `git pull origin main`
3. Verify all tests pass: `bun test:run`
4. Review current dropdown implementation:
   - `src/components/sidebar/ListSelector.tsx` (lines 23-181)

---

## Session Tasks

### Phase 1: Setup & Installation (10 min)

**Task 1.1**: Create feature branch
```bash
git checkout -b feat/radix-dropdown-migration
```

**Task 1.2**: Install Radix Dropdown Menu
```bash
bun add @radix-ui/react-dropdown-menu
```

**Task 1.3**: Verify installation
```bash
bun run tsc  # Should pass with 0 errors
```

**Commit 1**: `chore(deps): add Radix DropdownMenu for accessible navigation`

---

### Phase 2: Migrate ListSelector Dropdown (30 min)

**Task 2.1**: Analyze current implementation

**Current behavior** (`src/components/sidebar/ListSelector.tsx`):
- Manual open/close state (`isOpen`, `setIsOpen`)
- Manual click-outside detection (lines 29-50)
- Manual Escape key handling (lines 37-42)
- Manual editing state for rename functionality
- Dropdown positioned absolutely below trigger

**File**: `src/components/sidebar/ListSelector.tsx`

**Changes to make**:

1. Add import:
```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
```

2. Remove manual state management:
```typescript
// DELETE line 23
const [isOpen, setIsOpen] = useState(false);

// DELETE lines 29-50 (click-outside and keyboard handlers)
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => { ... };
  const handleKeyDown = (event: KeyboardEvent) => { ... };
  // ... cleanup
}, []);
```

3. Replace trigger button (lines 74-88):
```typescript
// BEFORE
<button
  type="button"
  onClick={() => setIsOpen(!isOpen)}
  className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between group border border-(--color-border-light) bg-black/60 hover:bg-white/5"
>
  {/* ... content ... */}
</button>

// AFTER
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button
      type="button"
      className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between group border border-(--color-border-light) bg-black/60 hover:bg-white/5"
    >
      <div className="flex-1 text-left">
        <div className="text-xs tracking-wider mb-1 font-mono text-text/50">ACTIVE LIST</div>
        <div className="tracking-wider font-light font-mono text-accent">
          {activeList?.title ?? 'No List'}
        </div>
      </div>
      <ChevronDown className="w-5 h-5 text-accent/50 transition-transform group-data-[state=open]:rotate-180" />
    </button>
  </DropdownMenu.Trigger>
```

4. Replace dropdown container (lines 91-178):
```typescript
// BEFORE
{isOpen && (
  <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-sm z-50 max-h-80 overflow-y-auto scrollbar-themed bg-black/90 border border-border-light">

// AFTER
<DropdownMenu.Portal>
  <DropdownMenu.Content
    className="absolute top-full left-0 right-0 mt-2 backdrop-blur-sm z-50 max-h-80 overflow-y-auto scrollbar-themed bg-black/90 border border-border-light focus:outline-none"
    align="start"
    sideOffset={8}
  >
```

5. Replace list items (keep inline editing logic):
```typescript
// Map over lists inside DropdownMenu.Content
{lists.map((list) => (
  <div key={list.id} className={cn(...)}>
    {editingId === list.id ? (
      // Keep inline editing as-is (not a menu item)
      <input ... />
    ) : (
      <DropdownMenu.Item asChild>
        <div className="flex items-center justify-between focus:outline-none">
          <button
            type="button"
            onClick={() => {
              onSelectList(list.id);
              // Radix closes automatically on item click
            }}
            className="flex-1 text-left"
          >
            <div className="font-mono text-sm text-text">{list.title}</div>
            <div className="text-xs font-mono text-text/40">{list.names.length} names</div>
          </button>

          {/* Edit/Delete buttons remain the same */}
        </div>
      </DropdownMenu.Item>
    )}
  </div>
))}
```

6. Replace "Create New" button (lines 167-177):
```typescript
// BEFORE
<button
  type="button"
  onClick={() => {
    onCreateList();
    setIsOpen(false);
  }}
  className="..."
>
  <Plus className="size-5" />
  <span className="font-mono text-sm tracking-wider">CREATE NEW LIST</span>
</button>

// AFTER
<DropdownMenu.Separator className="h-px bg-border-light my-0" />
<DropdownMenu.Item asChild>
  <button
    type="button"
    onClick={onCreateList}
    className="w-full px-4 py-3 transition-colors flex items-center gap-2 bg-accent-05 text-accent hover:bg-accent-10 focus:outline-none"
  >
    <Plus className="size-5" />
    <span className="font-mono text-sm tracking-wider">CREATE NEW LIST</span>
  </button>
</DropdownMenu.Item>
```

7. Close DropdownMenu.Content, DropdownMenu.Portal, and DropdownMenu.Root

**Task 2.2**: Test dropdown functionality
```bash
bun dev
```

Manual test:
- [ ] Dropdown opens on click
- [ ] Dropdown closes on Escape
- [ ] Dropdown closes when clicking outside
- [ ] Dropdown closes when selecting a list
- [ ] Arrow keys navigate between items
- [ ] Enter key activates focused item
- [ ] Inline editing still works (not affected by Radix)

**Commit 2**: `feat(sidebar): migrate ListSelector to Radix DropdownMenu primitive`

---

### Phase 3: Testing & Verification (15 min)

**Task 3.1**: Create/update ListSelector tests

**File**: `src/components/sidebar/ListSelector.test.tsx` (create if doesn't exist)

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ListSelector } from './ListSelector';

const mockLists = [
  { id: '1', title: 'List 1', names: [], createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'List 2', names: [], createdAt: new Date(), updatedAt: new Date() },
];

describe('ListSelector', () => {
  it('should open dropdown on trigger click', async () => {
    render(
      <ListSelector
        lists={mockLists}
        activeListId="1"
        onSelectList={vi.fn()}
        onCreateList={vi.fn()}
        onDeleteList={vi.fn()}
        onRenameList={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /active list/i });
    await userEvent.click(trigger);

    expect(screen.getByText('List 1')).toBeInTheDocument();
    expect(screen.getByText('List 2')).toBeInTheDocument();
  });

  it('should close dropdown on Escape key', async () => {
    render(<ListSelector ... />);

    const trigger = screen.getByRole('button', { name: /active list/i });
    await userEvent.click(trigger);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('CREATE NEW LIST')).not.toBeInTheDocument();
  });

  it('should navigate items with arrow keys', async () => {
    render(<ListSelector ... />);

    const trigger = screen.getByRole('button', { name: /active list/i });
    await userEvent.click(trigger);

    await userEvent.keyboard('{ArrowDown}');
    // First item should be focused (test with accessibility tools or visual check)
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

**Commit 3**: `test(sidebar): add keyboard navigation tests for ListSelector dropdown`

---

### Phase 4: Documentation (10 min)

**Task 4.1**: Update CODE_REFERENCE.md

**File**: `.claude/tasks/CODE_REFERENCE.md`

Add new section after the Dialog pattern (around line 370):

```markdown
### DropdownMenu Pattern
**Components**: ListSelector
**Package**: `@radix-ui/react-dropdown-menu`

**Basic structure**:
```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button>Open Menu</button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Portal>
    <DropdownMenu.Content
      className="p-2 bg-black border border-border-light z-50 focus:outline-none"
      align="start"
      sideOffset={8}
    >
      <DropdownMenu.Item asChild>
        <button onClick={handleAction}>Action 1</button>
      </DropdownMenu.Item>

      <DropdownMenu.Separator className="h-px bg-border-light my-1" />

      <DropdownMenu.Item asChild>
        <button onClick={handleAction2}>Action 2</button>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

**Key features**:
- Automatic Escape key handling
- Automatic click-outside detection
- Arrow key navigation between items
- Enter/Space to activate focused item
- Auto-close on item selection
- Keyboard typeahead (type to focus item)
- Use `asChild` for custom trigger/items
```

**Task 4.2**: Create session summary

**File**: `.claude/tasks/sessions/session-09-radix-dropdown.md`

Follow the pattern from `session-08-radix-dialog.md`:
- Date, status, duration, test count
- What was implemented
- Atomic commits created
- Verification results
- Key learnings (arrow navigation, asChild pattern)
- Next steps

**Commit 4**: `docs(radix): add DropdownMenu pattern and session summary`

---

## Post-Session Checklist

- [ ] All tests passing (`bun test:run`)
- [ ] Type check passing (`bun run tsc`)
- [ ] Build successful (`bun run build`)
- [ ] 4 atomic commits created
- [ ] Documentation updated
- [ ] Branch pushed to remote
- [ ] Ready for PR review

---

## Create Pull Request

```bash
git push -u origin feat/radix-dropdown-migration

gh pr create --title "feat: migrate ListSelector to Radix DropdownMenu (Session 9)" --body "$(cat <<'EOF'
## Summary
- Migrate ListSelector dropdown to Radix DropdownMenu
- Add keyboard arrow navigation
- Improve accessibility with WCAG 2.1 AA compliance
- Remove manual click-outside detection logic

## Changes
- Replace manual dropdown state with Radix DropdownMenu primitive
- Remove click-outside event listeners (Radix handles it)
- Remove manual Escape key handler (Radix handles it)
- Add automatic arrow key navigation
- Preserve inline editing functionality

## Components Updated
- ListSelector (src/components/sidebar/ListSelector.tsx)

## Testing
- All 96+ tests passing
- Keyboard navigation tested (Escape, Arrow keys, Enter)
- Click-outside behavior tested
- Manual testing completed

## Bundle Impact
- +12kb gzipped

## Code Reduction
- Removed ~40 lines of manual event handler code

## Related
- Part of Radix UI Migration (Sessions 8-11)
- See: .claude/tasks/features/active/radix-ui-migration.md
EOF
)"
```

---

## Success Criteria

- ✅ ListSelector uses Radix DropdownMenu
- ✅ Arrow key navigation works
- ✅ Escape key closes dropdown
- ✅ Click-outside closes dropdown
- ✅ Inline editing preserved
- ✅ All tests pass
- ✅ No visual regressions
- ✅ Documentation updated
- ✅ 4 atomic commits created

---

## Next Session

After merging this PR, proceed to **Session 10: Radix AlertDialog Migration**
- Prompt: `.claude/tasks/prompts/session-10-radix-alert-dialog-prompt.md`
- Feature: Replace browser `confirm()` with Radix AlertDialog
