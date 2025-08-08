# Users API

This document covers all user management server functions for profiles, settings, and account operations.

## Overview

The user management system provides:

- **Profile management** - Update names, avatars, and user information
- **Account settings** - Email preferences and privacy settings
- **User discovery** - Search and browse user profiles
- **Following system** - Social connections between users

## User Profile Functions

### Get User Profile

```typescript
export const getUser = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      userId: t.string().optional(),
      username: t.string().optional(),
    }),
  )
  .handler(async ({ userId, username }) => {
    if (!userId && !username) {
      throw new Error('Either userId or username is required');
    }

    const user = await db.query.users.findFirst({
      where: userId ? eq(users.id, userId) : eq(users.username, username!),
      columns: {
        id: true,
        email: false, // Don't expose email publicly
        username: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
      with: {
        organizationMemberships: {
          where: eq(organizationMembers.role, 'owner'),
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
                slug: true,
                avatar: true,
              },
            },
          },
        },
        // Optional: Include user stats
        _count: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  });
```

### Update User Profile

```typescript
export const updateUserProfile = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      name: t.string().optional(),
      username: t.string().optional(),
      avatar: t.string().optional(),
      bio: t.string().optional(),
      website: t.string().optional(),
      location: t.string().optional(),
    }),
  )
  .handler(async (updateData) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check username availability if updating
    if (updateData.username) {
      const existingUser = await db.query.users.findFirst({
        where: and(
          eq(users.username, updateData.username),
          not(eq(users.id, session.user.id)),
        ),
      });

      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        bio: users.bio,
        website: users.website,
        location: users.location,
      });

    return updatedUser[0];
  });
```

### Change Email Address

```typescript
export const changeEmail = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      newEmail: t.string().email(),
      password: t.string(), // Require password confirmation
    }),
  )
  .handler(async ({ newEmail, password }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify current password
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error('Invalid password');
    }

    // Check if new email is available
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, newEmail),
    });

    if (existingUser) {
      throw new Error('Email is already in use');
    }

    // Update email and mark as unverified
    await db
      .update(users)
      .set({
        email: newEmail,
        emailVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Send verification email to new address
    await sendVerificationEmail({ email: newEmail });

    return { success: true, message: 'Verification email sent to new address' };
  });
```

## User Discovery Functions

### Search Users

```typescript
export const searchUsers = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
      organizationId: t.string().optional(),
    }),
  )
  .handler(async ({ query, limit, offset, organizationId }) => {
    let baseQuery = db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        bio: users.bio,
      })
      .from(users);

    // Add organization filter if specified
    if (organizationId) {
      baseQuery = baseQuery
        .innerJoin(
          organizationMembers,
          eq(organizationMembers.userId, users.id),
        )
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            or(
              ilike(users.name, `%${query}%`),
              ilike(users.username, `%${query}%`),
            ),
          ),
        );
    } else {
      baseQuery = baseQuery.where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.username, `%${query}%`),
        ),
      );
    }

    const searchResults = await baseQuery
      .orderBy(
        // Prioritize exact username matches
        sql`CASE WHEN ${users.username} ILIKE ${query} THEN 0 ELSE 1 END`,
        users.name,
      )
      .limit(limit)
      .offset(offset);

    return searchResults;
  });
```

### Get User Stats

```typescript
export const getUserStats = createServerFn({ method: 'GET' })
  .validator(t.object({ userId: t.string() }))
  .handler(async ({ userId }) => {
    const stats = await db
      .select({
        postsCount: sql<number>`COUNT(DISTINCT ${posts.id})`,
        followersCount: sql<number>`COUNT(DISTINCT ${userFollows.followerId})`,
        followingCount: sql<number>`COUNT(DISTINCT following.following_id)`,
        organizationsCount: sql<number>`COUNT(DISTINCT ${organizationMembers.organizationId})`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .leftJoin(userFollows, eq(userFollows.followingId, users.id))
      .leftJoin(
        alias(userFollows, 'following'),
        eq(sql`following.follower_id`, users.id),
      )
      .leftJoin(organizationMembers, eq(organizationMembers.userId, users.id))
      .where(eq(users.id, userId))
      .groupBy(users.id);

    return (
      stats[0] || {
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        organizationsCount: 0,
      }
    );
  });
```

## Following System Functions

### Follow User

