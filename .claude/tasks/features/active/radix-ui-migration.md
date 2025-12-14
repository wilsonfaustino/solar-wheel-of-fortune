# Feature Task: Radix UI Migration (Accessibility & Behavioral Components)

**Status**: Ready for Implementation
**Priority**: Post-MVP Enhancement
**Estimated Time**: 4 sessions (6-8 hours total)
**Sessions**: 8, 9, 10, 11

---

## Context

After analyzing the project, we identified 6 components using manual `div` implementations for modals, dropdowns, and drawers with custom accessibility attributes. This migration replaces them with Radix UI primitives for:

- **Better Accessibility**: WCAG 2.1 AA compliance out of the box
- **Improved Focus Management**: Automatic trapping and restoration
- **Reduced Maintenance**: Less custom keyboard/click-outside logic
- **Standardized Navigation**: Built-in Escape, Tab, Arrow key support
- **Better Screen Reader Support**: Proper ARIA attributes auto-generated

### Decision: Radix UI over Base UI

**Why Radix UI?**
1. Already using `@radix-ui/react-slot` (ecosystem alignment)
2. Perfect Tailwind CSS v4 integration (unstyled primitives)
3. More comprehensive component coverage (AlertDialog, Toast, etc.)
4. Larger ecosystem (shadcn/ui, Vercel, Linear use it)
5. Better documentation and real-world examples
6. Tree-shakeable individual packages (smaller bundle)

**Bundle Impact**: +35kb gzipped (acceptable for accessibility gains)

---

## Migration Roadmap

### Session 8: Dialog Migration
**Branch**: `feat/radix-dialog-migration`
**Components**: ExportModal, BulkImportModal (2 components)
**Estimated Time**: 60-90 minutes

**Install**:
```bash
bun add @radix-ui/react-dialog
```

**Changes**:
- Replace `<div role="presentation">` with `<Dialog.Root>`
- Replace heading with `<Dialog.Title>`
- Replace close button with `<Dialog.Close>`
- Remove manual `onKeyDown` Escape handlers (Radix handles it)
- Add `<Dialog.Portal>` and `<Dialog.Overlay>`

**Files**:
- `src/components/sidebar/ExportModal.tsx`
- `src/components/sidebar/AddNameForm.tsx` (inline BulkImportModal)
- Tests for both modals

---

### Session 9: Dropdown Migration
**Branch**: `feat/radix-dropdown-migration`
**Components**: ListSelector dropdown (1 component)
**Estimated Time**: 45-60 minutes

**Install**:
```bash
bun add @radix-ui/react-dropdown-menu
```

**Changes**:
- Replace manual dropdown state with `<DropdownMenu.Root>`
- Replace trigger button with `<DropdownMenu.Trigger>`
- Replace dropdown div with `<DropdownMenu.Content>`
- Add keyboard arrow navigation (automatic)
- Remove click-outside detection logic (Radix handles it)

**Files**:
- `src/components/sidebar/ListSelector.tsx`
- Tests for dropdown

**Note**: Using DropdownMenu instead of Select (DropdownMenu for actions/navigation, Select for form inputs)

---

### Session 10: Alert Dialog Migration
**Branch**: `feat/radix-alert-dialog`
**Components**: Delete confirmations (2 locations)
**Estimated Time**: 45-60 minutes

**Install**:
```bash
bun add @radix-ui/react-alert-dialog
```

**Changes**:
- Replace `confirm("Delete list?")` with `<AlertDialog>` component
- Replace `alert("Cannot delete")` with styled AlertDialog
- Add custom styled confirmation dialogs
- Better UX with theme-consistent design

**Files**:
- `src/components/sidebar/ListSelector.tsx` (delete confirmations)
- Potentially: new shared `ConfirmDialog.tsx` component
- Tests for alert dialogs

---

### Session 11: Mobile Drawer Enhancement
**Branch**: `feat/radix-mobile-drawer`
**Components**: MobileSidebar (1 component)
**Estimated Time**: 30-45 minutes

**Dependencies**: Uses `@radix-ui/react-dialog` (already installed in Session 8)

**Changes**:
- Refactor `MobileSidebar` to use Dialog primitive
- Standardize with ExportModal/BulkImportModal pattern
- Improve focus trapping on mobile
- Better keyboard navigation

**Files**:
- `src/components/sidebar/MobileSidebar.tsx`
- Tests for mobile drawer

**Bundle Impact**: 0kb (reuses existing Dialog package)

---

## Total Impact Summary

### Bundle Size
- **Before**: Custom implementations (~5kb)
- **After**: Radix primitives (~40kb gzipped)
- **Net Increase**: +35kb gzipped

**Trade-off Justification**: Acceptable increase for:
- WCAG 2.1 AA accessibility compliance
- Reduced maintenance burden (~200 lines of custom logic removed)
- Better user experience (keyboard nav, focus management)
- Future-proofing (Toast, Tooltip, Popover easy to add)

### Files Modified
- **Components**: 6 files total
- **New Files**: Potentially 1 (shared ConfirmDialog component)
- **Tests**: 6 test files updated/created
- **Dependencies**: +3 packages

### Code Reduction
- Remove ~200 lines of manual event handlers
- Remove click-outside detection logic
- Remove manual keyboard handlers (Escape, Tab)
- Remove manual focus management
- Remove manual ARIA attribute assignments

