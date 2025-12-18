# Session 15: Shadcn Button Component Migration - Phase 1 (Sidebar)

## Session Goal

Migrate all sidebar component buttons to use the Shadcn Button component while preserving the distinctive tech/cyberpunk aesthetic (font-mono, tracking-wider, accent colors).

## Model Recommendation

**Recommended Model**: **Sonnet 4.5** (current model)

**Rationale**:
- This is a complex refactoring task requiring careful pattern matching and visual consistency
- Involves 9 component files with ~20 individual button replacements
- Requires understanding of CVA (Class Variance Authority) for variant creation
- Needs precision to maintain exact styling and accessibility features
- Sonnet 4.5 provides the best balance of accuracy and cost for this task

**Alternative**: Opus 4.5 if you want maximum attention to detail and zero visual regressions, but Sonnet 4.5 should be sufficient.

---

## Pre-Session Setup

Before starting, verify the following:

```bash
# 1. Ensure you're on a clean main branch
git status  # Should show clean working tree

# 2. Run tests to ensure baseline passes
bun test:run

# 3. Run type check
bun run tsc

# 4. Run build to ensure no errors
bun build

# 5. Create feature branch
git checkout -b feat/shadcn-button-migration-phase1
```

**Expected Output**: All checks pass, new branch created.

---

## Session Tasks

### Phase 1: Extend Button Component with Tech Variants (15-20 min)

**Goal**: Add custom CVA variants to support the tech aesthetic.

**File**: `src/components/ui/button.tsx`

**Task**: Extend the `buttonVariants` CVA configuration with tech-themed variants.

**Add the following variants** (after existing variants):

```typescript
const buttonVariants = cva(
  // Keep existing base classes unchanged
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // EXISTING VARIANTS (DO NOT MODIFY)
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',

        // NEW TECH VARIANTS (ADD THESE)
        tech: 'font-mono tracking-wider bg-accent-10 border border-border-light text-accent hover:bg-accent-20 transition-colors',
        'tech-ghost': 'font-mono tracking-wider bg-transparent text-text/70 hover:bg-white/10 transition-colors',
        'tech-destructive': 'font-mono tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors',
        'tech-toggle': 'font-mono tracking-wider border transition-colors',
        'tech-outline': 'font-mono tracking-wider border border-white/20 bg-transparent text-text/70 hover:border-white/40 hover:text-text transition-colors',
      },
      size: {
        // EXISTING SIZES (DO NOT MODIFY)
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',

        // NEW TECH SIZES (ADD THESE)
        'tech-default': 'h-11 px-4 py-3',
        'tech-sm': 'h-10 px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**Verification**:
- Type check: `bun run tsc` (should pass)
- No runtime errors in dev server

**Commit**:
```bash
git add src/components/ui/button.tsx
git commit -m "feat(ui): extend Button component with tech variants and sizes"
```

---

### Phase 2: Migrate ActionButtons Component (10 min)

**File**: `src/components/sidebar/names-list/ActionButtons.tsx`

**Current Implementation** (simplified):
```typescript
<button
  type="button"
  onClick={onClick}
  disabled={!hasTargetContent}
  title={title}
  className={cn(
    'flex-1 px-3 py-3 h-11 transition-colors font-mono text-xs tracking-wider bg-transparent disabled:cursor-not-allowed flex items-center justify-center gap-2',
    hasTargetContent
      ? 'border border-white/20 hover:bg-white/10 cursor-pointer transition-colors text-text/70 bg-white/5'
      : 'text-text/30'
  )}
>
  {children}
</button>
```

**New Implementation**:
```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { memo } from 'react';

interface ActionButtonsProps {
  onClick: () => void;
  hasTargetContent: boolean;
  title?: string;
  children: React.ReactNode;
}

export const ActionButtons = memo(
  ({ onClick, hasTargetContent, title, children }: ActionButtonsProps) => {
    return (
      <Button
        type="button"
        onClick={onClick}
        disabled={!hasTargetContent}
        title={title}
        variant="tech-ghost"
        size="tech-default"
        className={cn(
          'flex-1 text-xs',
          hasTargetContent && 'border border-white/20 bg-white/5'
        )}
      >
        {children}
      </Button>
    );
  }
);

