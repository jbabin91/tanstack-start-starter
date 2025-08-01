# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

**Code Quality:**

- `pnpm lint` / `pnpm lint:fix` - ESLint with auto-fix
- `pnpm format` / `pnpm format:check` - Prettier formatting
- `pnpm typecheck` - TypeScript type checking

**MANDATORY: Code Quality Workflow**
When writing or modifying code, you MUST run these commands:

1. `pnpm lint:fix` - Fix linting errors automatically
2. `pnpm format` - Format code with Prettier
3. `pnpm typecheck` - Verify TypeScript types

**Zero-tolerance policy:** All linting errors and warnings must be resolved before code is considered complete.

**Database:**

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database (drops all tables)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Drizzle Studio

**Authentication:**

- `pnpm auth:generate` - Generate Drizzle schema from better-auth config (run after auth config changes)

## Architecture Overview

**Core Stack:**

- **Framework:** TanStack Start (React 19 + TypeScript + Vite)
- **Routing:** File-based routing with `@tanstack/react-router` (routes in `src/routes/`)
- **Data Fetching:** `@tanstack/react-query` with router integration
- **Database:** PostgreSQL with Drizzle ORM, Arktype validation
- **Authentication:** better-auth with multi-session, organization, username plugins
- **UI:** shadcn/ui components (local copies in `src/components/ui/`)
- **Styling:** TailwindCSS v4
- **Email:** Transactional emails via Resend

**Key Architectural Patterns:**

1. **Modular Structure:** Features organized in modules (`src/modules/`) with api/components/hooks/types/utils subdirectories

2. **Route Tree Generation:** Routes are automatically generated into `routeTree.gen.ts` - never edit this file directly

3. **Database Schema Generation:** Auth schema (`src/lib/db/schemas/auth.ts`) is auto-generated from better-auth config - regenerate after auth changes

4. **ID Generation:** All entities use `nanoid()` from `@/lib/nanoid` with custom alphabet

5. **Environment Management:** Uses `dotenvx` with `.env` files, configuration in `src/configs/env.ts`

## Development Patterns

**Code Quality Enforcement:**

- **ALWAYS** run `pnpm lint:fix && pnpm format && pnpm typecheck` after writing/modifying code
- **NEVER** commit code with linting errors or warnings
- Fix all ESLint issues immediately - zero-tolerance policy
- Run formatter to ensure consistent code style

**File Size Guidelines:**

- **250+ lines:** Consider splitting into logical modules
- **400+ lines:** Refactoring is strongly recommended
- **Structure pattern:** `feature/index.ts` (main) + `feature/utils.ts` (helpers) + `feature/types.ts` (types)
- **Split criteria:** Logical cohesion, reusability, testability over raw line count

**File Naming:** kebab-case for all files except TanStack Router $param routes

**Import Style:**

- **MANDATORY: Use `@/` alias for all src imports** - NO relative imports (`./` or `../`)
- Auto-sorted imports with simple-import-sort
- Prefer `type` imports for TypeScript types
- Import shadcn/ui components from `@/components/ui/<component>`
- **No Barrel Files:** Import components directly, avoid `index.ts` re-exports

**React Patterns:**

- React 19 function components with proper TypeScript props
- Use `@tanstack/react-query` for all data fetching
- Leverage TanStack Router's type-safe navigation
- Use `Icons` component for all icons: `<Icons.activity />` instead of direct lucide imports
- **Lucide icons:** Always import with `*Icon` suffix (e.g., `ActivityIcon`, not `Activity`) to avoid naming conflicts
- **Function declarations preferred:** Use `function name() {}` instead of `const name = () => {}` for standalone utility functions
- **Arrow functions acceptable for:** Event handlers within components, object properties/methods, hook callbacks, and inline functions
- **Define functions outside components:** Move utility functions outside component scope when they don't depend on props/state to prevent re-creation on renders

**TypeScript Patterns:**

- **Prefer `type` over `interface`** - Use `type` for object shapes, only use `interface` when extending/merging is required
- Use `type` imports for TypeScript types (`import type { User } from './types'`)
- Prefer explicit return types for functions when beneficial for clarity

**JSX/React Content:**

- **Escape Apostrophes in JSX** - Use `&apos;` instead of `'` in JSX content to avoid ESLint errors
- Alternative escapes: `&lsquo;` (left single quote), `&#39;` (numeric), `&rsquo;` (right single quote)
- Example: `<Text>Don&apos;t forget to verify your email</Text>`

