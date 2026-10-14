# Session 37: Unavailability Icon and Day Count

**Branch**: `feat/unavailability-icon-label`

## Session Goal

Let a person marked unavailable carry one optional icon from 8 presets, and show the total day count (`· N DAYS`) on the row for multi-day ranges.

## Pre-Session Setup

```bash
git checkout main && git pull --ff-only
git checkout -b feat/unavailability-icon-label
bun test:run
```

## Session Tasks

1. Add `src/constants/unavailability.ts` (8 presets, `getUnavailabilityIcon`), `Name.unavailableIcon?`, and `countRangeDays` in `src/utils/name.ts`, tests first.
2. Add an `icon?` param to `setUnavailability`. Clear the icon in `clearUnavailability` and `resetList`.
3. Add the `ICON (OPTIONAL)` toggle grid with hover and focus tooltips to `UnavailabilityDialog`. `onSave(from, until, icon?)`; TODAY ONLY passes the icon.
4. Show the icon (`role="img"`, no `tabIndex`, hover tooltip) and ` · N DAYS` in `ReturnDayLabel`. Put one `TooltipProvider` in `NameListDisplay`.
5. Extend `e2e/specs/14-unavailability.spec.ts`: icon plus day count after reload, TODAY ONLY icon without day count, hover tooltip.

## Post-Session Checklist

```bash
bun run tsc -b
bun test:run
bun test:coverage
bun run build
bunx biome ci src e2e
bun run test:e2e e2e/specs/14-unavailability.spec.ts
```

## Success Criteria

- [ ] Icon saves, shows in the row, and clears on MARK AVAILABLE and list reset
- [ ] Multi-day rows show the total days; single-day rows do not
- [ ] Unknown icon id renders no icon and does not crash
- [ ] Coverage thresholds hold
