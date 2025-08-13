# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Strategic Context

@./.serena/memories/content_creation_writing_interface_design.md
@./.serena/memories/search_discovery_system_design.md
@./.serena/memories/ux_architecture_navigation_design.md
@./.serena/memories/implementation_roadmap_content_creation.md
@./.serena/memories/api_query_patterns_established.md
@./.serena/memories/architectural_patterns.md
@./.serena/memories/tanstack-start-role-permission-pattern-v2.md

## Technical Documentation

@./docs/architecture/index.md
@./docs/api/index.md
@./docs/development/index.md
@./docs/architecture/database.md  
@./docs/development/component-patterns.md
@./docs/development/storybook-testing.md

## Essential Commands

**Development:**

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

**Code Quality (CRITICAL):**

- `pnpm lint` / `pnpm lint:fix` - ESLint with auto-fix
- `pnpm lint:md` / `pnpm lint:md:fix` - Markdown linting
- `pnpm format` / `pnpm format:check` - Prettier formatting
- `pnpm typecheck` - TypeScript type checking

**Database:**

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Seed database with sample data

## EXTREMELY IMPORTANT: IDE Quality Checks

**ALWAYS run the following commands before completing any task:**

- Run `mcp__ide__getDiagnostics` to check all files for diagnostics
- If IDE diagnostics unavailable, fallback to: `pnpm lint:fix`, `pnpm format`, `pnpm typecheck`
- Fix any linting or type errors before considering the task complete
- **Zero-tolerance policy:** All linting errors and warnings must be resolved

This is a CRITICAL step that must NEVER be skipped when working on any code-related task.

## Core Stack & Dependencies

**Framework:** TanStack Start v1.87+ (React 19 + TypeScript + Vite)
**Database:** PostgreSQL with Drizzle ORM, Arktype validation
**Authentication:** better-auth with multi-session, organization plugins
**UI:** shadcn/ui components + TailwindCSS v4
**Email:** Transactional emails via Resend
**Data Fetching:** `@tanstack/react-query` with router integration

## Project Structure

```sh
src/
├── components/
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
│   └── nanoid.ts      # ID generation utility
├── routes/            # File-based routes
│   ├── _app/          # Protected routes
│   ├── _public/       # Public routes
│   └── api/           # API endpoints
└── configs/           # Configuration files
```

**Module Structure Pattern:**

```sh
modules/{feature}/
├── api/              # Server functions (one per file)
├── hooks/            # React Query hooks
├── components/       # Feature-specific components
├── types/           # TypeScript types
└── utils/           # Feature utilities
```

## MANDATORY DEVELOPMENT PROCESSES

**KISS & DRY Principles:**

- **KISS**: Favor simple, readable solutions over complex ones
- **DRY**: Eliminate code duplication through abstraction
- **Check Before Creating**: Search existing codebase before implementing new functionality

**Code Quality Enforcement:**

- **NEVER** commit code with linting errors or warnings
- Fix all ESLint issues immediately - zero-tolerance policy
- Code quality checks run automatically after file modifications via hooks

**File Size Guidelines:**

- **250+ lines:** Consider splitting into logical modules
- **400+ lines:** Refactoring is strongly recommended

## Critical Import & Coding Standards

**Import Style (MANDATORY):**

- **Use `@/` alias for ALL src imports** - NO relative imports (`./` or `../`)
- Check for existing utilities first before creating new ones
- Import shadcn/ui components from `@/components/ui/<component>`

**Barrel Files (Index.ts Re-exports):**

**❌ AVOID in most cases** - Import directly from source files for better tree-shaking and explicit dependencies

**✅ ACCEPTABLE exceptions:**

- **Drizzle schema aggregation** (`src/lib/db/schemas/index.ts`) - Technical requirement for relational queries
- **Component library patterns** (`src/components/ui/*/index.ts`) - Standard shadcn/ui design pattern
- **Test utility aggregation** (`src/test/utils.tsx`) - Standard testing practice

**❌ DO NOT use for:**

- Feature modules (`src/modules/*/index.ts`) - Use direct imports
- Business logic utilities - Use direct imports
- Type-only re-exports - Use direct imports

```typescript
// ✅ GOOD: Direct imports and standard patterns
import { Button } from '@/components/ui/button'; // Uses index.ts (standard shadcn/ui pattern)
import { users, posts } from '@/lib/db/schemas/auth'; // Direct import from schema file

// ❌ BAD: Unnecessary barrel files
import { UserService } from '@/modules/users'; // Don't create this
import { utils } from '@/lib/utils'; // Don't create this

// ✅ ACCEPTABLE: Required for Drizzle
import * as schema from '@/lib/db/schemas'; // Needed for drizzle({ schema })
```

**TanStack Start v1.87+ (CRITICAL):**

```typescript
// CORRECT - TanStack Start v1.87+
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

// WRONG - Old/Invalid
import { getWebRequest } from 'vinxi/http'; // DON'T USE
```

**Component API Standards:**

- **Colors:** `primary`, `secondary`, `error`, `warning`, `info`, `success`
- **Variants:** `contained`, `outlined`, `text`, `link`
- **Use `error` NOT `destructive`** for error states across ALL components

**React Patterns:**

- React 19 function components with proper TypeScript props
- Use `@tanstack/react-query` for all data fetching
- Use `Icons` component: `<Icons.activity />` instead of direct lucide imports
- **Function declarations preferred:** Use `function name() {}` for standalone utilities

**Database Patterns:**

- **MANDATORY: Modern pgTable API** - Use array format `(table) => []` NOT object format
- Use `nanoid()` from `@/lib/nanoid` for all IDs
- Add indexes on ALL foreign key columns

## Workflow Requirements

**Component Creation (REQUIRED STEPS):**

1. Search existing components before creating new ones
2. Create comprehensive Storybook stories with `play` functions
3. Run quality checks: `pnpm typecheck`, `pnpm lint`, `pnpm format`
4. File size check: Refactor if >250 lines

**Server Functions:**

- Use `createServerFn()` from TanStack Start (NOT traditional API routes)
- One function per file: `src/modules/{feature}/api/{action}-{resource}.ts`

**Custom Hooks:**

- ALL custom hooks MUST use object parameters: `useUser({ id })`
- **TkDodo hierarchical query pattern** (see strategic context for examples)

## Documentation Update Pattern (CRITICAL)

**When updating instructions, use this decision framework:**

### ✅ Add to CLAUDE.md directly if:

- **Critical workflow requirements** (zero-tolerance linting, IDE quality checks)
- **Essential commands** (dev server, build, typecheck)
- **Mandatory patterns** (`@/` imports, TanStack Start v1.87+ patterns)
- **Core standards** (component APIs, file size limits)

### 📚 Add to `/docs/` with @ import if:

- **Detailed examples** (code patterns, templates)
- **Comprehensive guides** (testing, component usage)
- **Reference materials** (schemas, troubleshooting)

**The Test:** "Does Claude need this immediately when starting any task?"

- **Yes** → CLAUDE.md
- **No** → `/docs/` + @ import

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

---

**Remember:** This CLAUDE.md contains the essentials. Detailed examples and comprehensive guides are imported from `/docs/` for deeper context.
