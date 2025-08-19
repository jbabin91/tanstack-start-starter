# Authentication API Documentation

This document covers the authentication and authorization system implementation using better-auth, including user management, permissions, and organization context.

## Overview

The authentication system provides:

- **Email/password authentication** with verification
- **Multi-session support** for organization switching
- **Role-based permissions** with organization context
- **Session management** across multiple devices

## Core Authentication

### User Authentication

The primary authentication endpoint provides current user context with computed permissions.

#### Get Current User

```typescript
import { getUser } from '@/modules/auth/api/get-user';

// Server function implementation
export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) return null;

    // Get user's organization membership and role
    const activeOrgId = session.session.activeOrganizationId ?? undefined;
    const membership = await getUserMembership({
      userId: session.user.id,
      organizationId: activeOrgId,
    });

    const orgRole =
      membership.length > 0 ? membership[0].organizationRole : null;
    const orgName =
      membership.length > 0 ? membership[0].organizationName : null;
    const orgId = membership.length > 0 ? membership[0].organizationId : null;

    // Compute permissions based on system role and organization role
    const permissions = computePermissions(session.user.role, orgRole);

    return {
      ...session.user,
      permissions,
      organizationRole: orgRole,
      activeOrganizationId: orgId,
      activeOrganizationName: orgName,
    };
  } catch (error) {
    // Handle database connection errors gracefully
    logger.warn(error, 'Failed to get user session');
    return null;
  }
});

// Client usage
const { data: user } = useCurrentUser();
```

**Returns:**

```typescript
type UserWithContext = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: Permission[];
  organizationRole: 'member' | 'admin' | 'owner' | null;
  activeOrganizationId: string | null;
  activeOrganizationName: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
} | null;
```

**Features:**

- **Graceful degradation** - Returns null on database errors to keep public routes functional
- **Permission computation** - Automatically computes permissions based on roles
- **Organization context** - Includes active organization information
- **Type safety** - Full TypeScript support with proper types

#### Switch Organization Context

```typescript
import { type } from 'arktype';

// Reusable schema - can be used in forms and server functions
export const SwitchOrgSchema = type({
  'organizationId?': 'string',
});

export const switchOrganization = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = SwitchOrgSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Verify organization membership
    if (organizationId) {
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.userId, session.user.id),
          eq(organizationMembers.organizationId, organizationId),
        ),
      });

      if (!membership) {
        throw new Error('Not a member of this organization');
      }
    }

    // Update session context
    await db
      .update(sessions)
      .set({ organizationId })
      .where(eq(sessions.id, session.session.id));

    return { success: true };
  });
```

### Permission Checking

#### Check User Permissions

```typescript
// Reusable schema for permission checking
export const CheckPermissionsSchema = type({
  permissions: 'string[]',
  'organizationId?': 'string',
});

export const checkPermissions = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = CheckPermissionsSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ permissions, organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      return { hasPermissions: false, reason: 'Not authenticated' };
    }

    const userPermissions = await getUserPermissions(
      session.user.id,
      organizationId,
    );

    const hasAll = permissions.every((permission) =>
      userPermissions.includes(permission),
    );

    return { hasPermissions: hasAll, userPermissions };
  });

// Helper function for permission resolution
async function getUserPermissions(
  userId: string,
  organizationId?: string,
): Promise<string[]> {
  if (!organizationId) {
    // Personal permissions
    return ['posts:create', 'posts:edit:own', 'profile:edit'];
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
    ),
  });

  if (!membership) return [];

  // Role-based permissions
  const rolePermissions = {
    owner: ['*'], // All permissions
    admin: [
      'posts:create',
      'posts:edit:all',
      'posts:delete:all',
      'posts:approve',
      'members:invite',
      'members:remove',
      'org:settings',
    ],
    member: ['posts:create', 'posts:edit:own'],
  };

  return rolePermissions[membership.role as keyof typeof rolePermissions] || [];
}
```

## Authentication Hooks & Patterns

### Route Protection

#### Protected Route Pattern

```typescript
// src/routes/_app.tsx - Protected layout
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(
      authQueries.currentSession(),
    );

    if (!session.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
});

// Organization-specific protection
export const Route = createFileRoute('/_app/organization/$orgSlug')({
  beforeLoad: async ({ context, params }) => {
    const session = await context.queryClient.fetchQuery(
      authQueries.currentSession(),
    );

    if (!session.user) {
      throw redirect({ to: '/login' });
    }

    const membership = await checkOrganizationMembership(
      session.user.id,
      params.orgSlug,
    );

    if (!membership) {
      throw redirect({ to: '/dashboard' });
    }

    return { user: session.user, membership };
  },
});
```

