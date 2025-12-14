# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Radial Name Randomizer** is a visually distinctive name selection tool designed for educators, team leaders, and event organizers who need fair, transparent random selection with an engaging radial interface.

See `radial-randomizer-prd.md` for the complete product vision and planned features.

## Current Architecture

The project has been migrated from a single-file POC to a React + TypeScript application.

### Tech Stack
- **Framework**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Package Manager**: Bun
- **State Management**: Zustand with persist middleware (localStorage)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Animations**: Framer Motion
- **Linting & Formatting**: Biome 2 (unified linter + formatter, Rust-based)
- **Git Hooks**: Lefthook (pre-commit, pre-push, commit-msg validation)

### Project Structure
```
src/
├── components/
│   ├── wheel/
│   │   ├── RadialWheel.tsx    # Main wheel container with spin logic (forwardRef for keyboard spin)
│   │   ├── CenterButton.tsx   # Spin trigger with pulse animation
│   │   ├── NameLabel.tsx      # Individual name positioned radially
│   │   ├── RadialLine.tsx     # Line extending from circle
│   │   └── index.ts           # Barrel exports (includes RadialWheelRef)
│   └── sidebar/
│       ├── NameManagementSidebar.tsx  # Main container, connects to store
│       ├── ListSelector.tsx           # Dropdown: switch/create/rename/delete lists (Escape to close)
│       ├── AddNameForm.tsx            # Input + bulk import modal (Escape to close)
│       ├── NameListDisplay.tsx        # Scrollable list, empty state
│       ├── NameListItem.tsx           # Single name: edit/delete/exclude
│       ├── BulkActionsPanel.tsx       # Clear selections, reset list
│       ├── names-list/
│       │   └── ActionButtons.tsx      # Reusable button component for bulk actions
│       └── index.ts                   # Barrel exports
├── stores/
│   ├── useNameStore.ts        # Zustand store with Immer middleware + localStorage
│   ├── useNameStore.test.ts   # 30 unit tests for all store actions
│   └── useNameStore.mock.ts   # Mock data for tests
├── types/
│   └── name.ts                # TypeScript interfaces (Name, NameList, SelectionRecord)
├── constants/
│   └── defaults.ts            # Default names, wheel config values
├── hooks/
│   ├── useKeyboardShortcuts.ts # Keyboard event handler (Space, Escape)
│   └── index.ts               # Barrel exports
├── test/
│   └── setup.ts               # Vitest setup with jest-dom matchers
├── utils/
│   └── cn.ts                  # Class name composition utility (clsx + tailwind-merge)
├── App.tsx                    # Main app component with keyboard shortcuts integration
├── main.tsx                   # React entry point
└── index.css                  # Tailwind imports + custom animations + overflow: hidden
```

### Reference
The original POC is preserved in `reference/index.html` for comparison.

## Development

### Commands
```bash
bun install    # Install dependencies
bun dev        # Start dev server (http://localhost:5173)
bun build      # Production build
bun run tsc    # Type check

# Linting & Formatting
bun lint       # Run Biome linter (no fixes)
bun lint:fix   # Run Biome linter with auto-fixes
bun format     # Format all files
bun check      # Biome check (lint + format + organize imports)
bun ci         # Biome CI mode (no writes, fails on issues)

# Testing
bun test       # Run tests in watch mode
bun test:ui    # Run tests with UI
bun test:run   # Run tests once (CI mode)

# Git Hooks
bun hooks:install   # Install git hooks (runs automatically on install)
bun hooks:uninstall # Remove git hooks
```

**Git Hooks (via Lefthook)**:
- **pre-commit**: Runs Biome check on staged files, auto-stages fixes
- **pre-push**: Runs full type-check and test suite
- **commit-msg**: Validates conventional commits format

### Key Implementation Details

**Wheel Animation**
- Names positioned using trigonometry: `x = center + cos(angle) * radius`
- Spin uses Framer Motion with custom easing: `cubic-bezier(0.17, 0.67, 0.3, 0.98)`
- 3-5 random full rotations before landing on selection

**State Management**
- Zustand store with Immer + `persist` middleware for localStorage
- Immer middleware provides draft-style mutations (simpler than spread operators)
- Use `useShallow` hook when selecting multiple state values to prevent re-renders
- Derived data (filtered names) should use `useMemo` to avoid infinite loops
- Store actions: addName, deleteName, updateName, markSelected, setActiveList, createList, deleteList, updateListTitle, toggleNameExclusion, clearSelections, resetList, bulkAddNames

**Keyboard Shortcuts** (Session 3)
- Space: Spin the wheel (via `useKeyboardShortcuts` hook)
- Escape: Close bulk import modal and list selector dropdown

