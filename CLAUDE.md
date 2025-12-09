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
│   └── wheel/
│       ├── RadialWheel.tsx    # Main wheel container with spin logic
│       ├── CenterButton.tsx   # Spin trigger with pulse animation
│       ├── NameLabel.tsx      # Individual name positioned radially
│       ├── RadialLine.tsx     # Line extending from circle
│       └── index.ts           # Barrel exports
├── stores/
│   └── useNameStore.ts        # Zustand store with localStorage persistence
├── types/
│   └── name.ts                # TypeScript interfaces (Name, NameList, SelectionRecord)
├── constants/
│   └── defaults.ts            # Default names, wheel config values
├── hooks/                     # Custom React hooks (empty, for future use)
├── utils/                     # Utility functions (empty, for future use)
├── App.tsx                    # Main app component
├── main.tsx                   # React entry point
└── index.css                  # Tailwind imports + custom animations
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
- Zustand store with `persist` middleware for localStorage
- Use `useShallow` hook when selecting multiple state values to prevent re-renders
- Derived data (filtered names) should use `useMemo` to avoid infinite loops

**Styling**
- Tailwind v4 uses CSS-based config via `@theme` directive in `index.css`
- Custom animations defined in `index.css` (pulse-glow, ping)

## Code Style

- Use descriptive variable names (not single letters)
- Avoid comments for self-evident code; only comment magic numbers and non-obvious business logic
- Keep animations in CSS when possible, use Framer Motion for complex interactions
- Prefer `memo` for pure components that receive stable props

## MVP Progress

### Completed
- [x] Project setup (Vite + React + TypeScript + Bun)
- [x] Core wheel component with radial name display
- [x] Spin animation with Framer Motion
- [x] State persistence (localStorage via Zustand)
- [x] Basic name store (add, delete, update, mark selected)

### Remaining MVP Features
- [ ] Name management sidebar (add/edit/delete UI)
- [ ] Selection history panel
- [ ] Bulk import (paste, CSV)
- [ ] Export (JSON, CSV)
- [ ] Basic theming (3 built-in themes)
- [ ] Responsive layout
- [ ] Keyboard shortcuts (Space to spin)

## Tech Debt

- [ ] Migrate from `framer-motion` to `motion` package (rebranded, same codebase)
  - Replace: `import { motion } from "framer-motion"` with `import { motion } from "motion/react"`
  - Consider using `motion/mini` for smaller bundle (2.5kb)
  - See: https://motion.dev/docs/react-upgrade-guide
