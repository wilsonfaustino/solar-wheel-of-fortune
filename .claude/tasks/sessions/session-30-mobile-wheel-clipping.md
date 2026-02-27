# Session 30: Mobile Wheel Clipping Fix

**Date**: 2026-02-26
**Status**: Complete
**Branch**: `fix/mobile-wheel-clipping` (merged via PR #50)
**Tests**: 260 passing, 1 skipped (unchanged)

---

## Overview

Fixed a mobile layout bug where the wheel SVG was hardcoded at 500×500px while the container was capped at 350px, causing 55px of overflow on each side of the viewport. Names at the horizontal extremes (DAKOTA, ROWAN, SAGE, QUINN) were clipped. Replaced the inline style / JS media query approach with a proper SVG `viewBox` and Tailwind responsive classes.

---

## What Was Done

### Discovery
- Explored codebase to identify quick wins
- Found documented mobile fixes in `features/active/mobile-fixes.md` were already applied
- Inspected live browser with mobile viewport (390px): `svgRect.left = -55`, confirming 55px clip on both sides
- SVG was `width: 500px; height: 500px` via inline style, centered in a 350px container

### Root Cause
`RadialWheel.tsx` used a `responsiveStyles` useMemo driven by `useMediaQuery` to set `maxWidth` via inline styles. The SVG had fixed inline dimensions of `500×500px` with no `viewBox`, so it rendered at full size regardless of container — overflowing the mobile viewport.

### Fix (`src/components/wheel/RadialWheel.tsx`)
- Removed `useMediaQuery` import (now unused in this file)
- Removed `useMemo` from React imports (same reason)
- Removed `responsiveStyles` computed object and `style={responsiveStyles}` from container div
- Added `sm:max-w-[500px] lg:max-w-[900px]` Tailwind classes to container (no small-screen cap — `w-full` + app padding constrains naturally to ~358px)
- SVG: removed `style={{ width, height }}`, added `className="absolute w-full h-full"` + `viewBox="0 0 500 500"`

### Result
SVG renders at 362×362px on a 390px screen (`left: 14px`), fully within the viewport. All 12 names visible. Wheel scales proportionally via viewBox.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/wheel/RadialWheel.tsx` | Removed inline styles + useMediaQuery; added viewBox + Tailwind responsive classes |

---

## Commits

- `dd9d36a` — `fix(wheel): replace fixed SVG size with viewBox and Tailwind responsive classes`

---

## Verification

- `bun run tsc --noEmit` → 0 errors
- `bun test:run` → 260 passed, 1 skipped
- `bun biome ci src/components/wheel/RadialWheel.tsx` → clean
- Pre-push hooks (test + typecheck) → all green
- Browser: SVG measured at 362×362px, `left: 14px` on 390px viewport

---

## Key Learnings

- **Stale task docs**: `features/active/mobile-fixes.md` described fixes already applied in earlier sessions — worth auditing active task files at session start
- **Inline styles vs Tailwind**: The `responsiveStyles` pattern (JS media query → inline style) was a Tailwind v4 anti-pattern; `viewBox` + responsive Tailwind classes is the right approach for responsive SVGs
- **`useMediaQuery` scope**: The hook is still used in `App.tsx` and `Toaster.tsx` — removing it from `RadialWheel.tsx` did not make it dead code

---

## Next Steps

- Archive `features/active/mobile-fixes.md` (fixes are done)
- Consider adding tests for `MobileHeader.tsx` and `useMediaQuery.ts` (both at 0% coverage)