**Database Patterns:**

- All schemas in `src/lib/db/schemas/` with Arktype validation
- Use Drizzle's relational queries for complex data fetching
- Seed realistic data using `@faker-js/faker`
- **Schema Organization:**
  - `index.ts` - Main schema exports and relations
  - Individual schema files for each entity (e.g., `users.ts`, `posts.ts`)
  - `auth.ts` - Auto-generated from better-auth config
- **Seed Data:** Modularized in `src/lib/db/seed/` with separate files per entity

**API Patterns:**

- **Server Functions:** Use `createServerFn()` from TanStack Start (NOT traditional API routes)
- **One Function Per File:** Each server function in its own file: `src/modules/{feature}/api/{action}-{resource}.ts`
- **File Naming Examples:** `get-users.ts`, `get-user.ts`, `create-post.ts`, `revoke-session.ts`
- **Query Integration:** Export `{feature}Queries` from `src/modules/{feature}/hooks/use-queries.ts`
- **Query Pattern:** Simple `{feature}Queries.method()` returning `queryOptions` objects
- **Exception:** Only `/api/auth/$` route exists for better-auth OAuth callbacks

**TanStack Query Patterns:**

- **Query Structure:** Simple `queryOptions` pattern (NOT TkDodo's hierarchical approach)
- **File Organization:** `use-queries.ts` for queries, `use-mutations.ts` for mutations (when needed)
- **Query Keys:** Use `as const` for proper TypeScript inference
- **Direct Access:** Access keys via `{feature}Queries.method().queryKey` for cache invalidation
- **Example Pattern:**

  ```typescript
  export const userQueries = {
    all: () =>
      queryOptions({
        queryKey: ['users'] as const,
        queryFn: () => fetchUsers(),
      }),
    byId: (id: string) =>
      queryOptions({
        queryKey: ['users', id] as const,
        queryFn: () => fetchUser({ data: id }),
      }),
  };
  ```

**Authentication Flow:**

- Config in `src/lib/auth/server.ts` with email verification enabled
- Client-side auth utilities in `src/lib/auth/client.ts`
- Email templates handled via Resend integration

## Project Structure

```sh
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components (local copies)
│   ├── layouts/       # Layout components
│   └── errors/        # Error boundary components
├── modules/           # Feature modules
│   ├── email/         # Email functionality
│   ├── posts/         # Post management
│   ├── sessions/      # Session management
│   └── users/         # User management
├── lib/               # Core utilities
│   ├── auth/          # Authentication config
│   ├── db/            # Database connection, schemas, migrations
│   ├── logger.ts      # Pino structured logging
│   └── nanoid.ts      # ID generation utility
├── routes/            # File-based routes
│   ├── _app/          # Protected routes
│   ├── _public/       # Public routes
│   └── api/           # API endpoints
└── configs/           # Configuration files
```

**Module Structure Pattern:**

Each feature module follows this structure:

```sh
modules/{feature}/
├── api/              # Server functions (one per file)
│   ├── get-{resource}.ts
│   ├── create-{resource}.ts
│   └── update-{resource}.ts
├── hooks/            # React Query hooks
│   ├── use-queries.ts
│   └── use-mutations.ts (if needed)
├── components/       # Feature-specific components
├── types/           # TypeScript types
└── utils/           # Feature utilities
```

## Important Configuration Notes

**ESLint:** Configured with React, TypeScript, import sorting, and accessibility rules. Max warnings: 0.

**Prettier:** Configured with Tailwind plugin for class sorting and packagejson plugin.

**Database:** Uses snake_case naming convention in PostgreSQL, configured in `drizzle.config.ts`.

**Authentication:** Multi-session enabled with organization and username plugins. Email verification required for new accounts.

**UI Components:** Always reference latest shadcn/ui documentation when adding new components - local copies may need updates.

## Commit Message Format

Follow conventional commits:

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `chore(scope): description` - Dependencies, tooling
- `docs(scope): description` - Documentation
- `refactor(scope): description` - Code changes without feature/bug changes

Use imperative mood, keep first line under 72 characters, no trailing period.

## Glossary

**Barrel File:** A file that only re-exports code from other files without any implementation. Example:

```typescript
// This is a barrel file - AVOID THESE
export { UserList } from './UserList';
export { UserProfile } from './UserProfile';
export type { User } from './types';
```

Instead, import directly from the source files.
