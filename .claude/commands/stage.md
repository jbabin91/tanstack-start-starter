---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git reset:*)
description: Stage files for git commit
---

## Context

- Current git status: !`git status`
- Unstaged changes: !`git diff --name-status`

## Your task

Stage files for git commit based on the provided arguments.

### If arguments provided: `$ARGUMENTS`

- If `$ARGUMENTS` is `.` or `--all` or `-A`: Stage all changes
- If `$ARGUMENTS` contains file paths: Stage only those specific files
- If `$ARGUMENTS` is `--patch` or `-p`: Use interactive patch mode

### If no arguments provided:

Analyze the unstaged changes and intelligently stage relevant files, excluding:

- Temporary files (_.tmp, _.log, etc.)
- Build artifacts (dist/, node_modules/, etc.)
- IDE files (.vscode/, .idea/, etc.)
- System files (.DS_Store, Thumbs.db, etc.)

## Usage Examples

- `/stage` - Auto-stage relevant unstaged files
- `/stage .` - Stage all changes
- `/stage src/components/Button.tsx` - Stage specific file
- `/stage src/modules/auth/` - Stage all files in directory
- `/stage --patch` - Interactive patch staging

## Safety

- Show what will be staged before executing
- Never stage files that are likely to be mistakes (secrets, large binaries, etc.)
- Confirm staging of sensitive files (.env, config files with secrets)