ActionButtons.displayName = 'ActionButtons';
```

**Verification**:
- Visual check: CLEAR and RESET buttons in BulkActionsPanel look identical
- Disabled state works correctly
- Hover effects match previous behavior

**Commit**:
```bash
git add src/components/sidebar/names-list/ActionButtons.tsx
git commit -m "refactor(sidebar): migrate ActionButtons to use Button component"
```

---

### Phase 3: Migrate NameListItem Buttons (15 min)

**File**: `src/components/sidebar/NameListItem.tsx`

**Task**: Replace 4 buttons with Button component.

**Add Import**:
```typescript
import { Button } from '@/components/ui/button';
```

**Button 1 - Exclude/Include Button** (icon-only toggle):

**Before**:
```typescript
<button
  type="button"
  onClick={() => toggleNameExclusion(activeListId, name.id)}
  className={cn(
    'p-2 rounded transition-colors h-10 w-10 flex items-center justify-center bg-transparent hover:bg-white/10',
    name.isExcluded ? 'text-text opacity-30' : 'text-accent opacity-70'
  )}
  aria-label={name.isExcluded ? 'Include name' : 'Exclude name'}
  title={name.isExcluded ? 'Include' : 'Exclude'}
>
  {name.isExcluded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => toggleNameExclusion(activeListId, name.id)}
  variant="tech-ghost"
  size="icon-sm"
  className={name.isExcluded ? 'opacity-30' : 'text-accent opacity-70'}
  aria-label={name.isExcluded ? 'Include name' : 'Exclude name'}
  title={name.isExcluded ? 'Include' : 'Exclude'}
>
  {name.isExcluded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
</Button>
```

**Button 2 - Edit Button** (icon-only):

**Before**:
```typescript
<button
  type="button"
  onClick={() => setIsEditing(true)}
  className="p-2 rounded transition-colors h-10 w-10 flex items-center justify-center bg-transparent text-accent opacity-70 hover:bg-white/10"
  aria-label={`Edit ${name.value}`}
>
  <Edit2 className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => setIsEditing(true)}
  variant="tech-ghost"
  size="icon-sm"
  className="text-accent opacity-70"
  aria-label={`Edit ${name.value}`}
>
  <Edit2 className="size-4" />
</Button>
```

**Button 3 - Delete Button** (icon-only destructive):

**Before**:
```typescript
<button
  type="button"
  onClick={() => deleteName(activeListId, name.id)}
  className="p-2 rounded transition-colors text-red-400/70 h-10 w-10 flex items-center justify-center bg-transparent hover:bg-white/10"
  aria-label={`Delete ${name.value}`}
>
  <Trash2 className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => deleteName(activeListId, name.id)}
  variant="tech-destructive"
  size="icon-sm"
  aria-label={`Delete ${name.value}`}
>
  <Trash2 className="size-4" />
</Button>
```

**Verification**:
- All 3 icon buttons appear identical to before
- Hover states work (bg-white/10 on hover)
- Toggle state for exclude/include works
- Icon sizes are consistent (size-4)

**Commit**:
```bash
git add src/components/sidebar/NameListItem.tsx
git commit -m "refactor(sidebar): migrate NameListItem buttons to Button component"
```

---

### Phase 4: Migrate AddNameForm Buttons (20 min)

**File**: `src/components/sidebar/AddNameForm.tsx`

**Task**: Replace 4 buttons with Button component.

**Add Import**:
```typescript
import { Button } from '@/components/ui/button';
```

**Button 1 - Submit Button** (Add Name):

**Before**:
```typescript
<button
  type="submit"
  className="px-4 py-3 h-11 font-mono text-sm text-accent border border-border-light bg-accent-10 tracking-wider transition-colors flex items-center justify-center"
  aria-label="Add name"
>
  <Plus className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="submit"
  variant="tech"
  size="tech-default"
  className="text-sm"
  aria-label="Add name"
>
  <Plus className="size-4" />
