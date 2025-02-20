# TanStack Start Starter

A modern, full-stack web application starter template built with TanStack Start, following comprehensive development guidelines and best practices.

## Development Guidelines

This project follows a set of carefully crafted development rules and patterns. For a complete overview, see our [Development Rules & Guidelines](.cursor/rules/_index.mdc).

Core Guidelines:

- 🎯 [Core Principles](.cursor/rules/domains/core/principles.mdc) - Fundamental development principles
- 🏗️ [Architecture](.cursor/rules/domains/core/architecture.mdc) - System design patterns
- 📋 [Standards](.cursor/rules/domains/core/standards.mdc) - Code quality and style standards

Frontend Development:

- ⚛️ [React Guidelines](.cursor/rules/domains/frontend/react.mdc) - React patterns and practices
- 📘 [TypeScript Guidelines](.cursor/rules/domains/frontend/typescript.mdc) - TypeScript best practices
- 🧪 [Testing Guidelines](.cursor/rules/domains/frontend/testing.mdc) - Testing standards

TanStack Development:

- 🚀 [Start Guidelines](.cursor/rules/domains/tanstack/start.mdc) - TanStack Start setup and patterns
- 🔄 [Query Guidelines](.cursor/rules/domains/tanstack/query.mdc) - Data fetching patterns
- 🛣️ [Router Guidelines](.cursor/rules/domains/tanstack/router.mdc) - Routing patterns

## Tech Stack

### Core Framework

- 🏗️ [TanStack Start](https://tanstack.com/start) - Full-stack TypeScript framework
- ⚛️ [React](https://react.dev) - UI Framework (v19+)
- 📘 [TypeScript](https://www.typescriptlang.org/) - Type safety

### TanStack Suite

- 🛣️ [TanStack Router](https://tanstack.com/router) - Type-safe routing
- 🔄 [TanStack Query](https://tanstack.com/query) - Data synchronization
- 📊 [TanStack Table](https://tanstack.com/table) - Table/DataGrid
- 📜 [TanStack Virtual](https://tanstack.com/virtual) - Virtualization

### UI & Styling

- 🎨 [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- 🧱 [Shadcn UI](https://ui.shadcn.com) - UI components
- 🔧 [Radix UI](https://www.radix-ui.com) - Headless UI primitives
- 🎨 [Lucide Icons](https://lucide.dev) - Icon library

### Form & Validation

- 📝 [React Hook Form](https://react-hook-form.com) - Form state management
- 🧱 [Shadcn Form](https://ui.shadcn.com/docs/components/form) - Form components
- ✅ [Zod](https://zod.dev) - Schema validation
- 🏷️ [Class Variance Authority](https://cva.style) - Component variants

### Development & Tooling

- 📦 [PNPM](https://pnpm.io) - Package manager
- 🔍 [ESLint](https://eslint.org) - Code linting
- 💅 [Prettier](https://prettier.io) - Code formatting
- ⚡ [Vite](https://vitejs.dev) - Build tool
- 🧪 [Vitest](https://vitest.dev) - Testing framework

### Features

- 📱 Responsive design
- 🌙 Dark mode support
- 🔒 Type-safe APIs
- 📄 File-based routing
- 🎯 Server functions
- 🎨 Themeable UI components
- 📱 Mobile-first design
- ♿ Accessible components
- 🌐 SEO optimized
- 🚀 Fast build times
- 📦 Optimized bundle size

## Development Workflow

### Getting Started

```zsh
# Clone the repository
git clone https://github.com/yourusername/tanstack-start-starter.git

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Development Process

1. Read through the [Development Rules & Guidelines](.cursor/rules/_index.mdc)
2. Follow the [Core Principles](.cursor/rules/domains/core/principles.mdc)
3. Adhere to [Standards](.cursor/rules/domains/core/standards.mdc)
4. Write tests following [Testing Guidelines](.cursor/rules/domains/frontend/testing.mdc)
5. Use proper [TanStack patterns](.cursor/rules/domains/tanstack/start.mdc)

### Code Quality

- Follow TypeScript best practices
- Maintain consistent code style
- Write comprehensive tests
- Document code changes
- Review code before committing

## Project Structure

```sh
app/
├── components/        # Shared components
│   ├── ui/           # UI components
│   └── features/     # Feature components
├── lib/              # Shared utilities
│   ├── client/       # Client-only code
│   ├── server/       # Server-only code
│   └── shared/       # Shared code
├── routes/           # File-based routes
│   ├── api/          # API routes
│   ├── _public/      # Public routes
│   ├── _auth/        # Auth routes
│   └── _app/         # Protected routes
├── styles/           # Global styles
└── types/            # TypeScript types
```

## License

MIT
