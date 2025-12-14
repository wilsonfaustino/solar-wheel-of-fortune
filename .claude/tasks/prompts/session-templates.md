# Ideal Next Session Prompt

Use this prompt to start the next development session efficiently. Copy and paste it directly into Claude Code.

---

## For Session 5 Phase 2 (History UI - Next Immediate Work)

```
Start Session 5 Phase 2: Selection History UI Components

Read .claude/tasks/SESSION_5_SUMMARY.md for context (Phase 1 complete).
Reference .claude/tasks/CODE_REFERENCE.md for component patterns.

Phase 2: UI Components (60-90 min)

1. Create HistoryPanel.tsx component
   - Display last 10-20 selections with timestamps
   - Show relative time formatting ("2 min ago", "1h ago", etc)
   - Show total count and empty state
   - Clear history button (uses clearHistory action)

2. Create HistoryItem.tsx component
   - Single selection display (name value)
   - Timestamp (relative time)
   - Delete button (uses deleteHistoryItem action)

3. Integrate into NameManagementSidebar.tsx
   - Add HistoryPanel as new section/tab
   - Show/hide toggle
   - Reuse existing sidebar styling patterns

4. Add relative time formatter utility
   - "just now" (< 1 min)
   - "5m ago" (< 1 hour)
   - "2h ago" (< 24 hours)
   - "3d ago" (< 30 days)
   - Full date for older

5. Write component tests
   - HistoryPanel renders empty state
   - HistoryPanel displays selections
   - Delete button removes item
   - Timestamps are formatted correctly

Deliverables:
- src/components/sidebar/HistoryPanel.tsx
- src/components/sidebar/HistoryItem.tsx (optional, can inline)
- src/utils/formatRelativeTime.ts (or in HistoryPanel)
- Updated src/components/sidebar/NameManagementSidebar.tsx
- Component tests in .test.ts files
- All tests passing
- Type-check passes
- Build succeeds

Use single quotes (Biome configured).
Reference CODE_REFERENCE.md for component patterns.
```

---

## For Session 5 Phase 3 (Export - After Phase 2)

```
Continue Session 5 Phase 3: Export Functionality

Phase 3: Export Utilities & UI (30-45 min)

1. Create src/utils/export.ts with:
   - exportToCSV(records: SelectionRecord[], filename: string) => void
   - exportToJSON(records: SelectionRecord[], filename: string) => void
   - Proper CSV escaping for names with commas/quotes
   - Pretty-printed JSON with metadata

2. Create export button in HistoryPanel
   - "Export CSV" button
   - "Export JSON" button
   - Triggers download with timestamp-based filename
   - e.g., "selection-history-2024-12-10.csv"

3. Optional: Create ExportModal.tsx for format selection
   - Radio buttons: CSV vs JSON
   - Download button
   - Preview option

4. Write export utility tests
   - CSV formatting correct
   - JSON structure valid
   - File naming includes timestamp
   - Escaping works for special characters

Deliverables:
- src/utils/export.ts (2 functions)
- Export buttons in HistoryPanel
- Export tests (5+ tests)
- All tests passing
- Type-check passes
- Build succeeds
```

---

## For Session 6 (Theming - After Session 5 Complete)

```
Start Session 6: Theming & Responsive Layout

Read .claude/tasks/SESSION_6.md for full spec.
Session 5 must be complete (all 3 phases: store ✅, UI ✅, export ✅).

Phase 1: Theme System (45-60 min)

1. Create src/constants/themes.ts
   - Define 3 themes: light, dark (current), neon
   - Each with colors object: bg, text, accent, border, etc
   - Export theme configurations

2. Extend useNameStore
   - Add currentTheme: 'light' | 'dark' | 'neon' to state
   - Add setTheme(theme) action
   - Persist theme to localStorage

3. Update src/index.css
   - Define CSS variables for all 3 themes
   - Use :root and [data-theme="light/neon"] selectors
   - Replace hardcoded colors with var() references

4. Create ThemeSwitcher.tsx component
   - 3 buttons or dropdown selector
   - Show current theme
   - Click to change
   - Place in sidebar header

5. Integrate theme into App.tsx
   - Apply [data-theme] attribute on root element
   - Listen for theme changes from store
   - Load persisted theme on mount

6. Write theme tests
   - setTheme updates currentTheme
   - Theme persists to localStorage
   - Can switch between all 3 themes
   - Defaults to dark

Phase 2: Responsive Layout (60-90 min)

1. Update NameManagementSidebar.tsx
   - Mobile: full-width drawer
   - Tablet: adjusted width
   - Desktop: fixed column

2. Create MobileMenu.tsx component
   - Hamburger toggle button
   - Manage drawer open/close state
   - Only show on mobile (<768px)

3. Update App.tsx layout
   - Desktop: flex row
   - Mobile: flex column with drawer overlay

4. Touch-friendly UI updates
   - Increase button sizes (44px+ targets)
   - Adjust spacing for mobile
   - Test at actual breakpoints

Deliverables:
- src/constants/themes.ts
- src/components/ThemeSwitcher.tsx
- src/components/MobileMenu.tsx
- Updated src/index.css (CSS variables)
- Updated src/stores/useNameStore.ts
- Updated src/components/sidebar/NameManagementSidebar.tsx
- Updated src/App.tsx
- Component + unit tests
- All tests passing
- Type-check passes
- Build succeeds
```

---

## Generic Session Startup Template

Copy this for any session:

```
Start Session [N]: [Feature Name]

Previous context: .claude/tasks/SESSION_[N-1]_SUMMARY.md
Current spec: .claude/tasks/SESSION_[N].md
Code reference: .claude/tasks/CODE_REFERENCE.md

[Task 1]
[Task 2]
[Task 3]

Deliverables:
- New files created
- Existing files modified
- All tests passing (bun test:run)
- Type-check passes (bun run tsc)
- Build succeeds (bun run build)
- No accessibility warnings (new ones)
- Commit message follows conventional format
```

