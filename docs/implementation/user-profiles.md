# User Profiles Implementation Guide

This guide provides complete implementation patterns for user profile management, building on the existing database schema and authentication system.

## Database Foundation (Ready)

The user profile system is built on these existing database tables:

```sql
-- Core users table with profile fields ready
users (
  id,
  email,
  username,
  name,
  avatar,
  bio,           -- Ready for profile features
  website,       -- Ready for profile features
  location,      -- Ready for profile features
  email_verified,
  created_at,
  updated_at
)

-- User following relationships (ready for social features)
user_follows (
  id,
  follower_id,   -- References users.id
  following_id,  -- References users.id
  created_at
)
```

All necessary indexes and relationships are already in place.

## API Implementation Patterns

### 1. Get User Profile

Fetch a user profile with public information and optional relationship data.

```typescript
// src/modules/users/api/get-user-profile.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  users,
  userFollows,
  posts,
  organizationMembers,
} from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const GetUserProfileInput = type({
  'userId?': 'string',
  'username?': 'string',
}).pipe((data) => {
  if (!data.userId && !data.username) {
    throw new Error('Either userId or username is required');
  }
  return data;
});

export const getUserProfile = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetUserProfileInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ userId, username }) => {
    const user = await db.query.users.findFirst({
      where: userId ? eq(users.id, userId) : eq(users.username, username!),
      columns: {
        id: true,
        email: false, // Don't expose email publicly
        username: true,
        name: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
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
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user statistics
    const stats = await db
      .select({
        postsCount: count(posts.id),
        followersCount: count(userFollows.followerId),
        followingCount: count(),
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .leftJoin(userFollows, eq(userFollows.followingId, users.id))
      .where(eq(users.id, user.id))
      .groupBy(users.id);

    return {
      ...user,
      stats: stats[0] || {
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
    };
  });
```

### 2. Update User Profile

Allow users to update their own profile information.

```typescript
// src/modules/users/api/update-user-profile.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and, not } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const UpdateUserProfileInput = type({
  'name?': 'string',
  'username?': 'string',
  'avatar?': 'string',
  'bio?': 'string',
  'website?': 'string',
  'location?': 'string',
});

export const updateUserProfile = createServerFn({ method: 'PUT' })
  .validator((data: unknown) => {
    const result = UpdateUserProfileInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
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

    // Validate website URL if provided
    if (updateData.website) {
      try {
        new URL(updateData.website);
      } catch {
        throw new Error('Invalid website URL');
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
        updatedAt: users.updatedAt,
      });

    return updatedUser[0];
  });
```

### 3. Change Email Address

Secure email change with password verification.

```typescript
// src/modules/users/api/change-email.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { sendEmailVerification } from '@/modules/email/api/send-email-verification';

const ChangeEmailInput = type({
  newEmail: 'string.email',
  password: 'string > 0',
});

export const changeEmail = createServerFn({ method: 'PUT' })
  .validator((data: unknown) => {
    const result = ChangeEmailInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ newEmail, password }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify current password using better-auth
    const isValidPassword = await auth.api.verifyPassword({
      password,
      userId: session.user.id,
    });

    if (!isValidPassword) {
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
    await sendEmailVerification({ email: newEmail, userId: session.user.id });

    return { success: true, message: 'Verification email sent to new address' };
  });
```

### 4. User Search and Discovery

Search for users by name or username.

```typescript
// src/modules/users/api/search-users.ts
import { createServerFn } from '@tanstack/react-start';
import { ilike, or, and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, organizationMembers } from '@/lib/db/schemas';

export const searchUsers = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      query: string;
      limit?: number;
      offset?: number;
      organizationId?: string;
    }) => {
      if (data.query.length < 1) {
        throw new Error('Query must be at least 1 character');
      }
      return {
        ...data,
        limit: Math.min(data.limit || 20, 100),
        offset: data.offset || 0,
      };
    },
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

### 5. Delete Account

Secure account deletion with confirmation.

```typescript
// src/modules/users/api/delete-account.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const DeleteAccountInput = type({
  password: 'string > 0',
  confirmText: 'string',
}).pipe((data) => {
  if (data.confirmText !== 'DELETE MY ACCOUNT') {
    throw new Error('Confirmation text does not match');
  }
  return data;
});

export const deleteAccount = createServerFn({ method: 'DELETE' })
  .validator((data: unknown) => {
    const result = DeleteAccountInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ password }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify password using better-auth
    const isValidPassword = await auth.api.verifyPassword({
      password,
      userId: session.user.id,
    });

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Delete user (cascade will handle related data)
    await db.delete(users).where(eq(users.id, session.user.id));

    // Revoke all sessions using better-auth
    await auth.api.revokeUserSessions({ userId: session.user.id });

    return { success: true };
  });
```

## React Query Integration

### Query Options and Hooks

```typescript
// src/modules/users/hooks/use-profile-queries.ts
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getUserProfile, searchUsers } from '@/modules/users/api';

