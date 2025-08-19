# Database Schema Documentation

This document provides comprehensive documentation of the PostgreSQL database schema for the TanStack Start blogging platform, including all tables, relationships, and current implementation status.

## Database Architecture Overview

The database uses PostgreSQL with Drizzle ORM and follows these key principles:

- **Modern Drizzle Patterns** - Array syntax for constraints and relations
- **Performance-First Indexing** - Comprehensive indexes for all query patterns
- **Type Safety** - Full TypeScript integration with Arktype validation
- **Better-auth Integration** - Schema designed to work with better-auth plugins
- **Multi-tenancy Support** - Organization-scoped data isolation

## Core Authentication Schema

### Users Table

The central user management table with extended profile fields:

```typescript
// src/lib/db/schemas/auth.ts
export const users = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean()
    .$defaultFn(() => false)
    .notNull(),
  image: text(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),

  // System-level permissions
  role: systemRoleEnum().default('user'), // user, admin, super_admin
  banned: boolean(),
  banReason: text(),
  banExpires: timestamp(),

  // Better-auth username plugin fields
  username: text().unique(),
  displayUsername: text(),

  // Additional profile fields from better-auth config
  address: text(),
  phone: text(),
  website: text(),
});
```

**Key Features:**

- **System roles** - `user`, `admin`, `super_admin` for platform-wide permissions
- **Username support** - Unique usernames with display names
- **Profile fields** - Extended user information
- **Audit trail** - Created/updated timestamps
- **Moderation** - Ban system with reasons and expiration

### Sessions Table

Extended session management with organization context:

```typescript
export const sessions = pgTable('sessions', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Better-auth features
  impersonatedBy: text(), // For admin impersonation
  activeOrganizationId: text(), // Current organization context
});
```

**Integration Points:**

- **Better-auth compatibility** - Works with multi-session plugin
- **Organization context** - Tracks active organization per session
- **Security tracking** - IP and user agent logging
- **Admin features** - Support for user impersonation

### Organizations & Members

Multi-tenant organization system using better-auth organization plugin:

```typescript
export const organizations = pgTable('organizations', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text().notNull(),
  slug: text().unique(),
  logo: text(),
  createdAt: timestamp().notNull(),
  metadata: text(), // JSON metadata
});

export const members = pgTable('members', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  organizationId: text()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: organizationRoleEnum().default('member').notNull(), // member, admin, owner
  createdAt: timestamp().notNull(),
});
```

**Role System:**

- **member** - Basic organization access
- **admin** - Can manage members and content
- **owner** - Full organization control

### Invitations System

Email-based organization invitations:

```typescript
export const invitations = pgTable('invitations', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  organizationId: text()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text().notNull(),
  role: organizationRoleEnum().default('member'),
  status: text().default('pending').notNull(), // pending, accepted, expired
  expiresAt: timestamp().notNull(),
  inviterId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});
```

## Session Metadata & Security Schema

### Session Metadata

Comprehensive session tracking for security and analytics:

