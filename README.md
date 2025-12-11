# Solar Wheel of Fortune

A visually distinctive name selection tool with an engaging radial interface. Perfect for educators, team leaders, and event organizers who need fair, transparent random selection.

## Features

- Radial wheel display with smooth spin animations
- Random name selection with visual feedback
- **Name management sidebar** - Add, edit, delete, and exclude names
- **Multi-list support** - Create multiple name lists and switch between them
- **Bulk import** - Add multiple names at once via paste
- **Persistent state** - Names and lists saved to localStorage
- Selection tracking (count and timestamp per name)
- **Keyboard shortcuts** - Space to spin, Escape to close modals
- **Unit tests** - 30+ comprehensive tests with Vitest
- Responsive layout (sidebar + wheel)

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7
- Zustand 5 + Immer (state management with draft-style mutations)
- Framer Motion (animations)
- Tailwind CSS v4
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
│   └── sidebar/        # Name management sidebar
│       ├── NameManagementSidebar.tsx
│       ├── ListSelector.tsx
│       ├── AddNameForm.tsx
│       ├── NameListDisplay.tsx
│       ├── NameListItem.tsx
│       ├── BulkActionsPanel.tsx
│       └── index.ts
├── stores/             # Zustand state management with Immer
│   ├── useNameStore.ts
│   ├── useNameStore.test.ts    # 30 unit tests
│   └── useNameStore.mock.ts    # Test fixtures
├── hooks/              # Custom React hooks
│   ├── useKeyboardShortcuts.ts # Keyboard event handling
│   └── index.ts
├── test/               # Test utilities
│   └── setup.ts        # Vitest configuration
├── types/              # TypeScript interfaces
│   └── name.ts
├── constants/          # Configuration values
│   └── defaults.ts
├── App.tsx             # Main app component
└── index.css           # Tailwind + custom animations
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

**Session 5: Selection History & Export**
- [ ] Selection history panel (track spins)
- [ ] Export CSV/JSON
- [ ] Record selection metadata

**Session 6+: Polish & Advanced**
- [ ] Theme options (3 built-in themes)
- [ ] Responsive layout (mobile drawer)
- [ ] framer-motion → motion package migration

### Future (Post-MVP)
- Weighted randomization
- Categories and filtering
- Fair mode (ensure everyone gets picked)
- Analytics dashboard
- framer-motion → motion package migration

## License

MIT
