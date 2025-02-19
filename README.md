# TanStack Start Starter

A modern, full-stack web application starter template built with TanStack Start, following comprehensive development guidelines and best practices.

## Development Guidelines

This project follows a set of carefully crafted development rules and patterns. For a complete overview, see our [Rules Index](.cursor/rules/INDEX.mdc).

Core Guidelines:

- 📋 [Code Style](.cursor/rules/core/code-style.mdc) - Code organization and style guidelines
- 🎯 [Core Principles](.cursor/rules/core/core-principles.mdc) - Core development principles and standards
- 🏗️ [Architecture](.cursor/rules/core/architecture.mdc) - System architecture and design patterns
- 📚 [Tech Stack](.cursor/rules/core/tech-stack.mdc) - Technology documentation and standards

Development Standards:

- ⚛️ [React Guidelines](.cursor/rules/development/react/guidelines.mdc) - React development guidelines
- 📘 [TypeScript Style](.cursor/rules/development/typescript/style.mdc) - TypeScript-specific patterns
- 🧪 [Testing Standards](.cursor/rules/development/testing/testing.mdc) - Testing and quality assurance

TanStack Ecosystem:

- 🚀 [TanStack Patterns](.cursor/rules/tanstack/core/patterns.mdc) - TanStack library usage
- 🛣️ [Routing](.cursor/rules/tanstack/start/routing.mdc) - Routing patterns and structure
- ⚙️ [Setup](.cursor/rules/tanstack/start/setup.mdc) - Project setup and configuration
- 📦 [Deployment](.cursor/rules/tanstack/start/deployment.mdc) - Deployment and CI/CD

## Tech Stack

### Core Framework

- 🏗️ [TanStack Start](https://tanstack.com/start) - Full-stack TypeScript framework
- ⚛️ [React](https://react.dev) - UI Framework (v19+)
- 📘 [TypeScript](https://www.typescriptlang.org/) - Type safety

### TanStack Suite

- 🛣️ [TanStack Router](https://tanstack.com/router) - Type-safe routing
- 🔄 [TanStack Query](https://tanstack.com/query) - Data synchronization
- 📝 [React Hook Form](https://react-hook-form.com/) - Form management with Shadcn UI
- 📊 [TanStack Table](https://tanstack.com/table) - Table/DataGrid
- 📜 [TanStack Virtual](https://tanstack.com/virtual) - Virtualization

### Authentication & Email

- 🔐 [Better Auth](https://better-auth.com) - Authentication
- 📧 [Resend](https://resend.com) - Email service
- ✉️ [React Email](https://react.email) - Email templates

### UI & Styling

- 🎨 [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- 🧱 [Shadcn UI](https://ui.shadcn.com) - UI components
- 🔧 [Radix UI](https://www.radix-ui.com) - Headless UI primitives
- 🎨 [React Icons](https://react-icons.github.io/react-icons) - Icon library (including Lucide icons)

### Form & Validation

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
- 🔐 Authentication with Better Auth
- 📧 Email templates with React Email
- 🎨 Themeable UI components
- 📱 Mobile-first design
- ♿ Accessible components
- 🌐 SEO optimized
- 🚀 Fast build times
- 📦 Optimized bundle size

## Development Workflow

### Getting Started

\`\`\`bash

# Clone the repository

git clone <https://github.com/yourusername/tanstack-start-starter.git>

# Install dependencies

pnpm install

# Start the development server

pnpm dev
\`\`\`

### Development Process

1. Read through the development guidelines in `.cursor/rules/INDEX.mdc`
2. Follow the [Core Principles](.cursor/rules/core/core-principles.mdc) for implementation
3. Ensure code adheres to [Code Style](.cursor/rules/core/code-style.mdc)
4. Write tests following [Testing Standards](.cursor/rules/development/testing/testing.mdc)
5. Use proper patterns from [TanStack Patterns](.cursor/rules/tanstack/core/patterns.mdc)

### Code Quality

- Follow TypeScript best practices
- Maintain consistent code style
- Write comprehensive tests
- Document code changes
- Review code before committing

## Project Structure

\`\`\`sh
app/
├── components/ # Shared components
│ ├── ui/ # UI components
│ └── email/ # Email templates
├── lib/ # Shared utilities
│ ├── client/ # Client-only code
│ ├── server/ # Server-only code
│ └── shared/ # Shared code
├── routes/ # File-based routes
│ ├── api/ # API routes
│ │ ├── auth/ # Better Auth endpoints
│ │ └── send.ts # Email endpoint
│ ├── \_public/ # Public routes
│ ├── \_auth/ # Auth routes
│ └── \_app/ # Protected routes
├── styles/ # Global styles
└── types/ # TypeScript types
\`\`\`

## License

MIT