**Styling**
- Tailwind v4 uses CSS-based config via `@theme` directive in `index.css`
- Custom animations defined in `index.css` (pulse-glow, ping)
- Use `cn()` utility for conditional class composition (combines clsx + tailwind-merge)
- Avoid inline styles - prefer Tailwind utility classes for consistency and maintainability
- Extract reusable button/component patterns into shared components (e.g., ActionButtons)

## Code Style

- Use descriptive variable names (not single letters)
- Avoid comments for self-evident code; only comment magic numbers and non-obvious business logic
- Keep animations in CSS when possible, use Framer Motion for complex interactions
- Prefer `memo` for pure components that receive stable props
- Use `cn()` for conditional className logic instead of template literals or ternaries

## Linting & Formatting (Session 4)

### Biome 2
- **Unified Tool**: Linting + formatting in one tool (no Prettier needed)
- **Speed**: Rust-based, 10-50x faster than ESLint
- **Configuration**: `biome.json` at project root
- **Import Organization**: Automatic import sorting enabled
- **Pre-commit Checks**: Runs on staged files via Lefthook
- **Accessibility**: Warns on a11y issues (buttons, SVG titles, etc.)

**Key Commands**:
- `bun lint` - Check for lint issues
- `bun lint:fix` - Fix lint issues automatically
- `bun format` - Format all files
- `bun check` - All-in-one check (lint + format + organize imports)

**Note**: Some a11y warnings are intentional design choices (modal interactions, etc.) and configured as warnings in `biome.json`.

### Lefthook Git Hooks
- **Configuration**: `lefthook.yml` at project root
- **Automatic Installation**: Runs on `bun install`
- **Pre-commit Hook**: Biome check on staged files, auto-stages fixes
- **Pre-push Hook**: Full type-check + test suite (prevents broken pushes)
- **Commit-msg Hook**: Validates conventional commits format

**Commit Message Validation**:
```
Format: <type>(<scope>): <description>
Types: feat, fix, docs, test, refactor, perf, style, chore
Scope: optional, lowercase alphanumeric with hyphens
Description: 1-100 characters
```

Example: `feat(wheel): add spin animation with random rotations`

## Conventional Commits

Use this format for all commit messages: `<type>(<scope>): <description>`

**Character Limit**: Keep the entire commit title under 100 characters (including type, scope, and description).

### Commit Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `chore`: Build process, dependencies, tooling

### Examples
```
feat(wheel): add spin animation with random rotations
fix(sidebar): resolve name validation edge case
docs(readme): update API documentation
test(store): add tests for list creation
refactor(components): extract shared validation utilities
```

### Atomic Commits Best Practice

**Use atomic commits** - Each commit should represent one logical, self-contained change:

**Benefits**:
- **Reviewability**: PRs with atomic commits are easier to review (each commit tells a clear story)
- **Bisectability**: Easier to find bugs with `git bisect` when commits are focused
- **Revertability**: Can safely revert individual commits without breaking others
- **History clarity**: Git history reads like a changelog of intentional changes

**Guidelines**:
- One feature/fix per commit, not multiple unrelated changes
- Commits should build and pass tests independently (when possible)
- Break large changes into logical steps (e.g., "add type definitions" → "add store logic" → "add UI component")
- Don't combine refactoring with new features in same commit

**Example workflow** (3 atomic commits):
```bash
git commit -m "feat(history): add SelectionRecord type definitions"
git commit -m "feat(history): extend store with history tracking logic"
git commit -m "feat(history): create history UI components and tests"
```

**IMPORTANT - Commit Attribution**:
- Do NOT add "Co-Authored-By" trailers with Claude model information to commits
- Do NOT sign commits with the AI model as author
- Commits should reflect human authorship only
- Use your own name and email for git commits (configured via `git config user.name` and `git config user.email`)

## Task Documentation (.claude/tasks)

The `.claude/tasks` directory maintains comprehensive documentation of all sessions, features, and development progress. This documentation is committed to the repository for team collaboration and future reference.

### Directory Structure

