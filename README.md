# Solar Wheel of Fortune

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=wilsonfaustino_solar-wheel-of-fortune&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=wilsonfaustino_solar-wheel-of-fortune)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=wilsonfaustino_solar-wheel-of-fortune&metric=coverage)](https://sonarcloud.io/summary/new_code?id=wilsonfaustino_solar-wheel-of-fortune)

A visually distinctive name selection tool with an engaging radial interface. Perfect for educators, team leaders, and event organizers who need fair, transparent random selection.

## Features

- Radial wheel display with smooth spin animations
- Random name selection with visual feedback
- **Name management sidebar** - Add, edit, delete, and exclude names
- **Multi-list support** - Create multiple name lists and switch between them
- **Bulk import** - Add multiple names at once via paste
- **Persistent state** - Names and lists saved to localStorage
- **Unavailable today** - Mark a name as unavailable for the day; the spin skips it
- **Volunteer pick** - Record a volunteer as a selection without a spin, tagged in history
- **Share and import lists** - Export a list to a JSON file, with optional selection state and history; import merges into a list with the same name
- **Selection history** - Track last 100 selections with relative timestamps
- **Export functionality** - Export selections to CSV or JSON with custom filenames
- **Cycles** - Enter work cycles with cooldown weeks; a widget above the wheel shows weekday progress, one block per week
- **Special events** - Add events with a duration in days and an optional holiday flag; events show as bands on the cycle bar and as a countdown badge
- **Settings** - Auto-exclude names after selection, clear selection after exclusion, spin sound
- **Dynamic theming** - 3 built-in themes (Cyan Pulse, Matrix Green, Sunset Orange) with a theme-aware favicon
- **Tab navigation** - Switch between Names, History, Cycles, and Settings tabs
- **Fully responsive design** - Mobile drawer, tablet, and desktop layouts
- **Touch-friendly UI** - 44px touch targets (WCAG AAA compliance)
- **Toast notifications** - Sonner-based toast system with auto-dismiss and stacking (max 3)
- **Keyboard shortcuts** - Space to spin, Escape to close modals
- **Tests** - Unit and integration tests with Vitest + React Testing Library, E2E tests with Playwright

## Themes

Three built-in themes available in the Settings tab:

- **Cyan Pulse** (default) - Cyan accent (#00FFFF) on black background
- **Matrix Green** - Green accent (#00FF00) on black background
- **Sunset Orange** - Orange accent (#FF6B35) on dark brown (#1A0A00)

Themes apply instantly and persist across sessions via localStorage.

## Responsive Design

The app is fully responsive across all device sizes:

- **Mobile (<640px)**: Drawer sidebar with hamburger menu, full-width wheel, 14px base font
- **Tablet (640-1023px)**: Drawer sidebar, wheel up to 500px, 15px base font
- **Desktop (≥1024px)**: Fixed sidebar, wheel up to 900px, 16px base font

All touch targets meet WCAG AAA standards (44px minimum height). The mobile drawer closes via backdrop click, close button, or Escape key.

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- Zustand 5 + Immer (state management with draft-style mutations)
- Motion (animations)
- Tailwind CSS v4 with clsx & tailwind-merge (class composition)
- Radix UI primitives + class-variance-authority (UI components)
- Sonner (toast notifications)
- Vitest + React Testing Library (unit tests), Playwright (E2E tests)
- Storybook (component stories)
- Bun (package manager)
- Biome 2 (linting & formatting)
- Lefthook (git hooks manager)
- SonarCloud (code quality + coverage in CI)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/wilsonfaustino/solar-wheel-of-fortune.git
cd solar-wheel-of-fortune

# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:5173`

### Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server (http://localhost:5173) |
| `bun build` | Build for production |
| `bun preview` | Preview production build |
| `bun run tsc` | Type check |
| `bun lint` | Check for lint issues |
| `bun lint:fix` | Auto-fix lint issues |
| `bun format` | Format all files |
| `bun check` | Unified check (lint + format + organize imports) |
| `bun run ci` | Biome CI mode (no writes, fails on issues) |
| `bun test` | Run tests in watch mode |
| `bun test:ui` | Run tests with UI dashboard |
| `bun test:run` | Run tests once (CI mode) |
| `bun test:coverage` | Run tests with coverage reports (LCOV + HTML) |
| `bun test:coverage:ui` | Coverage with Vitest UI |
| `bun run test:e2e` | Run Playwright E2E tests (headless) |
| `bun run test:e2e:ui` | Run E2E tests with Playwright UI |
| `bun run test:e2e:headed` | Run E2E tests with browser visible |
| `bun run test:e2e:debug` | Debug E2E tests with Playwright Inspector |
| `bun run test:e2e:report` | View last E2E test report |
| `bun run test:e2e:codegen` | Generate E2E test code via browser interaction |
| `bun storybook` | Start Storybook (http://localhost:6006) |
| `bun storybook:build` | Build static Storybook |
| `bun hooks:install` | Install git hooks (runs on `bun install`) |
| `bun hooks:uninstall` | Remove git hooks |

## Project Structure

```
src/
├── components/
│   ├── wheel/        # Radial wheel, center spin button, name labels
│   ├── sidebar/      # Tabs: names, history, cycles, settings; export and share
│   ├── cycle/        # Cycle progress widget and event countdown badge
│   ├── toast/        # Selection toast (Sonner)
│   ├── shared/       # Confirm dialogs
│   ├── ui/           # Button, switch, tooltip, glitch text
│   ├── MobileHeader.tsx
│   └── Footer.tsx
├── stores/           # Zustand stores (names, settings) with Immer + persist
├── hooks/            # Keyboard shortcuts, media query, spin sound
├── utils/            # Export, share list, cycle and event dates, favicon
├── lib/              # cn() class name utility
├── types/            # TypeScript interfaces
├── constants/        # Defaults and theme configs
├── test/             # Vitest setup and test helpers
├── App.tsx
└── index.css         # Tailwind + custom animations + theme variables
e2e/                  # Playwright specs, page objects, fixtures
```

## Development Status

### MVP: ✅ 100% COMPLETE - Production Ready + Performance Optimized

All core features are implemented and tested. Post-MVP sessions added cycles, special events, list sharing, volunteer picks, unavailable-today names, and more settings:

- **Core Features**: Radial wheel with smooth animations, multi-list support, persistent state
- **Name Management**: Add/edit/delete/exclude names, unavailable today, volunteer pick, bulk import, list switching
- **User Experience**: Keyboard shortcuts (Space, Escape), toast notifications, spin sound, responsive design
- **Data Features**: Selection history (last 100), CSV/JSON export with custom filenames, list share and import
- **Planning**: Cycles with cooldown weeks, special events with holiday flag and countdown
- **Theming**: 3 built-in themes (Cyan Pulse, Matrix Green, Sunset Orange)
- **Accessibility**: Radix UI primitives, WCAG 2.1 AA compliance, 44px touch targets
- **Performance**: Lazy loading for the mobile sidebar and toaster
- **Quality**: Unit and E2E tests in CI, SonarCloud quality gate, TypeScript strict mode, pre-commit hooks

**📋 Full Development History**: See [.claude/tasks/README.md](./.claude/tasks/README.md) for detailed session-by-session progress, implementation details, architectural decisions, and complete test coverage breakdown.

### Roadmap

See [radial-randomizer-prd.md](./radial-randomizer-prd.md) for the complete product vision.

**Future Enhancements (Post-MVP)**:
- Weighted randomization
- Categories and filtering
- Fair mode (ensure everyone gets picked)
- Analytics dashboard

## License

MIT
