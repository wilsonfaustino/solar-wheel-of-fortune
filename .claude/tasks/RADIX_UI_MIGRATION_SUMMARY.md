# Radix UI Migration - Complete Plan Summary

**Status**: Ready to Execute
**Created**: December 14, 2024
**Sessions**: 8, 9, 10, 11
**Total Time**: 6-8 hours (across 4 sessions)

---

## Quick Start

To start the migration, begin with **Session 8**:

1. Copy the entire prompt from: `.claude/tasks/prompts/session-08-radix-dialog-prompt.md`
2. Paste it into a new Claude Code conversation
3. Follow the step-by-step instructions
4. Create atomic commits as you go
5. Create PR when complete
6. Move to Session 9

---

## What This Migration Does

### Before (Current State)
- 6 components using manual `div` implementations for modals/dropdowns
- ~250 lines of custom event handler code (click-outside, Escape keys, focus management)
- Browser-native `confirm()` and `alert()` dialogs
- Inconsistent accessibility across components
- Manual ARIA attribute management

### After (With Radix UI)
- 6 components using Radix UI primitives
- ~50 lines of configuration code (Radix handles the rest)
- **WCAG 2.1 AA compliant** out of the box
- Consistent accessibility patterns
- Automatic keyboard navigation, focus management, screen reader support

---

## Migration Breakdown

### Session 8: Dialog Migration (60-90 min)
**Branch**: `feat/radix-dialog-migration`

**Install**:
```bash
bun add @radix-ui/react-dialog
```

**Migrates**:
- ExportModal (`src/components/sidebar/ExportModal.tsx`)
- BulkImportModal (`src/components/sidebar/AddNameForm.tsx`)

**Removes**:
- ~50 lines of manual keyboard handlers
- Manual `onKeyDown` Escape logic
- Manual click-outside detection

**Adds**:
- Automatic Escape handling
- Automatic focus trapping
- Automatic ARIA attributes
- Portal rendering

**Bundle**: +15kb gzipped

**Prompt**: `.claude/tasks/prompts/session-08-radix-dialog-prompt.md`

---

### Session 9: Dropdown Migration (45-60 min)
**Branch**: `feat/radix-dropdown-migration`

**Install**:
```bash
bun add @radix-ui/react-dropdown-menu
```

**Migrates**:
- ListSelector dropdown (`src/components/sidebar/ListSelector.tsx`)

**Removes**:
- ~40 lines of click-outside detection
- Manual Escape key handlers
- Manual open/close state management

**Adds**:
- Arrow key navigation (automatic)
- Keyboard typeahead
- Auto-close on selection
- Better accessibility

**Bundle**: +12kb gzipped

**Prompt**: `.claude/tasks/prompts/session-09-radix-dropdown-prompt.md`

---

### Session 10: AlertDialog Migration (45-60 min)
**Branch**: `feat/radix-alert-dialog`

**Install**:
```bash
bun add @radix-ui/react-alert-dialog
```

**Creates**:
- `ConfirmDialog` component (`src/components/shared/ConfirmDialog.tsx`)

**Migrates**:
- Delete confirmations in ListSelector
- Replaces all browser `confirm()` and `alert()` calls

**Removes**:
- Browser-native dialogs
- Inconsistent UX

**Adds**:
- Theme-consistent confirmation dialogs
- Variant styling (danger, warning, info)
- Better keyboard navigation
- Accessible confirmations

**Bundle**: +8kb gzipped

**Prompt**: `.claude/tasks/prompts/session-10-radix-alert-dialog-prompt.md`

---

### Session 11: Mobile Drawer Enhancement (30-45 min)
**Branch**: `feat/radix-mobile-drawer`

**No new dependencies** (reuses Dialog from Session 8)

**Migrates**:
- MobileSidebar (`src/components/sidebar/MobileSidebar.tsx`)

**Removes**:
- ~15 lines of manual Escape handlers
- Manual body scroll lock logic

**Adds**:
- Consistent modal behavior with desktop
- Better focus management on mobile
- Combines Radix Dialog + Framer Motion (best of both worlds)

**Bundle**: 0kb (reuses existing package)

**Prompt**: `.claude/tasks/prompts/session-11-radix-mobile-drawer-prompt.md`

---

## Total Impact

### Bundle Size
- **Total Addition**: +35kb gzipped
- **Trade-off**: Worth it for accessibility, maintainability, UX improvements

### Code Reduction
- **~200 lines removed**: Manual event handlers, click-outside detection, keyboard logic
- **~50 lines added**: Radix configuration
- **Net**: ~150 lines removed

### Accessibility Improvements
- ✅ WCAG 2.1 AA compliant
- ✅ Proper ARIA attributes (auto-generated)
- ✅ Focus trapping and restoration
- ✅ Keyboard navigation (Escape, Tab, Arrow keys, Enter)
- ✅ Screen reader announcements
- ✅ Body scroll locking when modals open

