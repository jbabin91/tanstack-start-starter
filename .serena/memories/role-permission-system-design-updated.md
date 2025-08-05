# Application-Wide Role & Permission System - UPDATED IMPLEMENTATION

## Current Implementation Status ✅

Successfully implemented following KISS/DRY principles with better-auth integration.

## Architecture Overview

### 1. Database Schema (Single Source of Truth)

```typescript
// src/lib/db/schemas/auth.ts
export const systemRoleEnum = pgEnum('system_role', [
  'user',
  'admin',
  'super_admin',
]);
export const organizationRoleEnum = pgEnum('organization_role', [
  'member',
  'admin',
  'owner',
]);

// Type inference from database enums
export type SystemRole = (typeof systemRoleEnum.enumValues)[number];
export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];
```

### 2. Permission System (Declarative Configuration)

```typescript
// src/lib/auth/types.ts - KISS principle applied
const PERMISSION_CONFIG = {
  system: {
    [SYSTEM_ROLES.USER]: ['posts:create'],
    [SYSTEM_ROLES.ADMIN]: ['posts:create', 'posts:edit', 'posts:delete', 'posts:moderate', 'users:view', 'users:edit', 'admin:access'],
    [SYSTEM_ROLES.SUPER_ADMIN]: [...all permissions],
  },
  organization: {
    [ORGANIZATION_ROLES.MEMBER]: [],
    [ORGANIZATION_ROLES.ADMIN]: ['org:invite', 'org:manage'],
    [ORGANIZATION_ROLES.OWNER]: ['org:invite', 'org:manage', 'org:billing', 'org:delete'],
  },
} as const;
```

### 3. Better-Auth Integration (DRY Implementation)

```typescript
// src/lib/auth/server.ts - Uses database hooks
databaseHooks: {
  user: {
    read: {
      after: async (user: any, context: any) => {
        // Get organization membership using helper function
        const membership = await getUserMembership({
          userId: user.id,
          organizationId: activeOrgId,
        });

        // Compute permissions using declarative config
        const permissions = computePermissions(user.role, orgRole);

        return {
          data: { ...user, permissions, organizationRole: orgRole, ... }
        };
      },
    },
  },
}
```

### 4. Helper Functions (DRY Principle)

```typescript
// src/lib/auth/utils/membership-queries.ts - Eliminates duplication
export async function getUserMembership({ userId, organizationId }) {
  // Centralized query logic used by both session and user hooks
}
```

## Key Improvements Implemented

### ✅ KISS (Keep It Simple, Stupid)

- **Declarative permissions** instead of imperative if/else chains
- **Database enum inference** instead of manual type definitions
- **Single configuration object** for all permission rules

### ✅ DRY (Don't Repeat Yourself)

- **Helper functions** for repeated database queries
- **Single source of truth** for roles (database enums)
- **Centralized permission computation** logic

### ✅ Better Architecture

- **Type safety** with `satisfies` and proper inference
- **Performance** with indexed enum columns
- **Maintainability** with configuration-driven approach

## Migration Applied

- ✅ Database migration generated for role enums
- ✅ Permission computation moved to better-auth hooks
- ✅ Duplicate queries eliminated with helper functions
- ✅ Types inferred from database schema
- ✅ Zero tolerance linting/type errors maintained

## Route Context Integration

```typescript
// src/routes/__root.tsx
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>; // Uses better-auth computed user
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(
      authQueries.currentUser(),
    );
    return { user }; // Already includes permissions from better-auth hook
  },
});
```

## Ready for Dashboard Implementation

System is now optimized and ready for role-based dashboard components with:

- Automatic permission computation
- Type-safe role checking
- Organization context awareness
- Clean, maintainable architecture

**Next Step:** Build role-based dashboard components using this system.
