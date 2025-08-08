# Authentication API

This document covers all authentication-related server functions and patterns for the TanStack Start blogging platform using better-auth.

## Overview

The authentication system provides:

- **Email/password authentication** with verification
- **Multi-session support** for organization switching
- **Role-based permissions** with organization context
- **Session management** across multiple devices

## Core Authentication Functions

### Session Management

#### Get Current Session

```typescript
// Server function pattern
export const getCurrentSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return { user: null, session: null };
    }

    return {
      user: session.user,
      session: session.session,
      organization: session.session.organizationId
        ? await getOrganization(session.session.organizationId)
        : null,
    };
  },
);

// Client usage
const { data: session } = useQuery({
  queryKey: ['auth', 'current-session'],
  queryFn: () => getCurrentSession(),
});
```

#### Switch Organization Context

```typescript
export const switchOrganization = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
    }),
  )
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
export const checkPermissions = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      permissions: t.array(t.string()),
      organizationId: t.string().optional(),
    }),
  )
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
    validator: (schema: Type) => ({
      handler: (fn: (data: TInput, context: AuthContext) => Promise<TOutput>) =>
        createServerFn(config)
          .validator(schema)
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
  .validator(t.object({ postId: t.string() }))
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
export const sendVerificationEmail = createServerFn({ method: 'POST' })
  .validator(t.object({ email: t.string().email() }))
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
  .validator(t.object({ token: t.string() }))
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

## Strategic Context

This authentication API implements the security patterns outlined in:

- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - Organization publishing workflows and co-authoring permissions
- **[Navigation Architecture](../../.serena/memories/ux_architecture_navigation_design.md)** - Organization context switching and role-based navigation

For implementation patterns and development guidelines, see:

- **[Development Guide](../development/index.md)** - Authentication patterns and security best practices
- **[Architecture Overview](../architecture/index.md)** - System-wide authentication integration
