# Verify

Run all quality gates to ensure the codebase is ready for commit/push.

## Steps

Run the following commands in sequence and report results:

1. **Type Check**: `bun run tsc -b`
2. **Lint**: `bun run ci`
3. **Tests**: `bun test:run`
4. **Build**: `bun run build`

## Output Format

After running all commands, provide a summary table:

| Check | Status | Details |
|-------|--------|---------|
| Type Check | Pass/Fail | Error count if any |
| Lint | Pass/Fail | Issue count if any |
| Tests | Pass/Fail | X/Y tests passing |
| Build | Pass/Fail | Bundle size if successful |

If all checks pass, confirm the codebase is ready for commit/push.

If any check fails, list the specific errors that need to be fixed.