### Server Function Protection

#### Standard Protection Pattern

```typescript
// Generic protected function wrapper
function createProtectedServerFn<TInput, TOutput>(
  config: { method: string },
  requiredPermissions?: string[],
) {
  return {
    validator: (schema: typeof type.any) => ({
      handler: (fn: (data: TInput, context: AuthContext) => Promise<TOutput>) =>
        createServerFn(config)
          .validator((data: unknown) => {
            const result = schema(data);
            if (result instanceof type.errors) {
              throw new Error(result.summary);
            }
            return result;
          })
          .handler(async (data: TInput) => {
            const { headers } = getWebRequest();
            const session = await auth.api.getSession({ headers });

            if (!session?.user) {
              throw new Error('Authentication required');
            }

            if (requiredPermissions) {
              const userPermissions = await getUserPermissions(
                session.user.id,
                session.session.organizationId,
              );

              const hasPermission = requiredPermissions.some(
                (permission) =>
                  userPermissions.includes(permission) ||
                  userPermissions.includes('*'),
              );

              if (!hasPermission) {
                throw new Error('Insufficient permissions');
              }
            }

            return fn(data, {
              user: session.user,
              session: session.session,
              permissions: userPermissions,
            });
          }),
    }),
  };
}

// Usage example
export const deletePost = createProtectedServerFn({ method: 'DELETE' }, [
  'posts:delete:own',
  'posts:delete:all',
])
  .validator(type({ postId: 'string' }))
  .handler(async ({ postId }, { user, permissions }) => {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Check ownership or admin permission
    if (
      post.authorId !== user.id &&
      !permissions.includes('posts:delete:all')
    ) {
      throw new Error('Cannot delete this post');
    }

    await db.delete(posts).where(eq(posts.id, postId));

    return { success: true };
  });
```

## Email Verification

### Verification Flow

```typescript
// Reusable schemas - can be used in forms and server functions
export const SendVerificationSchema = type({
  email: 'string',
});

export const VerifyEmailSchema = type({
  token: 'string',
});

export const sendVerificationEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = SendVerificationSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ email }) => {
    // Generate verification token
    const token = await generateVerificationToken(email);

    // Send email via Resend
    await resend.emails.send({
      from: 'noreply@yourplatform.com',
      to: email,
      subject: 'Verify your email address',
      html: EmailVerificationTemplate({ token, email }),
    });

    return { success: true };
  });

export const verifyEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = VerifyEmailSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ token }) => {
    const verification = await db.query.emailVerifications.findFirst({
      where: and(
        eq(emailVerifications.token, token),
        gt(emailVerifications.expiresAt, new Date()),
      ),
    });

    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.email, verification.email));

    // Clean up verification record
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, verification.id));

    return { success: true };
  });
```

## Error Handling Patterns

### Authentication Errors

```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | 'UNAUTHENTICATED'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'TOKEN_EXPIRED',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Client error handling
export function useAuthErrorHandler() {
  const router = useRouter();

  return (error: unknown) => {
    if (error instanceof Error && error.message === 'Authentication required') {
      router.navigate({ to: '/login' });
      return;
    }

    if (
      error instanceof Error &&
      error.message === 'Insufficient permissions'
    ) {
      toast.error("You don't have permission for this action");
      return;
    }

    // Handle other errors
    toast.error('An unexpected error occurred');
  };
}
```

## React Query Integration

### Authentication Queries

```typescript
// src/modules/auth/hooks/use-queries.ts
export const authQueries = {
  currentSession: () =>
    queryOptions({
      queryKey: ['auth', 'current-session'] as const,
      queryFn: () => getCurrentSession(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  permissions: (organizationId?: string) =>
    queryOptions({
      queryKey: ['auth', 'permissions', organizationId] as const,
      queryFn: () =>
        checkPermissions({
          permissions: [], // Will return all user permissions
          organizationId,
        }),
    }),
};

// Custom hooks
export function useCurrentUser() {
  const query = useSuspenseQuery(authQueries.currentSession());
  return query.data.user;
}

export function usePermissions(organizationId?: string) {
  return useQuery(authQueries.permissions(organizationId));
}

export function useHasPermission(permission: string, organizationId?: string) {
  const { data: permissionData } = usePermissions(organizationId);

  return (
    permissionData?.userPermissions?.includes(permission) ||
    permissionData?.userPermissions?.includes('*') ||
    false
  );
}
```

