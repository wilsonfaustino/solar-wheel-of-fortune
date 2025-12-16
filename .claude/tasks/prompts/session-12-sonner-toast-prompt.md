# Session 12 Prompt: Sonner Toast Notification System

## Quick Start

Copy and paste this prompt to begin Session 12 implementation.

---

## Session Goal

Replace the static selected name display card with a Sonner headless toast notification system that shows selection announcements with full theming support and history stacking.

## Context Files to Read

Before starting, review these files:
1. `.claude/plans/concurrent-pondering-petal.md` - Complete implementation plan
2. `src/App.tsx` - Current selected name display (lines 79-88)
3. `src/components/wheel/RadialWheel.tsx` - Spin animation and selection callback
4. `src/stores/useNameStore.ts` - Selection history tracking
5. `src/index.css` - Theme system and CSS variables
6. `.claude/tasks/CODE_REFERENCE.md` - Component and styling patterns

## Requirements

1. Install and configure Sonner toast library
2. Use headless API to create custom SelectionToast component
3. Match existing design:
   - Fira Code monospace font
   - Backdrop blur (`backdrop-blur-sm`)
   - Black background with transparency (`bg-black/60`)
   - Theme-based accent colors (`text-(--color-accent)`)
   - Border with theme color (`border-(--color-border-light)`)
4. Replace selected name card in App.tsx (lines 79-88)
5. Toast appears on every wheel spin
6. If history length > 1, show toast stack (max 3 visible)
7. Support all 3 themes: Cyan, Matrix, Sunset
8. Responsive design (mobile/tablet/desktop)
9. Accessibility: keyboard dismissal (Escape), ARIA announcements
10. Comprehensive tests for new components

## Implementation Phases

### Phase 1: Installation & Setup (15 min)
- Install Sonner: `bun add sonner`
- Create `src/components/toast/Toaster.tsx` wrapper
- Add Toaster to App.tsx root level
- Configure positioning: bottom-center

### Phase 2: Custom Toast Component (30 min)
- Create `src/components/toast/SelectionToast.tsx`
- Props: `{ id, nameValue, timestamp, onDismiss }`
- Replicate existing card styling (backdrop blur, theme colors, Fira Code)
- Add close button (X icon from lucide-react)
- Add entrance/exit animations (slide-up + fade)

### Phase 3: Integration (20 min)
- Create `src/components/toast/showSelectionToast.ts` utility
- Remove old selected name card from App.tsx (lines 79-88)
- Update handleSelect to call showSelectionToast
- Duration: 5000ms for single, 8000ms for stacked

### Phase 4: History Stacking (25 min)
- Create `src/hooks/useToastHistory.ts` for stack management
- Limit visible toasts to 3 (most recent)
- Vertical offset stacking with gap-2
- Slight opacity fade for older toasts (90%, 80%)
- Auto-dismiss oldest when limit exceeded

### Phase 5: Theming & Polish (15 min)
- Test all 3 themes (Cyan, Matrix, Sunset)
- Responsive sizing (mobile: smaller, desktop: full)
- Animation timing: entrance 200ms, exit 150ms, shift 300ms
- Verify backdrop blur on all screen sizes

### Phase 6: Testing (30 min)
- Create `src/components/toast/SelectionToast.test.tsx`
- Create `src/components/toast/showSelectionToast.test.ts`
- Manual integration tests:
  - Single spin → single toast
  - Multiple spins → toast stack
  - Theme switching → colors update
  - Responsive sizing
  - Keyboard: Space to spin, Escape to dismiss
- Verify all 139 existing tests pass
- Type-check: `bun run tsc`
- Build: `bun run build`

### Phase 7: Documentation (10 min)
- Create `.claude/tasks/sessions/session-12-sonner-toast.md`
- Update `.claude/tasks/README.md` (session status, test count)
- Update `.claude/tasks/CODE_REFERENCE.md` (toast patterns)
- Create atomic commits:
  1. `feat(toast): add Sonner installation and Toaster setup`
  2. `feat(toast): create SelectionToast headless component`
  3. `feat(toast): integrate toast with wheel selection flow`
  4. `feat(toast): add toast history stacking (max 3 visible)`
  5. `test(toast): add comprehensive SelectionToast tests`

## Expected Deliverables

