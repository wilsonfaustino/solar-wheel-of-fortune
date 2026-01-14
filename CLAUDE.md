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
bun test              # Run tests in watch mode
bun test:ui           # Run tests with UI
bun test:run          # Run tests once (CI mode)
bun test:coverage     # Generate coverage reports (LCOV + HTML)
bun test:coverage:ui  # Coverage with Vitest UI

# Git Hooks
bun hooks:install   # Install git hooks (runs automatically on install)
bun hooks:uninstall # Remove git hooks
```

**Git Hooks (via Lefthook)**:
- **pre-commit**: Runs Biome check on staged files, auto-stages fixes
- **pre-push**: Runs full type-check and test suite
- **commit-msg**: Validates conventional commits format

## CI/CD Pipeline

### GitHub Actions Workflow

**Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
**Triggers**: Pull requests to `main`, pushes to `main`

**Quality Gates** (6 jobs):
1. **Lint (Biome)** - `bun run ci` (fails on issues)
2. **Type Check (TypeScript)** - `bun run tsc -b` (strict mode)
3. **Test & Coverage (Vitest)** - `bun test:coverage` (190 tests, 45% threshold)
4. **Build (Vite)** - `bun run build` (production bundle)
5. **E2E Tests (Playwright)** - `bun run test:e2e` (6 tests, Chromium only)
6. **SonarQube Analysis** - Code quality + quality gate

**Job Dependencies**:
- Lint, type-check, test run in parallel
- Build waits for lint + type-check
- E2E waits for lint + type-check
- SonarQube waits for test coverage + E2E

**Estimated CI Time**: 4-6 minutes per run

### Test Coverage

**Commands**:
```bash
bun test:coverage     # Generate coverage reports (LCOV + HTML)
bun test:coverage:ui  # Coverage with Vitest UI
```

**Output**:
- `coverage/lcov.info` - SonarQube format (gitignored)
- `coverage/index.html` - HTML report for local review (gitignored)

**Thresholds**: 45% minimum for lines/functions/statements, 30% branches (baseline)

**Coverage Provider**: v8 (modern, fast, accurate)

### SonarQube Integration

**Configuration**: [sonar-project.properties](sonar-project.properties) (root directory)
**Dashboard**: https://sonarcloud.io/project/overview?id=wilsonfaustino_solar-wheel-of-fortune

**Quality Gates**:
- Code coverage ≥ 80% (SonarQube default)
- No new bugs, vulnerabilities, code smells
- Security hotspots reviewed
- Duplicated lines ≤ 3%

**Token**: Stored in GitHub Secrets as `SONAR_TOKEN`

### Branch Protection Rules

**Main Branch Rules**:
- ✅ Require 1 approval before merge
- ✅ Require all 5 status checks to pass
- ✅ Require branch to be up to date
- ✅ Require conversation resolution
- ❌ No bypassing settings (applies to admins)

**PR Workflow**:
1. Create feature branch from `main`
2. Push commits (triggers CI on push)
3. Create PR (triggers full CI pipeline)
4. Wait for all 5 checks to pass
5. Request review from teammate
6. Resolve all conversations
7. Merge when approved + green checks

### Local Testing Before Push

Run these commands locally to catch issues before CI:

```bash
bun run ci          # Biome lint (CI mode)
bun run tsc -b      # Type check
bun test:run        # All tests once
bun test:coverage   # Tests with coverage
bun run build       # Production build
```

**Note**: Local git hooks already run subset of these checks (pre-commit, pre-push)

### Troubleshooting CI Failures

**Lint Failures**:
```bash
bun lint:fix    # Auto-fix Biome issues
bun format      # Format code
bun check       # All-in-one check
```

**Type Errors**:
```bash
bun run tsc -b  # See exact errors
```

**Test Failures**:
```bash
bun test        # Run tests in watch mode
bun test:ui     # Debug with Vitest UI
```

**Coverage Below Threshold**:
- Add tests for uncovered code paths
- Or temporarily lower threshold in `vitest.config.ts`

**Build Failures**:
- Usually caused by type errors or missing dependencies
- Check `dist/` directory after successful build

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

**Keyboard Shortcuts** (Session 3, Session 15)
- Space: Spin the wheel (via `useKeyboardShortcuts` hook, suppressed when typing in input/textarea fields)
- Escape: Close bulk import modal and list selector dropdown
- Input field detection: Automatically prevents shortcuts during text entry to allow typing compound names

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

## Button Component Usage

The application uses a centralized Button component (`src/components/ui/button.tsx`) with CVA (Class Variance Authority) for variant management. All standard Shadcn variants have been removed in favor of project-specific tech variants.

### Available Variants

**Variants** (all use font-mono, tracking-wider):
- `tech` - Primary tech button (accent bg/border)
- `tech-ghost` - Transparent tech button (hover effects) **[DEFAULT]**
- `tech-destructive` - Destructive tech button (red theme)
- `tech-toggle` - Toggle button (active/inactive states via className)
- `tech-outline` - Outline tech button (border only)

**Sizes:**
- `sm` - h-8, px-3 (small standard size, used sparingly)
- `icon-sm` - size-8 (icon-only buttons)
- `tech-default` - h-11, px-4 py-3 (standard sidebar buttons) **[DEFAULT]**
- `tech-sm` - h-10, px-3 py-2 (compact tech buttons)

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

### Important Notes

- **Defaults**: If variant/size not specified, defaults to `tech-ghost` and `tech-default`
- **No Shadcn variants**: All standard Shadcn variants (default, destructive, outline, etc.) have been removed
- **Tech aesthetic**: All variants include `font-mono` and `tracking-wider` for consistency
- **Icon standardization**: Icon-only buttons use `size="icon-sm"` with `className="size-4"` for icons
- **Disabled states**: Automatically handled (pointer-events-none, opacity-50)
- **Focus rings**: Automatic focus-visible ring management
- **CenterButton exception**: Wheel spin button NOT migrated (preserves complex custom animations)

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

## Planning Mode Methodology

When planning implementation sessions, follow this structured 3-file approach to ensure thorough planning, clear execution, and complete documentation.

### 1. Planning Phase (Plan Mode)

**Trigger**: User requests a complex implementation task that requires planning

**Process**:
1. User enters plan mode (EnterPlanMode tool or explicit request)
2. Claude explores codebase to understand context and patterns
3. Claude asks clarifying questions to resolve ambiguities
4. Claude creates initial plan at `.claude/plans/[session-name].md`

**Plan Contents**:
- Feature branch name (e.g., `feat/radix-radiogroup-migration`)
- Session number and estimated duration
- Context and decision rationale
- Implementation phases with specific tasks
- Files to modify/create
- Success criteria
- Atomic commit strategy

**Exit**: User approves plan, Claude exits plan mode

### 2. Session Execution Files

After plan approval, create 2 files **before implementation starts**:

#### a) Session Prompt (`.claude/tasks/prompts/session-NN-feature-prompt.md`)

**Purpose**: Copy-paste prompt to execute the session

**Structure**:
- **Session Goal**: 1-2 sentence summary
- **Pre-Session Setup**: Verification checks before starting
- **Session Tasks**: 5 phases with specific code blocks and file paths
  - Phase 1: Setup & Installation (with exact commands)
  - Phase 2: Main Implementation (with before/after code examples)
  - Phase 3: Testing (with test cases to add)
  - Phase 4: Documentation (with files to update)
  - Phase 5: Verification & Commits (with commit messages)
- **Post-Session Checklist**: Verification steps (tests, type check, build)
- **Create Pull Request**: Template with gh CLI command
- **Troubleshooting**: Common issues and solutions
- **Success Criteria**: Acceptance checklist
- **Next Session**: Pointer to future work

**When to Create**: Before starting implementation (can be created during planning)

#### b) Session Documentation (`.claude/tasks/sessions/session-NN-feature.md`)

**Purpose**: Document what happened during the session

**Structure**:
- **Metadata**: Date, status, duration, test count
- **Overview**: What changed, why it matters (1-3 sentences)
- **What Was Done**: Detailed breakdown by phases
- **Files Modified**: Comprehensive list with impact descriptions
- **Commits**: All atomic commits with messages and what they included
- **Verification**: Test output, type check, build results
- **Key Learnings**: Patterns discovered, insights gained
- **Bundle Impact**: Before/after performance metrics (if applicable)
- **Next Steps**: Future work recommendations
- **Related Files**: Links to prompt, CODE_REFERENCE, previous sessions
- **Notes**: Additional context, design decisions

**When to Create**: During/after session to document actual implementation

### 3. File Naming Conventions

**Consistency is critical** for navigation and automation:

- **Plan File**: `.claude/plans/[descriptive-name].md`
  - Example: `.claude/plans/lovely-singing-gadget.md`
  - Auto-generated by Claude Code

- **Session Documentation**: `.claude/tasks/sessions/session-NN-feature-name.md`
  - Format: Zero-padded session number + kebab-case feature name
  - Example: `session-14-radix-radiogroup.md`

- **Session Prompt**: `.claude/tasks/prompts/session-NN-feature-name-prompt.md`
  - Same naming as session doc + `-prompt` suffix
  - Example: `session-14-radix-radiogroup-prompt.md`

- **Feature Branch**: `type/feature-description`
  - Types: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `refactor/`, `perf/`
  - Example: `feat/radix-radiogroup-migration`
  - Use kebab-case or underscores (be consistent within same category)

### 4. Planning Workflow

**Step-by-step process**:

1. **Exploration** (Phase 1)
   - User requests feature or asks to discuss approach
   - Enter plan mode to explore codebase
   - Identify existing patterns and architectural constraints
   - Ask clarifying questions about requirements

2. **Plan Creation** (Phase 2-4)
   - Write plan to `.claude/plans/[name].md`
   - Include branch name, session number, phases, files, commits
   - Present plan to user for approval

3. **Pre-Implementation** (Before Session Starts)
   - Create session prompt file with detailed execution steps
   - Optionally create session doc skeleton (to be filled during implementation)
   - Update CLAUDE.md if new patterns/guidelines are introduced

4. **Implementation** (During Session)
   - Follow session prompt step-by-step
   - Create atomic commits as planned
   - Document deviations or discoveries

5. **Documentation** (End of Session)
   - Complete session documentation file
   - Update `.claude/tasks/README.md` with session entry
   - Update CODE_REFERENCE.md with new patterns (if applicable)
   - Commit documentation changes

### 5. Benefits of This Methodology

**For Planning**:
- Forces thorough analysis before implementation
- Identifies edge cases and unknowns early
- Aligns user expectations with implementation reality
- Prevents scope creep and mid-session surprises

**For Execution**:
- Prompt provides clear, actionable steps (no guessing)
- Reduces cognitive load (just follow the prompt)
- Ensures consistency across sessions
- Makes sessions resumable (if interrupted)

**For Documentation**:
- Every session has complete paper trail (plan → prompt → session doc)
- New team members can understand "why" decisions were made
- Prompts are reusable templates for similar tasks
- Documentation written during session (not forgotten later)

**For Knowledge Transfer**:
- Junior developers can execute complex sessions using prompts
- Architectural patterns documented in CODE_REFERENCE.md
- Session history shows evolution of codebase
- Onboarding faster with searchable session docs

### 6. Example: Session 14 RadioGroup Migration

**Plan**: `.claude/plans/lovely-singing-gadget.md`
- Branch: `feat/radix-radiogroup-migration`
- Decision: Use Radix RadioGroup for consistency with Sessions 8-11
- Phases: Install, migrate component, update tests, document
- Commits: 4 atomic commits (dependency, migration, tests, docs)

**Prompt**: `.claude/tasks/prompts/session-14-radix-radiogroup-prompt.md`
- Pre-session: Check tests pass, review current ThemeSwitcher
- Phase 1: `bun add @radix-ui/react-radio-group` (10 min)
- Phase 2: Migrate ThemeSwitcher.tsx with before/after code blocks (20 min)
- Phase 3: Update tests for RadioGroup semantics (15 min)
- Phase 4: Update documentation files (15 min)
- Phase 5: Verify and create 4 commits (10 min)

**Session Doc**: `.claude/tasks/sessions/session-14-radix-radiogroup.md`
- Overview: Migrated ThemeSwitcher to Radix RadioGroup for accessibility
- Files Modified: ThemeSwitcher.tsx, tests, package.json, docs
- Commits: Listed all 4 atomic commits with messages
- Key Learnings: RadioGroup provides automatic arrow key navigation
- Bundle Impact: +3kb (minimal, Radix utilities already loaded)

### 7. When to Use Planning Mode

**Always Use Planning Mode For**:
- Multi-file changes (3+ files)
- New features or components
- Architectural decisions (multiple valid approaches)
- Dependency updates with migration required
- Refactoring that affects multiple components
- Anything that requires 3+ atomic commits

**Skip Planning Mode For**:
- Single-line fixes or typos
- Documentation-only changes
- Simple updates to existing patterns (following established conventions)
- Obvious bug fixes with clear solution

**Rule of Thumb**: If you would ask the user a clarifying question, use planning mode instead to explore first and present informed options.

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

## E2E Testing (Playwright)

### Overview
- **Framework**: Playwright 1.57+ with TypeScript
- **Architecture**: Page Object Model (POM)
- **Browser**: Chromium only (fastest CI execution)
- **Test Directory**: `/e2e/` (separate from Vitest unit tests)
- **Test Count**: 21 tests passing, 4 skipped (Phase 2 partial)
- **CI Integration**: 6th quality gate (runs after lint + typecheck)

### Running E2E Tests

```bash
bun run test:e2e          # Run all tests (headless)
bun run test:e2e:ui       # Run with Playwright UI (best for writing tests)
bun run test:e2e:headed   # Run with browser visible
bun run test:e2e:debug    # Debug with Playwright Inspector
bun run test:e2e:report   # View last test report
bun run test:e2e:codegen  # Generate test code via browser interaction
```

### Test Organization

**Page Objects** (`e2e/pages/`):
- BasePage.ts - Common functionality (navigation, shortcuts)
- WheelPage.ts - Wheel spin interactions
- SidebarPage.ts - Name/list management, export modal
- HistoryPage.ts - History tab interactions
- ThemePage.ts - Theme switcher controls
- MobilePage.ts - Mobile drawer and header

**Test Specs** (`e2e/specs/`):
- 01-wheel-spin.spec.ts - Spin animation, toast notifications (4 tests)
- 02-name-management.spec.ts - Add, bulk import (2 tests)
- 03-list-management.spec.ts - List CRUD operations (1 passing, 3 skipped)
- 04-selection-history.spec.ts - History tracking and management (4 tests)
- 05-export.spec.ts - CSV/JSON export downloads (3 tests)
- 06-theme-switching.spec.ts - Theme persistence and visual changes (2 tests)
- 07-mobile-sidebar.spec.ts - Responsive drawer behavior (2 tests)
- 08-name-exclusion-editing.spec.ts - Exclusion and UI interactions (2 tests)
- 09-keyboard-shortcuts.spec.ts - Edge cases for Space/Escape (2 tests)

### Writing E2E Tests

Use fixtures for automatic localStorage cleanup:
```typescript
import { test, expect } from '../fixtures/localStorage.fixture';