</Button>
```

**Button 2 - Bulk Import Link**:

**Before**:
```typescript
<button
  type="button"
  onClick={() => setShowBulkImport(true)}
  className="mt-3 text-xs text-accent/70 font-mono tracking-wider flex items-center gap-1"
>
  <Upload className="size-3" />
  BULK IMPORT
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => setShowBulkImport(true)}
  variant="tech-ghost"
  size="sm"
  className="mt-3 text-xs"
>
  <Upload className="size-3" />
  BULK IMPORT
</Button>
```

**Button 3 - Modal Import Button**:

**Before**:
```typescript
<button
  type="button"
  onClick={handleBulkImport}
  disabled={bulkText.trim().length === 0}
  className="flex-1 px-4 py-3 h-11 font-mono text-sm text-accent border border-border-light bg-accent-10 tracking-wider transition-colors"
>
  IMPORT
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={handleBulkImport}
  disabled={bulkText.trim().length === 0}
  variant="tech"
  size="tech-default"
  className="flex-1 text-sm"
>
  IMPORT
</Button>
```

**Button 4 - Modal Cancel Button** (Dialog.Close wrapper):

**Before**:
```typescript
<Dialog.Close asChild>
  <button
    type="button"
    className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors"
  >
    CANCEL
  </button>
</Dialog.Close>
```

**After**:
```typescript
<Dialog.Close asChild>
  <Button
    type="button"
    variant="tech-outline"
    size="tech-default"
    className="text-sm"
  >
    CANCEL
  </Button>
</Dialog.Close>
```

**Verification**:
- Submit button (Plus icon) works and matches previous style
- Bulk import link opens modal correctly
- Modal import button disabled when textarea empty
- Modal cancel button closes dialog via Dialog.Close
- All font-mono and tracking-wider styles preserved

**Commit**:
```bash
git add src/components/sidebar/AddNameForm.tsx
git commit -m "refactor(sidebar): migrate AddNameForm buttons to Button component"
```

---

### Phase 5: Migrate ListSelector Buttons (20 min)

**File**: `src/components/sidebar/ListSelector.tsx`

**Task**: Replace 5 buttons with Button component.

**Add Import**:
```typescript
import { Button } from '@/components/ui/button';
```

**Button 1 - Dropdown Trigger** (Radix DropdownMenu.Trigger):

**Before**:
```typescript
<DropdownMenu.Trigger asChild>
  <button
    type="button"
    className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between group border border-(--color-border-light) bg-black/60 hover:bg-white/5 data-[state=open]:bg-white/5"
  >
    {/* Dropdown content */}
  </button>
</DropdownMenu.Trigger>
```

**After**:
```typescript
<DropdownMenu.Trigger asChild>
  <Button
    type="button"
    variant="tech-outline"
    size="tech-default"
    className="w-full justify-between data-[state=open]:bg-white/5"
  >
    {/* Dropdown content */}
  </Button>
</DropdownMenu.Trigger>
```

**Button 2 - Edit List Button** (icon-only, in dropdown):

**Before**:
```typescript
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); setEditingId(list.id); }}
  className="p-1 rounded text-accent/70 bg-transparent hover:bg-white/5"
  aria-label={`Edit ${list.title}`}
>
  <Edit2 className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={(e) => { e.stopPropagation(); setEditingId(list.id); }}
  variant="tech-ghost"
  size="icon-sm"
  className="text-accent/70"
  aria-label={`Edit ${list.title}`}
>
  <Edit2 className="size-4" />
</Button>
```

**Button 3 - Delete List Button** (icon-only, destructive):

**Before**:
```typescript
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); handleDeleteClick(list.id); }}
  className="p-1 rounded text-red-400/70 bg-transparent hover:bg-white/5"
  disabled={lists.length === 1}
  aria-label={`Delete ${list.title}`}
>
  <Trash2 className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={(e) => { e.stopPropagation(); handleDeleteClick(list.id); }}
  variant="tech-destructive"
  size="icon-sm"
  disabled={lists.length === 1}
  aria-label={`Delete ${list.title}`}
>
  <Trash2 className="size-4" />
