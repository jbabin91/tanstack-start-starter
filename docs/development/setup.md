# Development Environment Setup

This guide provides detailed instructions for setting up your development environment for the TanStack Start blogging platform.

## Prerequisites

### Required Tools

- **Node.js** 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** for package management
- **PostgreSQL** 14+ for the database
- **Git** for version control
- **VS Code** or your preferred editor with TypeScript support

### Optional Tools

- **Docker** for containerized PostgreSQL
- **TablePlus** or **pgAdmin** for database management
- **Postman** or **Insomnia** for API testing

## Detailed Setup Instructions

### 1. Node.js and pnpm Setup

```sh
# Install Node.js 18+ using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version   # Should be 18+
pnpm --version   # Should be latest
```

### 2. Project Setup

```sh
# Clone the repository
git clone <repository-url>
cd tanstack-start-starter

# Install dependencies
pnpm install

# This will automatically:
# - Install all npm dependencies
# - Set up git hooks for code quality
# - Generate TypeScript types
```

### 3. Environment Configuration

```sh
# Copy the environment template
cp .env.example .env
```

Edit `.env` with your specific configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tanstack_start"

# Better-auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key"
SENDER_EMAIL_ADDRESS="noreply@yourdomain.com"

# Optional: Organization and debug settings
NODE_ENV="development"
```

**Generate required secrets:**

```sh
# Generate a secure secret for better-auth
pnpm auth:generate

# This will update your .env file with a secure random secret
```

### 4. Database Setup

#### Option A: Local PostgreSQL

```sh
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/
```

Create the database:

```sql
-- Connect to PostgreSQL as superuser
psql postgres

-- Create database and user
CREATE DATABASE tanstack_start;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tanstack_start TO your_username;

-- Exit psql
\q
```

#### Option B: Docker PostgreSQL

```sh
# Create and start PostgreSQL container
docker run --name tanstack-postgres \
  -e POSTGRES_DB=tanstack_start \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14

# Verify container is running
docker ps
```

#### Run Database Migrations

```sh
# Generate and run migrations
pnpm db:generate  # Generate migration files from schema
pnpm db:migrate   # Apply migrations to database

# Optional: Seed with sample data
pnpm db:seed

# Verify setup with database studio
pnpm db:studio    # Opens Drizzle Studio at http://localhost:4983
```

### 5. Development Server

```sh
# Start development server
pnpm dev

# Server will start at:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api/*
```

The development server includes:

- **Hot reload** for instant updates
- **TypeScript compilation** with error reporting
- **Automatic linting** with ESLint
- **Code formatting** with Prettier
- **Better-auth** session management

### 6. Editor Configuration

#### VS Code (Recommended)

Install these extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "unifiedjs.vscode-mdx",
    "ms-vscode.vscode-json"
  ]
}
```

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Other Editors

- **WebStorm**: Install TypeScript, ESLint, and Prettier plugins
- **Vim/Neovim**: Configure LSP with typescript-language-server
- **Emacs**: Use lsp-mode with typescript-language-server

### 7. Git Configuration

The project uses conventional commits and automated hooks:

```sh
# Configure git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use the interactive commit tool
pnpm commit

# Or follow conventional commit format manually
git commit -m "feat(auth): add OAuth login support"
git commit -m "fix(db): resolve migration issue"
git commit -m "docs(api): update session documentation"
```

### 8. Verification Checklist

Run these commands to verify your setup:

```sh
# Code quality checks
pnpm lint        # Should pass without errors
pnpm typecheck   # Should pass without errors
pnpm format      # Should format code correctly

# Database checks
pnpm db:studio   # Should open database browser
```

Visit these URLs to verify services:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Database Studio**: [http://localhost:4983](http://localhost:4983)

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:

   ```sh
   git pull origin main
   pnpm install  # Install any new dependencies
   ```

2. **Database updates** (if needed):

   ```sh
   pnpm db:migrate  # Apply new migrations
   ```

3. **Start development**:

   ```sh
   pnpm dev  # Start development server
   ```

4. **Make changes** with automatic quality checks
5. **Commit changes**:

   ```sh
   pnpm commit  # Interactive conventional commit
   ```

### Code Quality Automation

The project automatically enforces quality through:

- **Git hooks** that run on commit and push
- **ESLint** for code quality and consistency
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hook management

### Database Development

```sh
# Common database operations
pnpm db:studio     # Browse/edit data visually
pnpm db:generate   # Create migrations from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:reset      # Reset database (careful!)
pnpm db:seed       # Add sample data

# Production-like testing
pnpm build         # Build production bundle
pnpm start         # Run production server locally
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```sh
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 pnpm dev
```

#### Database Connection Errors

```sh
# Check PostgreSQL is running
brew services list | grep postgres

# Test connection manually
psql postgresql://username:password@localhost:5432/tanstack_start

# Reset database if corrupted
pnpm db:reset
pnpm db:migrate
```

#### TypeScript Errors

```sh
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm typecheck

# Regenerate types
pnpm db:generate
```

#### Package Installation Issues

```sh
# Clear pnpm cache
pnpm store prune

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Getting Help

- **Documentation**: Browse `/docs/` for detailed guides
- **Database Schema**: See [Database Documentation](../api/database.md)
- **API Reference**: Check [API Documentation](../api/index.md)
- **Development Patterns**: Review [Development Guide](./index.md)

## Performance Tips

### Development Performance

- **Use pnpm** instead of npm for faster installs
- **Enable TypeScript strict mode** for better error catching
- **Use database studio** for efficient data debugging
- **Enable hot reload** in your editor for instant feedback

### Production Preparation

```sh
# Test production build locally
pnpm build
pnpm start

# Run all quality checks
pnpm lint
pnpm typecheck
pnpm test  # When tests are added

# Verify database performance
pnpm db:studio  # Check query performance
```

## Next Steps

After completing setup:

1. **Explore the codebase** - Start with `src/routes/` for routing
2. **Review architecture** - Read [Architecture Overview](../architecture/index.md)
3. **Understand patterns** - Check [Development Guide](./index.md)
4. **Make your first change** - Try adding a simple component
5. **Read API docs** - Familiarize yourself with [API Documentation](../api/index.md)

Ready to start building? Head to the [Development Guide](./index.md) for coding patterns and best practices.
