# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Structure

This project uses a **tiered documentation system** designed for both AI agents and human developers:

### 📋 Strategic Planning (`.serena/memories/`)

High-level architectural decisions, system designs, and project planning:

- **[Content Creation System Design](./.serena/memories/content_creation_writing_interface_design.md)** - GitHub-style editor and publishing workflows
- **[Search & Discovery System](./.serena/memories/search_discovery_system_design.md)** - PostgreSQL full-text search and content discovery
- **[Navigation Architecture](./.serena/memories/ux_architecture_navigation_design.md)** - Organization-aware navigation patterns
- **[Implementation Roadmaps](./.serena/memories/implementation_roadmap_content_creation.md)** - Phase-by-phase development planning

### 📚 Technical Documentation (`/docs/`)

Implementation details, API references, and developer guides:

- **[Documentation Index](./docs/index.md)** - Complete documentation navigation
- **[Architecture Overview](./docs/architecture/index.md)** - System architecture and technical design
- **[Database Design](./docs/architecture/database.md)** - PostgreSQL schema and optimization
- **[Development Guide](./docs/development/index.md)** - Coding patterns and best practices
- **[API Reference](./docs/api/index.md)** - Server function documentation

**When to use which:**

- Reference `.serena/memories/` for architectural context and design rationale
- Reference `/docs/` for implementation details and coding standards
- Both tiers cross-reference each other for complete context

## Essential Commands

**Development:**

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

**Code Quality:**

- `pnpm lint` / `pnpm lint:fix` - ESLint with auto-fix
- `pnpm lint:md` / `pnpm lint:md:fix` - Markdown linting with markdownlint-cli2
- `pnpm format` / `pnpm format:check` - Prettier formatting
- `pnpm typecheck` - TypeScript type checking

## EXTREMELY IMPORTANT: IDE Quality Checks

**ALWAYS run the following commands before completing any task:**

Automatically use the IDE's built-in diagnostics tool to check for linting and type errors:

- Run `mcp__ide__getDiagnostics` to check all files for diagnostics
- If IDE diagnostics unavailable, fallback to: `pnpm lint:fix`, `pnpm format`, `pnpm typecheck`, `pnpm lint:md`
- Fix any linting or type errors before considering the task complete
- Do this for any file you create or modify

This is a CRITICAL step that must NEVER be skipped when working on any code-related task.

**Note:** The `post_tool_use.py` hook automatically runs these checks after file modifications.

**Commit Quality:**

- `pnpm commit` - Interactive commit creation with cz-git (enforces conventional commits)
- `pnpm commit:lint` - Validate commit messages against conventional commit standards
- **Automatic validation:** All commits are validated by commitlint via git hooks

**Code Quality Standards**
Code quality is automatically enforced via hooks after file modifications. The following commands run automatically:

- `pnpm format` - Format code with Prettier
- `pnpm lint` - Check for linting errors
- `pnpm typecheck` - Verify TypeScript types

**Zero-tolerance policy:** All linting errors and warnings must be resolved before code is considered complete. If automatic checks fail, fix issues immediately.

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

- **Framework:** TanStack Start v1.87+ (React 19 + TypeScript + Vite) - NO vinxi imports
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

## MANDATORY DEVELOPMENT PROCESSES

**KISS & DRY Principles:**

- **KISS (Keep It Simple, Stupid)**: Favor simple, readable solutions over complex ones
  - Use declarative configurations over imperative logic when possible
  - Extract complex logic into well-named helper functions
  - Prefer composition over inheritance
  - Choose clarity over cleverness

