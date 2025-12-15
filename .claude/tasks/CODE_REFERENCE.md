# Code Reference Guide

Quick lookup for code patterns, components, and common tasks in the Radial Name Randomizer project.

---

## Table of Contents

1. [Radix UI Patterns](#radix-ui-patterns)
2. [Store Patterns](#store-patterns)
3. [Component Patterns](#component-patterns)
4. [Styling Patterns](#styling-patterns)
5. [Testing Patterns](#testing-patterns)
6. [Useful Links](#useful-links)

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

**Reference**: Session 8 ([sessions/session-08-radix-dialog.md](./sessions/session-08-radix-dialog.md))

---

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
- Automatic click-outside detection (no manual useEffect needed)
- Arrow key navigation (Up/Down/Home/End)
- Type-ahead search (type to focus matching item)
- Automatic positioning (align, sideOffset props)
- Auto-close on item selection (use `e.preventDefault()` in `onSelect` to prevent)
- Use `asChild` prop for custom trigger/items
- Width matching with `w-[var(--radix-dropdown-menu-trigger-width)]`

**Special handling for non-menu items**:
```typescript
// Inline editing: wrap in plain div, not DropdownMenu.Item
{editingId === item.id ? (
  <div className="px-4 py-3">
    <input ... />
  </div>
) : (
  <DropdownMenu.Item>
    {/* Menu item content */}
  </DropdownMenu.Item>
)}

// Prevent auto-close on button clicks inside items
<DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
  <button onClick={handleEdit}>Edit</button>
  <button onClick={handleDelete}>Delete</button>
</DropdownMenu.Item>
```

**Reference**: Session 9 ([sessions/session-09-radix-dropdown.md](./sessions/session-09-radix-dropdown.md))

---

## Store Patterns

### Zustand Store with Immer
**File**: `src/stores/useNameStore.ts`

**Basic structure**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface State {
  data: DataType[];
}

interface Actions {
  addItem: (item: DataType) => void;
}

export const useStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      data: [],

      addItem: (item) =>
        set((state) => {
          state.data.push(item); // Immer allows mutations
        }),
    })),
    {
      name: 'store-name',
    }
  )
);
```

**Key patterns**:
- Use `immer` middleware for draft-style mutations (simpler than spread operators)
- Use `persist` middleware for localStorage sync
- Use `useShallow` hook when selecting multiple state values to prevent re-renders
- Derive computed data with `useMemo` in components

**Example usage**:
```typescript
import { useShallow } from 'zustand/react/shallow';

// Good: prevents re-renders when unrelated state changes
const { items, addItem } = useStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);

// Bad: re-renders on any state change
const store = useStore();
```

---

## Component Patterns

### Memoized Component with Props
**Pattern**: All sidebar components

```typescript
import { memo } from 'react';

interface ComponentProps {
  data: string[];
  onAction: (id: string) => void;
}

function ComponentName({ data, onAction }: ComponentProps) {
  // Component logic
  return <div>...</div>;
}

export const Component = memo(ComponentName);
```

**When to use `memo`**:
- Pure components with stable props
- Components that receive the same props frequently
- Components in lists or frequently re-rendered trees

---

### Keyboard Shortcuts Hook
**File**: `src/hooks/useKeyboardShortcuts.ts`

```typescript
import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: {
  onSpace?: () => void;
  onEscape?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === ' ' && handlers.onSpace) {
        event.preventDefault();
        handlers.onSpace();
      }

      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
```

---

## Styling Patterns

### Class Name Composition with `cn()`
**File**: `src/utils/cn.ts`

```typescript
import { cn } from '../../utils/cn';

// Conditional classes
<div className={cn(
  'base-class',
  condition && 'conditional-class',
  isActive ? 'active-class' : 'inactive-class'
)} />

// Override Tailwind classes (tailwind-merge resolves conflicts)
<div className={cn('p-2', 'p-4')} /> // Results in: p-4
```

**Never use**:
- Template literals for conditional classes: `` `${condition ? 'a' : 'b'}` ``
- Inline styles (use Tailwind utilities instead)
- Manual className concatenation: `'class1 ' + (condition ? 'class2' : '')`

---

### Tailwind v4 Custom Properties
**File**: `src/index.css`

```css
@theme {
  --color-accent: oklch(0.82 0.14 142);
  --color-text: oklch(0.95 0.02 142);
  --color-border-light: oklch(0.3 0.05 142);
}
```

**Usage in components**:
```typescript
<div className="border border-(--color-border-light) text-text bg-accent" />
```

**Custom animations**:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px var(--color-accent); }
  50% { box-shadow: 0 0 20px var(--color-accent); }
}

/* Use in component */
<div className="animate-pulse-glow" />
```

---

### Reusable Button Component
**File**: `src/components/sidebar/names-list/ActionButtons.tsx`

```typescript
interface ActionButtonsProps {
  buttons: Array<{
    onClick: () => void;
    label: string;
    variant: 'primary' | 'secondary';
    disabled?: boolean;
  }>;
}

export function ActionButtons({ buttons }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          onClick={button.onClick}
          disabled={button.disabled}
          className={cn(
            'flex-1 px-4 py-2 font-mono text-sm tracking-wider transition-colors',
            button.variant === 'primary'
              ? 'bg-accent text-black hover:bg-accent/90 disabled:bg-accent/50'
              : 'bg-white/10 text-text hover:bg-white/20 disabled:bg-white/5'
          )}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Testing Patterns

### Store Tests with Vitest
**File**: `src/stores/useNameStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNameStore } from './useNameStore';

describe('useNameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useNameStore.setState({ /* reset state */ });
  });

  it('should add item', () => {
    const { result } = renderHook(() => useNameStore());

    act(() => {
      result.current.addItem({ id: '1', name: 'Test' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Test');
  });
});
```

---

### Component Tests with React Testing Library
**File**: `src/components/sidebar/ExportModal.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ExportModal } from './ExportModal';

describe('ExportModal', () => {
  it('should close on Escape key', async () => {
    const handleClose = vi.fn();

    render(
      <ExportModal
        isOpen={true}
        onClose={handleClose}
        records={[]}
      />
    );

    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(<ExportModal isOpen={true} onClose={vi.fn()} records={[]} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
```

---

### Mock Data Pattern
**File**: `src/stores/useNameStore.mock.ts`

```typescript
import type { NameList } from '../types/name';

export const mockNameList: NameList = {
  id: '1',
  title: 'Test List',
  names: [
    { id: '1', value: 'Alice', isExcluded: false },
    { id: '2', value: 'Bob', isExcluded: false },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
```

**Usage in tests**:
```typescript
import { mockNameList } from './useNameStore.mock';

it('should work with mock data', () => {
  const { result } = renderHook(() => useNameStore());
  act(() => {
    result.current.lists = [mockNameList];
  });
  // ...
});
```

---

## Useful Links

### Documentation
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Vitest](https://vitest.dev/) - Unit testing framework
- [React Testing Library](https://testing-library.com/react) - Component testing

### Project Files
- [CLAUDE.md](../CLAUDE.md) - Project overview and architecture
- [README.md](./README.md) - Session navigation and status
- [Sessions](./sessions/) - Detailed session summaries
- [Features](./features/) - Feature task documentation

---

**Last Updated**: Session 9 (December 14, 2024)
**Maintained By**: Claude Code session documentation