### Developer Experience
- ✅ Less code to maintain
- ✅ Consistent patterns across components
- ✅ Better testing (Radix has comprehensive tests)
- ✅ Future-proof (easy to add Toast, Tooltip, Popover later)

---

## File Structure After Migration

```
.claude/tasks/
├── README.md (updated with Radix UI tasks)
├── CODE_REFERENCE.md (Radix patterns added)
│
├── features/
│   ├── active/
│   │   ├── mobile-fixes.md
│   │   └── radix-ui-migration.md (master plan)
│   └── completed/
│       └── (will contain radix-ui-migration.md after Session 11)
│
├── sessions/
│   ├── session-08-radix-dialog.md (created in Session 8)
│   ├── session-09-radix-dropdown.md (created in Session 9)
│   ├── session-10-radix-alert-dialog.md (created in Session 10)
│   └── session-11-radix-mobile-drawer.md (created in Session 11)
│
└── prompts/
    ├── session-08-radix-dialog-prompt.md ✅ Ready
    ├── session-09-radix-dropdown-prompt.md ✅ Ready
    ├── session-10-radix-alert-dialog-prompt.md ✅ Ready
    └── session-11-radix-mobile-drawer-prompt.md ✅ Ready
```

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
- ✅ Focus management automatic
- ✅ Proper ARIA attributes
- ✅ Screen reader compatible
- ✅ WCAG 2.1 AA compliant

### Code Quality
- ✅ Manual event handlers removed
- ✅ Click-outside logic removed
- ✅ Keyboard handlers removed
- ✅ Consistent patterns
- ✅ Atomic commits per session

---

## Git Workflow

### Per Session
1. Create feature branch: `git checkout -b feat/radix-[component]-migration`
2. Make changes following prompt instructions
3. Create 4-5 atomic commits per session
4. Push branch: `git push -u origin feat/radix-[component]-migration`
5. Create PR with detailed description
6. Merge after review/approval
7. Pull main and start next session

### Commit Message Format
```
chore(deps): add Radix [Component] for accessible [feature]
feat([component]): migrate [ComponentName] to Radix [Primitive]
test([component]): add comprehensive tests for [Component]
docs(radix): add [Primitive] pattern and session summary
```

---

## Testing Strategy

### Per Session
- Unit tests for migrated components
- Keyboard interaction tests
- Accessibility attribute tests
- Regression tests (existing behavior preserved)

### Manual Testing Checklist (All Sessions)
- [ ] Open/close behavior (click, keyboard)
- [ ] Escape key closes modals/dropdowns
- [ ] Tab navigation works
- [ ] Arrow keys work (DropdownMenu)
- [ ] Focus trapping works
- [ ] Focus restoration works
- [ ] Screen reader announces correctly
- [ ] No visual regressions
- [ ] Mobile/tablet behavior correct

---

## Rollback Plan

Each session is independent:
- If Session 8 fails → revert branch, no impact
- If Session 9 fails → keep Session 8, revert Session 9
- If Session 10 fails → keep Sessions 8-9, revert Session 10
- If Session 11 fails → keep Sessions 8-10, revert Session 11

**Low Risk**: Each Radix primitive is independent.

---

## Next Steps

### To Start Session 8
1. Review this summary
2. Open `.claude/tasks/prompts/session-08-radix-dialog-prompt.md`
3. Copy the entire prompt
4. Start new Claude Code conversation
5. Paste prompt and follow instructions

### After All Sessions Complete
- Move `radix-ui-migration.md` to `features/completed/`
- Update `.claude/tasks/README.md` session tracking
- Update main `CLAUDE.md` with Radix patterns
- Consider future enhancements (Toast, Tooltip, Popover)

---

## Questions?

**Master Plan**: `.claude/tasks/features/active/radix-ui-migration.md`
**Session Prompts**: `.claude/tasks/prompts/session-XX-*.md`
**Code Reference**: `.claude/tasks/CODE_REFERENCE.md`
**Radix Docs**: https://www.radix-ui.com/primitives

---

## Benefits Recap

1. **Accessibility**: WCAG 2.1 AA compliant, screen reader support
2. **Maintainability**: ~200 lines of code removed
3. **Consistency**: Standardized patterns across all interactive components
4. **User Experience**: Better keyboard navigation, focus management
5. **Future-Proof**: Easy to add more Radix primitives later
6. **Developer Experience**: Less custom code to maintain and test

**Total Time Investment**: 6-8 hours across 4 sessions
**Total Value**: Production-ready accessibility, cleaner codebase, better UX

---

**Ready to start? Begin with Session 8!**
`.claude/tasks/prompts/session-08-radix-dialog-prompt.md`
