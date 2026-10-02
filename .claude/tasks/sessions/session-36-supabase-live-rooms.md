# Session 36: Supabase Live Rooms

**Date**: 2026-10-01
**Status**: Completed
**Branch**: `wilsonfaustino/add-persistence`
**Tests**: 536 unit passed | 52 E2E passed locally (CI skips the live room spec: 51 passed, 1 skipped)

## Overview

A user can share all lists into a live room. The room id goes in the URL hash (`/#<roomId>`). Anyone who opens the link gets the room lists next to their own lists, and edits sync between all open browsers in about 1 second. Without a hash or a cached room, the app stays local-only and does not load supabase-js.

## What Was Done

### Reference

The RACHAI project (`~/www/dot/rachai`) gave the model: publishable key only, no auth, the room id in the URL is the access key, all writes through SQL functions, one Realtime channel per room. RACHAI also gave the test pattern (mock the module that calls Supabase) and the "RLS deny returns 204 with 0 rows" warning.

### Database (`supabase/schema.sql`)

- Table `rooms(id, data jsonb, version, updated_at)` with a 1MB size check on `data`.
- RLS on with no policies, and table access revoked from `anon` and `authenticated`. The publishable key cannot read or list rooms.
- `create_room`, `get_room`, `save_room` are `security definer` functions that need a room id. `save_room` takes `base_version` and returns no row when the version is stale.
- Applied to project `RADIAL` through the Supabase MCP server as migration `create_rooms`. The Supabase advisor reports the 3 functions as callable by `anon`. That is the design.

### Client

- `src/lib/supabase.ts`: client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, `null` when either is missing.
- `src/lib/rooms.ts`: the 3 room functions and `openRoomChannel`. A broadcast carries only `{ version }`, because Realtime caps message size. Receivers fetch the room with `get_room`.
- `src/lib/roomSync.ts`: connects the names store to the active room.
  - `NameList.roomId` marks room lists. Lists without it never leave the device.
  - SHARE LIVE moves every current list into a new room (`shareRoom`).
  - A store change schedules a save after 300ms. The save sends the room lists and their history with the current version.
  - A stale save pulls the room. The other device's data wins and the local edit drops.
  - The "last synced" fingerprint is a snapshot of the store after a save or an apply, never the server payload, because `jsonb` does not keep key order.
  - The app pulls again on every channel `SUBSCRIBED` and when the tab becomes visible, because broadcasts are not replayed.
  - A new history record in synced data shows the selection toast. The toast gets the name with the pick subtracted, because it expects the count from before the pick.
  - One room per device. Joining another room keeps the old room lists as local lists.
- `src/lib/roomSyncLoader.ts`: loads `roomSync` (and supabase-js) only for a room hash, a cached room, or a SHARE LIVE click. Main bundle stays at 643 kB (202 kB gzip). supabase-js is a separate 60 kB gzip chunk.

### UI

- `LiveRoomActions` under SHARE / IMPORT: SHARE LIVE, then a LIVE ROOM line and COPY LINK. It is hidden when the Supabase env vars are missing.
- `ListSelector` shows a `LIVE` badge on room lists, in the trigger and in the menu.

### Store fix

The history cap was 100 records for all lists together. A busy local list then trimmed the records of a shared list, and the next save deleted them for everyone. The cap is now 100 records per list (`trimHistoryPerList`).

### PR #83 review fixes

An agent review on PR #83 found 5 sync defects. Each fix has a test that failed before the fix.

1. **Duplicate list ids after rejoining a room.** Leaving a room kept its lists as local copies with the same ids. Rejoining added remote lists with those ids, and store actions edited the first match, which was the local copy. `applyRoomData` now gives a colliding local list a new id and moves its history to the new id with new record ids.
2. **Older responses rolled the room back.** A late join response could replace data that a catch-up pull had already applied, and a late save response could move the version backward. Both paths now ignore a version older than the applied one.
3. **Edits during `createRoom` were never saved.** `shareRoom` now builds the fingerprint from the snapshot it sent, then schedules a save.
4. **Failed saves were never retried.** A failed save retries every 5s (fixed interval, no backoff). A reconnect or the tab becoming visible runs `catchUp`: pull first, then save any unsaved edit.
5. **An empty room lost its controls.** `useRoomStore.activeRoomId` (not persisted) holds the active room apart from the lists. `startRoom` sets it, `stopRoomSync` clears it, and `LiveRoomActions` prefers it over the cached list `roomId`.

### Test isolation

Vitest loaded the real keys from `.env.local`. `vitest.config.ts` now sets both vars to empty strings, so unit tests cannot reach the live project.