test('should add name', async ({ sidebarPage }) => {
  await sidebarPage.addName('Alice');
  const count = await sidebarPage.getNameCount();
  expect(count).toBe(13);
});
```

### Debugging E2E Tests

1. **Run with UI mode**: `bun run test:e2e:ui`
2. **Check trace viewer**: Open `test-results/*/trace.zip`
3. **Increase timeouts**: Modify `waitForTimeout` in page objects
4. **Use pause**: Add `await page.pause()` for live debugging

### VSCode Integration

Install Playwright extension: `ms-playwright.playwright`
- Run/debug tests from sidebar
- Pick locators with browser tool
- View trace files inline

## Tech Debt

- [x] Add unit tests (Vitest + React Testing Library) - COMPLETED Session 3
- [x] Add E2E tests (Playwright) - COMPLETED Session 17
- [ ] Add component/integration tests - future priority
- [ ] Migrate from `framer-motion` to `motion` package (rebranded, same codebase)
  - Replace: `import { motion } from "framer-motion"` with `import { motion } from "motion/react"`
  - Consider using `motion/mini` for smaller bundle (2.5kb)
  - See: https://motion.dev/docs/react-upgrade-guide

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

### Session 24: Auto-Exclude Selected Names (Completed)
- [x] Add auto-exclusion timer to App.tsx handleSelect (2 second delay)
- [x] Add edge case check for last remaining name
- [x] Create 5 unit tests for auto-exclusion logic (Vitest fake timers)
- [x] Create 4 E2E tests for browser verification
- [x] Verify all tests pass (210 total: 206 unit + 27 E2E)

**Commits**:
- feat(app): add auto-exclusion timer to handleSelect
- test(e2e): add auto-exclusion E2E tests
- docs(session): document Session 24 auto-exclusion feature

**Key Implementation**:
- Auto-exclusion occurs 2 seconds after toast appears
- Edge case: Last name never auto-excluded (wheel requires ≥1 name)
- Timer uses `setTimeout` in handleSelect callback
- Store check via `useNameStore.getState()` inside timer
- No breaking changes to existing selection flow

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
