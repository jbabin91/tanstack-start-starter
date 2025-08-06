# Task Completion Requirements

## MUST RUN After Code Changes

1. `pnpm lint` - ESLint with max warnings: 0 (ZERO tolerance)
2. `pnpm typecheck` - TypeScript type checking
3. `pnpm format` - Prettier formatting with Tailwind class sorting

## Code Quality Checks

- All imports must use `@/` alias
- No unused variables or imports
- Proper type safety throughout
- JSX props sorted alphabetically
- Apostrophes escaped in JSX content

## Database Changes

- Run `pnpm db:generate` after schema changes
- Run `pnpm db:migrate` to apply migrations
- Update seed data if schema changes affect it

## Authentication Changes

- Run `pnpm auth:generate` after better-auth config changes
- Regenerates `src/lib/db/schemas/auth.ts` automatically

## Testing Approach

- No explicit test framework configured
- Manual testing through development server
- Use database seeding for test data

## File Generation Rules

- NEVER edit `routeTree.gen.ts` directly (auto-generated)
- NEVER edit `src/lib/db/schemas/auth.ts` directly (generated from better-auth)
- These files are regenerated automatically
