# Solar Wheel of Fortune

A visually distinctive name selection tool with an engaging radial interface. Perfect for educators, team leaders, and event organizers who need fair, transparent random selection.

## Features

- Radial wheel display with smooth spin animations
- Random name selection with visual feedback
- **Name management sidebar** - Add, edit, delete, and exclude names
- **Multi-list support** - Create multiple name lists and switch between them
- **Bulk import** - Add multiple names at once via paste
- **Persistent state** - Names and lists saved to localStorage
- **Selection history** - Track last 100 selections with relative timestamps
- **Export functionality** - Export selections to CSV or JSON with custom filenames
- **Dynamic theming** - 3 built-in themes (Cyan Pulse, Matrix Green, Sunset Orange)
- **Tab navigation** - Switch between Names, History, and Settings tabs
- **Fully responsive design** - Mobile drawer, tablet, and desktop layouts
- **Touch-friendly UI** - 44px touch targets (WCAG AAA compliance)
- **Keyboard shortcuts** - Space to spin, Escape to close modals
- **Unit tests** - 96 comprehensive tests with Vitest + React Testing Library

## Themes

Three built-in themes available in the Settings tab:

- **Cyan Pulse** (default) - Cyan accent (#00FFFF) on black background
- **Matrix Green** - Green accent (#00FF00) on black background
- **Sunset Orange** - Orange accent (#FF6B35) on dark brown (#1A0A00)

Themes apply instantly and persist across sessions via localStorage.

## Responsive Design

The app is fully responsive across all device sizes:

- **Mobile (<640px)**: Drawer sidebar with hamburger menu, 350px wheel, 14px base font
- **Tablet (640-1023px)**: Drawer sidebar, 500px wheel, 15px base font
- **Desktop (≥1024px)**: Fixed sidebar, 900px wheel, 16px base font

All touch targets meet WCAG AAA standards (44px minimum height). The mobile drawer closes via backdrop click, close button, or Escape key.

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- Zustand 5 + Immer (state management with draft-style mutations)
- Framer Motion (animations)
- Tailwind CSS v4 with clsx & tailwind-merge (class composition)
- Bun (package manager)
- Biome 2 (linting & formatting)
- Lefthook (git hooks manager)

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
| `bun test` | Run tests in watch mode |
| `bun test:ui` | Run tests with UI dashboard |
| `bun test:run` | Run tests once (CI mode) |

## Project Structure

```
src/
├── components/
│   ├── wheel/          # Radial wheel components
│   │   ├── RadialWheel.tsx
│   │   ├── CenterButton.tsx
│   │   ├── NameLabel.tsx
│   │   ├── RadialLine.tsx
│   │   └── index.ts
│   ├── MobileHeader.tsx         # Mobile header with hamburger menu
│   └── sidebar/        # Name management sidebar
│       ├── NameManagementSidebar.tsx
│       ├── TabSelectionButton.tsx    # Reusable tab button component
│       ├── ListSelector.tsx
│       ├── AddNameForm.tsx
│       ├── NameListDisplay.tsx
│       ├── NameListItem.tsx
│       ├── BulkActionsPanel.tsx
│       ├── HistoryPanel.tsx     # Selection history display
│       ├── HistoryItem.tsx      # Individual history entry
│       ├── ExportModal.tsx      # CSV/JSON export modal
│       ├── ThemeSwitcher.tsx    # Theme selection in Settings
│       ├── MobileSidebar.tsx    # Mobile drawer sidebar
│       └── index.ts
├── stores/             # Zustand state management with Immer
│   ├── useNameStore.ts
│   ├── useNameStore.test.ts    # 96 unit tests
│   └── useNameStore.mock.ts    # Test fixtures
├── hooks/              # Custom React hooks
│   ├── useKeyboardShortcuts.ts # Keyboard event handling
│   ├── useMediaQuery.ts        # Responsive breakpoint detection
│   └── index.ts
├── utils/              # Utility functions
│   ├── cn.ts                   # Class name composition (clsx + tailwind-merge)
│   ├── export.ts               # CSV/JSON export utilities
│   ├── formatRelativeTime.ts   # Timestamp formatting
│   └── index.ts
├── test/               # Test utilities
│   └── setup.ts        # Vitest configuration
├── types/              # TypeScript interfaces
│   ├── name.ts
│   └── theme.ts        # Theme type definitions
├── constants/          # Configuration values
│   ├── defaults.ts
│   └── themes.ts       # 3 built-in theme configs
├── App.tsx             # Main app component
└── index.css           # Tailwind + custom animations + theme variables
```

## Roadmap

See [radial-randomizer-prd.md](./radial-randomizer-prd.md) for the complete product vision.

### MVP Progress

**Session 1: Core Features** ✅ Complete
- [x] Core wheel with spin animation
- [x] State persistence (Zustand + localStorage)
- [x] Multi-list support

**Session 2: Name Management Sidebar** ✅ Complete
- [x] Name management UI (add/edit/delete/exclude)
- [x] List management (create/rename/delete lists)
- [x] Bulk import modal
- [x] Clear selections & reset buttons
- [x] Immer middleware integration

**Session 3: Keyboard Shortcuts & Testing** ✅ Complete
- [x] Space bar to spin the wheel
- [x] Escape key for modals/dropdowns
- [x] Unit tests (Vitest + React Testing Library)
- [x] 30 comprehensive store tests

**Session 4: Tooling Modernization** ✅ Complete
- [x] Migrate from ESLint to Biome 2 (unified linter + formatter)
- [x] Install and configure lefthook (git hooks manager)
- [x] Pre-commit validation (lint + auto-fix on staged files)
- [x] Pre-push validation (type-check + test suite)
- [x] Commit message validation (conventional commits format)
- [x] VSCode integration (format on save, auto-fix)

**Session 5: Selection History & Export** ✅ Complete
- [x] Selection history tracking (FIFO 100 items)
- [x] History UI panel with relative timestamps
- [x] Export to CSV and JSON
- [x] Custom filename input with timestamps
- [x] 37 comprehensive export tests

**Session 6: Dynamic Theming System** ✅ Complete
- [x] CSS custom properties system with @theme directive
- [x] 3 built-in themes (Cyan Pulse, Matrix Green, Sunset Orange)
- [x] ThemeSwitcher component in Settings tab
- [x] All 13+ components updated to use theme variables
- [x] localStorage theme persistence
- [x] 8 theme-specific tests

**Session 7: Responsive Layout** ✅ Complete
- [x] Responsive breakpoints (mobile/tablet/desktop)
- [x] Mobile drawer sidebar with animations
- [x] useMediaQuery hook for screen detection
- [x] Responsive wheel sizing (350px/500px/900px)
- [x] Touch-friendly buttons (44px WCAG AAA)
- [x] Responsive typography (14px/15px/16px)
- [x] Mobile fixes (scrollbars, text overlays)

**MVP Status: 100% COMPLETE - Production Ready**

### Future (Post-MVP)
- Weighted randomization
- Categories and filtering
- Fair mode (ensure everyone gets picked)
- Analytics dashboard
- framer-motion → motion package migration

## License

MIT
