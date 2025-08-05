---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git log:*)
description: Create a conventional commit with auto-generated or custom message
---

## Context

- Current git status: !`git status`
- Staged changes: !`git diff --cached --name-status`
- Staged diff: !`git diff --cached`
- Recent commits: !`git log --oneline -5`

## Your task

**IMPORTANT: Only commit if the user has explicitly told you to commit.**

**CRITICAL: Only commit staged changes. NEVER automatically stage unstaged files with `git add`. Respect the user's intentional staging decisions.**

**NOTE: All commits are automatically validated by commitlint. If validation fails, suggest using `pnpm commit` for interactive commit creation.**

### Pre-commit Checks

1. **Check for staged changes**: If no files are staged, inform the user and do not proceed
2. **Respect staging**: Only commit what the user has explicitly staged
3. **Never auto-stage**: Do not run `git add` commands to stage unstaged files

### If arguments provided: `$ARGUMENTS`

Use the provided message as the commit message. Validate it follows conventional commit format before proceeding.

**IMPORTANT: Check the `includeCoAuthoredBy` setting from .claude/settings.json:**

- If `"includeCoAuthoredBy": false`, use ONLY the provided message without any co-authored lines
- If `"includeCoAuthoredBy": true` or the setting is missing, append the standard co-authored footer

### If no arguments provided:

Analyze ONLY the staged changes and generate a conventional commit message.

**IMPORTANT: Check the `includeCoAuthoredBy` setting from .claude/settings.json:**

- If `"includeCoAuthoredBy": false`, do NOT include any co-authored lines in the commit message
- If `"includeCoAuthoredBy": true` or the setting is missing, include the standard co-authored footer

## Conventional Commit Standards

### Format

`<type>[optional scope]: <description>`

### Type Prefixes

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Dependencies, tooling, etc.
- `ci`: CI configuration changes
- `revert`: Revert a previous commit

### Writing Guidelines

- Start commit message on the first line without any leading blank lines
- Keep the first line under 72 characters (enforced by commitlint)
- Use imperative mood ("add" not "added" or "adds")
- Don't end the subject line with a period
- Use lowercase for subject (no sentence-case, start-case, pascal-case, or upper-case)
- For complex changes, include a body with detailed explanation after the subject line, separated by a blank line

### Breaking Changes

- Use exclamation mark before the colon: `feat!: remove deprecated API endpoints`
- Or include `BREAKING CHANGE:` in the commit body

### Scope Guidelines

- Use lowercase for scope names (enforced by commitlint)
- Common project scopes: `auth`, `db`, `ui`, `api`, `hooks`, `commands`, `lint`, `deps`, `docs`, `types`, `config`, `build`, `test`
- Extract scope from file paths (src/modules/auth → auth, src/lib/db → db)
- Custom scopes are allowed but should be meaningful and consistent

### Examples

- ✅ `feat(auth): implement passwordless login flow`
- ✅ `fix: resolve data fetching race condition`
- ✅ `feat!: remove deprecated API endpoints`
- ❌ `feat(auth): add OAuth integration.` (period at end)
- ❌ `feat(auth): added OAuth integration` (wrong mood)

## Usage

- `/commit` - Auto-generate message from staged changes
- `/commit feat(auth): add OAuth integration` - Use custom message