</Button>
```

**Note**: There are also "Select List Item" buttons and "Create New List" button in this component. Apply the same Button pattern.

**Verification**:
- Dropdown trigger opens/closes correctly
- Edit button shows inline editing
- Delete button disabled when only 1 list exists
- All Radix `asChild` integrations work
- data-[state=open] styling works on dropdown trigger

**Commit**:
```bash
git add src/components/sidebar/ListSelector.tsx
git commit -m "refactor(sidebar): migrate ListSelector buttons to Button component"
```

---

### Phase 6: Migrate ExportModal Buttons (20 min)

**File**: `src/components/sidebar/ExportModal.tsx`

**Task**: Replace 5 buttons with Button component.

**Add Import**:
```typescript
import { Button } from '@/components/ui/button';
```

**Button 1 - Close Button** (icon-only, Dialog.Close):

**Before**:
```typescript
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

**After**:
```typescript
<Dialog.Close asChild>
  <Button
    type="button"
    variant="tech-ghost"
    size="icon-sm"
    className="text-accent/50 hover:text-accent"
    aria-label="Close modal"
  >
    <X className="size-5" />
  </Button>
</Dialog.Close>
```

**Button 2 - CSV Format Toggle**:

**Before**:
```typescript
<button
  type="button"
  onClick={() => setFormat('csv')}
  className={cn(
    'flex-1 px-3 py-2 font-mono text-sm tracking-wider transition-colors border',
    format === 'csv'
      ? 'border-accent bg-accent-20 text-accent'
      : 'bg-transparent border-white/20 text-text/70 hover:border-white/40 hover:text-text'
  )}
>
  CSV
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => setFormat('csv')}
  variant="tech-toggle"
  size="tech-sm"
  className={cn(
    'flex-1 text-sm',
    format === 'csv'
      ? 'border-accent bg-accent-20 text-accent'
      : 'border-white/20 text-text/70 hover:border-white/40 hover:text-text'
  )}
>
  CSV
</Button>
```

**Button 3 - JSON Format Toggle** (same pattern as CSV):

**After**:
```typescript
<Button
  type="button"
  onClick={() => setFormat('json')}
  variant="tech-toggle"
  size="tech-sm"
  className={cn(
    'flex-1 text-sm',
    format === 'json'
      ? 'border-accent bg-accent-20 text-accent'
      : 'border-white/20 text-text/70 hover:border-white/40 hover:text-text'
  )}
>
  JSON
</Button>
```

**Button 4 - Download Button**:

**Before**:
```typescript
<button
  type="button"
  onClick={handleExport}
  className={cn(
    'flex-1 px-4 py-2 transition-colors font-mono text-sm tracking-wider flex items-center justify-center gap-2',
    'bg-accent-10 border border-border-light text-accent hover:bg-accent-20'
  )}
>
  <Download className="size-4" />
  DOWNLOAD
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={handleExport}
  variant="tech"
  size="tech-sm"
  className="flex-1 text-sm"
>
  <Download className="size-4" />
  DOWNLOAD
</Button>
```

**Button 5 - Cancel Button**:

**Before**:
```typescript
<button
  type="button"
  onClick={onClose}
  className="px-4 py-2 transition-colors font-mono text-sm tracking-wider bg-transparent border border-white/20 text-text/70 hover:bg-white/5"
>
  CANCEL
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={onClose}
  variant="tech-outline"
  size="tech-sm"
  className="text-sm"
>
  CANCEL
</Button>
```

**Verification**:
- Close button dismisses modal
- CSV/JSON toggle buttons switch active state correctly
- Download button triggers export
- Cancel button closes modal
- All Dialog.Close integrations work

**Commit**:
```bash
git add src/components/sidebar/ExportModal.tsx
git commit -m "refactor(sidebar): migrate ExportModal buttons to Button component"
```

---

### Phase 7: Migrate TabSelectionButton (10 min)

**File**: `src/components/sidebar/TabSelectionButton.tsx`

**Task**: Refactor component to use Button internally.

