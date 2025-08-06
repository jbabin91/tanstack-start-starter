---
allowed-tools: Bash(pnpm format:*), Bash(pnpm lint:*), Bash(pnpm typecheck:*), Bash(pnpm lint:md:*), Bash(echo $?)
description: Run comprehensive code quality checks and auto-fix all issues
---

## Context

This command runs the complete code quality pipeline in the correct order:

1. **Format code** - Prettier auto-formatting
2. **Lint & fix** - ESLint with automatic fixes
3. **Markdown lint & fix** - Markdown linting with auto-fix
4. **Type checking** - TypeScript validation

Current project quality commands:

- `pnpm format` - Format with Prettier
- `pnpm lint:fix` - ESLint with auto-fix
- `pnpm lint:md:fix` - Markdown linting with auto-fix
- `pnpm typecheck` - TypeScript type checking

## Your task

Run the complete quality check pipeline in this specific order:

### Step 1: Auto-format code

```bash
pnpm format
```

This runs Prettier on the entire codebase to ensure consistent formatting.

### Step 2: Auto-fix linting issues

```bash
pnpm lint:fix
```

This runs ESLint with automatic fixes for any issues that can be auto-resolved.

### Step 3: Auto-fix markdown issues

```bash
pnpm lint:md:fix
```

This runs markdownlint-cli2 with automatic fixes for markdown files.

### Step 4: Type checking

```bash
pnpm typecheck
```

This runs TypeScript type checking to catch any type errors.

**Important Notes:**

- If any step fails, report the specific error and stop the pipeline
- The project has a zero-tolerance policy for linting errors
- Type errors must be resolved before code is considered complete
- All these checks run automatically on file changes via hooks

## Expected Output

After successful completion, report:

- ✅ Formatting: Applied Prettier formatting
- ✅ Linting: Fixed [X] auto-fixable issues
- ✅ Markdown: Fixed [X] markdown issues
- ✅ TypeScript: No type errors found

If any step fails:

- ❌ Report which step failed and the specific error
- 💡 Provide guidance on how to fix the issue manually

## Usage

- `/quality` - Run complete quality pipeline with auto-fixes
- Use this command before committing to ensure all quality standards are met
- Equivalent to the quality checks that run automatically via git hooks
