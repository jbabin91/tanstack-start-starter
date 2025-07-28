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

**File Naming:** kebab-case for all files except TanStack Router $param routes

**Import Style:**

- Use `@/` alias for all src imports
- Auto-sorted imports with simple-import-sort
- Prefer `type` imports for TypeScript types
- Import shadcn/ui components from `@/components/ui/<component>`
- **No Barrel Files:** Import components directly, avoid `index.ts` re-exports

**React Patterns:**

- React 19 function components with proper TypeScript props
- Use `@tanstack/react-query` for all data fetching
- Leverage TanStack Router's type-safe navigation

**Database Patterns:**

- All schemas in `src/lib/db/schemas/` with Arktype validation
- Use Drizzle's relational queries for complex data fetching
- Seed realistic data using `@faker-js/faker` (see `src/lib/db/seed.ts`)

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