```
.claude/tasks/
├── README.md                              # Navigation hub for all task documentation
├── CODE_REFERENCE.md                      # Code patterns, styles, and quick lookup
│
├── sessions/                              # Session documentation (consolidated, one file per session)
│   ├── session-02-sidebar.md              # Session 2: Name Management Sidebar
│   ├── session-03-shortcuts-testing.md    # Session 3: Keyboard Shortcuts & Testing
│   ├── session-04-tooling.md              # Session 4: Tooling Modernization
│   ├── session-05-history-export.md       # Session 5: Selection History & Export
│   ├── session-06-theming.md              # Session 6: Dynamic Theming System
│   └── session-07-responsive.md           # Session 7: Responsive Layout (MVP 100%)
│
├── features/                              # Feature tasks (organized by status)
│   ├── active/
│   │   └── mobile-fixes.md                # In-progress feature tasks
│   └── completed/
│       ├── fira-code-integration.md       # Completed feature tasks
│       └── sidebar-scrolling-fix.md
│
└── prompts/                               # Session prompt templates for reuse
    └── session-templates.md               # Reusable prompts for starting sessions
```

### How to Use Task Documentation

**Starting a New Session**:
1. Read `README.md` to understand current status and navigation
2. Check `features/active/` for pending work or `features/completed/` for context
3. Use prompts in `prompts/session-templates.md` as starting point
4. Create a plan in `.claude/plans/` before implementation

**During Implementation**:
- Reference `CODE_REFERENCE.md` for code patterns and component templates
- Check previous session summaries for context and architectural decisions
- Keep `.claude/tasks/README.md` updated with progress

**End of Session**:
1. Create atomic commits (see "Atomic Commits Best Practice" above)
2. Write session summary in `sessions/session-XX.md`
3. Move completed features from `features/active/` to `features/completed/`
4. Update `README.md` with new session information
5. Commit documentation changes: `git push origin [branch-name]`

### Session Documentation Template

Each session file contains:
- **Overview**: What was accomplished, duration, test counts
- **What Was Done**: Detailed breakdown of features/changes
- **Files Modified**: List of all changed files with impact descriptions
- **Commits**: Atomic commits created during session
- **Verification**: Test results, type check, build status
- **Key Learnings**: Patterns discovered or lessons learned
- **Next Steps**: Recommendations for future sessions

### Feature Task Template

Each feature task contains:
- **Status**: Current state (Active/Completed/Ready for Implementation)
- **Context**: Background and relationship to sessions
- **Problem Statement**: What needs to be fixed/implemented
- **Solution**: Detailed implementation steps
- **Implementation Checklist**: Step-by-step verification
- **Files to Modify**: Exact files affected and changes needed

### Benefits of This Approach

- **Traceability**: Every change linked to session/feature documentation
- **Knowledge Preservation**: Decisions and learnings recorded for team
- **Onboarding**: New team members can understand project history and architecture
- **Reference**: Quick access to patterns, templates, and previous solutions
- **Continuity**: Sessions can be resumed with full context preserved
- **PR Context**: Documentation helps reviewers understand scope and rationale

---

## MVP Progress

### Session 1: Core Features (Completed)
- [x] Project setup (Vite + React + TypeScript + Bun)
- [x] Core wheel component with radial name display
- [x] Spin animation with Framer Motion (3-5 random rotations)
- [x] State persistence (localStorage via Zustand)
- [x] Basic name store (add, delete, update, mark selected)
- [x] Multi-list support with active list tracking

### Session 2: Name Management Sidebar (Completed)
- [x] Immer middleware integration (replaces manual spread operators)
- [x] New store actions: createList, deleteList, updateListTitle, toggleNameExclusion, clearSelections, resetList, bulkAddNames
- [x] Name management sidebar with 6 components
- [x] List management UI (dropdown with create/rename/delete)
- [x] Name list display (inline editing, exclude/include, delete)
- [x] Add name form with validation (1-100 chars) + bulk import modal
- [x] Bulk actions panel (clear selections, reset list)
- [x] Fixed scrollbar layout issue (overflow: hidden on html/body)

### Remaining MVP Features
- [x] Keyboard shortcuts (Space to spin, Escape for modals/dropdowns)
- [ ] Selection history panel
- [ ] Bulk import (paste, CSV) - form ready, needs integration
- [ ] Export (JSON, CSV)
- [ ] Basic theming (3 built-in themes)
- [ ] Responsive layout (mobile drawer)

## Testing Strategy

### Implemented: Vitest + React Testing Library (Session 3)
- **Vitest** - Fast unit test runner with Vite integration
- **React Testing Library** - Component testing utilities
- **Vitest Globals** - No imports needed in test files (configured in tsconfig)
- **@testing-library/jest-dom** - DOM matchers for assertions

**Test Organization**:
- Test files placed next to source files (e.g., `useNameStore.test.ts` next to `useNameStore.ts`)
- Mock data extracted to `.mock.ts` files for cleaner tests
- 30 unit tests for store (all 12 actions covered)

**Test Scripts**:
```bash
bun test      # Run tests in watch mode
bun test:ui   # Run tests with UI
bun test:run  # Run tests once
```

