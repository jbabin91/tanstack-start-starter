# Database Architecture

This document details the PostgreSQL database schema design, optimization strategies, and performance considerations for the TanStack Start blogging platform.

## Database Design Principles

### Modern Drizzle Patterns

- **Array syntax** `(table) => []` for constraints (NOT deprecated object format)
- **Performance indexing** on all foreign keys and frequently queried fields
- **Explicit cascade behavior** with `onDelete: 'cascade'` or `onDelete: 'set null'`
- **Timezone-aware timestamps** with `timestamp({ withTimezone: true })`

### PostgreSQL Optimization

- **Full-text search** using PostgreSQL native capabilities
- **Proper indexing strategy** for query performance
- **Composite indexes** for common query patterns
- **JSONB columns** for flexible metadata storage

## Core Schema

### Users & Authentication

```typescript
// Core user table
export const users = pgTable(
  'users',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    email: varchar({ length: 255 }).notNull().unique(),
    username: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 255 }).notNull(),
    avatar: text(),
    emailVerified: boolean().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_username_idx').on(table.username),
    index('users_created_at_idx').on(table.createdAt),
  ],
);

// Sessions with organization context
export const sessions = pgTable(
  'sessions',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text().references(() => organizations.id, {
      onDelete: 'set null',
    }),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_idx').on(table.token),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);
```

### Organizations & Multi-tenancy

```typescript
export const organizations = pgTable(
  'organizations',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 100 }).notNull().unique(),
    description: text(),
    avatar: text(),
    website: text(),
    settings: jsonb().$type<OrganizationSettings>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('organizations_slug_idx').on(table.slug),
    index('organizations_created_at_idx').on(table.createdAt),
  ],
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar({ length: 50 }).notNull().default('member'), // member, admin, owner
    permissions: jsonb().$type<string[]>(),
    invitedBy: text().references(() => users.id, { onDelete: 'set null' }),
    joinedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('org_members_org_id_idx').on(table.organizationId),
    index('org_members_user_id_idx').on(table.userId),
    index('org_members_role_idx').on(table.role),
    // Composite indexes for common queries
    index('org_members_org_user_idx').on(table.organizationId, table.userId),
    // Unique constraint
    unique('unique_org_member').on(table.organizationId, table.userId),
  ],
);
```

### Content Management

```typescript
export const posts = pgTable(
  'posts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar({ length: 500 }).notNull(),
    slug: varchar({ length: 200 }).notNull(),
    content: text(),
    excerpt: text(),
    status: varchar({ length: 20 }).notNull().default('draft'), // draft, published, archived
    publishingType: varchar({ length: 20 }).default('personal'), // personal, organization_member, organization_official

    // Authorship
    authorId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text().references(() => organizations.id, {
      onDelete: 'set null',
    }),

    // Content metadata
    readingTime: integer().default(0),
    wordCount: integer().default(0),
    featuredImage: text(),

    // SEO and social
    metaTitle: varchar({ length: 255 }),
    metaDescription: varchar({ length: 500 }),
    socialImage: text(),

    // Publishing workflow
    submittedAt: timestamp({ withTimezone: true }),
    publishedAt: timestamp({ withTimezone: true }),
    lastReviewedAt: timestamp({ withTimezone: true }),
    reviewedBy: text().references(() => users.id, { onDelete: 'set null' }),

    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Primary indexes for common queries
    index('posts_author_id_idx').on(table.authorId),
    index('posts_organization_id_idx').on(table.organizationId),
    index('posts_status_idx').on(table.status),
    index('posts_published_at_idx').on(table.publishedAt),

    // Composite indexes for complex queries
    index('posts_status_published_at_idx').on(table.status, table.publishedAt),
    index('posts_author_status_idx').on(table.authorId, table.status),
    index('posts_org_status_idx').on(table.organizationId, table.status),

    // Full-text search index
    index('posts_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.content})`,
    ),

    // Unique slug per organization (or global if no org)
    unique('unique_post_slug').on(table.slug, table.organizationId),
  ],
);

// Co-authoring support
export const postCoAuthors = pgTable(
  'post_co_authors',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    postId: text()
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar({ length: 20 }).notNull().default('editor'), // editor, viewer, reviewer
    invitedBy: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    acceptedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('co_authors_post_id_idx').on(table.postId),
    index('co_authors_user_id_idx').on(table.userId),
    unique('unique_co_author').on(table.postId, table.userId),
  ],
);

// Draft management and auto-save
export const drafts = pgTable(
  'drafts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    postId: text().references(() => posts.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text(),
    content: text(),
    metadata: jsonb().$type<DraftMetadata>(),
    isAutoSave: boolean().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('drafts_post_id_idx').on(table.postId),
    index('drafts_user_id_idx').on(table.userId),
    index('drafts_updated_at_idx').on(table.updatedAt),
  ],
);
```

### Search & Discovery

```typescript
export const postTags = pgTable(
  'post_tags',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    postId: text()
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tag: varchar({ length: 100 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('post_tags_post_id_idx').on(table.postId),
    index('post_tags_tag_idx').on(table.tag),
    unique('unique_post_tag').on(table.postId, table.tag),
  ],
);

export const userFollows = pgTable(
  'user_follows',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    followerId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('follows_follower_id_idx').on(table.followerId),
    index('follows_following_id_idx').on(table.followingId),
    unique('unique_follow').on(table.followerId, table.followingId),
  ],
);

