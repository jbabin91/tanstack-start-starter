# Permissions System

This document outlines the role-based permission system that controls access to features and data across personal and organizational contexts.

## Overview

The platform uses a hierarchical permission system with:

- **Personal permissions** - Individual user capabilities
- **Organization roles** - Role-based permissions within organizations
- **Context-aware access** - Permissions that vary by organizational context
- **Resource-level security** - Fine-grained access control for posts and data

## Permission Architecture

### Permission Types

#### Global Permissions

Applied to all users regardless of context:

```typescript
const globalPermissions = {
  'profile:edit': 'Edit own profile information',
  'posts:create': 'Create personal posts',
  'posts:edit:own': 'Edit own posts',
  'drafts:manage:own': 'Manage own drafts',
  'organizations:create': 'Create new organizations',
  'organizations:join': 'Join organizations via invitation',
};
```

#### Organization Permissions

Granted based on role within specific organizations:

```typescript
const organizationPermissions = {
  // Content permissions
  'posts:create': 'Create posts in organization context',
  'posts:edit:own': 'Edit own organization posts',
  'posts:edit:all': 'Edit all organization posts',
  'posts:delete:own': 'Delete own organization posts',
  'posts:delete:all': 'Delete any organization posts',
  'posts:approve': 'Approve posts for publication',
  'posts:moderate': 'Moderate published posts',

  // Member management
  'members:view': 'View organization members',
  'members:invite': 'Invite new members',
  'members:remove': 'Remove members',
  'members:promote': 'Change member roles',

  // Organization management
  'org:settings': 'Modify organization settings',
  'org:templates': 'Manage content templates',
  'org:guidelines': 'Manage writing guidelines',
  'org:analytics': 'View organization analytics',
  'org:delete': 'Delete organization',
};
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

### Context-Based Resolution

Permissions are resolved based on the current context:

```typescript
async function getUserPermissions(
  userId: string,
  organizationId?: string,
): Promise<string[]> {
  // Personal context
  if (!organizationId) {
    return getPersonalPermissions(userId);
  }

  // Organization context
  const membership = await getOrganizationMembership(userId, organizationId);
  if (!membership) {
    return []; // No access to organization
  }

  return getOrganizationPermissions(membership.role);
}

function getPersonalPermissions(userId: string): string[] {
  return [
    'profile:edit',
    'posts:create',
    'posts:edit:own',
    'posts:delete:own',
    'drafts:manage:own',
    'organizations:create',
    'organizations:join',
  ];
}

function getOrganizationPermissions(role: string): string[] {
  const rolePermissions = {
    owner: ['*'],
    admin: [
      'posts:create',
      'posts:edit:all',
      'posts:delete:all',
      'posts:approve',
      'posts:moderate',
      'members:view',
      'members:invite',
      'members:remove',
      'org:settings',
      'org:templates',
      'org:guidelines',
      'org:analytics',
    ],
    member: [
      'posts:create',
      'posts:edit:own',
      'posts:delete:own',
      'members:view',
    ],
  };

  return rolePermissions[role] || [];
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

File-based route protection using TanStack Router:

```typescript
// src/routes/_app/admin.tsx
export const Route = createFileRoute('/_app/admin')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      authQueries.currentSession(),
    );

    if (!session.user) {
      throw redirect({ to: '/login' });
    }

    const permissions = await getUserPermissions(
      session.user.id,
      session.session.organizationId,
    );

    const canAccess =
      permissions.includes('org:settings') || permissions.includes('*');

    if (!canAccess) {
      throw redirect({ to: '/dashboard' });
    }

    return {
      user: session.user,
      permissions,
    };
  },
});
```

## Client-Side Permission Checking

### Permission Hooks

```typescript
// src/hooks/use-permissions.ts
export function usePermissions(organizationId?: string) {
  return useQuery({
    queryKey: ['permissions', organizationId],
    queryFn: () => checkPermissions({
      permissions: [], // Get all permissions
      organizationId
    }),
  });
}

export function useHasPermission(
  permission: string,
  organizationId?: string
) {
  const { data: permissionData } = usePermissions(organizationId);

  return (
    permissionData?.userPermissions?.includes(permission) ||
    permissionData?.userPermissions?.includes('*') ||
    false
  );
}

// Usage in components
function PostActions({ post }: { post: Post }) {
  const canEdit = useHasPermission('posts:edit:own', post.organizationId);
  const canDelete = useHasPermission('posts:delete:own', post.organizationId);
  const canModerate = useHasPermission('posts:moderate', post.organizationId);

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
