# Posts API Documentation

This document covers the posts management system implementation, including basic content querying with database schema support for advanced features.

## Overview

The posts system currently provides:

- **Content Querying** - Fetch posts by ID and user with proper type safety
- **Database Schema** - Complete schema supporting drafts, co-authoring, and organization workflows
- **Type Safety** - Full TypeScript integration with Drizzle ORM
- **Performance** - Optimized queries with proper indexing

## Core Posts API

### Get Post by ID

Fetch a single post by its unique identifier.

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { db, eq } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';
import { fetchPostById } from '@/modules/posts/api/get-post';

// Reusable schema - can be used in forms and server functions
export const GetPostInputSchema = type('string');

export const fetchPostById = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetPostInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async (data) => {
    logger.info(`Fetching post with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, data));

    if (posts.length === 0) {
      throw new Error(`Post with id ${data} not found`);
    }

    return posts[0];
  });

// Client usage
const { data: post } = useQuery({
  queryKey: ['posts', postId],
  queryFn: () => fetchPostById(postId),
});
```

**Parameters:**

- `data: string` - The post ID to fetch

**Returns:**

```typescript
type Post = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';
  publishingType: 'personal' | 'organization_member' | 'organization_official';
  authorId: string;
  organizationId: string | null;
  readingTime: number;
  wordCount: number;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  socialImage: string | null;
  submittedAt: Date | null;
  publishedAt: Date | null;
  lastReviewedAt: Date | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### Get Posts by User

Fetch all posts authored by a specific user.

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { db, eq } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';
import { fetchPostsByUserId } from '@/modules/posts/api/get-posts-by-user';

export const GetPostsByUserInputSchema = type('string');

export const fetchPostsByUserId = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetPostsByUserInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async (data) => {
    logger.info(`Fetching posts for user with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, data));

    return posts;
  });

// Client usage
const { data: userPosts } = useQuery({
  queryKey: ['posts', 'by-user', userId],
  queryFn: () => fetchPostsByUserId(userId),
});
```

**Parameters:**

- `data: string` - The user ID to fetch posts for

**Returns:** `Post[]` - Array of posts authored by the user

## Database Schema Integration

The posts system leverages a comprehensive database schema with support for advanced features:

### Core Post Table

```sql
posts (
  id                  TEXT PRIMARY KEY,
  title               VARCHAR(500) NOT NULL,
  slug                VARCHAR(200) NOT NULL,
  content             TEXT,
  excerpt             TEXT,
  status              VARCHAR(20) DEFAULT 'draft',
  publishing_type     VARCHAR(20) DEFAULT 'personal',

  -- Authorship
  author_id           TEXT NOT NULL REFERENCES users(id),
  organization_id     TEXT REFERENCES organizations(id),

  -- Content metadata
  reading_time        INTEGER DEFAULT 0,
  word_count          INTEGER DEFAULT 0,
  featured_image      TEXT,

  -- SEO and social
  meta_title          VARCHAR(255),
  meta_description    VARCHAR(500),
  social_image        TEXT,

  -- Publishing workflow
  submitted_at        TIMESTAMP,
  published_at        TIMESTAMP,
  last_reviewed_at    TIMESTAMP,
  reviewed_by         TEXT REFERENCES users(id),

  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
```

### Related Tables

**Co-authoring Support:**

```sql
post_co_authors (
  id           TEXT PRIMARY KEY,
  post_id      TEXT NOT NULL REFERENCES posts(id),
  user_id      TEXT NOT NULL REFERENCES users(id),
  role         VARCHAR(20) DEFAULT 'editor',
  invited_by   TEXT NOT NULL REFERENCES users(id),
  accepted_at  TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Draft Management:**

```sql
drafts (
  id           TEXT PRIMARY KEY,
  post_id      TEXT REFERENCES posts(id),
  user_id      TEXT NOT NULL REFERENCES users(id),
  title        TEXT,
  content      TEXT,
  metadata     JSONB,
  is_auto_save BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

**Tags and Categories:**

```sql
post_tags (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id),
  tag        VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

post_categories (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL REFERENCES posts(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  created_at  TIMESTAMP DEFAULT NOW()
);
```

## React Query Integration

### Query Patterns

The posts system uses TanStack Query for type-safe client-side data management:

```typescript
// src/modules/posts/hooks/use-queries.ts
export const postQueries = {
  all: () => ['posts'] as const,

  details: () => [...postQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...postQueries.details(), id],
      queryFn: () => fetchPostById(id),
    }),

  byUser: (userId: string) =>
    queryOptions({
      queryKey: [...postQueries.all(), 'by-user', userId],
      queryFn: () => fetchPostsByUserId(userId),
    }),
};

// Custom hooks with object parameters (required pattern)
export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(postQueries.detail(id));
}