**Before**:
```typescript
import { cn } from '@/utils/cn';
import { memo } from 'react';

interface TabSelectionButtonProps {
  isActiveTab: boolean;
  onSelectTab: () => void;
  children: React.ReactNode;
}

export const TabSelectionButton = memo(
  ({ isActiveTab, onSelectTab, children }: TabSelectionButtonProps) => {
    return (
      <button
        type="button"
        onClick={onSelectTab}
        className={cn(
          'flex-1 px-4 py-3 font-mono text-sm transition-colors',
          isActiveTab ? 'text-accent border-b-2 border-accent' : 'text-text/50 border-b-0'
        )}
      >
        {children}
      </button>
    );
  }
);

TabSelectionButton.displayName = 'TabSelectionButton';
```

**After**:
```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { memo } from 'react';

interface TabSelectionButtonProps {
  isActiveTab: boolean;
  onSelectTab: () => void;
  children: React.ReactNode;
}

export const TabSelectionButton = memo(
  ({ isActiveTab, onSelectTab, children }: TabSelectionButtonProps) => {
    return (
      <Button
        type="button"
        onClick={onSelectTab}
        variant="tech-ghost"
        size="tech-default"
        className={cn(
          'flex-1 text-sm rounded-none',
          isActiveTab ? 'text-accent border-b-2 border-accent' : 'text-text/50 border-b-0'
        )}
      >
        {children}
      </Button>
    );
  }
);

TabSelectionButton.displayName = 'TabSelectionButton';
```

**Note**: `rounded-none` preserves tab aesthetic (no rounded corners on tabs).

**Verification**:
- Active tab shows accent text and bottom border
- Inactive tab shows muted text, no border
- Tab switching works correctly

**Commit**:
```bash
git add src/components/sidebar/TabSelectionButton.tsx
git commit -m "refactor(sidebar): migrate TabSelectionButton to use Button component"
```

---

### Phase 8: Migrate HistoryItem and HistoryPanel Buttons (15 min)

**Files**:
- `src/components/sidebar/HistoryItem.tsx` (1 button)
- `src/components/sidebar/HistoryPanel.tsx` (2 buttons)

**Add Imports** (both files):
```typescript
import { Button } from '@/components/ui/button';
```

#### HistoryItem.tsx

**Button - Delete Button** (icon-only destructive):

**Before**:
```typescript
<button
  type="button"
  onClick={() => onDelete(record.id)}
  className="ml-2 p-1.5 rounded transition-colors text-red-400/70 shrink-0 bg-transparent hover:bg-white/10"
  aria-label={`Delete ${record.nameValue} from history`}
>
  <Trash2 className="size-4" />
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={() => onDelete(record.id)}
  variant="tech-destructive"
  size="icon-sm"
  className="ml-2 shrink-0"
  aria-label={`Delete ${record.nameValue} from history`}
>
  <Trash2 className="size-4" />
</Button>
```

#### HistoryPanel.tsx

**Button 1 - Export Button**:

**Before**:
```typescript
<button
  type="button"
  onClick={handleOpenExport}
  className="flex-1 px-4 py-2 transition-colors font-mono text-sm flex items-center justify-center gap-2 border border-(--color-border-light) text-(--color-accent) bg-transparent hover:bg-accent-20"
  aria-label="Export selection history"
>
  <Download className="size-4" />
  Export
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={handleOpenExport}
  variant="tech-outline"
  size="tech-sm"
  className="flex-1 text-sm text-accent hover:bg-accent-20"
  aria-label="Export selection history"
>
  <Download className="size-4" />
  Export
</Button>
```

**Button 2 - Clear History Button**:

**Before**:
```typescript
<button
  type="button"
  onClick={handleClearHistory}
  className="flex-1 px-4 py-2 transition-colors font-mono text-sm flex items-center justify-center gap-2 text-red-400 border border-destructive/30 bg-transparent hover:bg-destructive/20"
  aria-label="Clear all history"
>
  <Trash2 className="size-4" />
  Clear
</button>
```

**After**:
```typescript
<Button
  type="button"
  onClick={handleClearHistory}
  variant="tech-destructive"
  size="tech-sm"
  className="flex-1 text-sm"
  aria-label="Clear all history"
>
  <Trash2 className="size-4" />
  Clear
</Button>
```

