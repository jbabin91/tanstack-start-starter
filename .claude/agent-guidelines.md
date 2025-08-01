# Agent Guidelines for Code Quality

## Mandatory Code Quality Workflow

**ALL agents working on this codebase MUST follow this workflow:**

### After Writing/Modifying ANY Code:

1. **`pnpm lint:fix`** - Fix all linting errors automatically
2. **`pnpm format`** - Format code with Prettier
3. **`pnpm typecheck`** - Verify TypeScript types

### Zero-Tolerance Policy:

- **NEVER** consider code complete until all linting errors/warnings are resolved
- **ALWAYS** run the three commands above after any code changes
- **IMMEDIATELY** fix any ESLint issues that arise
- **CONSISTENTLY** format code to maintain project standards

### Implementation Pattern:

```bash
# After writing code changes
pnpm lint:fix && pnpm format && pnpm typecheck

# Only proceed if all commands succeed without errors
```

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
