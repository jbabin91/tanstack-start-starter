# AGENTS.md

## Essential Commands

**Development:**

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

**Code Quality:**

- `pnpm lint` / `pnpm lint:fix` - ESLint with auto-fix
- `pnpm format` / `pnpm format:check` - Prettier formatting
- `pnpm typecheck` - TypeScript type checking

**Database:**

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database (drops all tables)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Drizzle Studio

**Testing:**

- No explicit test runner configured in package.json

## Code Style Guidelines

**File Naming:**

- kebab-case for all files except TanStack Router $param routes

**Imports:**

- Use `@/` alias for all src imports
- Auto-sorted imports with simple-import-sort
- Prefer `type` imports for TypeScript types
- Import shadcn/ui components from `@/components/ui/<component>`
- No barrel files - import components directly

**TypeScript:**

- Prefer `type` over `interface` for object shapes
- Use `type` imports for TypeScript types
- Explicit return types for functions when beneficial

**React:**

- React 19 function components with proper TypeScript props
- Use `@tanstack/react-query` for all data fetching
- Leverage TanStack Router's type-safe navigation

**JSX:**

- Escape apostrophes in JSX with `'` instead of `'`

**Database:**

- All schemas in `src/lib/db/schemas/` with Arktype validation
- Use Drizzle's relational queries for complex data fetching

## Architecture

**Core Stack:**

- TanStack Start (React 19 + TypeScript + Vite)
- File-based routing with `@tanstack/react-router`
- PostgreSQL with Drizzle ORM
- better-auth with multi-session, organization, username plugins
- shadcn/ui components with TailwindCSS v4
- Transactional emails via Resend

**Key Patterns:**

- Modular structure in `src/modules/`
- Auto-generated route tree (`routeTree.gen.ts`)
- Auto-generated auth schema from better-auth config
- All entities use `nanoid()` for ID generation
- Environment management with `dotenvx`
