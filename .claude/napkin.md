# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-11] Always run `bun info <pkg>` before installing unfamiliar packages**
   Do instead: verify package exists on npm registry before `bun add`, especially for scoped @github-ui/* packages.

2. **[2026-03-11] Do NOT use `storybook init` - it spawns npm internally**
   Do instead: `bun add -D storybook @storybook/react-vite ...` then create `.storybook/` files manually.

## Shell & Command Reliability
1. **[2026-03-11] Tailwind v4 uses Vite plugin, not PostCSS**
   Do instead: use `@tailwindcss/vite` in `viteFinal` for Storybook; never add `postcss.config.*`.

## Domain Behavior Guardrails
1. **[2026-03-11] Both tsconfig.app.json AND tsconfig.node.json have `noUncheckedSideEffectImports: true`**
   Do instead: any new tsconfig (e.g., tsconfig.storybook.json) that needs CSS imports must override this flag to `false`.

2. **[2026-03-11] Button component is a named export `{ Button }` from `src/components/ui/button.tsx`; uses `@/lib/utils` (not `@/utils/cn`)**
   Do instead: import as `import { Button } from './button'` or `import { Button } from '@/components/ui/button'`.

## User Directives
1. **[2026-03-11] No emojis, no em-dashes in any output**
   Do instead: plain text only.

2. **[2026-03-11] No "Co-Authored-By" Claude trailers in commits**
   Do instead: omit AI attribution entirely from commit messages.

3. **[2026-03-11] Plans must be extremely concise - sacrifice grammar for concision**
   Do instead: bullet points, code blocks, minimal prose.
