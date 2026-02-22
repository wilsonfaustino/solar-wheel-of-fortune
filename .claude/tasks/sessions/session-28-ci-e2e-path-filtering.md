# Session 28: CI E2E Path Filtering

**Date**: February 22, 2026
**Status**: Completed
**Branch**: `chore/ci-path-filtering`
**PR**: #46 (merged)
**Duration**: ~30 minutes
**Test Count**: 250 unit tests (no change — CI infrastructure only)

## Overview

Session 28 optimized the CI pipeline by skipping the E2E job on pull requests where only documentation, plans, or unit test files changed. E2E is the slowest job (~2-3 min including Playwright browser installation) and adds no value when production code is untouched.

The implementation uses a native `git diff` approach in a lightweight `changes` job — no third-party actions required.

## What Was Done

### Analysis

Reviewed the existing plan at `.claude/plans/ci-path-filtering.md`, which pre-evaluated two strategies:

- **Strategy 1** (original plan): `paths-ignore` at the workflow trigger level — skips the entire pipeline for doc-only PRs
- **Strategy 3** (chosen): Job-level `if` condition on the `e2e` job only — keeps lint, typecheck, and unit tests running for all PRs, skips only E2E when irrelevant

Strategy 3 was chosen because it gives more granular control: unit tests still run on test-only PRs (they can expose type errors and regressions), while only E2E is skipped.

### Implementation

**File modified**: `.github/workflows/ci.yml`

#### 1. New `changes` job

Runs in parallel with `lint`, `typecheck`, and `test`. Uses `git diff --name-only` against the PR base SHA to detect whether E2E-relevant files changed. Outputs `e2e-needed=true|false`.

Skip pattern (E2E not needed when all files match):
```
^(\.claude/|reference/|.*\.md$|src/.*\.(test|spec)\.(ts|tsx)$)
```

Push events to `main` always set `e2e-needed=true` (safety net after merge).

#### 2. `e2e` job — conditional execution

```yaml
needs: [lint, typecheck, changes]
if: needs.changes.outputs.e2e-needed == 'true'
```

#### 3. `sonarqube` job — handle skipped E2E

```yaml
if: always() && needs.test.result == 'success' && (needs.e2e.result == 'success' || needs.e2e.result == 'skipped')
```

Without `always()`, SonarQube would be blocked when E2E is skipped, since GitHub treats skipped jobs like failures in `needs` chains by default.

## Execution Flow by Scenario

| PR changes | `changes` output | E2E | SonarQube |
|---|---|---|---|
| `**.md`, `.claude/**`, `reference/**` | `false` | Skipped | Runs (after test) |
| `src/**/*.test.ts(x)` only | `false` | Skipped | Runs (after test) |
| Any `src/**` non-test file | `true` | Runs | Runs (after test + e2e) |
| Any `e2e/**` file | `true` | Runs | Runs (after test + e2e) |
| Push to `main` | `true` (forced) | Runs | Runs |

## Files Modified

- `.github/workflows/ci.yml` — Added `changes` job (+40 lines), updated `e2e` needs + `if`, updated `sonarqube` `if`

## Commits

**Commit 1**: `chore(ci): skip e2e job for doc and unit-test-only PRs`
- Add `changes` job with git diff detection
- Add `if: needs.changes.outputs.e2e-needed == 'true'` to `e2e`
- Add `if: always() && ...` to `sonarqube`

## Verification

**Pre-push hook** (ran automatically on `git push`):
```
✔ test (2.13 seconds) — 250 tests passing
✔ typecheck (1.56 seconds) — 0 errors
```

**Real-world verification**: This session's own PR (#46) triggered E2E because `ci.yml` is not in the skip pattern — correct behavior.

**Pending**: Verify E2E is skipped on a doc-only PR (branch `doc/session-28-ci-path-filtering` created post-merge for this purpose).

## Key Learnings

### 1. `always()` is required for downstream jobs after optional jobs
Without `always()` in the `sonarqube` `if` condition, GitHub blocks the job when any `needs` entry is skipped. `always()` overrides this and lets the explicit condition logic take over.

### 2. Push-to-main safety net
Direct pushes to `main` (i.e., post-merge CI run) always run E2E. This avoids a false sense of security where a merge could bypass E2E entirely if the PR happened to be doc-only in terms of file diff.

### 3. No third-party action needed
`dorny/paths-filter` is the standard approach for this pattern, but a `git diff --name-only` with a bash regex covers the use case cleanly without introducing a new pinned dependency.

### 4. `grep -qvE` for "any file outside pattern" detection
The logic `echo "$files" | grep -qvE "$SKIP_PATTERN"` exits 0 if any line does NOT match the pattern — i.e., E2E is needed. Exits non-zero if all lines match — E2E can be skipped. Edge case: empty `$CHANGED_FILES` defaults to `e2e-needed=true`.

## Bundle Impact

No bundle change — CI infrastructure only.

## Next Steps

- [ ] Confirm E2E skips on doc-only PR (branch `doc/session-28-ci-path-filtering`)
- [ ] Update branch protection rules if `E2E Tests (Playwright)` is a required check (must be set to optional to allow skipped runs to pass)
- [ ] Future: apply similar pattern to `build` job for doc-only PRs if CI time becomes a concern

## Related Files

- **Plan**: [.claude/plans/ci-path-filtering.md](../../plans/ci-path-filtering.md)
- **Workflow**: [.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
- **Previous Session**: [Session 27 - Matrix Instruction Glitch](session-27-matrix-instruction-glitch.md)
