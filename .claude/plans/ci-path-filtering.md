# CI Path-Based Filtering Optimization Plan

**Branch**: `chore/ci-path-filtering`
**Session**: Session 26
**Estimated Duration**: 30-45 minutes
**Type**: CI/CD optimization (non-breaking infrastructure change)

## Context

Currently, the CI pipeline runs all 6 jobs (lint, typecheck, test, build, e2e, sonarqube) on every change, including documentation-only updates. This results in:
- Unnecessary CI time (~5 minutes per doc-only PR)
- Wasted GitHub Actions minutes
- Slower feedback loop for trivial documentation changes

Common doc-only changes:
- `.claude/tasks/sessions/*.md` - Session documentation after every session
- `.claude/tasks/prompts/*.md` - Session prompts
- `README.md`, `CLAUDE.md` - Documentation updates
- `reference/` - POC reference files

## Decision Rationale

**Chosen Approach**: Strategy 1 (Simple paths-ignore)

**Why Strategy 1 over Strategy 3**:
1. **Simplicity**: 5 lines of YAML vs 50+ lines + external action dependency
2. **Current needs**: No deployment step exists yet, so aggressive optimization unnecessary
3. **Reversibility**: Easy to revert if issues arise
4. **Maintenance**: Easier for team to understand and modify
5. **Sufficient**: Solves 90% of the problem (doc-only PRs)

**Future migration path**: When deployment is added, upgrade to Strategy 3 (path-based job conditions with `dorny/paths-filter`) for granular control.

## Implementation Phases

### Phase 1: Add Path Filtering to Workflow Trigger (10 min)

**File**: `.github/workflows/ci.yml`

**Changes**:
```yaml
on:
  pull_request:
    branches: [main]
    paths-ignore:
      - '**.md'
      - '.claude/**'
      - 'reference/**'
      - '.github/ISSUE_TEMPLATE/**'
      - '.github/PULL_REQUEST_TEMPLATE.md'
  push:
    branches: [main]
    paths-ignore:
      - '**.md'
      - '.claude/**'
      - 'reference/**'
      - '.github/ISSUE_TEMPLATE/**'
      - '.github/PULL_REQUEST_TEMPLATE.md'
```

**Why these paths**:
- `**.md` - All markdown files (README, CLAUDE.md, session docs, etc.)
- `.claude/**` - Task documentation, plans, prompts (no production impact)
- `reference/**` - POC HTML reference (preserved for historical context)
- `.github/ISSUE_TEMPLATE/**` - Issue templates (documentation)
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template (documentation)

**Explicitly NOT excluded**:
- `**/*.test.ts`, `**/*.test.tsx` - Tests can reveal type errors, keep CI running
- `e2e/**` - E2E tests validate production behavior, keep CI running
- `src/**` - Production code (obvious)
- Config files - `vite.config.ts`, `playwright.config.ts`, etc. (affect builds)

### Phase 2: Update Documentation (15 min)

**File 1**: `CLAUDE.md` - Update CI/CD Pipeline section

Add new subsection after "Local Testing Before Push":

```markdown
### CI Path Filtering

The CI pipeline intelligently skips workflow runs for documentation-only changes to save time and resources.

**Excluded Paths** (workflow won't run):
- `**.md` - All markdown files
- `.claude/**` - Task documentation, plans, prompts
- `reference/**` - POC reference files
- `.github/ISSUE_TEMPLATE/**` - Issue templates
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template

**Always Included** (workflow runs):
- Production code (`src/**/*.ts`, `src/**/*.tsx`)
- Tests (`**/*.test.ts`, `**/*.test.tsx`)
- E2E tests (`e2e/**`)
- Configuration files (`vite.config.ts`, `playwright.config.ts`, etc.)
- Dependencies (`package.json`, `bun.lockb`)

**Example Behavior**:
- Doc-only PR (session summary + README update) → CI skipped ✅
- CLAUDE.md update only → CI skipped ✅
- Code + docs change → CI runs normally ✅
- Test-only change → CI runs normally ✅

**Note**: If you need to force CI to run on a doc-only PR, add an empty commit with a code file:
```bash
git commit --allow-empty -m "chore: trigger CI for doc PR"
```
```

**File 2**: `.claude/tasks/README.md` - Add note in "End of Session" section

After "Commit documentation changes", add:

```markdown
5. **Note**: Documentation commits will skip CI pipeline (by design). If you need CI verification, include a code change or create an empty commit.
```

### Phase 3: Create Test PR to Verify (10 min)

**Steps**:
1. Create branch `chore/ci-path-filtering`
2. Commit workflow changes
3. Push to GitHub
4. Verify CI runs (workflow changes trigger CI)
5. Create a doc-only commit (update README with test line)
6. Push to GitHub
7. Verify CI does NOT run for doc-only commit

**Expected Results**:
- First push (workflow change): CI runs ✅
- Second push (doc-only): CI skipped ✅
- GitHub UI shows: "Expected — Waiting for status to be reported"

### Phase 4: Create Session Documentation (10 min)

**File**: `.claude/tasks/sessions/session-26-ci-path-filtering.md`

Standard session structure:
- Overview
- What Was Done
- Files Modified
- Commits
- Verification
- Key Learnings
- Next Steps

### Phase 5: Verification & Commits (5 min)

**Pre-commit checks**:
```bash
bun run ci          # Biome lint (should pass)
bun run tsc -b      # Type check (no TS changes, should pass)
bun test:run        # All tests (no code changes, should pass)
```

**Atomic commits**:
1. `chore(ci): add path filtering to skip docs-only workflow runs`
2. `docs(ci): document path filtering behavior and exclusions`
3. `docs(session): document Session 26 CI path filtering optimization`

## Files to Modify

1. `.github/workflows/ci.yml` - Add paths-ignore to triggers
2. `CLAUDE.md` - Document path filtering behavior
3. `.claude/tasks/README.md` - Note about doc commits skipping CI
4. `.claude/tasks/sessions/session-26-ci-path-filtering.md` - Session documentation

## Success Criteria

- [ ] Workflow file updated with paths-ignore configuration
- [ ] Documentation updated in CLAUDE.md and .claude/tasks/README.md
- [ ] Test PR created and verified (CI skips for doc-only changes)
- [ ] All commits follow conventional commits format
- [ ] Session documentation completed
- [ ] PR merged without breaking existing CI for code changes

## Edge Cases to Consider

1. **CLAUDE.md updates**: Will skip CI. Acceptable trade-off (guidelines don't affect code correctness).
2. **Mixed commits** (code + docs): CI will run (any non-excluded file triggers workflow).
3. **Branch protection**: If required status checks exist, skipped workflows may block merging. Solution: Make checks optional or use Strategy 3.
4. **Empty commits**: Can force CI with `git commit --allow-empty` if needed.

## Rollback Plan

If path filtering causes issues:
```bash
git revert <commit-hash>  # Revert workflow changes
git push origin main      # Restore original behavior
```

Simple rollback since changes are isolated to workflow trigger configuration.

## Future Enhancements (Post-Deployment)

When deployment is added, consider upgrading to Strategy 3:
- Use `dorny/paths-filter` action for granular job control
- Skip build/e2e for test-only changes
- Skip sonarqube for e2e-only changes
- Keep lint/typecheck/test running for all changes

**Migration path documented** in session notes for future reference.

## Questions for User (if any)

None - straightforward optimization with clear trade-offs.

## References

- GitHub Actions `paths-ignore` docs: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore
- Current CI workflow: `.github/workflows/ci.yml`
- Planning methodology: `CLAUDE.md` section "Planning Mode Methodology"
