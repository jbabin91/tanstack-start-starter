# Key Architectural Patterns

## ID Generation

- All entities use `nanoid()` from `@/lib/nanoid` with custom alphabet
- Custom alphabet excludes ambiguous characters
- 21 character length for sufficient entropy

## Authentication Flow

- better-auth with multi-session, organization, username plugins
- Auto-creates personal organization for new users
- Email verification required for new accounts
- Organizations have owner/member roles
- Active organization stored in session

## Data Fetching Pattern

Server functions with validation:

```typescript
export const fetchUser = createServerFn()
  .validator(arktypeSchema)
  .handler(async ({ data }) => {
    // Implementation
  });
```

Query definitions:

```typescript
export const userQueries = {
  byId: (id: string) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: () => fetchUser({ data: id }),
    }),
};
```

## Database Patterns

- Drizzle ORM with PostgreSQL
- snake_case naming convention
- Arktype validation for all schemas
- Generated auth schema from better-auth config

## Environment Management

- Uses dotenvx with vault integration
- Configuration in `src/configs/env.ts`
- Client/server environment separation
- Skip validation flag for development

## Email Integration

- Resend for transactional emails
- React Email templates
- Integrated with better-auth flows
- Templates in `src/modules/email/templates/`
