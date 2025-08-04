# Agent Guidelines for Code Quality

## Automatic Code Quality Enforcement

**Code quality is automatically enforced via hooks after file modifications.**

### What Happens Automatically:

When you modify files, the following checks run automatically based on file type:

- **TypeScript files (.ts, .tsx)**: `pnpm typecheck`
- **JavaScript/TypeScript files (.ts, .tsx, .js, .jsx, .cjs, .mjs)**: `pnpm lint:fix`
- **All formattable files (.ts, .tsx, .js, .jsx, .cjs, .mjs, .json, .md, .mdx)**: `pnpm format`

### Zero-Tolerance Policy:

- **NEVER** consider code complete until all automatic checks pass
- **IMMEDIATELY** fix any issues reported by the automatic checks
- **ALWAYS** ensure zero linting errors or warnings before proceeding
- **CONSISTENTLY** maintain code quality standards

### When Automatic Checks Fail:

If the automatic hooks report errors:

1. Read the error output carefully
2. Fix the identified issues immediately
3. Save the file again to re-trigger the checks
4. Only proceed when all checks pass

### Why This Matters:

- Maintains consistent code quality across all contributors
- Prevents technical debt from accumulating
- Ensures TypeScript safety throughout the codebase
- Keeps CI/CD pipelines passing
- Follows project's zero-warning policy

## Documentation Strategy

### Temporary Files → .claude/ directory

- Agent collaboration summaries
- Implementation plans
- Temporary technical docs
- Delete after implementation is complete

### Permanent Knowledge → Serena memories

- Architecture patterns
- Code conventions
- Long-term project knowledge
- Reusable guidelines

---

_These guidelines apply to ALL specialized agents working on this codebase._
