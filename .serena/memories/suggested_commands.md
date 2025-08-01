# Essential Development Commands

## Development

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Code Quality (MUST RUN AFTER TASKS)

- `pnpm lint` / `pnpm lint:fix` - ESLint with auto-fix (max warnings: 0)
- `pnpm format` / `pnpm format:check` - Prettier formatting with Tailwind plugin
- `pnpm typecheck` - TypeScript type checking

## Database Operations

- `pnpm db:generate` - Generate Drizzle migrations from schema changes
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database (drops all tables)
- `pnpm db:seed` - Seed database with sample data using faker
- `pnpm db:studio` - Open Drizzle Studio for database inspection

## Authentication Schema

- `pnpm auth:generate` - Generate auth schema from better-auth config (run after auth config changes)

## Environment Management

- `pnpm env:pull` - Pull environment variables from dotenv vault
- `pnpm env:push` - Push environment variables to dotenv vault

## System Commands (Darwin)

- Standard Unix commands: `git`, `ls`, `cd`, `grep`, `find`
- Package manager: `pnpm` (required, not npm/yarn)
