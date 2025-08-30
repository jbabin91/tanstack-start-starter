# Development Workflow & Commands

## Essential Daily Commands

### Development Server

- `pnpm dev` - Start development server (<http://localhost:3000>)
- `pnpm storybook` - Start Storybook component development (<http://localhost:6006>)

### Code Quality (CRITICAL - Zero tolerance policy)

- `pnpm lint` - Run ESLint (must pass with zero warnings)
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check Prettier formatting
- `pnpm typecheck` - TypeScript type checking
- `pnpm lint:md` - Markdown linting
- `pnpm lint:md:fix` - Auto-fix markdown issues

### Testing

- `pnpm test` - Run unit tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Open Vitest UI
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e:ui` - Open Playwright UI
- `pnpm test:storybook` - Run Storybook tests

### Database

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset database

### Build & Deployment

- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm build-storybook` - Build Storybook

## Task Completion Checklist

When completing any coding task:

1. **Code Quality Checks (MANDATORY)**:
   - Run `pnpm lint:fix` - Fix all ESLint issues
   - Run `pnpm format` - Format all code
   - Run `pnpm typecheck` - Ensure no TypeScript errors
   - **Zero tolerance**: All linting errors and warnings must be resolved

2. **Testing**:
   - Run relevant tests: `pnpm test` for unit tests
   - For UI components: Update/create Storybook stories
   - For E2E features: Run `pnpm test:e2e`

3. **Database Changes**:
   - Run `pnpm db:generate` after schema changes
   - Run `pnpm db:migrate` to apply migrations

4. **Documentation**:
   - Update component documentation in Storybook
   - Run `pnpm lint:md:fix` for markdown files

## Important Patterns

### Import Standards

- **ALWAYS** use `@/` alias for src imports
- Import ShadCN components from `@/components/ui/`
- Use centralized Icons component: `@/components/icons`
- Import utilities from `@/utils/cn` (NOT @/lib/utils)

### Component Development

- Create comprehensive Storybook stories for all components
- Follow ShadCN/UI patterns with local customization
- Use cva (class-variance-authority) for variant styling
- Include accessibility attributes and ARIA support

### Code Style

- Use function declarations for components
- Object parameters for custom hooks: `useHook({ param })`
- Alphabetical prop sorting in JSX
- Use type (not interface) for object definitions

## Git Workflow

- Conventional commits with `pnpm commit`
- Pre-commit hooks run linting and formatting automatically
- All code must pass quality checks before committing