---

## Session-by-Session Breakdown

### Session 8: Foundation
**Purpose**: Establish Dialog pattern, migrate most complex modals first

**Why First?**
- ExportModal is most complex modal (forms, validation, state)
- Establishes patterns for Sessions 9-11
- Dialog is most critical primitive (used by 3 components)

**Deliverables**:
- ExportModal using Radix Dialog
- BulkImportModal using Radix Dialog
- Shared animation utilities (if needed)
- Updated tests
- Documentation pattern for future sessions

---

### Session 9: Interactions
**Purpose**: Migrate dropdown interactions, add keyboard navigation

**Why Second?**
- Builds on Dialog knowledge from Session 8
- Different primitive (DropdownMenu) expands Radix understanding
- ListSelector is critical navigation component

**Deliverables**:
- ListSelector using Radix DropdownMenu
- Keyboard arrow navigation working
- Click-outside logic removed
- Updated tests

---

### Session 10: Confirmations
**Purpose**: Replace browser dialogs with custom AlertDialog

**Why Third?**
- Depends on Dialog primitive knowledge from Session 8
- AlertDialog is similar to Dialog (easier after Session 8)
- Improves UX over browser `confirm()`/`alert()`

**Deliverables**:
- Custom AlertDialog component (reusable)
- Delete confirmations using AlertDialog
- No more browser `confirm()` calls
- Themed, consistent confirmation UI
- Updated tests

---

### Session 11: Mobile Polish
**Purpose**: Apply learnings to mobile drawer, ensure consistency

**Why Last?**
- Reuses Dialog from Session 8 (no new package)
- Benefits from all previous learnings
- Final polish to ensure consistency across desktop/mobile

**Deliverables**:
- MobileSidebar using Radix Dialog
- Consistent modal behavior across app
- Improved mobile focus management
- Updated tests

---

## Success Criteria (All Sessions)

### Functional
- ✅ All existing functionality preserved
- ✅ No visual regressions
- ✅ All 96+ tests passing
- ✅ Type check passes (0 errors)
- ✅ Production build succeeds

### Accessibility
- ✅ Keyboard navigation works (Escape, Tab, Arrow keys)
- ✅ Focus management automatic (trapping, restoration)
- ✅ Proper ARIA attributes (`role`, `aria-labelledby`, `aria-describedby`)
- ✅ Screen reader announcements correct
- ✅ WCAG 2.1 AA compliance

### Code Quality
- ✅ Manual event handlers removed
- ✅ Click-outside logic removed
- ✅ Keyboard handlers removed
- ✅ Consistent patterns across all components
- ✅ Atomic commits for each session

---

## Testing Strategy

### Unit Tests
Each migrated component gets:
- Keyboard interaction tests (Escape, Enter, Tab, Arrows)
- Focus management tests
- Accessibility attribute tests
- Regression tests (existing behavior preserved)

### Integration Tests
- User workflows (create list, export, delete)
- Keyboard-only navigation
- Tab order verification

### Manual Testing
- Screen reader testing (VoiceOver/NVDA)
- Mobile device testing
- Cross-browser testing (Chrome, Firefox, Safari)

---

## Rollback Plan

Each session is on a separate branch:
1. If Session 8 fails → revert branch, Dialog not merged
2. If Session 9 fails → keep Session 8, Dropdown stays manual
3. If Session 10 fails → keep Sessions 8-9, AlertDialog stays browser-native
4. If Session 11 fails → keep Sessions 8-10, MobileSidebar stays Framer Motion only

**Low Risk**: Each primitive is independent, can be rolled back individually without affecting others.

---

## Implementation Order Rationale

1. **Dialog First** (Session 8)
   - Most complex, establishes foundation
   - Used by 3 components (ExportModal, BulkImportModal, MobileSidebar)
   - Highest impact on accessibility

2. **Dropdown Second** (Session 9)
   - Different primitive, expands knowledge
   - Critical navigation component
   - Moderately complex

3. **AlertDialog Third** (Session 10)
   - Similar to Dialog, easier after Session 8
   - UX improvement over browser dialogs
   - Low complexity

4. **Mobile Drawer Last** (Session 11)
   - Reuses Dialog primitive (Session 8)
   - Benefits from all previous learnings
   - Lowest complexity (mostly refactoring)

---

## Next Steps

1. ✅ Review and approve this master plan
2. ⬜ Start Session 8: Dialog Migration
3. ⬜ Create branch `feat/radix-dialog-migration`
4. ⬜ Follow Session 8 detailed plan (to be created in `.claude/tasks/prompts/`)
5. ⬜ Create atomic commits
6. ⬜ Write session summary
7. ⬜ Merge to main
8. ⬜ Repeat for Sessions 9-11

---

## Related Documentation

- [Session 8 Prompt](../prompts/session-08-radix-dialog-prompt.md) (to be created)
- [Session 9 Prompt](../prompts/session-09-radix-dropdown-prompt.md) (to be created)
- [Session 10 Prompt](../prompts/session-10-radix-alert-dialog-prompt.md) (to be created)
- [Session 11 Prompt](../prompts/session-11-radix-mobile-drawer-prompt.md) (to be created)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [CODE_REFERENCE.md](../../CODE_REFERENCE.md)
- [CLAUDE.md](../../../CLAUDE.md)