---

## Complete Testing Workflow

Always run at end of session:

```bash
# 1. Type check
bun run tsc

# 2. Run tests
bun test:run

# 3. Lint
bun check

# 4. Build
bun run build

# 5. Review changes
git status
git diff

# 6. Commit
git add .
git commit -m "feat(...): description"
```

---

## Key Context Files

**Always have these open/referenced:**
1. `.claude/tasks/README.md` - Navigation hub
2. `.claude/tasks/CODE_REFERENCE.md` - Code patterns
3. `.claude/tasks/SESSION_X_SUMMARY.md` - What was done
4. `CLAUDE.md` - Architecture & decisions
5. `src/stores/useNameStore.ts` - Store reference (16 actions)
6. Existing component for pattern reference

---

## Store Actions Reference (16 Total)

**Name Management** (6):
- addName, deleteName, updateName, bulkAddNames

**Selection & State** (3):
- markSelected, clearSelections, resetList

**List Management** (4):
- createList, deleteList, updateListTitle, setActiveList

**Exclusions** (1):
- toggleNameExclusion

**History** (3) [NEW in Session 5]:
- recordSelection, clearHistory, deleteHistoryItem

**Selector**: selectHistoryStats

---

## Component Structure Reference

**Sidebar Components:**
```
NameManagementSidebar (container, connects to store)
├── ListSelector (dropdown: switch/create/rename/delete)
├── AddNameForm (input + bulk import modal)
├── NameListDisplay (scrollable list, grouped)
│   └── NameListItem (editable, actions)
├── BulkActionsPanel (clear selections, reset)
└── [NEW] HistoryPanel (selection history)
    └── [NEW] HistoryItem (individual record)
```

**Styling Pattern:**
- Dark theme colors: `bg-black`, `text-white`, `border-cyan-400/30`
- Hover reveals: `opacity-0 group-hover:opacity-100`
- Sticky headers: `sticky top-0 bg-black/90`
- Memoization: wrap all components with `memo()`

---

## Important Patterns

### Store Usage
```typescript
// Single value
const lists = useNameStore((state) => state.lists);

// Multiple values with useShallow (prevents re-renders)
const { lists, activeListId } = useNameStore(
  useShallow((state) => ({
    lists: state.lists,
    activeListId: state.activeListId,
  }))
);

// Action
const addName = useNameStore((state) => state.addName);

// Derived data with useMemo
const activeList = useMemo(
  () => lists.find((l) => l.id === activeListId),
  [lists, activeListId]
);
```

### Component Pattern
```typescript
interface ComponentProps {
  prop1: Type;
  prop2: Type;
}

const Component = memo<ComponentProps>(({ prop1, prop2 }) => {
  const action = useNameStore((state) => state.someAction);

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
});

Component.displayName = 'ComponentName';

export default Component;
```

---

## Common Commands Quick Reference

```bash
# Development
bun dev              # Start server

# Verification (run before committing)
bun run tsc         # Type check
bun test:run        # Run all tests
bun check           # Lint + format check
bun run build       # Production build

# Git
git status
git diff
git add .
git commit -m "type(scope): message"
```

---

## Session Checklist

Before you start a session, ensure:
- [ ] Read previous session summary
- [ ] Understand current feature spec
- [ ] Identify files to create/modify
- [ ] Review similar existing code
- [ ] Have CODE_REFERENCE.md open

As you work:
- [ ] Mark tasks complete in TodoWrite
- [ ] Run type-check before ending
- [ ] Run tests before ending
- [ ] Run Biome check before ending

Before committing:
- [ ] All tests passing
- [ ] Type-check passes
- [ ] Build succeeds
- [ ] No new warnings
- [ ] Commit message follows format

After committing:
- [ ] Update SESSION_X_SUMMARY.md
- [ ] Update README.md tracking
- [ ] Create next SESSION file if needed

---

## Quick Troubleshooting

**Tests failing?**
- Check beforeEach hook in test file
- Look at mockInitialState - may need new fields
- Run single test: `bun test filename.test.ts`

**Type errors?**
- Run `bun run tsc` to see all errors
- Check interface definitions match implementation
- Look for missing properties in state

**Build fails?**
- Run `bun run tsc` first to find type errors
- Check for unused imports (Biome will catch)
- Verify all files are properly exported

**Linting fails?**
- Run `bun check --write` to auto-fix
- Check for missing aria-labels or button types
- Verify single quotes, not double

---

## Pro Tips

1. **Before coding**: Always read what was done last session (SUMMARY file)
2. **While coding**: Run `bun check` frequently (catches issues early)
3. **Testing**: Write tests as you go, not at the end
4. **Refactoring**: Avoid it! Keep changes minimal and focused
5. **Commits**: One feature = one commit (unless multiple parts)
6. **Comments**: Only for magic numbers, complex logic (avoid obvious)
7. **Performance**: Use memo() on components, useShallow() on store

---

## End of Session Checklist

```
☐ All tasks completed or documented for next session
☐ bun run tsc passes
☐ bun test:run passes
☐ bun check passes (may have pre-existing warnings)
☐ bun run build passes
☐ git diff reviewed
☐ Commit created with conventional message
☐ SESSION_X_SUMMARY.md updated
☐ README.md updated
☐ Next SESSION file created (if applicable)
☐ Notes for next session written
```

---

This prompt ensures:
- ✅ Consistency across sessions
- ✅ Clear deliverables
- ✅ Quality checks in place
- ✅ Documentation updated
- ✅ Easy context switching
- ✅ No context loss between sessions

Ready to code! 🚀
