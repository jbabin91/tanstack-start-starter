# Auth Schema Regeneration Strategy

## Current Custom Modifications to Preserve

When `pnpm auth:generate` needs to be run (for OAuth providers, etc.), these customizations must be manually restored:

### 1. Custom Enums

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
```

### 2. Enhanced User Fields

Additional fields in `users` table:

- `role: systemRoleEnum().default('user')`
- `banned: boolean()`
- `banReason: text()`
- `banExpires: timestamp()`
- `username: text().unique()`
- `displayUsername: text()`
- `address: text()`
- `phone: text()`
- `website: text()`

### 3. Custom ID Generation

All tables use:

```typescript
id: text()
  .primaryKey()
  .$defaultFn(() => nanoid());
```

### 4. Enhanced Sessions Table

Additional fields:

- `activeOrganizationId: text()`

### 5. Drizzle-Arktype Integration

```typescript
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';

// For each table:
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users);

export type InsertUser = typeof insertUserSchema.infer;
export type User = typeof selectUserSchema.infer;
export type UpdateUser = typeof updateUserSchema.infer;
```

### 6. Enhanced Relations

Complete relational mapping between all tables with proper foreign key relations.

### 7. Organization-specific Tables

The entire organizations/members/invitations structure with proper role enums.

## Safe Regeneration Process

When OAuth or other features require schema regeneration:

### Step 1: Backup

```bash
cp src/lib/db/schemas/auth.ts src/lib/db/schemas/auth.ts.custom-backup
```

### Step 2: Document Current Better-Auth Config

```bash
# Take note of current config in src/lib/auth/auth.ts
# including all plugins and settings
```

### Step 3: Regenerate

```bash
pnpm auth:generate
```

### Step 4: Restore Custom Modifications

Manually merge back:

1. Import statements (drizzle-arktype, nanoid)
2. Custom enums at top of file
3. Enhanced user fields
4. Custom ID generation for all tables
5. Session enhancements
6. Organization tables and relations
7. Arktype schema generation
8. All relations

### Step 5: Database Migration

```bash
pnpm db:generate
# Review the migration before applying
pnpm db:migrate
```

## Alternative: Gradual OAuth Integration

Instead of full regeneration, consider:

1. **Manual OAuth account linking** - Add OAuth accounts to existing `accounts` table
2. **Provider-specific fields** - Add OAuth fields manually to current schema
3. **Incremental better-auth adoption** - Add features one at a time with manual schema updates

This preserves all customizations while gaining OAuth functionality.

## Strategic Context

This auth schema regeneration strategy supports the authentication patterns documented in:

- **[Authentication Implementation](../api/auth.md)** - Current auth API patterns
- **[Database Architecture](../architecture/database.md)** - Schema design principles
- **[Development Patterns](./index.md)** - Implementation standards

The custom modifications enable advanced features like:

- **Multi-tenant organizations** with role-based access
- **Enhanced user management** with banning and profile customization
- **Session organization context** for seamless org switching
- **Type-safe validation** with Arktype integration

---

_This document should be consulted before any auth schema regeneration to preserve project customizations._