export function usePostWithLoading({
  id,
  enabled = true,
}: {
  id?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...postQueries.detail(id ?? ''),
    enabled: enabled && !!id,
  });
}

export function useUserPosts({ userId }: { userId: string }) {
  return useQuery(postQueries.byUser(userId));
}
```

### Cache Management

```typescript
// Invalidate all posts
queryClient.invalidateQueries({ queryKey: postQueries.all() });

// Invalidate specific user's posts
queryClient.invalidateQueries({
  queryKey: postQueries.byUser(userId).queryKey,
});

// Update specific post cache
queryClient.setQueryData(
  postQueries.detail(postId).queryKey,
  (old: Post | undefined) => {
    if (!old) return old;
    return { ...old, title: 'Updated Title' };
  },
);
```

## Performance Considerations

### Query Optimization

- **Indexes**: All foreign keys and frequently queried fields are indexed
- **Type Safety**: Full TypeScript integration prevents runtime errors
- **Efficient Queries**: Direct database queries without unnecessary joins
- **Proper Error Handling**: Graceful error responses with meaningful messages

### Caching Strategy

- **5-minute stale time** for post details
- **1-minute stale time** for post lists
- **Background refetch** on window focus
- **Optimistic updates** for mutations

## Error Handling

### Post Access Errors

```typescript
export function usePostErrorHandler() {
  const router = useRouter();

  return (error: unknown) => {
    if (error instanceof Error) {
      switch (error.message) {
        case 'Post with id ${id} not found':
          router.navigate({ to: '/404' });
          break;
        default:
          toast.error('An error occurred while loading the post');
      }
    }
  };
}
```

## Publishing Workflows

### Publishing Types

The database schema supports three publishing types:

1. **Personal** (`personal`) - Individual user posts
2. **Organization Member** (`organization_member`) - Posts by org members
3. **Organization Official** (`organization_official`) - Official org content

### Status Workflow

Posts can progress through these statuses:

```txt
draft → published → archived
  ↓
submitted → reviewed → published
```

**Status Values:**

- `draft` - Work in progress, not visible publicly
- `published` - Live and visible to appropriate audiences
- `archived` - No longer active but preserved

## Strategic Context

The posts API provides the foundation for content management with:

- **Simple Implementation** - Basic querying with comprehensive database schema
- **Type Safety** - Full TypeScript integration with Drizzle ORM
- **Extensibility** - Database schema supports advanced features like co-authoring and workflows
- **Performance** - Optimized queries with proper indexing

## Implementation Guides

While the current implementation provides basic querying, the database schema supports comprehensive content management features. Complete implementation patterns are available in the **[Content Creation Implementation Guide](../implementation/content-creation.md)**, including:

- **Post Creation & Editing** - Complete CRUD operations with validation
- **Draft Management** - Auto-save functionality and draft workflows
- **Publishing Workflows** - Review processes and organization publishing
- **Co-authoring System** - Invitation and collaborative editing features
- **Metadata Management** - SEO, social sharing, and content optimization

### Quick Implementation Reference

```typescript
// Full post creation with draft support
import { createPost } from '../implementation/content-creation.md#create-new-post';

// Auto-save draft functionality
import { saveDraft } from '../implementation/content-creation.md#draft-auto-save';

// Co-author invitation system
import { inviteCoAuthor } from '../implementation/content-creation.md#co-author-management';
```

For implementation patterns and development guidelines, see:

- **[Content Creation Guide](../implementation/content-creation.md)** - Complete post management implementation
- **[Database Schema](../architecture/database.md)** - Complete schema with relations and indexes
- **[Authentication API](./auth.md)** - User context and permission checking
- **[Development Guide](../development/index.md)** - Query patterns and performance optimization
- **[Architecture Overview](../architecture/index.md)** - System-wide content management integration