## Files Modified

| File | Change |
|------|--------|
| `supabase/schema.sql` | New: `rooms` table, RLS, 3 room functions |
| `src/lib/supabase.ts` | New: client or `null` |
| `src/lib/rooms.ts` | New: room functions and channel |
| `src/lib/roomSync.ts` | New: store and room sync |
| `src/lib/roomSyncLoader.ts` | New: lazy load and boot |
| `src/main.tsx` | Calls `bootRoomSync()` |
| `src/types/name.ts` | `NameList.roomId` |
| `src/stores/useRoomStore.ts` | New: active room id, not persisted |
| `src/stores/useNameStore.ts` | History cap per list |
| `src/components/sidebar/LiveRoomActions.tsx` | New: SHARE LIVE, COPY LINK |
| `src/components/sidebar/NameManagementSidebar.tsx` | Renders `LiveRoomActions` |
| `src/components/sidebar/ListSelector.tsx` | `LIVE` badge |
| `src/vite-env.d.ts` | Env var types |
| `vitest.config.ts` | Blank Supabase env vars in tests |
| `.env.example` | Supabase env vars |
| `e2e/specs/15-live-room.spec.ts` | New: two browser contexts, skips without keys |
| Tests next to each source file | New and updated cases |

## Commits

| Hash | Message |
|------|---------|
| `8ebd8c4` | `chore(deps): add supabase-js client` |
| `9c063bd` | `feat(db): add rooms schema with rpc-only access` |
| `e25ffa3` | `fix(store): cap selection history per list` |
| `afdcd8d` | `chore(test): blank supabase env vars in unit tests` |
| `6d0cabd` | `feat(sync): sync store with shared room over realtime` |
| `bf99a98` | `chore(merge): merge origin/main into add-persistence` (PR #82) |
| `0bbd09d` | `perf(sync): load supabase only for live rooms` |
| `5de0aca` | `fix(sync): show pre-pick count in remote selection toast` |
| `4585954` | `feat(sidebar): add live room share button` |
| `49809e1` | `test(e2e): verify live sync across two browser contexts` |
| `47989e9` | `feat(sidebar): mark live room lists in list selector` |
| `b23b8f8` | `docs(session): document Session 36 supabase live rooms` |
| `49b3052` | `fix(sync): give local copies new ids when they collide with room lists` |
| `7882b40` | `fix(sync): ignore room responses older than the applied version` |
| `968bcdc` | `fix(sync): save edits made while a room is being created` |
| `67a76c7` | `fix(sync): retry failed room saves and save after reconnecting` |
| `14eb5d7` | `fix(sidebar): keep live room controls when the room has no lists` |
| `(this commit)` | `docs(session): add PR #83 review fixes to Session 36` |

## Verification

```
bun test:coverage -> 536 passed, lines 96.7%, branches 89.6%
bun run test:e2e  -> 52 passed with .env.local keys
                     live room spec skips without keys (CI)
```

- Type check: pass (`bun run tsc -b`)
- Lint: pass (`bun run ci`)
- Build: pass (`bun run build`)
- Live check in Orca with 2 isolated browser profiles: share, join, add name both ways (about 1s), spin toast on the other tab, auto-exclusion synced, rejoin after reload.

## Key Learnings

- A sync fingerprint must come from the local store. A server `jsonb` payload never matches `JSON.stringify` of the same data, which gives a save loop between 2 clients.
- A cap or cleanup that runs on all lists becomes a delete for everyone once some lists are shared.
- A queued save of a room the device already left sends an empty snapshot. Each save checks that its room is still the active room.
- `VITE_*` vars in `.env.local` reach Vitest. Blank them in `test.env` before any test imports the client.
- The two-browser check found the toast count bug that the unit tests missed. Mocked tests passed the name in the shape the test author expected, not in the shape the app sends.
- The review found 5 ordering defects (late responses, work in flight during create, failures with no follow-up edit). For each async path, ask: what if this response arrives late, what changes while it runs, and what happens when it fails with no further input.

## Next Steps

- Read-only links (decided: later).
- Leave room / stop sharing (decided: not now).
- Per-list merge if "last write wins" drops edits in practice.
- The E2E live room spec leaves one room row per local run. Add a cleanup path if the table grows.
- A deploy target. Links work only where the app is reachable; VITE_* vars must be build variables there.

## Notes

- The plan is in `.claude/plans/supabase-persistence.md`. No session prompt file was written, because the plan came before the implementation in the same session.
- The cycles E2E failure found during this session was a separate time zone bug in the app. It shipped in PR #82 and is merged into this branch.
