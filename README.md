# Solar Wheel of Fortune

A visually distinctive name selection tool with an engaging radial interface. Perfect for educators, team leaders, and event organizers who need fair, transparent random selection.

## Features

- Radial wheel display with smooth spin animations
- Random name selection with visual feedback
- Persistent state (names saved to localStorage)
- Responsive design

## Tech Stack

- React 19 + TypeScript
- Vite
- Zustand (state management)
- Framer Motion (animations)
- Tailwind CSS v4

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/radial-randomizer.git
cd radial-randomizer

# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:5173`

### Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun preview` | Preview production build |
| `bun run tsc` | Type check |
| `bun lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   └── wheel/          # Radial wheel components
├── stores/             # Zustand state management
├── types/              # TypeScript interfaces
├── constants/          # Configuration values
├── App.tsx             # Main app component
└── index.css           # Tailwind + custom animations
```

## Roadmap

See [radial-randomizer-prd.md](./radial-randomizer-prd.md) for the complete product vision.

### MVP (In Progress)
- [x] Core wheel with spin animation
- [x] State persistence
- [ ] Name management UI (add/edit/delete)
- [ ] Selection history
- [ ] Import/Export (CSV, JSON)
- [ ] Theme options
- [ ] Keyboard shortcuts

### Future
- Weighted randomization
- Categories and filtering
- Fair mode (ensure everyone gets picked)
- Analytics dashboard

## License

MIT
