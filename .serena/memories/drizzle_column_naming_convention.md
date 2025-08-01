# Drizzle Column Naming Convention

## Key Configuration

```typescript
// drizzle.config.ts
casing: 'snake_case';
```

## Naming Rules

### ✅ CORRECT - Let Drizzle Handle Conversion

```typescript
// Drizzle automatically converts camelCase → snake_case
sessionId: text(); // → session_id in DB
deviceFingerprint: varchar({ length: 64 }); // → device_fingerprint in DB
lastActivityAt: timestamp({ withTimezone: true }); // → last_activity_at in DB
isTrustedDevice: boolean(); // → is_trusted_device in DB
```

### ❌ WRONG - Redundant Explicit Naming

```typescript
// DON'T do this - it's redundant with casing: 'snake_case'
sessionId: text('session_id'); // Redundant column name
deviceFingerprint: varchar('device_fingerprint', { length: 64 }); // Redundant
lastActivityAt: timestamp('last_activity_at', { withTimezone: true }); // Redundant
```

## When to Use Explicit Column Names

Only use explicit column names when:

1. **Overriding automatic conversion:**

   ```typescript
   specialField: text('custom_db_name');
   ```

2. **Using reserved keywords:**

   ```typescript
   order: integer('order_column'); // 'order' is SQL reserved word
   ```

3. **Non-standard naming patterns:**

   ```typescript
   metadata: jsonb('meta_data'); // Want underscore in different place
   ```

## Applied Changes

Fixed `src/lib/db/schemas/session-metadata.ts` by removing redundant column names:

- All `text('column_name')` → `text()`
- All `varchar('column_name', { length: N })` → `varchar({ length: N })`
- All `timestamp('column_name', { withTimezone: true })` → `timestamp({ withTimezone: true })`
- All `enumType('column_name')` → `enumType()`

## Benefits

- **Cleaner code:** Less repetitive column naming
- **Consistency:** Relies on project's casing configuration
- **Maintainability:** One place to control naming convention
- **Type safety:** Drizzle handles conversion automatically
