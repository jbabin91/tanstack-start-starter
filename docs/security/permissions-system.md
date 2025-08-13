# Permissions System

This document outlines the role-based permission system that controls access to features and data across personal and organizational contexts.

## Overview

The platform uses a hierarchical permission system with:

- **Personal permissions** - Individual user capabilities
- **Organization roles** - Role-based permissions within organizations
- **Context-aware access** - Permissions that vary by organizational context
- **Resource-level security** - Fine-grained access control for posts and data

## Permission Architecture

### Database-First Design with Enums

The system uses PostgreSQL enums as the single source of truth:

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

export const users = pgTable('users', {
  // ... other fields
  role: systemRoleEnum().default('user'),
});

export const members = pgTable('members', {
  // ... other fields
  role: organizationRoleEnum().default('member').notNull(),
});
```

### Type-Safe Permission Configuration

Permissions are defined declaratively using configuration:

```typescript
// src/lib/auth/permissions.ts
export type SystemRole = (typeof systemRoleEnum.enumValues)[number];
export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];

const PERMISSION_CONFIG = {
  system: {
    user: ['posts:create', 'profile:edit', 'organizations:create'],
    admin: [
      'posts:create',
      'posts:edit',
      'posts:moderate',
      'profile:edit',
      'organizations:create',
      'users:manage',
    ],
    super_admin: ['*'], // All permissions
  },
  organization: {
    member: ['posts:create', 'posts:edit:own'],
    admin: [
      'posts:create',
      'posts:edit:own',
      'posts:edit:all',
      'members:view',
      'members:invite',
      'org:settings',
    ],
    owner: [
      'posts:create',
      'posts:edit:all',
      'posts:delete:all',
      'members:view',
      'members:invite',
      'members:remove',
      'org:settings',
      'org:billing',
      'org:delete',
    ],
  },
} as const;

export function computePermissions(
  systemRole?: string | null,
  organizationRole?: string | null,
): string[] {
  const systemPermissions = systemRole
    ? (PERMISSION_CONFIG.system[systemRole as SystemRole] ?? [])
    : [];
  const orgPermissions = organizationRole
    ? (PERMISSION_CONFIG.organization[organizationRole as OrganizationRole] ??
      [])
    : [];
  return [...new Set([...systemPermissions, ...orgPermissions])];
}
```

### Role Hierarchy

#### Personal Context

All users have basic personal permissions:

```typescript
const personalRole = {
  role: 'user',
  permissions: [
    'profile:edit',
    'posts:create',
    'posts:edit:own',
    'posts:delete:own',
    'drafts:manage:own',
    'organizations:create',
    'organizations:join',
  ],
};
```

#### Organization Roles

**Member:**

```typescript
const memberRole = {
  role: 'member',
  permissions: [
    'posts:create',
    'posts:edit:own',
    'posts:delete:own',
    'members:view',
  ],
};
```

**Admin:**

```typescript
const adminRole = {
  role: 'admin',
  permissions: [
    ...memberRole.permissions,
    'posts:edit:all',
    'posts:delete:all',
    'posts:approve',
    'posts:moderate',
    'members:invite',
    'members:remove',
    'org:settings',
    'org:templates',
    'org:guidelines',
    'org:analytics',
  ],
};
```

**Owner:**

```typescript
const ownerRole = {
  role: 'owner',
  permissions: [
    '*', // All permissions
  ],
};
```

## Permission Resolution

### Better-Auth Integration

Permissions are automatically computed and attached to the user object via better-auth database hooks:

```typescript
// src/lib/auth/server.ts
import { getUserMembership } from '@/lib/auth/utils/membership-queries';
import { computePermissions } from '@/lib/auth/permissions';

