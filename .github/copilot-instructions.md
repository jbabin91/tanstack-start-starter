# Copilot AI Coding Agent Instructions for tanstack-start-starter

## Project Architecture

- **Stack:** React 19 + TypeScript + Vite + TailwindCSS
- **Routing:** Uses `@tanstack/react-router` (see `src/router.tsx` and generated `routeTree.gen.ts`)
- **State/Data:** Uses `@tanstack/react-query` for data fetching/caching
- **Auth:** Integrated with `better-auth` (see `src/lib/auth/server.ts` and generated schema in `src/lib/db/schemas/auth.ts`)
- **ORM:** Uses Drizzle ORM with Arktype validation (see `src/lib/db/seed.ts`, `src/lib/db/schemas/`)
- **Email:** Transactional emails via Resend (`src/modules/email/lib/resend.ts`)
- **UI:** shadcn/ui components (local in `src/components/ui/`), always fetch latest usage from https://ui.shadcn.com/docs/components

## Developer Workflows

- **Install:** Use `pnpm install` (see `packageManager` in `package.json`)
- **Dev Server:** `pnpm dev`
- **Build:** `pnpm build`
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint` / `pnpm lint:fix`
- **Format:** `pnpm format` / `pnpm format:check`
- **DB Migrations:** `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:reset`, `pnpm db:seed`, `pnpm db:studio`
- **Auth Schema:** `pnpm auth:generate` (generates Drizzle schema from better-auth config)

## Key Patterns & Conventions

- **ID Generation:** All entities use `nanoid` via customAlphabet (see `src/lib/db/schemas/auth.ts`)
- **Address Validation:** Use Arktype for realistic address objects (see `src/lib/db/seed.ts`)
- **UI Composition:** Always import shadcn/ui components from local `@/components/ui/<component>`
- **Sidebar Layout:** Sidebar card uses floating variant with top/bottom margin and rounded corners; parent container must respect nav-bar height (see `src/components/ui/sidebar/sidebar.tsx`)
- **Environment:** Use `.env` and `dotenvx` for environment management
- **Testing:** No explicit test runner found; use Playwright for UI diagnostics if needed

## Integration Points

- **Drizzle ORM:** All DB logic in `src/lib/db/` and `drizzle/`
- **Auth:** All config in `src/lib/auth/server.ts`, schema in `src/lib/db/schemas/auth.ts`
- **Email:** All transactional logic in `src/modules/email/lib/resend.ts`
- **UI:** All reusable UI in `src/components/ui/`, layouts in `src/components/layouts/`
- **Routes:** All app routes in `src/routes/`

## Examples

- **Seed Data:** See `src/lib/db/seed.ts` for realistic user/post/account/session/verification seeding
- **Sidebar:** See `src/components/ui/sidebar/sidebar.tsx` for layout, context, and card styling
- **Email Demo:** See `src/routes/_public/demo/email.tsx` for frontend email form

## External Docs

- **shadcn/ui:** Always fetch latest docs for component usage
- **TanStack Router:** https://tanstack.com/router/v1/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **Better-auth:** https://github.com/better-auth/better-auth

## Commit Message Rules

- Do not commit anything unless explicitly instructed by the user.

### Conventional Commits Format

- **Structure:** `<type>[optional scope]: <description>`
- **Examples:**
  - `feat(auth): implement passwordless login flow`
  - `fix: resolve data fetching race condition`
  - `docs: update API documentation`

#### Type Prefixes

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process, dependencies, or tooling
- `ci`: Changes to CI configuration files and scripts
- `revert`: Revert a previous commit

#### Writing Guidelines

- Start commit message on the first line without any leading blank lines
- Keep the first line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Don't end the subject line with a period
- For complex changes, include a body with more detailed explanation after the subject line, separated by a blank line

#### Breaking Changes

- Indicate breaking changes with an exclamation mark before the colon
- Example: `feat!: remove deprecated API endpoints`
- Alternatively, include `BREAKING CHANGE:` in the commit body

#### Scope Guidelines

- Use scope to indicate the component, module, or area of the codebase
- Keep scope names consistent across the project
- Use lowercase for scope names

#### Format Example

✅ Correct:
feat(auth): add OAuth integration

- Implemented Google OAuth flow
- Added user session management
- Updated login UI components

❌ Incorrect:
[blank line]
feat(auth): add OAuth integration

❌ Incorrect:
🦊 feat(auth): add OAuth integration
