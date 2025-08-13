# Architecture Overview

This document provides a comprehensive overview of the system architecture for the TanStack Start blogging platform.

## System Architecture

### Frontend Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│           TanStack Start v1.87+ (React 19 + Vite)              │
├─────────────────────────────────────────────────────────────────┤
│ TanStack Router  │  TanStack Query  │  ShadCN/UI  │ Tailwind   │
│ (File-based)     │  (Data fetching) │ (Components)│    v4      │
├─────────────────────────────────────────────────────────────────┤
│                    Server Functions                             │
│         (Type-safe, createServerFn API endpoints)               │
├─────────────────────────────────────────────────────────────────┤
│         Better-auth           │      Drizzle ORM + Arktype      │
│   (Multi-session, Orgs)       │     (Database + Validation)     │
├─────────────────────────────────────────────────────────────────┤
│                          PostgreSQL                            │
│          (Primary database + Full-text search with GIN)        │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Type Safety First** - End-to-end TypeScript with strict validation
2. **Performance Optimized** - Efficient queries, proper indexing, caching
3. **Developer Experience** - Hot reload, comprehensive tooling, clear patterns
4. **Scalable Design** - Modular architecture supporting growth

## Technology Stack

### TanStack Start (v1.87+)

- **Full-stack React framework** using Vite (NOT vinxi) for bundling
- **Server Functions** - Type-safe API endpoints with `createServerFn`
- **File-based routing** - Automatic route generation
- **SSR & Streaming** - Full-document SSR with streaming support
- **Import pattern**: `import { createServerFn } from '@tanstack/react-start'`

### TanStack Router

- **Type-safe routing** - Full TypeScript support with `createFileRoute`
- **File-based conventions** - Routes in `src/routes/` directory
- **Route guards** - `beforeLoad` for authentication/authorization
- **Search params** - Type-safe query parameters
- **Virtual routes** - Dynamic route generation

### TanStack Query (v5)

- **Server state management** - Caching, synchronization, background updates
- **`queryOptions` pattern** - Standardized query configurations
- **Suspense support** - `useSuspenseQuery` for data loading
- **Optimistic updates** - UI updates before server confirmation
- **Query invalidation** - Targeted cache updates

### TanStack Table

- **Headless UI** - Complete control over markup and styling
- **Column definitions** - Type-safe column configuration
- **Sorting & Filtering** - Built-in and custom filters
- **Pagination** - Client and server-side pagination
- **Row selection** - Single and multi-select patterns

### TanStack Virtual

- **List virtualization** - Efficient rendering of large lists
- **`useVirtualizer` hook** - React integration
- **Window scrolling** - `useWindowVirtualizer` for full-page lists
- **Dynamic measurements** - Automatic item size calculation

### Drizzle ORM

- **Modern schema syntax** - Array format `(table) => []` for constraints
- **Performance indexes** - GIN indexes for full-text search
- **Relational queries** - Efficient data fetching with relations
- **Type-safe migrations** - Schema-first approach
- **PostgreSQL optimized** - Native features like `tsvector`

### Better-auth

- **TypeScript-first** - Full type safety
- **Multi-session support** - Users in multiple organizations
- **Organization plugin** - Built-in multi-tenancy
- **Email verification** - Resend integration
- **Username plugin** - Alternative to email login

### Arktype

- **Runtime validation** - TypeScript-compatible validators
- **Better errors** - Human-readable validation messages
- **Performance** - Faster than Zod, close to native
- **Integration** - Works with server functions and forms

### React Hook Form

- **Performance focused** - Minimal re-renders
- **`useForm` hook** - Main form management
- **`Controller` component** - External UI library integration
- **Validation** - Built-in and schema validation
- **Error handling** - Field-level error management

### ShadCN/UI Components

- **Local components** - Copied to `src/components/ui/`
- **Customizable** - Full control over component code
- **Accessibility** - WCAG compliant components
- **Dark mode** - Built-in theme support
- **Project customization**: Uses `cn.ts` instead of `utils.ts`

### Project-Specific Patterns

- **Icons component** - Centralized icon management instead of direct lucide imports
- **cn utility** - Class name merging at `@/utils/cn`
- **Path aliases** - Always use `@/` for src imports
- **ID Generation** - All entities use `nanoid()` from `@/lib/nanoid` with custom alphabet
- **Environment Management** - Uses `dotenvx` with configuration in `src/configs/env.ts`

## Module Architecture

### Feature Module Structure

Each feature follows a consistent modular pattern:

