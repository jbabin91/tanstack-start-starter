---
allowed-tools: Bash(git status:*), Bash(git pull:*), Bash(git push:*), Bash(git fetch:*), Bash(git log:*)
description: Sync repository with remote (pull and push changes)
---

## Context

- Current git status: !`git status`
- Current branch: !`git branch --show-current`
- Remote status: !`git fetch --dry-run`
- Commits ahead/behind: !`git log --oneline @{u}..HEAD`

## Your task

Sync the repository with the remote origin based on the provided arguments.

### If arguments provided: `$ARGUMENTS`

- If `$ARGUMENTS` is `pull` or `down`: Only pull changes from remote
- If `$ARGUMENTS` is `push` or `up`: Only push local changes to remote
- If `$ARGUMENTS` is `--force` or `-f`: Force push (use with caution)

### If no arguments provided:

Perform a full sync:

1. **Pull first**: `git pull origin <current-branch>` to get latest remote changes
2. **Push after**: `git push origin <current-branch>` to send local commits

## Safety Checks

- Check for uncommitted changes before pulling
- Warn if force push is attempted
- Verify remote branch exists
- Handle merge conflicts gracefully
- Show summary of changes pulled/pushed

## Usage Examples

- `/sync` - Full sync (pull then push)
- `/sync pull` - Only pull from remote
- `/sync push` - Only push to remote
- `/sync --force` - Force push (use carefully)

## Error Handling

- If pull fails due to conflicts, provide guidance on resolution
- If push fails due to remote changes, suggest pulling first
- If no remote is configured, provide setup instructions
