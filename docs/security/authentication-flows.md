# Authentication Flows

This document outlines the complete authentication system implementation using better-auth, including session management, organization context, and security patterns.

## Overview

The authentication system provides:

- **Email/password authentication** with email verification
- **Multi-session support** for multiple device and organization access
- **Role-based permissions** with organization-specific roles
- **Secure session management** with automatic expiration

## Authentication Architecture

### better-auth Configuration

```typescript
// src/lib/auth/server.ts
export const auth = betterAuth({
  database: {
    provider: 'pg',
    url: env.DATABASE_URL,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10,
    }),
    multiSession(),
    username(),
  ],

  // Custom session data
  callbacks: {
    session: {
      jwt: async ({ session, user }) => {
        return {
          ...session,
          user: {
            ...user,
            permissions: await getUserPermissions(
              user.id,
              session.organizationId,
            ),
          },
        };
      },
    },
  },
});
```

## Registration Flow

### 1. User Registration

```typescript
// Registration with email verification
export const register = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      email: t.string().email(),
      password: t.string().min(8),
      name: t.string().min(2),
      username: t.string().min(3),
    }),
  )
  .handler(async (data) => {
    try {
      // Check if email/username already exists
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(users.email, data.email),
          eq(users.username, data.username),
        ),
      });

      if (existingUser) {
        throw new Error(
          existingUser.email === data.email
            ? 'Email already registered'
            : 'Username already taken',
        );
      }

      // Create user with better-auth
      const result = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
          username: data.username,
        },
      });

      // Send verification email
      if (result.user && !result.user.emailVerified) {
        await sendVerificationEmail(result.user.email);
      }

      return {
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
        requiresVerification: !result.user?.emailVerified,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  });
```

### 2. Email Verification Flow

```typescript
export const verifyEmail = createServerFn({ method: 'POST' })
  .validator(t.object({ token: t.string() }))
  .handler(async ({ token }) => {
    try {
      const result = await auth.api.verifyEmail({
        body: { token },
      });

      if (!result.user) {
        throw new Error('Invalid or expired verification token');
      }

      return {
        success: true,
        message: 'Email verified successfully',
        user: result.user,
      };
    } catch (error) {
      throw new Error('Email verification failed');
    }
  });

export const resendVerification = createServerFn({ method: 'POST' })
  .validator(t.object({ email: t.string().email() }))
  .handler(async ({ email }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    await sendVerificationEmail(email);

    return {
      success: true,
      message: 'Verification email sent',
    };
  });
```

## Login Flow

### Standard Login

```typescript
export const login = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      email: t.string().email(),
      password: t.string(),
      rememberMe: t.boolean().optional(),
    }),
  )
  .handler(async ({ email, password, rememberMe }) => {
    const { headers } = getWebRequest();

    try {
      const result = await auth.api.signInEmail({
        body: { email, password },
        headers,
      });

      if (!result.user) {
        throw new Error('Invalid email or password');
      }

      if (!result.user.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      // Extend session if remember me is checked
      if (rememberMe && result.session) {
        await extendSession(result.session.id);
      }

      return {
        success: true,
        user: result.user,
        session: result.session,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  });
```

### Organization Context Login

```typescript
export const loginWithOrganization = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      email: t.string().email(),
      password: t.string(),
      organizationSlug: t.string().optional(),
    }),
  )
  .handler(async ({ email, password, organizationSlug }) => {
    // First, authenticate user
    const loginResult = await login({ email, password });

    if (!loginResult.success || !loginResult.user) {
      return loginResult;
    }

    // If organization specified, switch context
    if (organizationSlug) {
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.slug, organizationSlug),
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Verify membership
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.userId, loginResult.user.id),
          eq(organizationMembers.organizationId, organization.id),
        ),
      });

      if (!membership) {
        throw new Error('Not a member of this organization');
      }

      // Update session with organization context
      await switchOrganization({ organizationId: organization.id });
    }

    return loginResult;
  });
```

## Multi-Session Management

### Session Creation and Management

```typescript
export const createSession = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
      deviceName: t.string().optional(),
    }),
  )
  .handler(async ({ organizationId, deviceName }) => {
    const { headers } = getWebRequest();
    const currentSession = await auth.api.getSession({ headers });

    if (!currentSession?.user) {
      throw new Error('Authentication required');
    }

    // Create additional session
    const newSession = await auth.api.createSession({
      userId: currentSession.user.id,
      organizationId,
      metadata: {
        deviceName: deviceName || 'Unknown Device',
        createdAt: new Date().toISOString(),
      },
    });

    return newSession;
  });

export const listUserSessions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const sessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, session.user.id),
      columns: {
        id: true,
        createdAt: true,
        expiresAt: true,
        organizationId: true,
      },
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: desc(sessions.createdAt),
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === session.session.id,
    }));
  },
);

export const revokeSession = createServerFn({ method: 'DELETE' })
  .validator(t.object({ sessionId: t.string() }))
  .handler(async ({ sessionId }) => {
    const { headers } = getWebRequest();
    const currentSession = await auth.api.getSession({ headers });

    if (!currentSession?.user) {
      throw new Error('Authentication required');
    }

    // Verify session belongs to user
    const targetSession = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, currentSession.user.id),
      ),
    });

    if (!targetSession) {
      throw new Error('Session not found');
    }

    if (sessionId === currentSession.session.id) {
      throw new Error('Cannot revoke current session');
    }

    await auth.api.revokeSession(sessionId);

    return { success: true };
  });
```