**Verification**:
- HistoryItem delete button matches previous style
- HistoryPanel export button opens modal
- HistoryPanel clear button shows confirmation dialog

**Commit**:
```bash
git add src/components/sidebar/HistoryItem.tsx src/components/sidebar/HistoryPanel.tsx
git commit -m "refactor(sidebar): migrate HistoryItem and HistoryPanel buttons to Button component"
```

---

### Phase 9: Update Documentation (20 min)

**Task**: Document the new Button variants and usage patterns.

#### File 1: CLAUDE.md

**Add section** after "## Code Style":

```markdown
## Button Component Usage

The application uses a centralized Button component (`src/components/ui/button.tsx`) with CVA (Class Variance Authority) for variant management.

### Tech Variants

The following custom variants preserve the tech/cyberpunk aesthetic:

**Variants:**
- `tech` - Primary tech button (font-mono, tracking-wider, accent bg/border)
- `tech-ghost` - Transparent tech button (font-mono, tracking-wider, hover effects)
- `tech-destructive` - Destructive tech button (font-mono, tracking-wider, red theme)
- `tech-toggle` - Toggle button (font-mono, tracking-wider, active/inactive states via className)
- `tech-outline` - Outline tech button (font-mono, tracking-wider, border only)

**Tech Sizes:**
- `tech-default` - h-11, px-4 py-3 (sidebar buttons)
- `tech-sm` - h-10, px-3 py-2 (compact buttons)

**Icon Sizes:**
- `icon-sm` - size-8 (small icon-only buttons)
- `icon` - size-9 (default icon-only buttons)
- `icon-lg` - size-10 (large icon-only buttons)

### Usage Examples

**Primary tech button:**
```typescript
<Button variant="tech" size="tech-default">
  <Plus className="size-4" />
  ADD
</Button>
```

**Icon-only button:**
```typescript
<Button variant="tech-ghost" size="icon-sm" aria-label="Delete name">
  <Trash2 className="size-4" />
</Button>
```

**Destructive button:**
```typescript
<Button variant="tech-destructive" size="tech-sm">
  <Trash2 className="size-4" />
  DELETE
</Button>
```

**Toggle button (active/inactive states):**
```typescript
<Button
  variant="tech-toggle"
  size="tech-sm"
  className={cn(
    isActive
      ? 'border-accent bg-accent-20 text-accent'
      : 'border-white/20 text-text/70'
  )}
>
  OPTION
</Button>
```

**Radix integration (Dialog.Close, DropdownMenu.Trigger):**
```typescript
<Dialog.Close asChild>
  <Button variant="tech-outline" size="tech-default">
    CANCEL
  </Button>
</Dialog.Close>
```

### Migration Notes

- CenterButton (wheel spin) intentionally NOT migrated - complex custom animations preserved
- All sidebar buttons use Button component as of Session 15
- Icon buttons standardized to size-8 (icon-sm), size-9 (icon), or size-10 (icon-lg)
- Disabled states automatically handled by Button (pointer-events-none, opacity-50)
- Focus rings handled by Button's base classes (focus-visible variants)
```

#### File 2: .claude/tasks/CODE_REFERENCE.md

**Add section** under "## Components":

```markdown
### Button Component

**Location**: `src/components/ui/button.tsx`

**Description**: Centralized button component using CVA (Class Variance Authority) for variant management. Supports both standard Shadcn variants and custom tech-themed variants.

**Tech Variants** (preserve cyberpunk aesthetic):
- `tech` - Primary tech button (accent bg, border, font-mono)
- `tech-ghost` - Transparent button with hover effects
- `tech-destructive` - Destructive action (red theme)
- `tech-toggle` - Toggle states (active/inactive via className)
- `tech-outline` - Border-only button

**Icon Sizes**:
- `icon-sm` (size-8), `icon` (size-9), `icon-lg` (size-10)

**Usage Pattern**:
```typescript
import { Button } from '@/components/ui/button';

// Primary button
<Button variant="tech" size="tech-default">
  ACTION
</Button>

// Icon-only button
<Button variant="tech-ghost" size="icon-sm" aria-label="Delete">
  <Trash2 className="size-4" />