**Test Coverage** (Session 3):
1. **Store (useNameStore.test.ts)** - 30 tests
   - All 12 actions: addName, deleteName, updateName, markSelected, setActiveList, createList, deleteList, updateListTitle, toggleNameExclusion, clearSelections, resetList, bulkAddNames
   - localStorage persistence
   - Multi-list state management
   - Edge cases and validations

**Future Testing Areas**:
- Component tests for sidebar and wheel components
- Integration tests for user workflows

## Tech Debt

- [x] Add unit tests (Vitest + React Testing Library) - COMPLETED Session 3
- [ ] Add component/integration tests - future priority
- [ ] Migrate from `framer-motion` to `motion` package (rebranded, same codebase)
  - Replace: `import { motion } from "framer-motion"` with `import { motion } from "motion/react"`
  - Consider using `motion/mini` for smaller bundle (2.5kb)
  - See: https://motion.dev/docs/react-upgrade-guide
- [ ] Add E2E tests (Playwright or Cypress) - lower priority

## Known Issues & Fixes

### Fixed in Session 2
- ✅ Scrollbar layout shift during wheel spin - Fixed by adding `overflow: hidden` to html/body

## Component Performance Notes

- All sidebar components memoized (`memo()`) to prevent unnecessary re-renders
- ListSelector dropdown uses click-outside detection
- NameListItem inline editing uses useRef for auto-focus
- Store selections use `useShallow` to prevent re-renders on object changes
- Derived data (active names, has selections) use `useMemo`

## Session Progress

### Session 3: Keyboard Shortcuts & Testing (Completed)
- [x] Add `bun test` script for Vitest (test, test:ui, test:run)
- [x] Implement Space key listener for spin (via useKeyboardShortcuts hook)
- [x] Implement Escape key for modal/dropdown close (AddNameForm, ListSelector)
- [x] Add 30 unit tests for useNameStore (all 12 actions)
- [x] Mock data extraction pattern (.mock.ts files)
- [x] Run type check and build (all passing)

**Commits**:
- feat(test): set up Vitest testing infrastructure
- feat(shortcuts): add keyboard shortcuts for Space and Escape keys
- test(store): add comprehensive unit tests for useNameStore with Vitest globals

### Session 4: Tooling Modernization (Completed)
- [x] Remove ESLint dependencies and configuration
- [x] Install and configure Biome 2 (unified linter + formatter)
- [x] Migrate linting rules from ESLint to Biome
- [x] Install and configure lefthook (git hooks manager)
- [x] Set up pre-commit hooks (Biome check on staged files)
- [x] Set up pre-push hooks (type-check + full test suite)
- [x] Set up commit-msg validation (conventional commits format)
- [x] Update documentation

**Changes**:
- Replaced ESLint (6 packages) with Biome 2 for unified linting + formatting
- Added lefthook for git hooks (pre-commit, pre-push, commit-msg)
- Updated package.json scripts: lint, lint:fix, format, check, ci, hooks:install, hooks:uninstall
- Configured Biome with React + TypeScript rules, Tailwind support
- Configured Lefthook with 3 hooks for quality gates and commit validation
- Relaxed a11y warnings to accommodate design choices
- Net reduction: 4 packages (removed 6 ESLint packages, added 2 new tools)

### Session 4.5: Styling Architecture Refactor (Completed)
- [x] Add cn() utility function for class name composition
- [x] Create reusable ActionButtons component
- [x] Migrate all 8 components from inline styles to Tailwind classes
- [x] Remove all style event handlers (onMouseEnter, onMouseLeave, onFocus, onBlur)
- [x] Standardize conditional styling with cn() utility
- [x] Update documentation with styling best practices

**Components Migrated**:
- AddNameForm, NameListItem, NameListDisplay, BulkActionsPanel
- ExportModal, HistoryItem, ThemeSwitcher, CenterButton

**Benefits**:
- Eliminated ~300 lines of inline style code
- Improved consistency across components
- Better maintainability with Tailwind utilities
- Reusable component pattern established

**Commits**: 9 atomic commits (1 infrastructure + 8 component migrations)

### Session 5: Selection History & Export (Planned)
- [ ] Create selection history store (extend useNameStore)
- [ ] Create history panel component
- [ ] Record selections on spin
- [ ] Export CSV/JSON functionality
- [ ] Add tests for history/export features

### Session 6+: Theming & Responsive
- [ ] Create theme system (3 built-in themes)
- [ ] Add theme switcher component
- [ ] Mobile responsiveness (sidebar drawer)
- [ ] Additional UI polish
