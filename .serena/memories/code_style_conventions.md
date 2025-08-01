# Code Style and Conventions

## File Naming

- **kebab-case** for all files except TanStack Router $param routes
- Route parameters use `$paramName.tsx` format

## TypeScript Patterns

- **Prefer `type` over `interface`** - Use `type` for object shapes, only use `interface` when extending/merging required
- Use `type` imports: `import type { User } from './types'`
- Explicit return types for functions when beneficial for clarity
- ESLint enforces consistent type definitions and imports

## Import Organization

- Use `@/` alias for all src imports (never relative paths like `../`)
- Auto-sorted imports with simple-import-sort plugin
- Prefer `type` imports for TypeScript types
- **No Barrel Files** - Import components directly, avoid `index.ts` re-exports
- Import shadcn/ui components from `@/components/ui/<component>`

## JSX/React Content

- **Escape Apostrophes** - Use `&apos;` instead of `'` in JSX content to avoid ESLint errors
- Alternative escapes: `&lsquo;`, `&#39;`, `&rsquo;`
- Example: `<Text>Don&apos;t forget to verify</Text>`

## React Patterns

- React 19 function components with proper TypeScript props
- Use `@tanstack/react-query` for all data fetching
- Leverage TanStack Router's type-safe navigation
- JSX props are sorted alphabetically by ESLint

## Database Patterns

- All schemas in `src/lib/db/schemas/` with Arktype validation
- Use Drizzle's relational queries for complex data fetching
- snake_case naming convention in PostgreSQL
- All entities use `nanoid()` with custom alphabet for IDs