```typescript
export const followUser = createServerFn({ method: 'POST' })
  .validator(t.object({ userId: t.string() }))
  .handler(async ({ userId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    if (userId === session.user.id) {
      throw new Error('Cannot follow yourself');
    }

    // Check if user exists
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Check if already following
    const existingFollow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, session.user.id),
        eq(userFollows.followingId, userId),
      ),
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    // Create follow relationship
    await db.insert(userFollows).values({
      followerId: session.user.id,
      followingId: userId,
    });

    return { success: true };
  });
```

### Unfollow User

```typescript
export const unfollowUser = createServerFn({ method: 'DELETE' })
  .validator(t.object({ userId: t.string() }))
  .handler(async ({ userId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const deleteResult = await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.followingId, userId),
        ),
      )
      .returning({ id: userFollows.id });

    if (deleteResult.length === 0) {
      throw new Error('Not following this user');
    }

    return { success: true };
  });
```

### Get User's Followers

```typescript
export const getUserFollowers = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      userId: t.string(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(async ({ userId, limit, offset }) => {
    const followers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(users.id, userFollows.followerId))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return followers;
  });
```

### Get User's Following

```typescript
export const getUserFollowing = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      userId: t.string(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(async ({ userId, limit, offset }) => {
    const following = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(users.id, userFollows.followingId))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return following;
  });
```

## Account Management Functions

### Delete Account

```typescript
export const deleteAccount = createServerFn({ method: 'DELETE' })
  .validator(
    t.object({
      password: t.string(),
      confirmText: t.string().refine((val) => val === 'DELETE MY ACCOUNT'),
    }),
  )
  .handler(async ({ password, confirmText }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify password
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error('Invalid password');
    }

    // Delete user (cascade will handle related data)
    await db.delete(users).where(eq(users.id, session.user.id));

    // Revoke all sessions
    await auth.api.revokeUserSessions(session.user.id);

    return { success: true };
  });
```

## React Query Integration

### User Queries

```typescript
// src/modules/users/hooks/use-queries.ts
export const userQueries = {
  profile: (userId?: string, username?: string) =>
    queryOptions({
      queryKey: ['users', 'profile', userId, username] as const,
      queryFn: () => getUser({ userId, username }),
      enabled: !!(userId || username),
    }),

  stats: (userId: string) =>
    queryOptions({
      queryKey: ['users', 'stats', userId] as const,
      queryFn: () => getUserStats({ userId }),
    }),

  followers: (userId: string, limit = 20, offset = 0) =>
    queryOptions({
      queryKey: ['users', 'followers', userId, limit, offset] as const,
      queryFn: () => getUserFollowers({ userId, limit, offset }),
    }),

  following: (userId: string, limit = 20, offset = 0) =>
    queryOptions({
      queryKey: ['users', 'following', userId, limit, offset] as const,
      queryFn: () => getUserFollowing({ userId, limit, offset }),
    }),

  search: (query: string, organizationId?: string) =>
    queryOptions({
      queryKey: ['users', 'search', query, organizationId] as const,
      queryFn: () => searchUsers({ query, organizationId }),
      enabled: query.length > 0,
    }),
};

// Custom hooks
export function useUser({
  userId,
  username,
}: {
  userId?: string;
  username?: string;
}) {
  return useQuery(userQueries.profile(userId, username));
}

export function useUserStats({ userId }: { userId: string }) {
  return useQuery(userQueries.stats(userId));
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: (_, { userId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['users', 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'followers', userId],
      });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'followers', userId],
      });
    },
  });
}
```

### Profile Management Hooks

```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update all profile queries for this user
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile'],
      });

      // Update auth session cache if it's the current user
      queryClient.setQueryData(
        ['auth', 'current-session'],
        (oldData: Session | undefined) => ({
          ...oldData,
          user: { ...oldData?.user, ...updatedUser },
        }),
      );
    },
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeEmail,
    onSuccess: () => {
      // Invalidate session to reflect email verification status
      queryClient.invalidateQueries({
        queryKey: ['auth', 'current-session'],
      });
    },
  });
}
```

## Strategic Context

This users API supports the social and collaboration features outlined in:

- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - User profiles and co-authoring workflows
- **[Navigation Architecture](../../.serena/memories/ux_architecture_navigation_design.md)** - User-centric navigation and profile management

For implementation patterns and development guidelines, see:

- **[Development Guide](../development/index.md)** - User management patterns and best practices
- **[Database Design](../architecture/database.md)** - User schema and relationship design
- **[Authentication API](./auth.md)** - Session management and permission integration