export const userProfileQueries = {
  all: () => ['user-profiles'] as const,

  profile: (userId?: string, username?: string) =>
    queryOptions({
      queryKey: [
        ...userProfileQueries.all(),
        'profile',
        userId,
        username,
      ] as const,
      queryFn: () => getUserProfile({ userId, username }),
      enabled: !!(userId || username),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  search: (query: string, organizationId?: string) =>
    queryOptions({
      queryKey: [
        ...userProfileQueries.all(),
        'search',
        query,
        organizationId,
      ] as const,
      queryFn: () => searchUsers({ query, organizationId }),
      enabled: query.length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
};

// Custom hooks with object parameters (required pattern)
export function useUserProfile({
  userId,
  username,
}: {
  userId?: string;
  username?: string;
}) {
  return useQuery(userProfileQueries.profile(userId, username));
}

export function useUserSearch({
  query,
  organizationId,
}: {
  query: string;
  organizationId?: string;
}) {
  return useQuery(userProfileQueries.search(query, organizationId));
}
```

### Mutation Hooks

```typescript
// src/modules/users/hooks/use-profile-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateUserProfile,
  changeEmail,
  deleteAccount,
} from '@/modules/users/api';
import { userProfileQueries } from './use-profile-queries';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update all profile queries for this user
      queryClient.invalidateQueries({
        queryKey: userProfileQueries.all(),
      });

      // Update auth session cache if it's the current user
      queryClient.setQueryData(['auth', 'current-session'], (oldData: any) => ({
        ...oldData,
        user: { ...oldData?.user, ...updatedUser },
      }));
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

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Redirect to home page will be handled by the component
      window.location.href = '/';
    },
  });
}
```

## Frontend Component Patterns

### Profile Display Component

```typescript
// src/components/profiles/user-profile-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useUserProfile } from '@/modules/users/hooks/use-profile-queries';

type UserProfileCardProps = {
  userId: string;
  className?: string;
};

export function UserProfileCard({ userId, className }: UserProfileCardProps) {
  const { data: user, isLoading, error } = useUserProfile({ userId });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (error || !user) {
    return <div className="text-center p-4">User not found</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {user.bio && <p className="text-sm mb-3">{user.bio}</p>}

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {user.location && (
            <div className="flex items-center">
              <Icons.mapPin className="h-4 w-4 mr-1" />
              {user.location}
            </div>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-foreground"
            >
              <Icons.externalLink className="h-4 w-4 mr-1" />
              Website
            </a>
          )}
        </div>

        <div className="flex space-x-4 mt-4">
          <Badge variant="secondary">
            {user.stats.postsCount} posts
          </Badge>
          <Badge variant="secondary">
            {user.stats.followersCount} followers
          </Badge>
          <Badge variant="secondary">
            {user.stats.followingCount} following
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Profile Edit Form

```typescript
// src/components/profiles/edit-profile-form.tsx
import { useForm } from 'react-hook-form';
import { type } from 'arktype';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/icons';
import { useUpdateProfile } from '@/modules/users/hooks/use-profile-mutations';

// Reusable schema - can be used in forms and server functions
export const ProfileFormSchema = type({
  name: 'string > 0 <= 255',
  username: 'string > 0 <= 50',
  'bio?': 'string <= 500',
  'website?': 'string.url | ""',
  'location?': 'string <= 100',
});

type ProfileFormData = typeof ProfileFormSchema.infer;

type EditProfileFormProps = {
  initialData: ProfileFormData;
  onSuccess: () => void;
};

export function EditProfileForm({ initialData, onSuccess }: EditProfileFormProps) {
  const form = useForm<ProfileFormData>({
    defaultValues: initialData,
  });

  const updateProfile = useUpdateProfile();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Error handling is done by React Query
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full"
        >
          {updateProfile.isPending && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}
```

## Testing Considerations

### API Testing

```typescript
// src/modules/users/api/__tests__/get-user-profile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile } from '../get-user-profile';

// Mock database and auth
vi.mock('@/lib/db');
vi.mock('@/lib/auth');

describe('getUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user profile by ID', async () => {
    // Test implementation
  });

  it('should fetch user profile by username', async () => {
    // Test implementation
  });

  it('should throw error when user not found', async () => {
    // Test implementation
  });

  it('should not expose email in public profile', async () => {
    // Test implementation
  });
});
```

### Component Testing

```typescript
// src/components/profiles/__tests__/user-profile-card.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileCard } from '../user-profile-card';

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('UserProfileCard', () => {
  it('should display user information', async () => {
    renderWithQueryClient(<UserProfileCard userId="user-1" />);

    // Test assertions
  });
});
```

## Security Considerations

1. **Data Privacy** - Email addresses are never exposed in public profiles
2. **Input Validation** - All user inputs are validated both client and server-side
3. **Authentication** - All profile updates require valid session
4. **Authorization** - Users can only update their own profiles
5. **Password Verification** - Sensitive operations require password confirmation
6. **SQL Injection Prevention** - All queries use parameterized statements via Drizzle ORM

## Performance Optimization

1. **Database Indexes** - All foreign keys and frequently queried fields are indexed
2. **Query Optimization** - Selective field loading to minimize data transfer
3. **Caching Strategy** - Appropriate stale times for different data types
4. **Pagination** - Search results are paginated to prevent large data loads

## Integration Points

- **Authentication**: Uses better-auth for session management and password verification
- **Database**: Built on existing users and userFollows tables
- **Email**: Integrates with email verification system for email changes
- **Organizations**: Supports organization membership display in profiles
- **Posts**: Includes post count statistics

This implementation guide provides everything needed to add comprehensive user profile management to the application using the existing architectural foundation.
