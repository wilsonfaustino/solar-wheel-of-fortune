# Feature Task: Mobile Fixes (Sidebar Scrollbars & Wheel Overlays)

**Status**: Ready for Implementation
**Priority**: Critical for MVP completion
**Estimated Time**: 30-45 minutes

---

## Context

After completing Session 7's responsive layout implementation, two critical mobile UX issues were discovered during testing that must be fixed before PR:

1. **Sidebar Scrollbar Issue**: Mobile and tablet drawer showing unwanted scrollbars
2. **Wheel Overlay Issue**: Text overlaps overlapping wheel component on small screens

---

## Issue 1: Sidebar Scrollbar Problems

### Symptoms
- Vertical scrollbar appears in mobile/tablet drawer sidebar
- Horizontal scrollbar sometimes appears on very small screens
- Nested scroll containers causing inconsistent behavior

### Root Causes
- `NameManagementSidebar` has hardcoded `h-screen` (100vh) conflicting with mobile drawer's flex layout
- Three levels of overflow handling creating nested scroll containers
- Fixed `w-80` (320px) may exceed viewport on very small screens

### Solution

Update `NameManagementSidebar.tsx` to use conditional height based on `isMobile` prop.

**File**: `src/components/sidebar/NameManagementSidebar.tsx` (Line 68)

**Change**:
```tsx
// BEFORE
<div className={`w-80 border-r flex flex-col h-screen ${className}`}>

// AFTER
<div className={`w-80 border-r flex flex-col ${isMobile ? 'h-full' : 'h-screen'} ${className}`}>
```

**Rationale**:
- Desktop: `h-screen` maintains fixed sidebar height (100vh) - existing behavior preserved
- Mobile: `h-full` fills drawer container height without forcing viewport height
- Eliminates height conflict between component and container
- Removes nested scroll container issue

---

## Issue 2: Wheel Text Overlays Overlapping

### Symptoms
- "CLICK CENTER TO RANDOMIZE" text overlaps top of wheel on mobile
- Selected name overlay overlaps bottom of wheel on mobile
- Issue worsens on very small screens (<400px)

### Root Causes
- Overlays positioned with fixed spacing (`top-8`, `bottom-8` = 32px)
- Fixed spacing doesn't scale with responsive wheel sizing:
  - Mobile: 350px wheel
  - Tablet: 500px wheel
  - Desktop: 900px wheel
- Container `max-w-4xl` can be much larger than wheel, creating excessive space

### Solution

Make overlay spacing responsive to match wheel sizing at each breakpoint.

**File**: `src/App.tsx`

**Change 1** - Top text overlay (Lines 107-113):
```tsx
// BEFORE
<div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs tracking-wider font-mono">
  CLICK CENTER TO RANDOMIZE
</div>

// AFTER
<div className="absolute top-2 sm:top-4 lg:top-8 left-1/2 -translate-x-1/2 text-xs tracking-wider font-mono">
  CLICK CENTER TO RANDOMIZE
</div>
```

**Change 2** - Bottom selected name overlay - Apply responsive spacing:
```tsx
// Update bottom spacing with responsive values
bottom-2 sm:bottom-4 lg:bottom-8
// Instead of fixed bottom-8
```

---

## Implementation Steps

1. Update `NameManagementSidebar.tsx` - Add conditional height
2. Update `App.tsx` - Make overlay spacing responsive
3. Test mobile drawer (no scrollbars)
4. Test wheel overlays (no overlapping on all screen sizes)
5. Test all breakpoints (sm, md, lg)

---

## Verification Checklist

- [ ] Mobile drawer shows no vertical scrollbar
- [ ] Mobile drawer shows no horizontal scrollbar
- [ ] Tablet drawer (768px) shows no scrollbars
- [ ] Top overlay text doesn't overlap wheel
- [ ] Bottom overlay text doesn't overlap wheel
- [ ] Desktop layout unchanged (h-screen preserved)
- [ ] All 96 tests still pass
- [ ] Type check passes
- [ ] Production build succeeds

---

## Files to Modify

1. `src/components/sidebar/NameManagementSidebar.tsx`
2. `src/App.tsx`

**Total Changes**: 2 files, ~3-4 line modifications