```typescript
// src/lib/db/schemas/session-metadata.ts
export const sessionMetadata = pgTable('session_metadata', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  sessionId: text()
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),

  // Device identification
  deviceFingerprint: varchar({ length: 64 }).notNull(), // SHA-256 hash
  deviceType: deviceTypeEnum().notNull().default('unknown'), // mobile, desktop, tablet
  deviceName: varchar({ length: 255 }), // "iPhone 15", "Chrome on MacOS"
  browserName: varchar({ length: 100 }),
  browserVersion: varchar({ length: 50 }),
  osName: varchar({ length: 100 }),
  osVersion: varchar({ length: 50 }),
  isMobile: boolean().notNull().default(false),

  // Location information
  countryCode: varchar({ length: 2 }), // ISO 2-letter
  region: varchar({ length: 100 }),
  city: varchar({ length: 100 }),
  timezone: varchar({ length: 50 }),
  ispName: varchar({ length: 200 }),
  connectionType: connectionTypeEnum().default('unknown'), // wifi, cellular, ethernet

  // Security scoring
  securityScore: integer().notNull().default(50), // 0-100
  isTrustedDevice: boolean().notNull().default(false),
  trustFactors: jsonb().$type<Record<string, any>>(),
  suspiciousActivityCount: integer().notNull().default(0),
  lastSecurityCheck: timestamp({ withTimezone: true }),

  // Activity tracking
  lastActivityAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  pageViewsCount: integer().notNull().default(0),
  requestsCount: integer().notNull().default(0),
  lastPageVisited: text(),
  sessionDurationSeconds: integer().default(0),

  // Timestamps
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**Security Features:**

- **Device fingerprinting** - Unique device identification
- **Geolocation tracking** - Country, region, city detection
- **Security scoring** - Risk assessment algorithms
- **Activity monitoring** - Page views and request tracking

### Trusted Devices

Persistent device trust management:

```typescript
export const trustedDevices = pgTable('trusted_devices', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deviceFingerprint: varchar({ length: 64 }).notNull(),
  deviceName: varchar({ length: 255 }).notNull(),
  deviceType: deviceTypeEnum().notNull(),
  trustLevel: trustLevelEnum().notNull().default('medium'), // high, medium, low
  isActive: boolean().notNull().default(true),

  // Trust lifecycle
  firstSeenAt: timestamp({ withTimezone: true }).notNull(),
  lastSeenAt: timestamp({ withTimezone: true }).notNull(),
  trustedAt: timestamp({ withTimezone: true }).notNull(),
  expiresAt: timestamp({ withTimezone: true }), // Optional expiration
  createdBySessionId: text().references(() => sessions.id, {
    onDelete: 'set null',
  }),

  // Timestamps
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

### Session Activity Log

Comprehensive audit trail for security analysis:

```typescript
export const sessionActivityLog = pgTable('session_activity_log', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  sessionId: text()
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Denormalized for performance

  // Activity details
  activityType: activityTypeEnum().notNull(), // login, logout, page_view, api_request, security_event
  activityDetails: jsonb().$type<Record<string, any>>(), // Flexible event data
  ipAddress: varchar({ length: 45 }), // IPv6 compatible
  userAgent: text(),
  requestPath: text(),
  httpMethod: varchar({ length: 10 }),
  responseStatus: integer(),
  responseTimeMs: integer(),

  // Timestamp
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
```

**Activity Types:**

- **login** - Authentication events
- **logout** - Session termination
- **page_view** - Page navigation
- **api_request** - Server function calls
- **security_event** - Security-related activities
- **error** - Error occurrences

## Content Management Schema

### Posts Table

Core content management with organization support:

```typescript
// src/lib/db/schemas/posts.ts
export const posts = pgTable('posts', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar({ length: 255 }).notNull(),
  body: text().notNull(),
  status: varchar({ length: 20 }).notNull().default('draft'), // draft, published
  slug: varchar({ length: 255 }), // URL-friendly slug
  excerpt: text(), // Short description
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  publishedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**Performance Indexes:**

```typescript
index('posts_user_id_idx').on(table.userId),
index('posts_organization_id_idx').on(table.organizationId),
index('posts_status_idx').on(table.status),
index('posts_slug_idx').on(table.slug),
index('posts_created_at_idx').on(table.createdAt),
index('posts_published_at_idx').on(table.publishedAt),
index('posts_user_created_at_idx').on(table.userId, table.createdAt),
index('posts_status_published_at_idx').on(table.status, table.publishedAt),
```

**Post Workflow:**

- **draft** - Work in progress, not visible publicly
- **published** - Live content, publicly accessible

### Comments System

Threaded comments with moderation capabilities:

```typescript
// src/lib/db/schemas/comments.ts
export const comments = pgTable('comments', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  body: text().notNull(),
  postId: text()
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentId: text().references(() => comments.id, { onDelete: 'cascade' }), // For threading
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**Threading Support:**

- **parentId** - References parent comment for nested conversations
- **Self-referential** - Comments can reply to other comments
- **Cascade deletion** - Deleting parent removes all replies

## Media Management Schema

### Media Table

File storage integration with Cloudflare R2:

```typescript
// src/lib/db/schemas/media.ts
export const media = pgTable('media', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  filename: varchar({ length: 255 }).notNull(),
  originalName: varchar({ length: 255 }).notNull(),
  mimeType: varchar({ length: 100 }).notNull(),
  size: integer().notNull(), // File size in bytes
  url: text().notNull(), // Cloudflare R2 URL
  key: text().notNull(), // R2 object key
  bucket: varchar({ length: 100 }).notNull(), // R2 bucket name

  // Ownership and organization
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text().references(() => organizations.id, {
    onDelete: 'cascade',
  }),

  // Metadata
  alt: text(), // Alt text for accessibility
  caption: text(), // Optional caption
  metadata: text(), // JSON metadata (dimensions, duration, etc.)
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**Storage Integration:**

- **Cloudflare R2** - Object storage for media files
- **URL management** - Direct CDN URLs for fast access
- **Metadata storage** - Flexible JSON metadata for file properties
- **Organization scoping** - Media can belong to organizations

## Database Relations

### Type-Safe Relationships

All schemas include comprehensive Drizzle relations for type-safe joins:

```typescript
// User relationships
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(members),
  posts: many(posts),
  comments: many(comments),
  uploadedMedia: many(media),
  trustedDevices: many(trustedDevices),
}));

// Organization relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
  posts: many(posts),
  media: many(media),
}));

// Post relationships
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [posts.organizationId],
    references: [organizations.id],
  }),
  comments: many(comments),
}));

