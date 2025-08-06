# API Documentation

This section documents all server functions and API endpoints for the TanStack Start blogging platform.

## Architecture

The platform uses **TanStack Start v1.87+ server functions** instead of traditional REST API routes. Each server function is a type-safe endpoint that integrates seamlessly with TanStack Query on the client.

### Server Function Pattern (Latest)

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

// Modern server function with validation
export const getUserPosts = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    // Use Arktype for validation
    const result = GetUserPostsInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async (validatedData) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Type-safe database query
    return await db.query.posts.findMany({
      where: eq(posts.userId, validatedData.userId),
      with: { author: true },
      orderBy: desc(posts.createdAt),
    });
  });

// Client usage with TanStack Query
const { data: posts } = useQuery({
  queryKey: ['user-posts', userId],
  queryFn: () => getUserPosts({ userId }),
});
```

### Key Updates in v1.87+

- **Import from `@tanstack/react-start`** (NOT `@tanstack/start`)
- **Use `getWebRequest`** from `@tanstack/react-start/server` (NOT from vinxi)
- **Arktype validation** for better performance and error messages
- **Better-auth integration** with multi-session support

## Authentication & Permissions

All API endpoints use the better-auth session system for authentication:

```typescript
// Standard auth pattern
export const protectedFunction = createServerFn({ method: 'POST' }).handler(
  async (data) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Function logic...
  },
);
```

## API Modules

### [Authentication](./auth.md)

User authentication, sessions, and organization context management.

### [Users](./users.md)

User profiles, settings, and account management.

### [Posts](./posts.md)

Content creation, drafts, publishing, and co-authoring.

### [Organizations](./organizations.md)

Organization management, member roles, and publishing workflows.

### [Search](./search.md)

Full-text search, filtering, and content discovery.

### [Comments](./comments.md) _(Planned)_

Comment system and moderation features.

## Error Handling

All server functions use a consistent error handling pattern:

```typescript
try {
  // Function logic
  return { success: true, data };
} catch (error) {
  console.error('Function error:', error);
  throw new Error(
    error instanceof Error ? error.message : 'Internal server error',
  );
}
```

## Query Integration

Server functions are designed to work seamlessly with TanStack Query:

```typescript
// Query patterns in use-queries.ts files
export const postQueries = {
  all: () =>
    queryOptions({
      queryKey: ['posts'] as const,
      queryFn: () => getAllPosts(),
    }),

  byId: (id: string) =>
    queryOptions({
      queryKey: ['posts', id] as const,
      queryFn: () => getPost({ data: id }),
    }),
};

// Custom hooks for common patterns
export function usePosts() {
  return useSuspenseQuery(postQueries.all());
}

export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(postQueries.byId(id));
}
```

## Strategic Context

This API documentation provides implementation details for the systems designed in:

- [Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md) - Editor and publishing workflows
- [Search & Discovery System](../../.serena/memories/search_discovery_system_design.md) - Search and filtering capabilities
- [Navigation Architecture](../../.serena/memories/ux_architecture_navigation_design.md) - User interface and navigation patterns

## Development Guidelines

- **One function per file** - Each server function in `src/modules/{feature}/api/{action}-{resource}.ts`
- **Type safety** - Use validators and return proper TypeScript types
- **Permission checks** - Always validate user permissions and organization context
- **Error consistency** - Use standard error patterns and logging
- **Query integration** - Design functions to work with TanStack Query patterns

See [Development Guide](../development/index.md) for detailed implementation patterns.
