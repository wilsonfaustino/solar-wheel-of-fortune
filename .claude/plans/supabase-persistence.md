# Supabase shared rooms (Session 36)

Branch: `wilsonfaustino/add-persistence` (exists, no new branch).

## Goal

Share a wheel by URL hash (`/#<roomId>`), RACHAI style. Anyone with the link sees the same data. A change on one machine shows on the others live. No hash = app works local-only, as today.

## Reference: RACHAI (`~/www/dot/rachai`)

- `supabase-js` ^2.115, anon key only, no auth. Room id in URL is the access key.
- Client in `src/lib/supabase.ts`, all calls in `src/lib/*.ts`, components never import supabase.
- Writes via SECURITY DEFINER rpc. Realtime channel per room, refetch on event.
- Test pattern: `createSupabaseMock()` + `vi.mock('./supabase')`.
- Gotchas: RLS deny = 204 + 0 rows, no error (assert returned row). VITE_* vars inline at build time. Realtime DELETE payload only has replica identity cols.

## Decisions (user, 2026-10-01)

- Room holds app state: lists (names, cycles, events) + history of those lists.
- Link = edit access. Read-only links later.
- Spin: no animation mirror. Result syncs; remote machines show toast.
- Joining adds room lists next to local lists. Local lists stay local.
- No leave/unshare for now.
- No Supabase project yet (user creates it). E2E local only.

## Assumptions (confirm)

- Lists carry `roomId?: string`. Only lists with `roomId` sync. Local lists never upload.
- SHARE moves all current local lists into the new room.
- New list created while a room is active goes to the room.
- One room per device for MVP. Room id persisted, so reopening without hash still syncs.
- Remote toast: when applied remote data has a new history record, show toast for it. No extra event.
- Auto-exclude timer runs only on the spinner's machine; result syncs like any edit.
- `currentTheme`, `activeListId`, settings stay local.

## Design

- Table `rooms(id uuid pk, data jsonb, version int, updated_at timestamptz)`.
- Security: RLS on, no table policies for anon. Access only through rpc `get_room(id)`, `create_room(data)`, `save_room(id, data, base_version)`. Without this, anon key could `select *` and list every room.
- Live: Realtime Broadcast channel `room:<id>` (no RLS needed). Writer saves via rpc, then broadcasts `{ version }` only (message size cap). Receivers call `get_room` when version > local. Pull again on every SUBSCRIBED and on tab visible (broadcasts are not replayed).
- Conflict: `save_room` rejects stale `base_version`; client refetches and re-applies. Whole-blob last write wins. Fine for a small team, loses one edit on true simultaneous writes.
- Share flow: SHARE button -> `create_room(current blob)` (this is the localStorage migration) -> set `location.hash` -> copy link.
- Join flow: open link -> `get_room` -> load into store -> subscribe channel -> debounced save (~300ms) on store change. Ignore store changes caused by applying remote data (no echo loop).
- Settings, theme stay local per device.
- History capped at 100 per list (was 100 global: a busy local list trimmed shared records). Whole room re-sent on every save; 1MB DB cap.
- No env vars -> sharing hidden, app local-only, E2E unaffected.

## Validation (Orca browser, verified CLI support)

- `orca tab profile create --label guest --scope isolated --json` -> separate partition (own localStorage, like incognito).
- Tab A: `orca tab create --url http://localhost:5173 --json` (default profile). Click SHARE, read hash.
- Tab B: `orca tab create --url http://localhost:5173/#<roomId> --profile <guestId> --json`.
- Add name in A -> `orca wait --text <name> --page <B>`; edit in B -> check A.
- Plus Playwright E2E: 2 browser contexts, same flow (CI-safe only if Supabase reachable; else local-only spec).

## Phases

1. Deps + client -> verify: `bun run tsc -b`
2. `supabase/schema.sql` (rooms, rpc, grants) -> verify: rpc calls in SQL editor; direct `select` as anon returns nothing
3. `src/lib/rooms.ts` (rpc calls), `src/lib/roomSync.ts` (hash, subscribe, debounce, apply) -> verify: unit tests
4. SHARE button + room indicator in sidebar -> verify: component test
5. Tests: sync unit (create, join, apply newer, drop older, stale-version retry, no echo, no env no-op) -> verify: `bun test:coverage` >= 95
6. Orca two-profile check + E2E -> verify: live update both ways
7. Docs: session doc, README tasks, CLAUDE.md

## Commits

1. `chore(deps): add supabase-js client`
2. `feat(db): add rooms schema with rpc-only access`
3. `feat(sync): sync store with shared room over realtime`
4. `feat(sidebar): add share button and room indicator`
5. `test(sync): cover room create, join, and conflict paths`
6. `test(e2e): verify live sync across two browser contexts`
7. `docs(session): document Session 36 shared rooms`

## Unresolved questions

1. Confirm assumptions above (esp. SHARE moves all local lists, one room per device).
2. Deploy target? None in repo. Friends need a public URL to open the link; localhost only works on your machine.
3. User step: create Supabase project, put URL + anon key in `.env.local`, run `schema.sql` in SQL editor.
