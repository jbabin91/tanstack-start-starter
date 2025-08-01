# API and Query Patterns - Established Standards

## API Architecture

**Server Functions (Primary Pattern):**

- Use `createServerFn()` from TanStack Start
- Location: `src/modules/{feature}/api/{function-name}.ts`
- NO traditional API routes except `/api/auth/$` for better-auth

**Import Requirements:**

- **MANDATORY:** All imports must use `@/` alias
- **NO relative imports** (`./` or `../`) allowed
- Fixed in session module as reference implementation

## TanStack Query Organization

**File Structure:**

- `src/modules/{feature}/hooks/use-queries.ts` - Query definitions only
- `src/modules/{feature}/hooks/use-mutations.ts` - Mutations (when needed)
- NO barrel files in API folders

**Query Key Hierarchy (TkDodo Pattern):**

```typescript
export const sessionQueries = {
  all: () => ['sessions'] as const,
  lists: () => [...sessionQueries.all(), 'list'] as const,
  list: () =>
    queryOptions({
      queryKey: [...sessionQueries.lists()],
      queryFn: () => fetchSessions(),
      refetchInterval: 30000,
    }),
  details: () => [...sessionQueries.all(), 'detail'] as const,
  detail: (sessionId: string) =>
    queryOptions({
      queryKey: [...sessionQueries.details(), sessionId],
      queryFn: () => fetchSessionActivity({ data: { sessionId } }),
    }),
  current: () =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'current'],
      queryFn: () => fetchCurrentSession(),
      refetchInterval: 10000,
    }),
};
```

## Refactoring Complete - Session Module

✅ Fixed all relative imports to use `@/` aliases
✅ Moved sessionQueries from api/ to hooks/use-queries.ts
✅ Implemented hierarchical query key pattern
✅ Removed barrel file from api directory
✅ All code quality checks pass

## Updated CLAUDE.md

✅ Added mandatory import alias requirement
✅ Documented API and query patterns
✅ Added TanStack query organization standards
✅ Exception documented for better-auth route

This establishes our architectural standards for all future API development.