### New Files Created (7)
1. `src/components/toast/Toaster.tsx` - Sonner wrapper
2. `src/components/toast/SelectionToast.tsx` - Custom headless toast
3. `src/components/toast/showSelectionToast.ts` - Utility function
4. `src/components/toast/index.ts` - Barrel exports
5. `src/hooks/useToastHistory.ts` - Stack management
6. `src/components/toast/SelectionToast.test.tsx` - Component tests
7. `src/components/toast/showSelectionToast.test.ts` - Utility tests

### Files Modified (5)
1. `src/App.tsx` - Remove card, add Toaster, update handleSelect
2. `src/components/wheel/RadialWheel.tsx` - Pass history length
3. `.claude/tasks/README.md` - Update session status
4. `.claude/tasks/CODE_REFERENCE.md` - Add toast patterns
5. `package.json` - Add sonner dependency

### Session Documentation (1)
1. `.claude/tasks/sessions/session-12-sonner-toast.md` - Summary with:
   - Overview (what was replaced, why)
   - Implementation details
   - Files modified
   - Testing results
   - Commits created
   - Key learnings

## Code Style Requirements

1. Use `cn()` utility for conditional classes (no inline ternaries)
2. Memoize components where appropriate (`memo()`)
3. Use Tailwind v4 utility classes (no inline styles)
4. Reference CSS variables for theme colors: `text-(--color-accent)`
5. Follow existing component structure (components/toast directory)
6. Use lucide-react icons (X for close button)
7. Use Fira Code font: `font-mono`
8. Follow atomic commit pattern (1 feature per commit)

## Design Reference

**Current Selected Name Card** (to replicate in toast):
```tsx
<div className="px-6 py-3 backdrop-blur-sm rounded bg-black/60 border border-(--color-border-light)">
  <div className="text-xs tracking-wider mb-1 font-mono text-text/50">SELECTED</div>
  <div className="text-2xl tracking-wider font-light font-mono text-(--color-accent)">
    {selectedName.value}
  </div>
</div>
```

**Toast Stack Layout** (when history.length > 1):
```
┌─────────────────────────┐
│  Most Recent Selection  │  ← opacity-100, top position
└─────────────────────────┘
┌─────────────────────────┐
│  Previous Selection     │  ← opacity-90, middle position
└─────────────────────────┘
┌─────────────────────────┐
│  Oldest Selection       │  ← opacity-80, bottom position
└─────────────────────────┘
```

## Testing Checklist

- [ ] Sonner installed successfully
- [ ] Toaster renders in App.tsx
- [ ] SelectionToast matches card styling
- [ ] Toast appears on wheel spin
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Close button (X) dismisses toast
- [ ] Escape key dismisses toast
- [ ] Toast stack shows up to 3 toasts
- [ ] Oldest toast dismissed when 4th appears
- [ ] Theme switching updates toast colors
- [ ] Responsive sizing works (mobile/tablet/desktop)
- [ ] All 139 existing tests pass
- [ ] New toast tests pass
- [ ] Type-check passes (0 errors)
- [ ] Production build succeeds

## Success Criteria

- Static card replaced with dynamic toast notifications
- Sonner headless API used (no default styles)
- Custom SelectionToast component matches existing design
- Toast stacking works (max 3 visible)
- All 3 themes supported
- Responsive on all screen sizes
- Comprehensive tests added
- All existing tests still pass
- Documentation complete
- 5 atomic commits created

## Estimated Time: 2.5 hours

---

## Copy This to Start Session

```
I'm ready to implement the Sonner toast notification system to replace the static selected name display.

I've read:
- .claude/plans/concurrent-pondering-petal.md (implementation plan)
- src/App.tsx (current selected name display)
- src/components/wheel/RadialWheel.tsx (spin and selection logic)
- src/stores/useNameStore.ts (selection history)
- src/index.css (theme system)
- .claude/tasks/CODE_REFERENCE.md (component patterns)

Please implement all 7 phases:
1. Install Sonner and create Toaster wrapper
2. Create custom SelectionToast component (headless, match existing card styling)
3. Integrate with wheel selection flow
4. Add toast history stacking (max 3 visible)
5. Polish theming and responsive design
6. Create comprehensive tests
7. Update documentation

Requirements:
- Use Sonner headless API (full custom styling)
- Match existing design (Fira Code, backdrop blur, theme colors)
- Support all 3 themes (Cyan, Matrix, Sunset)
- Responsive design (mobile/tablet/desktop)
- Accessibility (keyboard dismissal, ARIA)
- All existing 139 tests must pass
- Create atomic commits (1 feature per commit)

Let's start with Phase 1: Sonner installation and Toaster setup.
```