## Password Management

### Password Reset Flow

```typescript
export const requestPasswordReset = createServerFn({ method: 'POST' })
  .validator(t.object({ email: t.string().email() }))
  .handler(async ({ email }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        success: true,
        message: 'If an account exists, a reset email will be sent',
      };
    }

    try {
      await auth.api.forgetPassword({
        body: { email },
      });

      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      return {
        success: true,
        message: 'If an account exists, a reset email will be sent',
      };
    }
  });

export const resetPassword = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      token: t.string(),
      newPassword: t.string().min(8),
    }),
  )
  .handler(async ({ token, newPassword }) => {
    try {
      const result = await auth.api.resetPassword({
        body: { token, newPassword },
      });

      if (!result.user) {
        throw new Error('Invalid or expired reset token');
      }

      // Revoke all existing sessions for security
      await auth.api.revokeUserSessions(result.user.id);

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new Error('Password reset failed');
    }
  });

export const changePassword = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      currentPassword: t.string(),
      newPassword: t.string().min(8),
    }),
  )
  .handler(async ({ currentPassword, newPassword }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error('Current password is incorrect');
    }
  });
```

## Organization Session Context

### Context Switching

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
      throw new Error('Authentication required');
    }

    // Verify organization membership if switching to org
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

    // Update current session context
    await db
      .update(sessions)
      .set({
        organizationId,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.session.id));

    return {
      success: true,
      organizationId,
    };
  });

export const getCurrentContext = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return { user: null, organization: null };
    }

    let organization = null;
    if (session.session.organizationId) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, session.session.organizationId),
        with: {
          members: {
            where: eq(organizationMembers.userId, session.user.id),
            columns: { role: true, permissions: true },
          },
        },
      });
    }

    return {
      user: session.user,
      organization,
      membership: organization?.members[0] || null,
    };
  },
);
```

## Security Best Practices

### Rate Limiting

```typescript
// Implement rate limiting for auth endpoints
const authRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
) {
  const now = Date.now();
  const record = authRateLimit.get(identifier);

  if (!record || now > record.resetTime) {
    authRateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    throw new Error(
      `Too many attempts. Try again in ${Math.ceil((record.resetTime - now) / 1000 / 60)} minutes`,
    );
  }

  record.count++;
  return true;
}

// Use in login endpoint
export const secureLogin = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      email: t.string().email(),
      password: t.string(),
    }),
  )
  .handler(async ({ email, password }) => {
    const { headers } = getWebRequest();
    const clientIP = headers.get('x-forwarded-for') || 'unknown';

    // Rate limit by IP and email
    checkRateLimit(`login:${clientIP}`);
    checkRateLimit(`login:${email}`, 3);

    return login({ email, password });
  });
```

### Session Security

```typescript
// Session validation middleware
export async function validateSession(requiredPermissions?: string[]) {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  // Check email verification
  if (!session.user.emailVerified) {
    throw new Error('Email verification required');
  }

  // Check session expiration
  if (session.session.expiresAt < new Date()) {
    await auth.api.revokeSession(session.session.id);
    throw new Error('Session expired');
  }

  // Check permissions if required
  if (requiredPermissions?.length) {
    const userPermissions = await getUserPermissions(
      session.user.id,
      session.session.organizationId,
    );

    const hasPermission = requiredPermissions.some(
      (permission) =>
        userPermissions.includes(permission) || userPermissions.includes('*'),
    );

    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }
  }

  return {
    user: session.user,
    session: session.session,
    permissions: userPermissions,
  };
}
```

## Strategic Context

This authentication system implements comprehensive security patterns for:

- **Organization publishing workflows** - Multi-tenant content access and co-authoring permissions
- **Session management** - Multi-device and organization context switching
- **Role-based access control** - Hierarchical permissions across personal and organizational contexts

For related documentation, see:

- **[Sessions API](../api/sessions.md)** - Multi-session management implementation
- **[Organizations API](../api/organizations.md)** - Organization context and membership management
- **[Permissions System](./permissions-system.md)** - Role-based access control details
- **[Database Schema](../api/database.md)** - Authentication and session table schemas