```text
src/modules/{feature}/
├── api/              # Server functions (one per file)
│   ├── get-{resource}.ts
│   ├── create-{resource}.ts
│   └── update-{resource}.ts
├── hooks/            # React Query integration
│   ├── use-queries.ts
│   └── use-mutations.ts
├── components/       # Feature-specific components
├── types/           # TypeScript types
└── utils/           # Feature utilities
```

### Current Modules

- **`users/`** - User profiles and account management
- **`posts/`** - Content creation, drafts, publishing
- **`organizations/`** - Multi-tenant organization system
- **`sessions/`** - Session management and multi-session support
- **`email/`** - Transactional email via Resend

## Database Architecture

### Schema Design Principles

- **Modern Drizzle Patterns** - Array syntax `(table) => []` for constraints
- **Performance Indexing** - All foreign keys and query fields indexed
- **Cascade Behavior** - Explicit `onDelete` rules for data integrity
- **Timestamp Standards** - Timezone-aware timestamps with auto-update

### Core Tables

```sql
-- Core user system
users (id, email, username, name, avatar, created_at, updated_at)
sessions (id, user_id, organization_id, expires_at, ...)
organizations (id, name, slug, description, ...)
organization_members (organization_id, user_id, role, ...)

-- Content system
posts (id, title, content, author_id, organization_id, status, ...)
post_co_authors (post_id, user_id, role)
drafts (id, post_id, content, auto_saved_at, ...)

-- Future: Search & discovery
post_tags (post_id, tag_name)
user_follows (follower_id, following_id)
post_views (post_id, user_id, viewed_at)
```

See [Database Design](./database.md) for detailed schema specifications.

## Authentication & Permissions

### better-auth Integration

- **Multi-session Support** - Users can belong to multiple organizations
- **Organization Context** - Session includes current organization
- **Role-based Permissions** - Admin, member, owner roles
- **Email Verification** - Required for new account activation

### Permission Patterns

```typescript
// Route-level protection
export const Route = createFileRoute('/_app/admin')({
  beforeLoad: ({ context }) => {
    if (!context.user?.permissions?.includes('admin:access')) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

// Server function protection
export const adminFunction = createServerFn({ method: 'POST' }).handler(
  async (data) => {
    const session = await auth.api.getSession({ headers });

    if (session?.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    // Function logic
  },
);
```

## Data Fetching Architecture

### TanStack Query Integration

The platform uses a structured approach to data fetching:

1. **Server Functions** - Type-safe API endpoints
2. **Query Options** - Standardized query configurations
3. **Custom Hooks** - Reusable data fetching patterns

```typescript
// Query options pattern
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

// Custom hooks with object parameters
export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.byId(id));
}
```

## UI Architecture

### Component Organization

- **`components/ui/`** - ShadCN/UI components (local copies)
- **`components/layouts/`** - Layout components and page templates
- **`components/errors/`** - Error boundaries and fallback components
- **`modules/{feature}/components/`** - Feature-specific components

### Design System

- **ShadCN/UI** - Consistent component library
- **TailwindCSS v4** - Utility-first styling with automatic class sorting
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliance built into components

## Build & Development Architecture

### Development Stack

- **TanStack Start v1.87+** - Uses Vite (not vinxi) for build system
- **TypeScript** - Strict configuration with path aliases
- **ESLint + Prettier** - Code quality enforcement
- **Conventional Commits** - Standardized commit messages

### Quality Enforcement

```bash
# Automatic on file changes
pnpm format      # Prettier formatting
pnpm lint        # ESLint validation
pnpm typecheck   # TypeScript checking
```

### Environment Management

- **dotenvx** - Environment variable management
- **Drizzle Kit** - Database migrations and schema generation
- **better-auth** - Schema generation from auth configuration

## Strategic Context

This technical architecture implements the systems designed in our strategic planning:

- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - Markdown editor and publishing workflows
- **[Search & Discovery](../../.serena/memories/search_discovery_system_design.md)** - PostgreSQL full-text search optimization
- **[Navigation Architecture](../../.serena/memories/ux_architecture_navigation_design.md)** - Organization-aware navigation patterns

## Performance Considerations

### Database Optimization

- **Proper Indexing** - All foreign keys and frequently queried fields
- **Query Efficiency** - Drizzle relational queries for complex data
- **Full-text Search** - PostgreSQL native search capabilities

### Frontend Performance

- **Bundle Optimization** - Code splitting and dynamic imports
- **Caching Strategy** - TanStack Query with stale-while-revalidate
- **Image Optimization** - Responsive images and lazy loading

### Scalability Planning

- **Modular Design** - Features can be extracted into microservices
- **Database Partitioning** - Ready for table partitioning as needed
- **CDN Integration** - Static assets and image optimization

See [Development Guide](../development/index.md) for detailed implementation patterns and performance optimization strategies.
