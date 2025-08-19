# Getting Started

Welcome to the TanStack Start blogging platform! This guide will help you get up and running with the project.

## Prerequisites

- **Node.js** 18+ and **pnpm** for package management
- **PostgreSQL** for the database
- **Git** for version control

## Quick Setup

### 1. Clone and Install

```sh
git clone <repository-url>
cd tanstack-start-starter
pnpm install
```

### 2. Environment Setup

```sh
# Copy environment template
cp .env.example .env

# Generate required secrets
pnpm auth:generate
```

### 3. Database Setup

```sh
# Start your PostgreSQL instance, then:
pnpm db:migrate     # Run database migrations
pnpm db:seed        # Seed with sample data (optional)
```

### 4. Start Development

```sh
pnpm dev            # Start development server on port 3000
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development Workflow

### Code Quality (Automated)

The project enforces code quality automatically:

```sh
pnpm lint           # ESLint with auto-fix
pnpm format         # Prettier formatting
pnpm typecheck      # TypeScript validation
```

All checks run automatically after file changes via hooks.

### Database Operations

```sh
pnpm db:studio      # Open Drizzle Studio
pnpm db:generate    # Generate new migrations
pnpm db:reset       # Reset database (careful!)
```

### Commit Standards

Use conventional commits:

```sh
pnpm commit         # Interactive commit tool
# or manually: git commit -m "feat(auth): add OAuth login"
```

## Project Structure

```sh
src/
├── components/     # Reusable UI components
│   ├── ui/        # ShadCN/UI components
│   └── layouts/   # Layout components
├── modules/        # Feature modules (users, posts, etc.)
│   ├── auth/      # Authentication & sessions
│   ├── email/     # Email functionality
│   └── posts/     # Content management
├── lib/           # Core utilities and configurations
│   ├── auth/      # Better-auth configuration
│   └── db/        # Database schemas and connection
├── routes/        # File-based routing
│   ├── _app/      # Protected routes
│   └── _public/   # Public routes
└── configs/       # Configuration files

docs/              # Technical documentation (you are here)
```

## Key Features Overview

### Authentication

- Multi-session support with better-auth
- Organization context switching
- Role-based permissions

### Content Creation

- GitHub-style markdown editor with real-time preview
- Organization publishing workflows
- Co-authoring support
- Auto-save functionality

### Search & Discovery

- PostgreSQL full-text search with GIN indexes
- Advanced filtering and categorization
- Content ranking and relevance scoring

## Development Commands Reference

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start development server     |
| `pnpm build`     | Build for production         |
| `pnpm lint`      | Check and fix linting issues |
| `pnpm typecheck` | Verify TypeScript types      |
| `pnpm db:studio` | Open database management UI  |
| `pnpm commit`    | Create conventional commit   |

## Next Steps

1. **Explore the codebase** - Start with `src/routes/` to understand routing
2. **Read architecture docs** - [Architecture Overview](../architecture/index.md)
3. **Review database schema** - Check [Database Documentation](../api/database.md)
4. **Set up your editor** - Configure TypeScript and ESLint extensions
5. **Review implementation patterns** - See [Development Guide](../development/index.md)

## Getting Help

- **Technical Documentation** - Browse `/docs/` for implementation details
- **API Reference** - See [API Documentation](../api/index.md) for server functions
- **Code Patterns** - Review existing modules for established patterns
- **Development Standards** - See [CLAUDE.md](../../CLAUDE.md) for detailed guidelines

## Common Issues

### Database Connection

```sh
# If database connection fails:
# 1. Ensure PostgreSQL is running
# 2. Check .env database URL
# 3. Run migrations: pnpm db:migrate
```

### Type Errors

```sh
# If TypeScript errors persist:
pnpm typecheck      # See detailed errors
# Check imports use @/ alias, not relative paths
```

### Linting Issues

```sh
# Auto-fix most linting problems:
pnpm lint:fix
pnpm format
```

Ready to start building? Head to the [Development Guide](../development/index.md) for detailed coding patterns and best practices.