// Comment relationships with threading
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'parentComment',
  }),
  replies: many(comments, {
    relationName: 'parentComment',
  }),
}));
```

## Performance Optimization

### Indexing Strategy

Every table includes comprehensive indexing for common query patterns:

1. **Single Column Indexes** - All foreign keys and frequently queried fields
2. **Composite Indexes** - Multi-column indexes for complex queries
3. **Unique Constraints** - Prevent duplicate data where appropriate
4. **Partial Indexes** - Conditional indexes for specific use cases

### Query Optimization Examples

```typescript
// Efficient user posts query with organization context
const userPosts = await db.query.posts.findMany({
  where: and(
    eq(posts.userId, userId),
    eq(posts.organizationId, orgId),
    eq(posts.status, 'published'),
  ),
  with: {
    author: {
      columns: { id: true, name: true, username: true },
    },
    organization: {
      columns: { id: true, name: true, slug: true },
    },
  },
  orderBy: [desc(posts.publishedAt)],
  limit: 20,
});

// Efficient session lookup with metadata
const sessionWithDetails = await db.query.sessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: {
    user: {
      columns: { id: true, name: true, email: true },
    },
    metadata: true,
    activityLog: {
      orderBy: desc(sessionActivityLog.createdAt),
      limit: 10,
    },
  },
});
```

## Type Safety & Validation

### Arktype Integration

All schemas include full Arktype validation schemas:

```typescript
import { type } from 'arktype';

// Generated validation schemas using Arktype
export const InsertUserSchema = type({
  email: 'string',
  username: 'string',
  name: 'string',
  'avatar?': 'string',
  'emailVerified?': 'boolean',
  'role?': '"user" | "admin" | "super_admin"',
  'banned?': 'boolean',
  'banReason?': 'string',
  'banExpires?': 'Date',
  'displayUsername?': 'string',
  'address?': 'string',
  'phone?': 'string',
  'website?': 'string',
});

export const SelectUserSchema = type({
  id: 'string',
  email: 'string',
  username: 'string',
  name: 'string',
  'avatar?': 'string',
  emailVerified: 'boolean',
  role: '"user" | "admin" | "super_admin"',
  'banned?': 'boolean',
  'banReason?': 'string',
  'banExpires?': 'Date',
  'displayUsername?': 'string',
  'address?': 'string',
  'phone?': 'string',
  'website?': 'string',
  createdAt: 'Date',
  updatedAt: 'Date',
});

export const UpdateUserSchema = type({
  'name?': 'string',
  'avatar?': 'string',
  'displayUsername?': 'string',
  'address?': 'string',
  'phone?': 'string',
  'website?': 'string',
});

// TypeScript types
export type InsertUser = typeof InsertUserSchema.infer;
export type User = typeof SelectUserSchema.infer;
export type UpdateUser = typeof UpdateUserSchema.infer;
```

### Enum Type Safety

PostgreSQL enums provide compile-time type safety:

```typescript
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
export const deviceTypeEnum = pgEnum('device_type', [
  'mobile',
  'desktop',
  'tablet',
  'unknown',
]);
export const activityTypeEnum = pgEnum('activity_type', [
  'login',
  'logout',
  'page_view',
  'api_request',
  'security_event',
  'error',
]);

// Usage in TypeScript
export type SystemRole = (typeof systemRoleEnum.enumValues)[number];
export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];
```

## Implementation Status

### ✅ Completed Tables

1. **users** - Full user management with better-auth integration
2. **sessions** - Extended session tracking with organization context
3. **accounts** - Better-auth account linking for OAuth providers
4. **verifications** - Email verification and password reset tokens
5. **organizations** - Basic organization structure
6. **members** - Organization membership with roles
7. **invitations** - Email-based organization invitations
8. **sessionMetadata** - Comprehensive session tracking
9. **trustedDevices** - Device trust management
10. **sessionActivityLog** - Security audit logging
11. **posts** - Content management with organization support
12. **comments** - Threaded comment system
13. **media** - File storage with Cloudflare R2 integration

### 🚧 Schema Extensions Needed

Based on Task Master analysis, several schema enhancements are planned:

1. **Post versioning** - Content history and draft management
2. **Full-text search** - PostgreSQL GIN indexes for search
3. **Tag system** - Post categorization and discovery
4. **User follows** - Social features and activity feeds
5. **Email analytics** - Email delivery tracking and analytics

## Migration Management

### Database Migrations

Migrations are managed through Drizzle Kit:

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Open database studio for inspection
pnpm db:studio
```

### Migration Best Practices

1. **Always generate migrations** - Never modify database directly
2. **Test migrations** - Verify on development before production
3. **Backup before migrations** - Ensure data safety
4. **Index management** - Add indexes in separate migrations for large tables

## Security Considerations

### Data Protection

1. **Cascade Deletes** - Proper cleanup of related data
2. **Organization Isolation** - Data scoped to organizations
3. **Audit Trails** - Comprehensive activity logging
4. **Device Tracking** - Security monitoring and anomaly detection

### Performance Security

1. **Query Optimization** - Prevent N+1 queries with relations
2. **Index Coverage** - All query patterns properly indexed
3. **Connection Pooling** - Efficient database connection management
4. **Rate Limiting** - Prevent database abuse

For implementation examples and usage patterns, see:

- [Sessions API](./sessions.md) - Session management implementation
- [Organizations API](./organizations.md) - Multi-tenancy patterns
- [Development Guide](../development/index.md) - Database usage patterns
- [Architecture Overview](../architecture/database.md) - Design decisions