databaseHooks: {
  user: {
    read: {
      after: async (user: User, context: SessionContext) => {
        if (!user) return { data: user };

        // Get organization context
        const membership = await getUserMembership({
          userId: user.id,
          organizationId: context?.session?.activeOrganizationId,
        });

        const orgRole = membership.length > 0 ? membership[0].organizationRole : null;
        const permissions = computePermissions(user.role, orgRole);

        return {
          data: {
            ...user,
            permissions,
            organizationRole: orgRole,
            activeOrganizationId: membership.length > 0 ? membership[0].organizationId : null,
            activeOrganizationName: membership.length > 0 ? membership[0].organizationName : null,
          },
        };
      },
    },
  },
}
```

### Helper Functions for DRY Code

```typescript
// src/lib/auth/utils/membership-queries.ts
export async function getUserMembership({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId?: string;
}) {
  return await db
    .select({
      organizationId: members.organizationId,
      organizationRole: members.role,
      organizationName: organizations.name,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(
      and(
        eq(members.userId, userId),
        organizationId ? eq(members.organizationId, organizationId) : undefined,
      ),
    )
    .limit(1);
}

export async function getUserFirstMembership(userId: string) {
  return getUserMembership({ userId });
}
```

### Resource-Level Security

Beyond role-based permissions, the system enforces resource-level security:

#### Post Access Control

```typescript
async function checkPostAccess(
  userId: string,
  postId: string,
  action: string,
): Promise<boolean> {
  const post = await getPost(postId);
  const userPermissions = await getUserPermissions(userId, post.organizationId);

  // Check specific access rules
  switch (action) {
    case 'read':
      return canReadPost(userId, post, userPermissions);

    case 'edit':
      return canEditPost(userId, post, userPermissions);

    case 'delete':
      return canDeletePost(userId, post, userPermissions);

    default:
      return false;
  }
}

function canEditPost(
  userId: string,
  post: Post,
  permissions: string[],
): boolean {
  // Owner can always edit
  if (post.authorId === userId) {
    return permissions.includes('posts:edit:own');
  }

  // Admins can edit all posts in organization
  if (post.organizationId && permissions.includes('posts:edit:all')) {
    return true;
  }

  // Co-authors can edit if they have editor role
  if (
    post.coAuthors?.some((ca) => ca.userId === userId && ca.role === 'editor')
  ) {
    return true;
  }

  return false;
}
```

## Server Function Protection

### Permission Middleware

All server functions use standardized permission checking:

```typescript
// Permission decorator
function requiresPermission(permissions: string[]) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const userPermissions = await getUserPermissions(
        session.user.id,
        session.session.organizationId,
      );

      const hasPermission = permissions.some(
        (permission) =>
          userPermissions.includes(permission) || userPermissions.includes('*'),
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      return originalMethod.apply(this, args);
    };
  };
}

// Usage example
export const deletePost = createServerFn({ method: 'DELETE' })
  .validator(t.object({ postId: t.string() }))
  .handler(
    requiresPermission(['posts:delete:own', 'posts:delete:all'])(
      async ({ postId }, { user }) => {
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!post) {
          throw new Error('Post not found');
        }

        // Additional ownership check for 'posts:delete:own'
        const userPermissions = await getUserPermissions(
          user.id,
          post.organizationId,
        );

        if (
          !userPermissions.includes('posts:delete:all') &&
          post.authorId !== user.id
        ) {
          throw new Error('Can only delete own posts');
        }

        await db.delete(posts).where(eq(posts.id, postId));
        return { success: true };
      },
    ),
  );
```

### Route Protection

File-based route protection using TanStack Router with better-auth integration:

```typescript
// src/routes/__root.tsx
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>; // Includes computed permissions
}>()({
  beforeLoad: async ({ context }) => {
    // Single call gets user + permissions (computed by better-auth hook)
    const user = await context.queryClient.fetchQuery(
      authQueries.currentUser(),
    );
    return { user };
  },
});

// src/routes/_app/admin.tsx
export const Route = createFileRoute('/_app/admin')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' });
    }

    // Permissions already computed and available
    const canAccess =
      context.user.permissions?.includes('org:settings') ||
      context.user.permissions?.includes('*');

    if (!canAccess) {
      throw redirect({ to: '/dashboard' });
    }

    return {
      user: context.user,
    };
  },
});
```

## Client-Side Permission Checking

### Simplified Permission Access

Since permissions are computed by better-auth hooks, they're available directly from route context:

```typescript
// Usage in components
function PostActions({ post }: { post: Post }) {
  const { user } = Route.useRouteContext();

  // Permissions already computed and available
  const canEdit = user?.permissions?.includes('posts:edit:own') ||
                  user?.permissions?.includes('posts:edit:all') ||
                  user?.permissions?.includes('*');
  const canDelete = user?.permissions?.includes('posts:delete:own') ||
                   user?.permissions?.includes('posts:delete:all') ||
                   user?.permissions?.includes('*');
  const canModerate = user?.permissions?.includes('posts:moderate') ||
                     user?.permissions?.includes('*');

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button onClick={() => editPost(post.id)}>
          Edit
        </Button>
      )}

      {canDelete && (
        <Button color="error" onClick={() => deletePost(post.id)}>
          Delete
        </Button>
      )}

      {canModerate && (
        <Button variant="outlined" onClick={() => moderatePost(post.id)}>
          Moderate
        </Button>
      )}
    </div>
  );
}

// Helper function for reusable permission checking
function hasPermission(user: any, permission: string): boolean {
  return user?.permissions?.includes(permission) ||
         user?.permissions?.includes('*') ||
         false;
}