</Button>

// With Radix integration
<Dialog.Close asChild>
  <Button variant="tech-outline" size="tech-default">
    CANCEL
  </Button>
</Dialog.Close>
```

**Key Features**:
- `asChild` prop for Radix Slot composition
- Automatic disabled state styling (opacity-50, pointer-events-none)
- Focus ring management (focus-visible:ring-ring/50)
- SVG icon sizing via CSS selector ([&_svg:not([class*='size-'])]:size-4)
```

**Commit**:
```bash
git add CLAUDE.md .claude/tasks/CODE_REFERENCE.md
git commit -m "docs(button): update documentation with Button component usage patterns"
```

---

## Post-Session Checklist

After completing all phases, verify the following:

```bash
# 1. Type check passes
bun run tsc

# 2. Build succeeds
bun build

# 3. Tests pass (if component tests exist)
bun test:run

# 4. Dev server runs without errors
bun dev
```

**Visual Regression Testing** (manual):
1. Open http://localhost:5173
2. Navigate to each sidebar section and verify:
   - [ ] All buttons appear identical to before migration
   - [ ] Hover states work (bg-white/10 on hover)
   - [ ] Focus states show ring on keyboard navigation
   - [ ] Disabled states reduce opacity and prevent clicks
   - [ ] Icon sizes are consistent (size-4 for icons)
   - [ ] Font-mono and tracking-wider preserved
   - [ ] Accent colors match theme (cyan, matrix, sunset)

**Interaction Testing**:
1. **NameListItem**: Test exclude/include toggle, edit, delete
2. **AddNameForm**: Test add name, bulk import modal, import/cancel
3. **ListSelector**: Test dropdown open/close, edit/delete list, create new list
4. **ExportModal**: Test CSV/JSON toggle, download, close, cancel
5. **HistoryPanel**: Test export, clear history (with confirmation)
6. **TabSelectionButton**: Test tab switching (Names/History)
7. **BulkActionsPanel**: Test CLEAR and RESET buttons

---

## Create Pull Request

Once all checks pass and visual verification is complete:

```bash
# 1. Push feature branch
git push -u origin feat/shadcn-button-migration-phase1

# 2. Create PR using GitHub CLI
gh pr create --title "feat(ui): migrate sidebar buttons to Shadcn Button component (Phase 1)" --body "$(cat <<'EOF'
## Summary
- Extended Button component with 5 tech variants (tech, tech-ghost, tech-destructive, tech-toggle, tech-outline)
- Added 2 tech sizes (tech-default, tech-sm) for sidebar consistency
- Migrated 9 sidebar component files (~20 individual buttons) to use Button component
- Preserved distinctive tech/cyberpunk aesthetic (font-mono, tracking-wider, accent colors)
- Standardized icon button sizes to icon-sm/icon/icon-lg
- Updated documentation with Button usage patterns

## Components Migrated
1. ActionButtons.tsx - Bulk action buttons
2. NameListItem.tsx - 4 buttons (exclude, edit, delete, name display)
3. AddNameForm.tsx - 4 buttons (submit, bulk import, modal import, cancel)
4. ListSelector.tsx - 5 buttons (dropdown trigger, edit, delete, create, select)
5. ExportModal.tsx - 5 buttons (close, CSV/JSON toggles, download, cancel)
6. TabSelectionButton.tsx - Tab navigation button
7. HistoryItem.tsx - Delete button
8. HistoryPanel.tsx - 2 buttons (export, clear)
9. BulkActionsPanel.tsx - Uses ActionButtons (indirect migration)

## Components NOT Migrated (Phase 2)
- CenterButton (wheel spin) - Custom animations preserved
- MobileHeader - Mobile-specific button
- ConfirmDialog - Dialog action buttons
- SelectionToast - Toast close button

## Test Plan
- [ ] Type check passes (bun run tsc)
- [ ] Build succeeds (bun build)
- [ ] Tests pass (bun test:run)
- [ ] Visual regression: all buttons identical to before
- [ ] Hover states work (bg-white/10)
- [ ] Focus states show ring
- [ ] Disabled states prevent interaction
- [ ] All icon sizes consistent (size-4)
- [ ] Tech aesthetic preserved (font-mono, tracking-wider)
- [ ] All Radix integrations work (Dialog.Close, DropdownMenu.Trigger)

## Bundle Impact
Expected minimal impact - Button component already imported in project. Adding variants increases CSS size by ~500 bytes (gzipped).

## Breaking Changes
None - this is a refactoring with no API changes.

## Next Steps
Phase 2: Migrate remaining components (MobileHeader, ConfirmDialog, SelectionToast)

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Troubleshooting

### Issue 1: Type errors with Radix `asChild`

**Symptom**: TypeScript errors when using `asChild` with Dialog.Close or DropdownMenu.Trigger.

**Solution**: Ensure Button component has `asChild?: boolean` prop in type definition. The Shadcn Button already supports this via Radix Slot.

### Issue 2: Button styling doesn't match exactly

**Symptom**: Buttons look slightly different after migration.

**Solution**:
- Check that tech variants include `font-mono tracking-wider`
- Verify custom className overrides are applied correctly
- Use browser DevTools to compare computed styles before/after

### Issue 3: Icon sizes inconsistent

**Symptom**: Some icons appear larger/smaller than before.

**Solution**:
- All icons should use `className="size-4"` (enforced by Button's SVG selector)
- Icon-only buttons use `size="icon-sm"` (size-8) for consistency

### Issue 4: Hover states not working

**Symptom**: Buttons don't show hover background change.

**Solution**:
- Tech variants already include `hover:bg-white/10` or `hover:bg-accent-20`
- If custom hover needed, use className prop: `className="hover:bg-custom"`

### Issue 5: Focus rings missing

**Symptom**: Keyboard navigation doesn't show focus state.

**Solution**:
- Button component includes `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Ensure no `outline-none` in custom className overrides

