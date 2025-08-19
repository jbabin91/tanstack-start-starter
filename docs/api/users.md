# Users API Documentation

This document covers the user management system implementation, including basic user querying with comprehensive database schema support for profiles and user relationships.

## Overview

The users system currently provides:

- **User Querying** - Fetch individual users and user lists with proper type safety
- **Database Schema** - Complete schema supporting profiles, follows, and user relationships
- **Type Safety** - Full TypeScript integration with Drizzle ORM
- **Performance** - Optimized queries with proper indexing

## Current Implementation

The users system currently provides basic user querying functionality with two server functions:

### Get User by ID

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { db, eq } from '@/lib/db';
import { users as usersTable } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';

// Reusable schema - can be used in forms and server functions
export const GetUserInputSchema = type('string');

// src/modules/users/api/get-user.ts
export const fetchUser = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetUserInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async (data) => {
    logger.info(`Fetching user with id ${data}...`);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data));

    if (users.length === 0) {
      throw new Error(`User with id ${data} not found`);
    }

    return users[0];
  });
```

### Get All Users

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { db } from '@/lib/db';
import { users as usersTable } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';

// src/modules/users/api/get-users.ts
export const fetchUsers = createServerFn({ method: 'GET' }).handler(
  async () => {
    logger.info('Fetching users...');

    const users = await db.select().from(usersTable);
    return users;
  },
);
```

## Implementation Guides

While the current implementation provides basic user querying, the database schema supports comprehensive user management features. Complete implementation patterns are available in the **[User Profiles Implementation Guide](../implementation/user-profiles.md)**, including:

- **Profile Management** - Complete user profile CRUD with validation
- **Account Settings** - Email changes, password updates, account deletion
- **User Discovery** - Search and recommendation systems
- **Social Integration** - Ready for following system implementation

### Quick Implementation Reference

```typescript
// Complete user profile management
import {
  getUserProfile,
  updateUserProfile,
} from '../implementation/user-profiles.md#api-implementation-patterns';

// Secure email management
import { changeEmail } from '../implementation/user-profiles.md#change-email-address';

// User search and discovery
import { searchUsers } from '../implementation/user-profiles.md#user-search-and-discovery';
```

For social features including the following system, see the **[Social Features Implementation Guide](../implementation/social-features.md)**.

## React Query Integration

Current query patterns using TkDodo hierarchical structure:

```typescript
// src/modules/users/hooks/use-queries.ts
export const userQueries = {
  all: () => ['users'] as const,
  lists: () => [...userQueries.all(), 'list'] as const,
  list: () =>
    queryOptions({
      queryKey: [...userQueries.lists()],
      queryFn: () => fetchUsers(),
    }),
  details: () => [...userQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => fetchUser({ data: id }),
    }),
};

// Fetch all users
export function useUsers() {
  return useSuspenseQuery(userQueries.list());
}

// Fetch a user by ID
export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.detail(id));
}
```

### Usage Examples

```typescript
// In components - basic user fetching
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUser({ id: userId });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>@{user.username}</p>
    </div>
  );
}

// In components - users list
function UsersList() {
  const { data: users } = useUsers();

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Database Schema Support

The users system uses a comprehensive PostgreSQL schema designed for scalability:

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

-- Organization membership support
organization_members (
  id,
  organization_id,
  user_id,
  role,          -- member, admin, owner
  permissions,   -- JSONB for fine-grained control
  joined_at
)
```

## Strategic Context

This users API provides the foundation for social and collaboration features:

- **User Profiles** - Basic user data with schema ready for bio, website, location
- **Social Features** - Database schema supports following system and user discovery
- **Organization Integration** - Multi-tenant user management with role-based permissions
- **Scalability** - Proper indexing and relationship design for growth

For comprehensive implementations and development guidelines, see:

- **[User Profiles Guide](../implementation/user-profiles.md)** - Complete profile management implementation
- **[Social Features Guide](../implementation/social-features.md)** - Following system and user discovery
- **[Development Guide](../development/index.md)** - User management patterns and best practices
- **[Database Design](../architecture/database.md)** - Complete user schema and relationship design
- **[Authentication API](./auth.md)** - Session management and permission integration