// Usage with helper
function AdminFeature() {
  const { user } = Route.useRouteContext();

  if (!hasPermission(user, 'admin:access')) {
    return <AccessDenied />;
  }

  return <AdminPanel />;
}
```

### Conditional UI Rendering

```typescript
// Permission-based component rendering
function OrganizationSettings() {
  const canManageSettings = useHasPermission('org:settings');
  const canManageMembers = useHasPermission('members:invite');
  const canViewAnalytics = useHasPermission('org:analytics');

  if (!canManageSettings) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <GeneralSettings />

      {canManageMembers && <MemberManagement />}
      {canViewAnalytics && <AnalyticsPanel />}
    </div>
  );
}
```

## Security Best Practices

### Defense in Depth

The permission system implements multiple layers of security:

1. **Route Protection** - Prevent access to unauthorized pages
2. **Server Function Protection** - Validate permissions on all API calls
3. **Resource-Level Checks** - Verify ownership and context-specific access
4. **Client-Side Conditional Rendering** - Hide unauthorized UI elements

### Permission Validation Rules

#### Always Validate on Server

```typescript
// GOOD: Server-side validation
export const sensitiveAction = createServerFn({ method: 'POST' })
  .handler(async (data) => {
    const session = await getValidatedSession();
    const hasPermission = await checkUserPermission(
      session.user.id,
      'required:permission'
    );

    if (!hasPermission) {
      throw new Error('Unauthorized');
    }

    // Perform action
  });

// BAD: Client-side only validation
function SensitiveButton() {
  const canPerform = useHasPermission('required:permission');

  // This only hides UI - doesn't prevent API access
  if (!canPerform) return null;

  return <Button onClick={performSensitiveAction} />;
}
```

#### Context-Aware Permissions

```typescript
// Always consider organizational context
async function checkPostPermission(userId: string, postId: string) {
  const post = await getPost(postId);
  const permissions = await getUserPermissions(userId, post.organizationId);

  // Context matters - same user might have different permissions
  return validatePermission(permissions, 'posts:edit', post);
}
```

#### Fail Securely

```typescript
// Default to deny access
function hasPermission(userPermissions: string[], required: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false; // Fail securely
  }

  return userPermissions.includes(required) || userPermissions.includes('*');
}
```

## Testing Permission Systems

### Unit Tests

```typescript
describe('Permission System', () => {
  test('member can edit own posts', async () => {
    const user = await createTestUser();
    const org = await createTestOrganization();
    await addMemberToOrganization(org.id, user.id, 'member');

    const post = await createTestPost({
      authorId: user.id,
      organizationId: org.id,
    });

    const canEdit = await checkPostAccess(user.id, post.id, 'edit');
    expect(canEdit).toBe(true);
  });

  test('member cannot edit other member posts', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const org = await createTestOrganization();

    await addMemberToOrganization(org.id, user1.id, 'member');
    await addMemberToOrganization(org.id, user2.id, 'member');

    const post = await createTestPost({
      authorId: user2.id,
      organizationId: org.id,
    });

    const canEdit = await checkPostAccess(user1.id, post.id, 'edit');
    expect(canEdit).toBe(false);
  });

  test('admin can edit all organization posts', async () => {
    const admin = await createTestUser();
    const member = await createTestUser();
    const org = await createTestOrganization();

    await addMemberToOrganization(org.id, admin.id, 'admin');
    await addMemberToOrganization(org.id, member.id, 'member');

    const post = await createTestPost({
      authorId: member.id,
      organizationId: org.id,
    });

    const canEdit = await checkPostAccess(admin.id, post.id, 'edit');
    expect(canEdit).toBe(true);
  });
});
```

## Audit and Compliance

### Permission Auditing

```typescript
// Log all permission checks for audit trails
async function auditPermissionCheck(
  userId: string,
  permission: string,
  resource: string,
  granted: boolean,
  context: Record<string, unknown>,
) {
  await db.insert(permissionAudits).values({
    userId,
    permission,
    resource,
    granted,
    context: JSON.stringify(context),
    timestamp: new Date(),
  });
}

// Enhanced permission checking with auditing
async function checkPermissionWithAudit(
  userId: string,
  permission: string,
  resourceId: string,
  organizationId?: string,
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId, organizationId);
  const granted =
    userPermissions.includes(permission) || userPermissions.includes('*');

  await auditPermissionCheck(userId, permission, resourceId, granted, {
    organizationId,
    userPermissions,
  });

  return granted;
}
```

The permission system provides comprehensive, context-aware access control while maintaining security and auditability across the platform.