---

## Success Criteria

- [ ] All 9 sidebar component files migrated successfully
- [ ] 9 atomic commits created (1 per phase)
- [ ] Tech aesthetic preserved (visual regression test passes)
- [ ] Icon sizes standardized (all use size-4 icons)
- [ ] Type check passes (`bun run tsc`)
- [ ] Build succeeds (`bun build`)
- [ ] Tests pass (`bun test:run`)
- [ ] Documentation updated (CLAUDE.md, CODE_REFERENCE.md)
- [ ] Pull request created with detailed description
- [ ] No console errors or warnings in dev server
- [ ] All Radix integrations work (Dialog.Close, DropdownMenu.Trigger)
- [ ] Accessibility maintained (aria-labels, keyboard navigation)

---

## Next Session: Phase 2

Components to migrate in Phase 2:
1. `src/components/MobileHeader.tsx` - Mobile menu toggle button (remove inline styles)
2. `src/components/shared/ConfirmDialog.tsx` - Dialog action buttons (confirm/cancel with variants)
3. `src/components/toast/SelectionToast.tsx` - Toast dismiss button

**Note**: CenterButton (wheel spin) will remain custom due to complex pulse animations and backdrop blur.

---

## Estimated Timeline

- **Phase 1**: Extend Button component (15-20 min)
- **Phase 2**: Migrate ActionButtons (10 min)
- **Phase 3**: Migrate NameListItem (15 min)
- **Phase 4**: Migrate AddNameForm (20 min)
- **Phase 5**: Migrate ListSelector (20 min)
- **Phase 6**: Migrate ExportModal (20 min)
- **Phase 7**: Migrate TabSelectionButton (10 min)
- **Phase 8**: Migrate HistoryItem/HistoryPanel (15 min)
- **Phase 9**: Update documentation (20 min)
- **Post-session**: Testing and PR creation (20 min)

**Total**: 90-120 minutes

---

## Related Files

- **Plan**: `.claude/plans/tranquil-launching-bumblebee.md`
- **Session Doc**: `.claude/tasks/sessions/session-15-shadcn-button-migration-phase1.md` (create after session)
- **Code Reference**: `.claude/tasks/CODE_REFERENCE.md`
- **Project Docs**: `CLAUDE.md`
