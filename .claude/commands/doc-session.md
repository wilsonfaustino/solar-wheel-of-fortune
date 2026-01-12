# Document Session

Create comprehensive session documentation following project standards.

## Purpose

This command helps document completed sessions with consistent structure, ensuring all critical information is captured for team collaboration, future reference, and knowledge preservation.

## When to Use

Run this command at the **end of a session** after:
- Implementation is complete
- All tests pass
- Type check succeeds
- Build succeeds
- Code is committed

## What This Command Does

1. Gather session metadata (number, date, duration, branch, PR, test count)
2. Create session documentation file in `.claude/tasks/sessions/`
3. Document what was done (phases, changes, impact)
4. List all files modified with descriptions
5. Document all atomic commits with messages
6. Include verification results (tests, type check, build)
7. Capture key learnings and architectural decisions
8. Identify next steps and future opportunities
9. Update `.claude/tasks/README.md` with session entry
10. Follow established template from previous sessions

## Documentation Template Structure

Use this structure (based on [session-22-integration-tests.md](/.claude/tasks/sessions/session-22-integration-tests.md)):

### Required Sections

1. **Header Metadata**
   - Date (format: January 2, 2026)
   - Status (Completed/In Progress)
   - Branch name (e.g., `test/integration-tests-workflows`)
   - PR number (if merged)
   - Duration (~X hours)
   - Test Count (X tests, +Y new)

2. **Overview** (2-3 paragraphs)
   - What was accomplished
   - Why it matters
   - Key achievements

3. **What Was Done** (Detailed breakdown by phases)
   - Phase 1: [Name]
     - Goal: What was the objective
     - Files Created/Modified
     - Impact: What changed and why
   - Phase 2: [Name]
     - (Same structure)
   - Continue for all phases...

4. **Files Modified**
   - New Files (X) - with line counts and descriptions
   - Modified Files (X) - with +/- line changes
   - Deleted Files (X) - with reasons

5. **Commits** (List all atomic commits)
   - Commit message
   - Brief description of what was included
   - Commit hash (first 7 chars)

6. **Verification**
   - Test results (X tests passing)
   - Type check status
   - Lint status
   - Build status (with bundle size if applicable)
   - Coverage impact (if applicable)

7. **Key Learnings**
   - Patterns discovered
   - Architecture insights
   - Trade-offs made
   - Best practices identified

8. **Deviations from Plan** (if applicable)
   - Planned vs Actual scope
   - Why changes were made
   - Impact of deviations

9. **Next Steps**
   - Immediate opportunities
   - Long-term improvements
   - Related work

10. **Related Files**
    - Link to session plan
    - Link to session prompt
    - Link to CODE_REFERENCE.md sections
    - Link to previous session

11. **Notes** (Optional but recommended)
    - Session highlights
    - Design decisions
    - Additional context

12. **Success Criteria**
    - Functional requirements checklist
    - Quality requirements checklist
    - Documentation requirements checklist

## File Naming Convention

**Format**: `session-NN-feature-name.md`

Examples:
- `session-22-integration-tests.md`
- `session-23-ui-integration-tests.md`
- `session-14-radix-radiogroup.md`

**Rules**:
- Zero-padded session number (01, 02, ..., 22, 23)
- Kebab-case feature name (lowercase, hyphens)
- Descriptive but concise (2-4 words max)

## Process

### Step 1: Gather Information

Ask the user for:
- Session number
- Feature/focus name
- Duration estimate
- Branch name (check `git branch --show-current`)
- PR number (if merged)

### Step 2: Analyze Changes

Run these commands to gather data:
```bash
git log --oneline -n 10  # Get recent commits
bun test:run             # Get test count
git diff main --stat     # Get file changes
```

### Step 3: Create Documentation

1. Create session file at `.claude/tasks/sessions/session-NN-feature-name.md`
2. Use template structure above
3. Fill in all sections with accurate information
4. Link to related files (plan, prompt, CODE_REFERENCE)

### Step 4: Update README

Update `.claude/tasks/README.md`:
1. Add session entry to "Current Session Tasks" section
2. Update "Session Tracking" table
3. Update "Last updated" timestamp
4. Move previous session to "What Just Happened" section

## Example Usage

```
User: /doc-session
Assistant: I'll help document this session. Let me gather some information first.

[Runs git commands to check branch, commits, file changes]

What is the session number? (e.g., 23)
User: 23

What is the main focus of this session? (e.g., "ui-integration-tests")
User: ui-integration-tests

Approximately how long was this session in hours? (e.g., 2-3 hours)
User: 3 hours

Has this been merged to main? If yes, what is the PR number?
User: Not yet

[Assistant creates session documentation with all sections filled]
[Assistant updates README.md with session entry]

Session 23 documentation created successfully!

Files created:
- .claude/tasks/sessions/session-23-ui-integration-tests.md

Files updated:
- .claude/tasks/README.md

Next steps:
1. Review the session documentation for accuracy
2. Commit the documentation files
3. Create PR if ready
```

## Important Notes

- Always use the established template structure (see session-22 for reference)
- Include accurate commit messages and hashes
- Document deviations from the original plan (if applicable)
- Capture key learnings and architectural decisions
- Link to related files (plans, prompts, CODE_REFERENCE)
- Update README.md with session entry
- Follow conventional commits format when committing documentation

## Related Files

- **Template Reference**: [.claude/tasks/sessions/session-22-integration-tests.md](/.claude/tasks/sessions/session-22-integration-tests.md)
- **README Template**: [.claude/tasks/README.md](/.claude/tasks/README.md)
- **Planning Mode Methodology**: See CLAUDE.md → Planning Mode Methodology section

## Quality Checklist

Before finalizing documentation:
- [ ] All required sections filled with accurate information
- [ ] File naming follows convention (session-NN-feature-name.md)
- [ ] Commit messages and hashes are correct
- [ ] File changes list is complete and accurate
- [ ] Key learnings capture meaningful insights
- [ ] Links to related files work correctly
- [ ] README.md updated with session entry
- [ ] Verification results included (tests, type check, build)
- [ ] Success criteria documented
- [ ] Next steps identified
