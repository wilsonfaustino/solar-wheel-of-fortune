# Plan: Session 31 — React Doctor Audit Fixes

## Context

react-doctor audit scored 96/100. 1 error + 5 warnings found. After investigation, item #6 (e2e/pages/index.ts) is a false alarm — file doesn't export `secondaryNameList`. 5 real issues remain.

## Branch

`chore/react-doctor-fixes`

## Tasks

### 1. Footer.tsx — Move hardcoded `authorName` to constants
- **File**: `src/components/Footer.tsx:5`
- `const authorName = 'Wilson Faustino'` flagged as possible hardcoded secret
- Move to `src/constants/defaults.ts` as exported constant (not a real secret, just a lint fix)

### 2. NameLabel.tsx — Replace `transition: "all"` with specific properties
- **File**: `src/components/wheel/NameLabel.tsx:35`
- Current: `style={{ transition: 'all 0.3s ease' }}`
- Replace with Tailwind classes: `transition-opacity duration-300 ease-in-out` (or whichever properties actually animate — check usage)

### 3. MobileSidebar.tsx + RadialWheel.tsx — LazyMotion optimization
- **Files**: `src/components/sidebar/MobileSidebar.tsx`, `src/components/wheel/RadialWheel.tsx`
- Replace `import { motion } from 'framer-motion'` with `import { LazyMotion, domAnimation, m } from 'framer-motion'`
- Wrap animated elements with `<LazyMotion features={domAnimation}>`, replace `motion.div` with `m.div`
- Saves ~30kb bundle
- **Note**: Check all framer-motion imports project-wide; consider wrapping `<LazyMotion>` at App level instead of per-component

### 4. Remove unused `secondaryNameList` export
- **File**: `src/test/test-data.ts` (lines 35-62)
- Delete the entire `secondaryNameList` export — confirmed zero usage in actual test files
- Item #6 (`e2e/pages/index.ts`) is a false alarm — no action needed

## Verification

```bash
bun run tsc -b          # type check
bun test:run            # all unit tests pass
bun run test:e2e        # all E2E tests pass
bun run ci              # biome lint clean
bun run build           # production build succeeds
```

## Commits (atomic)

1. `chore(footer): move authorName to constants`
2. `perf(wheel): replace transition-all with specific properties in NameLabel`
3. `perf(motion): use LazyMotion for reduced framer-motion bundle`
4. `chore(test): remove unused secondaryNameList export`

## Unresolved Questions

- **LazyMotion scope**: Wrap at App level (cleaner, one wrapper) or per-component (more isolated)? Recommend App level if multiple components use motion.
- **Footer authorName**: Is `constants/defaults.ts` the right place, or should it be an env var? Author name isn't secret — constant seems fine.