## Permission System Architecture

### Permission Configuration

The permission system uses a declarative configuration approach for maintainability:

```typescript
// src/lib/auth/permissions.ts
const PERMISSION_CONFIG = {
  system: {
    user: ['posts:create'],
    admin: [
      'posts:create',
      'posts:edit',
      'posts:delete',
      'posts:publish',
      'posts:moderate',
      'users:view',
      'users:edit',
      'admin:access',
    ],
    super_admin: [
      'posts:create',
      'posts:edit',
      'posts:delete',
      'posts:publish',
      'posts:moderate',
      'users:view',
      'users:edit',
      'users:delete',
      'users:ban',
      'admin:access',
      'admin:manage',
      'admin:system',
      'system:analytics',
      'system:settings',
      'system:maintenance',
    ],
  },
  organization: {
    member: [],
    admin: ['org:invite', 'org:manage'],
    owner: ['org:invite', 'org:manage', 'org:billing', 'org:delete'],
  },
};
```

### Permission Utilities

```typescript
import {
  computePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/auth/permissions';

// Compute permissions for a user
const permissions = computePermissions('admin', 'owner');

// Check specific permission
const canEdit = hasPermission(user, 'posts:edit');

// Check multiple permissions (OR logic)
const canManage = hasAnyPermission(user, ['posts:edit', 'posts:delete']);

// Check all permissions required (AND logic)
const canFullyManage = hasAllPermissions(user, ['posts:edit', 'posts:delete']);
```

## Account Management APIs

### Session Management

#### Get User Sessions

```typescript
import { getUserSessions } from '@/modules/accounts/api/get-sessions';

export const getUserSessions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const sessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, session.user.id),
      with: {
        metadata: true,
        trustedDevice: true,
        recentActivity: {
          orderBy: desc(sessionActivityLog.timestamp),
          limit: 5,
        },
      },
      orderBy: desc(sessions.createdAt),
    });

    return sessions.map((sessionData) => ({
      ...sessionData,
      isCurrentSession: sessionData.id === session.session.id,
    }));
  },
);

// Return type
type SessionWithDetails = Session & {
  metadata: SessionMetadata | null;
  trustedDevice: TrustedDevice | null;
  recentActivity: SessionActivityLog[];
  isCurrentSession: boolean;
};
```

#### Revoke Session

```typescript
// Reusable schemas for session management
export const RevokeSessionSchema = type({
  sessionId: 'string',
});

export const GetSessionActivitySchema = type({
  sessionId: 'string',
});

export const revokeSession = createServerFn({ method: 'DELETE' })
  .validator((data: unknown) => {
    const result = RevokeSessionSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ sessionId }) => {
    const { headers } = getWebRequest();
    const currentSession = await auth.api.getSession({ headers });

    if (!currentSession?.user) {
      throw new Error('Not authenticated');
    }

    // Verify session ownership
    const sessionToRevoke = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, currentSession.user.id),
      ),
    });

    if (!sessionToRevoke) {
      throw new Error('Session not found');
    }

    // Prevent self-revocation
    if (sessionId === currentSession.session.id) {
      throw new Error('Cannot revoke current session');
    }

    // Revoke the session
    await db.delete(sessions).where(eq(sessions.id, sessionId));

    return { success: true };
  });
```

#### Get Session Activity

```typescript
export const getSessionActivity = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetSessionActivitySchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ sessionId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Verify session ownership
    const targetSession = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, session.user.id),
      ),
    });

    if (!targetSession) {
      throw new Error('Session not found');
    }

    const activity = await db.query.sessionActivityLog.findMany({
      where: eq(sessionActivityLog.sessionId, sessionId),
      orderBy: desc(sessionActivityLog.timestamp),
      limit: 50,
    });

    return activity;
  });
```

## Strategic Context

This authentication API implements comprehensive security patterns including:

- **Multi-session Support** - Users can be authenticated across multiple devices and organization contexts
- **Role-based Access Control** - Declarative permission system with system and organization roles
- **Session Security** - Device fingerprinting, activity tracking, and security scoring
- **Organization Context** - Seamless switching between personal and organization contexts

For implementation patterns and development guidelines, see:

- **[Sessions API Documentation](./sessions.md)** - Detailed session management and security features
- **[Database Schema](./database.md)** - Complete schema with security considerations
- **[Development Guide](../development/index.md)** - Authentication patterns and security best practices
- **[Architecture Overview](../architecture/index.md)** - System-wide authentication integration