export const postViews = pgTable(
  'post_views',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    postId: text()
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text().references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: varchar({ length: 45 }),
    userAgent: text(),
    viewedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('post_views_post_id_idx').on(table.postId),
    index('post_views_user_id_idx').on(table.userId),
    index('post_views_viewed_at_idx').on(table.viewedAt),
    // Composite for unique view tracking
    index('post_views_post_user_idx').on(table.postId, table.userId),
  ],
);
```

## Search Optimization

### Full-Text Search Implementation

```sql
-- PostgreSQL full-text search configuration
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search index on posts
CREATE INDEX posts_search_idx ON posts
USING gin(to_tsvector('english', title || ' ' || content));

-- Trigram indexes for fuzzy matching
CREATE INDEX posts_title_trgm_idx ON posts
USING gin(title gin_trgm_ops);

-- Combined search function
CREATE OR REPLACE FUNCTION search_posts(
  search_term TEXT,
  organization_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id TEXT,
  title VARCHAR,
  excerpt TEXT,
  author_name VARCHAR,
  organization_name VARCHAR,
  published_at TIMESTAMP,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.excerpt,
    u.name as author_name,
    o.name as organization_name,
    p.published_at,
    ts_rank(to_tsvector('english', p.title || ' ' || p.content),
            plainto_tsquery('english', search_term)) as search_rank
  FROM posts p
  JOIN users u ON p.author_id = u.id
  LEFT JOIN organizations o ON p.organization_id = o.id
  WHERE
    p.status = 'published'
    AND (organization_filter IS NULL OR p.organization_id = organization_filter)
    AND (
      to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', search_term)
      OR p.title ILIKE '%' || search_term || '%'
    )
  ORDER BY search_rank DESC, p.published_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization

### Index Strategy

```typescript
// Example of comprehensive indexing strategy
export const posts = pgTable(
  'posts',
  {
    // ... column definitions
  },
  (table) => [
    // Single column indexes for basic queries
    index('posts_author_id_idx').on(table.authorId),
    index('posts_status_idx').on(table.status),
    index('posts_published_at_idx').on(table.publishedAt),

    // Composite indexes for complex queries
    index('posts_status_published_idx').on(table.status, table.publishedAt),
    index('posts_author_status_idx').on(table.authorId, table.status),

    // Partial indexes for specific conditions
    index('posts_published_recent_idx')
      .on(table.publishedAt)
      .where(sql`${table.status} = 'published'`),

    // Full-text search
    index('posts_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.content})`,
    ),
  ],
);
```

### Query Patterns

```typescript
// Efficient relational queries with Drizzle
const getPostsWithAuthors = async (organizationId?: string) => {
  return await db.query.posts.findMany({
    where: organizationId
      ? and(
          eq(posts.organizationId, organizationId),
          eq(posts.status, 'published'),
        )
      : eq(posts.status, 'published'),
    with: {
      author: {
        columns: { id: true, name: true, username: true, avatar: true },
      },
      organization: {
        columns: { id: true, name: true, slug: true },
      },
      tags: true,
    },
    orderBy: desc(posts.publishedAt),
    limit: 20,
  });
};

// Search with full-text capabilities
const searchPosts = async (query: string, organizationId?: string) => {
  return await db.execute(sql`
    SELECT p.*, u.name as author_name, o.name as org_name,
           ts_rank(to_tsvector('english', p.title || ' ' || p.content), 
                   plainto_tsquery('english', ${query})) as rank
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE p.status = 'published'
      AND ${organizationId ? sql`p.organization_id = ${organizationId}` : sql`1=1`}
      AND to_tsvector('english', p.title || ' ' || p.content) 
          @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC, p.published_at DESC
    LIMIT 20
  `);
};
```

## Migration Strategy

### Schema Evolution

```typescript
// Example migration pattern
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

// Add new column with proper indexing
export async function up(db: any) {
  // Add column
  await db.execute(sql`
    ALTER TABLE posts 
    ADD COLUMN reading_time INTEGER DEFAULT 0
  `);

  // Add index
  await db.execute(sql`
    CREATE INDEX posts_reading_time_idx ON posts(reading_time)
  `);

  // Backfill data
  await db.execute(sql`
    UPDATE posts 
    SET reading_time = GREATEST(1, LENGTH(content) / 250)
    WHERE content IS NOT NULL
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    DROP INDEX IF EXISTS posts_reading_time_idx
  `);
  await db.execute(sql`
    ALTER TABLE posts DROP COLUMN IF EXISTS reading_time
  `);
}
```

## Monitoring & Maintenance

### Performance Monitoring

```sql
-- Query to identify slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

### Maintenance Tasks

```sql
-- Regular maintenance (run via cron)
VACUUM ANALYZE;
REINDEX DATABASE your_db_name;

-- Update full-text search statistics
ANALYZE posts;
```

## Strategic Context

This database architecture implements the data requirements defined in our strategic planning:

- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - Co-authoring, draft management, and publishing workflows
- **[Search & Discovery System](../../.serena/memories/search_discovery_system_design.md)** - Full-text search optimization and content discovery
- **[Organization Architecture](../../.serena/memories/ux_architecture_navigation_design.md)** - Multi-tenant organization support

For implementation patterns and development guidelines, see:

- **[Development Guide](../development/index.md)** - Database patterns and query optimization
- **[Architecture Overview](./index.md)** - Overall system architecture
- **[API Documentation](../api/index.md)** - Server function implementations
