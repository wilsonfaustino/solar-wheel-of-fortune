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

### Project Structure
```
src/
├── components/
│   ├── wheel/
│   │   ├── RadialWheel.tsx    # Main wheel container with spin logic
│   │   ├── CenterButton.tsx   # Spin trigger with pulse animation
│   │   ├── NameLabel.tsx      # Individual name positioned radially
│   │   ├── RadialLine.tsx     # Line extending from circle
│   │   └── index.ts           # Barrel exports
│   └── sidebar/
│       ├── NameManagementSidebar.tsx  # Main container, connects to store
│       ├── ListSelector.tsx           # Dropdown: switch/create/rename/delete lists
│       ├── AddNameForm.tsx            # Input + bulk import modal
│       ├── NameListDisplay.tsx        # Scrollable list, empty state
│       ├── NameListItem.tsx           # Single name: edit/delete/exclude
│       ├── BulkActionsPanel.tsx       # Clear selections, reset list
│       └── index.ts                   # Barrel exports
├── stores/
│   └── useNameStore.ts        # Zustand store with Immer middleware + localStorage
├── types/
│   └── name.ts                # TypeScript interfaces (Name, NameList, SelectionRecord)
├── constants/
│   └── defaults.ts            # Default names, wheel config values
├── hooks/                     # Custom React hooks (empty, for future use)
├── utils/                     # Utility functions (empty, for future use)
├── App.tsx                    # Main app component (flex layout: sidebar + wheel)
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
```

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

**Styling**
- Tailwind v4 uses CSS-based config via `@theme` directive in `index.css`
- Custom animations defined in `index.css` (pulse-glow, ping)

## Code Style

- Use descriptive variable names (not single letters)
- Avoid comments for self-evident code; only comment magic numbers and non-obvious business logic
- Keep animations in CSS when possible, use Framer Motion for complex interactions
- Prefer `memo` for pure components that receive stable props

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
- [ ] Keyboard shortcuts (Space to spin)
- [ ] Selection history panel
- [ ] Bulk import (paste, CSV) - form ready, needs integration
- [ ] Export (JSON, CSV)
- [ ] Basic theming (3 built-in themes)
- [ ] Responsive layout (mobile drawer)

## Testing Strategy

### Recommended: Vitest + React Testing Library
Next session should implement unit tests using:
- **Vitest** - Fast unit test runner (Vite-native, similar syntax to Jest)
- **React Testing Library** - Component testing best practices
- **@testing-library/user-event** - User interaction simulation

**Key areas to test**:
1. **Store (useNameStore.ts)**
   - All 12 actions work correctly (add, delete, create list, etc.)
   - localStorage persistence works
   - Multi-list state management

2. **Sidebar Components**
   - ListSelector: dropdown open/close, create/delete/rename list
   - AddNameForm: input validation, bulk import modal
   - NameListItem: inline editing, exclude toggle, delete
   - BulkActionsPanel: clear/reset with confirmations

3. **Wheel Component**
   - Spin animation triggers correctly
   - Selection updates store
   - Excluded names not in active list

4. **Integration Tests**
   - Add name → displays in list → spin wheel → selection shows
   - Create list → switch lists → names persist

**Setup**:
```bash
bun add -d vitest @testing-library/react @testing-library/dom happy-dom
```

## Tech Debt

- [ ] Add unit tests (Vitest + React Testing Library) - next priority
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

## Future Session Checklist

### Session 3: Keyboard Shortcuts & Testing
- [ ] Add `bun test` script for Vitest
- [ ] Implement Space key listener for spin
- [ ] Implement Escape key for modal/dropdown close
- [ ] Add 20+ unit tests for store and components
- [ ] Add 5+ integration tests
- [ ] Run type check and build

### Session 4: Selection History & Export
- [ ] Create selection history store (extend useNameStore)
- [ ] Create history panel component
- [ ] Record selections on spin
- [ ] Export CSV/JSON functionality
- [ ] Add import tests

### Session 5+: Theming & Responsive
- [ ] Create theme system (3 built-in themes)
- [ ] Add theme switcher component
- [ ] Mobile responsiveness (sidebar drawer)
- [ ] Additional UI polish
