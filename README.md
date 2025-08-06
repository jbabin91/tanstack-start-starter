# TanStack Start Blogging Platform

A modern, Medium-style blogging platform built with TanStack Start, featuring GitHub-style markdown editing, organization workflows, and collaborative writing.

## ✨ Features

- **📝 GitHub-Style Editor** - Familiar markdown editing with live preview
- **🏢 Organization Publishing** - Multi-tenant system with approval workflows
- **👥 Co-authoring** - Collaborative writing with multiple authors
- **🔍 Advanced Search** - PostgreSQL full-text search with intelligent discovery
- **🔐 Multi-Session Auth** - Role-based permissions with organization context
- **📱 Mobile-First** - Responsive design optimized for all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **PostgreSQL** database
- **Git** for version control

### Setup

```bash
# Clone and install
git clone <repository-url>
cd tanstack-start-starter
pnpm install

# Environment setup
cp .env.example .env
pnpm auth:generate

# Database setup
pnpm db:migrate
pnpm db:seed        # Optional sample data

# Start development
pnpm dev            # Runs on http://localhost:3000
```

## 🏗️ Built With

- **[TanStack Start](https://tanstack.com/start)** - React 19 + TypeScript + Vite
- **[TanStack Router](https://tanstack.com/router)** - Type-safe file-based routing
- **[TanStack Query](https://tanstack.com/query)** - Powerful data fetching
- **[PostgreSQL](https://postgresql.org/)** - Robust database with full-text search
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database queries
- **[better-auth](https://better-auth.com/)** - Modern authentication
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first styling

## 📚 Documentation

### For Developers

- **[Quick Start Guide](./docs/overview/quickstart.md)** - Get up and running in minutes
- **[Documentation Index](./docs/index.md)** - Complete documentation overview
- **[Architecture Guide](./docs/architecture/index.md)** - System design and patterns
- **[API Reference](./docs/api/index.md)** - Server functions and endpoints

### For Strategic Planning

- **[Content Creation Design](./.serena/memories/content_creation_writing_interface_design.md)** - Editor and publishing workflows
- **[Search & Discovery System](./.serena/memories/search_discovery_system_design.md)** - Search architecture and UX
- **[Implementation Roadmaps](./.serena/memories/implementation_roadmap_content_creation.md)** - Development planning

## 🎯 Project Status

### ✅ Completed

- Authentication system with multi-session support
- Database foundation with user/organization models
- Navigation system with organization context switching
- Core UI components and development tooling

### 🚧 In Progress

- GitHub-style markdown editor with organization workflows
- Advanced search and content discovery features

### 📋 Planned

- Feed algorithms and social following system
- Moderation and admin management tools
- Enhanced profile management features
- Comprehensive testing suite

## 🛠️ Development

### Code Quality (Automated)

```bash
pnpm lint           # ESLint with auto-fix
pnpm format         # Prettier formatting
pnpm typecheck      # TypeScript validation
```

All quality checks run automatically on file changes.

### Database Operations

```bash
pnpm db:studio      # Open Drizzle Studio
pnpm db:generate    # Generate migrations
pnpm db:reset       # Reset database
```

### Commit Standards

```bash
pnpm commit         # Interactive conventional commits
# Example: feat(auth): add OAuth login support
```

## 🏛️ Architecture Highlights

- **Type-Safe End-to-End** - Full TypeScript coverage from database to UI
- **Server Functions** - TanStack Start server functions (not REST API)
- **Modular Design** - Feature-based modules with consistent patterns
- **Performance First** - Optimized queries, proper indexing, efficient caching
- **Developer Experience** - Hot reload, comprehensive tooling, clear conventions

## 🤝 Contributing

1. **Read the docs** - Start with [Documentation Index](./docs/index.md)
2. **Understand patterns** - Review [Architecture Guide](./docs/architecture/index.md)
3. **Follow conventions** - See [CLAUDE.md](./CLAUDE.md) for detailed guidelines
4. **Use conventional commits** - Run `pnpm commit` for proper formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [./docs/index.md](./docs/index.md)
- **Strategic Planning**: [./.serena/memories/](./.serena/memories/)
- **Architecture**: [./docs/architecture/index.md](./docs/architecture/index.md)
- **API Reference**: [./docs/api/index.md](./docs/api/index.md)