- **DRY (Don't Repeat Yourself)**: Eliminate code duplication through abstraction
  - Extract common patterns into reusable utilities
  - Use shared types and constants as single source of truth
  - Create helper functions for repeated database queries or API calls
  - Leverage existing utilities before creating new ones

- **Check Before Creating**: Before implementing new functionality:
  - Search existing codebase for similar patterns or utilities
  - Check if shadcn/ui has the component you need
  - Look for existing helper functions in `/src/lib/` or `/src/utils/`
  - Review similar features for established patterns
  - Use `@/` imports to leverage existing abstractions

**Code Quality Enforcement:**

- Code quality checks run automatically after file modifications via hooks
- **NEVER** commit code with linting errors or warnings
- Fix all ESLint issues immediately - zero-tolerance policy
- If automatic checks report errors, resolve them before proceeding

**File Size Guidelines:**

- **250+ lines:** Consider splitting into logical modules
- **400+ lines:** Refactoring is strongly recommended
- **Structure pattern:** `feature/index.ts` (main) + `feature/utils.ts` (helpers) + `feature/types.ts` (types)
- **Split criteria:** Logical cohesion, reusability, testability over raw line count

**File Naming:** kebab-case for all files except TanStack Router $param routes

**Import Style:**

- **Check for existing utilities first**: Always search codebase for similar functions before creating new ones
- Use `rg "function.*pattern"` or `grep -r "pattern" src/` to find existing implementations
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

**Modern Drizzle Schema Patterns:**

- **MANDATORY: Modern pgTable API** - Use array format `(table) => []` NOT deprecated object format `(table) => ({})`
- **Performance Indexes:** Add indexes on ALL foreign key columns and frequently queried fields
- **Foreign Key Patterns:** Always specify cascade behavior: `onDelete: 'cascade'` or `onDelete: 'set null'`
- **Timestamp Standards:** Use `timestamp({ withTimezone: true })` with `.defaultNow()` and `.$onUpdate(() => new Date())`
- **ID Generation:** Consistent `$defaultFn(() => nanoid())` pattern for all primary keys

**Component API Standards:**

- **Button API** - Colors: `primary`, `secondary`, `error`, `warning`, `info`, `success`. Variants: `contained`, `outlined`, `text`, `link`
- **Semantic Consistency:** ALL components use `error` instead of `destructive` (Badge, Alert, Context Menu, Form inputs, etc.)
- **CSS Variables:** `--error` and `--error-foreground` as primary, with `--destructive-*` aliases for backward compatibility
- **TypeScript Types:** All variant types use `'error'` not `'destructive'` for error states
- **Component Examples:** `<Button color="error" variant="contained">Delete</Button>`, `<Badge variant="error">Error</Badge>`

**Database Schema Example:**

```typescript
export const posts = pgTable(
  'posts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar({ length: 255 }).notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for common queries
    index('posts_user_id_idx').on(table.userId),
    index('posts_created_at_idx').on(table.createdAt),
    index('posts_user_created_at_idx').on(table.userId, table.createdAt),
  ],
);
```

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
- **Hook Extraction:** Extract repeated `useQuery`/`useMutation` calls into reusable hooks

**Query Invalidation Pattern:**

```typescript
// GOOD: Use existing queryKey from queryOptions
queryClient.invalidateQueries({
  queryKey: userQueries.byId(userId).queryKey,
});

// BAD: Duplicate query key arrays
queryClient.invalidateQueries({ queryKey: ['users', userId] });
```

**Custom Hook Patterns:**

```typescript
// src/modules/users/hooks/use-queries.ts
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

// Reusable hooks with object parameters (STANDARD PATTERN)
export function useUsers() {
  return useSuspenseQuery(userQueries.all());
}

export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.byId(id));
}

export function useSessionActivity({
  sessionId,
  enabled = true,
}: {
  sessionId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...sessionQueries.activity(sessionId ?? ''),
    enabled: enabled && !!sessionId,
  });
}
```

**Mutation Hook Patterns:**

```typescript
// src/modules/users/hooks/use-mutations.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      // Targeted invalidation using existing queryOptions
      queryClient.invalidateQueries({
        queryKey: userQueries.byId(data.id).queryKey,
      });
    },
  });
}
```

**Hook Extraction Guidelines:**

- **Extract when:** Multiple components use the same `useQuery(featureQueries.method())` pattern
- **Extract when:** Complex mutation logic with optimistic updates is repeated
- **Extract when:** Query configurations (enabled, refetchInterval) are duplicated
- **Keep inline when:** Query is used only once in a single component
- **Pattern:** Create hooks that encapsulate both query logic and common configurations

**Object Parameter Standards:**

- **MANDATORY:** All custom hooks MUST use object parameters for consistency
- **Simple hooks:** Even single parameters use objects: `useUser({ id })`
- **Complex hooks:** Multiple parameters with defaults: `useSessionActivity({ sessionId, enabled = true })`
- **Type definitions:** Always provide explicit TypeScript types for parameter objects
- **Default values:** Set defaults in parameter destructuring when appropriate

**Authentication Flow:**

- Config in `src/lib/auth/server.ts` with email verification enabled
- Client-side auth utilities in `src/lib/auth/client.ts`
- Email templates handled via Resend integration

## MANDATORY WORKFLOW PROCESSES

**CRITICAL: These are immutable system rules, not suggestions. Follow these processes sequentially.**

### Component Creation Workflow (REQUIRED STEPS)

When creating any UI component, execute these steps in order:

1. **Pre-Creation Check (MANDATORY)**
   - Search existing components: `rg "export.*Component" src/components/`
   - Check shadcn/ui availability: Review `src/components/ui/` directory
   - Verify component doesn't exist in similar form

2. **Component Implementation (SYSTEM BOUNDARIES)**
   - Use function declarations: `function ComponentName() {}` NOT `const ComponentName = () => {}`
   - Import Icons component: `import { Icons } from '@/components/icons'` NOT lucide-react directly
   - Use proper API: `color="error"` NOT `variant="destructive"`
   - Apply `cn()` utility: `import { cn } from '@/utils/cn'` NOT `@/lib/utils`

3. **Story Creation (MANDATORY)**
   - Create story file: `[component]/[component].stories.tsx`
   - Use hierarchical title: `'UI/[Category]/[ComponentName]'`
   - Include comprehensive `argTypes` with descriptions
   - Add interactive `play` functions for testing
   - Document real-world usage scenarios

4. **Quality Enforcement (REQUIRED)**
   - Run `pnpm typecheck` - must pass with zero errors
   - Run `pnpm lint` - must pass with zero warnings
   - Run `pnpm format` - must apply automatically
   - File size check: If >250 lines, refactor into modules

### Story Creation Process (IMMUTABLE RULES)

For every interactive component, stories are MANDATORY:

1. **Structure Requirements (NON-NEGOTIABLE)**

   ```typescript
   // REQUIRED: Hierarchical categorization
   title: 'UI/[Inputs|Surfaces|Data Display|Feedback|Navigation|Layout]/ComponentName'

   // REQUIRED: Comprehensive argTypes with descriptions
   argTypes: {
     propName: {
       description: 'Detailed explanation of prop behavior',
       control: 'select',
       options: [...],
     },
   }
   ```

2. **Content Requirements (SYSTEM BOUNDARIES)**
   - Default story showing primary usage
   - All variant combinations (colors, sizes, states)
   - Interactive examples with `play` functions
   - Real-world integration scenarios
   - Error and edge case handling

3. **Testing Integration (MANDATORY)**
   - Every interactive element needs `play` functions
   - Use proper selectors: `canvas.getByRole()` or `canvas.getByTestId()`
   - Assert user interactions: `expect(args.onClick).toHaveBeenCalled()`

### Code Review Process (REQUIRED EXECUTION)

After completing any development task, execute this checklist:

1. **API Compliance Check**
   - ✅ Components use our color system: `primary`, `secondary`, `error`, `warning`, `info`, `success`
   - ✅ No default shadcn patterns: NO `destructive`, `outline`, `ghost`
   - ✅ Proper variants: `contained`, `outlined`, `text`, `link`

2. **Quality Gates (ZERO TOLERANCE)**
   - ✅ TypeScript: Zero errors (`pnpm typecheck`)
   - ✅ ESLint: Zero warnings (`pnpm lint`)
   - ✅ Formatting: Applied (`pnpm format`)
   - ✅ File size: <250 lines or properly refactored

3. **Testing Requirements (MANDATORY)**
   - ✅ Interactive components have stories
   - ✅ Stories include `play` functions
   - ✅ All major variants covered
   - ✅ Error states documented

### Storybook Testing Requirements (REQUIRED)

**CRITICAL: These are non-negotiable testing standards for all Storybook stories.**

1. **Portal Component Tests (MANDATORY)**
   - **Select, Dialog, Tooltip components MUST use `within(document.body)`**
   - Portal components render outside the canvas DOM scope
   - Standard `canvas.getByRole()` will fail - use `within(document.body).getByRole()`
   - Example: `const selectTrigger = within(document.body).getByRole('combobox');`

2. **Animation Timing (REQUIRED)**
   - **MUST use `waitFor()` + `setTimeout(300)` for animated components**
   - Animations need time to complete before assertions
   - Pattern: `await waitFor(() => new Promise(resolve => setTimeout(resolve, 300)));`
   - Apply to: Tooltips, Dialogs, Select dropdowns, any CSS transitions

3. **ARIA Compliance (MANDATORY)**
   - **ALL form fields MUST have FormDescription** - Cannot be empty or omitted
   - **Select components MUST have aria-label** - Required for screen reader accessibility
   - Form fields without descriptions fail WCAG AA compliance
   - Example: `<FormDescription>Choose your preferred option</FormDescription>`

4. **Unique IDs (REQUIRED)**
   - **Error message IDs MUST be unique across all stories**
   - Use component-specific prefixes: `email-error`, `password-error`, `select-error`
   - Duplicate IDs cause DOM validation failures in Storybook
   - Pattern: `<FormMessage id="component-field-error">`

5. **Required Imports (SYSTEM BOUNDARY)**
   - **MUST import from '@storybook/test':** `{ expect, userEvent, waitFor, within }`
   - DO NOT import from '@testing-library/react' or other testing libraries
   - Storybook provides optimized versions for story testing
   - Example: `import { expect, userEvent, waitFor, within } from '@storybook/test';`

**Complete Testing Pattern:**

```typescript
import { expect, userEvent, waitFor, within } from '@storybook/test';

export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // For standard components
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    // For portal components (Select, Dialog, Tooltip)
    const portalElement = within(document.body).getByRole('combobox');
    await userEvent.click(portalElement);

    // For animated components
    await waitFor(() => new Promise((resolve) => setTimeout(resolve, 300)));

    // Assertions
    expect(args.onClick).toHaveBeenCalled();
  },
};
```

**Reference Documentation:**

- Complete patterns and examples: `docs/development/storybook-testing.md`
- Portal component testing strategies
- Animation timing best practices
- ARIA compliance requirements

### Agent Behavior Boundaries (IMMUTABLE RULES)

**File Exploration vs Creation:**

- NEVER read files randomly or speculatively
- ALWAYS use targeted searches: `rg "pattern"` or specific file paths
- BEFORE creating any component, MUST search: `rg "export.*ComponentName" src/`
- READ documentation first: Check `docs/` and `.serena/memories/` for context

**Error Recovery Process (REQUIRED STEPS):**

1. **TypeScript Errors:** Fix immediately, never ignore
2. **ESLint Warnings:** Resolve before proceeding with any other task
3. **Build Failures:** Debug systematically, don't guess at solutions
4. **Test Failures:** Investigate root cause, don't skip tests

**Context Pollution Prevention:**

- Follow file size limits strictly (250+ lines = refactor required)
- Use modular imports, avoid reading large files unnecessarily
- Reference established patterns instead of inventing new ones
- Front-load context from CLAUDE.md rather than exploring randomly

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
│   ├── use-queries.ts    # queryOptions + custom query hooks
│   └── use-mutations.ts  # custom mutation hooks (when needed)
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

## TanStack Start v1.87+ Patterns (CRITICAL)

**IMPORTANT: TanStack Start no longer uses vinxi - it uses Vite directly**

### ✅ Correct Imports:

```typescript
// CORRECT - TanStack Start v1.87+
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

// WRONG - Old/Invalid
import { getWebRequest } from 'vinxi/http'; // DON'T USE
import { createServerFn } from '@tanstack/start'; // WRONG MODULE
```

### Authentication & Permissions Pattern

**Use Route Context for Permissions:**

```typescript
// src/routes/__root.tsx - Fetch user with permissions ONCE
export const Route = createRootRouteWithContext<{
  user: (User & { permissions?: string[] }) | null;
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(
      authQueries.currentUserWithPermissions(),
    );
    return { user };
  },
});

// Protected routes use beforeLoad
export const Route = createFileRoute('/_app/admin')({
  beforeLoad: ({ context }) => {
    if (!context.user?.permissions?.includes('admin:access')) {
      throw redirect({ to: '/dashboard' });
    }
  },
});
```

**DON'T create separate permission hooks - use route context:**

```typescript
// WRONG - Don't create these
const useHasPermission = () => { /* ... */ };
const useIsAdmin = () => { /* ... */ };

// CORRECT - Use route context
function Component() {
  const { user } = Route.useRouteContext();
  if (!user?.permissions?.includes('admin:access')) {
    return <AccessDenied />;
  }
}
```

### Server Function Protection Pattern

```typescript
// CORRECT - Check permissions in server function
export const deleteUser = createServerFn({ method: 'DELETE' }).handler(
  async (userId: string) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (session?.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    // Proceed with deletion
  },
);
```

## Commit Message Format

Follow conventional commits:

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `chore(scope): description` - Dependencies, tooling
- `docs(scope): description` - Documentation
- `refactor(scope): description` - Code changes without feature/bug changes

Use imperative mood, keep first line under 100 characters, no trailing period.

## Glossary

**Barrel File:** A file that only re-exports code from other files without any implementation. Example:

```typescript
// This is a barrel file - AVOID THESE
export { UserList } from './UserList';
export { UserProfile } from './UserProfile';
export type { User } from './types';
```

Instead, import directly from the source files.

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
