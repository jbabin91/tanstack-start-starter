# Barrel File Definition & Policy

## What is a Barrel File?

A **barrel file** is a module that **only re-exports** from other modules without containing any actual implementation logic.

### ❌ Examples of Barrel Files (Avoid):

```typescript
// src/modules/users/index.ts - BARREL FILE (bad)
export { fetchUsers, userQueries } from './api/user-queries';
export { UserCard } from './components/user-card';
export type { User } from './types/user';
```

```typescript
// src/components/index.ts - BARREL FILE (bad)
export * from './button';
export * from './card';
export * from './form';
```

### ✅ Examples of Implementation Files (Good):

```typescript
// src/modules/users/api/user-queries.ts - IMPLEMENTATION FILE (good)
import { createServerFn } from '@tanstack/react-start';

export const fetchUsers = createServerFn().handler(async () => {
  // Actual implementation logic
  return await db.select().from(usersTable);
});

export const userQueries = {
  all: () =>
    queryOptions({
      queryFn: () => fetchUsers(),
      queryKey: ['users'],
    }),
};
```

## Project Policy: NO BARREL FILES

**Reasoning:**

- **Circular Dependencies:** Can create import cycles
- **Performance Issues:** Tree-shaking problems, larger bundles
- **Maintenance Overhead:** Extra indirection layer
- **IDE Confusion:** "Go to definition" leads to re-export, not implementation

## Exceptions

**✅ Allowed `index.ts` files:**

- **UI Components:** shadcn/ui components use `index.ts` for component exports (project convention)
- **Single Directory Exports:** When a directory has one main export (rare cases)

## Refactoring Applied

**Renamed confusing `index.ts` files to descriptive names:**

- `modules/email/api/index.ts` → `send-demo-email.ts`
- `modules/users/api/index.ts` → `user-queries.ts`
- `modules/posts/api/index.ts` → `post-queries.ts`
- **Deleted:** `modules/sessions/index.ts` (was actual barrel file)

**All imports now use direct paths:**

```typescript
// ✅ Direct imports (good)
import { userQueries } from '@/modules/users/api/user-queries';
import { sendDemoEmailFn } from '@/modules/email/api/send-demo-email';

// ❌ Barrel imports (removed)
import { userQueries } from '@/modules/users';
```

This policy ensures cleaner imports, better performance, and eliminates circular dependency risks.
