# Project Overview

A modern Medium-style blogging platform built with TanStack Start, featuring organization workflows, collaborative writing, and advanced content discovery.

## What We're Building

### Core Features

- **GitHub-style Markdown Editor** - Familiar writing experience with live preview
- **Organization Publishing** - Multi-tenant system with review workflows
- **Co-authoring** - Collaborative writing with multiple authors
- **Advanced Search** - Full-text search with PostgreSQL and intelligent discovery
- **User Management** - Role-based permissions with organization context

### Target Users

- **Individual Writers** - Personal blogging with markdown-first approach
- **Organizations** - Teams publishing official content with approval workflows
- **Collaborative Teams** - Multi-author content creation with proper attribution
- **Technical Communities** - Developer-friendly platform with code syntax highlighting

## Technical Stack

### Frontend

- **TanStack Start v1.87+** - React 19 + TypeScript + Vite
- **TanStack Router** - File-based routing with type-safe navigation
- **TanStack Query** - Data fetching and caching
- **ShadCN/UI** - Modern component library
- **TailwindCSS v4** - Utility-first styling

### Backend

- **PostgreSQL** - Primary database with full-text search
- **Drizzle ORM** - Type-safe database queries
- **better-auth** - Authentication with multi-session support
- **Resend** - Transactional email delivery

### Infrastructure

- **Server Functions** - TanStack Start server-side API
- **File-based Routing** - Organized route structure
- **TypeScript** - End-to-end type safety

## Architecture Principles

### 1. KISS & DRY

- Simple, readable solutions over complex ones
- Extract common patterns into reusable utilities
- Check existing codebase before creating new functionality

### 2. Type Safety

- End-to-end TypeScript with strict configuration
- Database schema validation with Arktype
- Type-safe API endpoints and data fetching

### 3. Developer Experience

- Hot reload development environment
- Comprehensive linting and formatting
- Conventional commit standards
- Automated code quality enforcement

### 4. Performance First

- Optimized database queries with proper indexing
- Efficient data fetching patterns
- Progressive enhancement approach
- Mobile-first responsive design

## Project Status

### ✅ Completed

- Authentication & permissions system
- Database foundation with user/organization models
- Navigation system with organization context switching
- Core UI components and layouts
- Development tooling and quality enforcement

### 🚧 In Progress

- Content creation system ([Strategic Design](../../.serena/memories/content_creation_writing_interface_design.md))
- Search & discovery features ([System Design](../../.serena/memories/search_discovery_system_design.md))

### 📋 Planned

- Feed algorithm & following system
- Moderation & admin tools
- Profile management enhancements
- Comprehensive testing suite

## Getting Started

New to the project? Check out these resources:

1. **[Development Setup](../development/setup.md)** - Get your local environment running
2. **[Architecture Overview](../architecture/README.md)** - Understand the system design
3. **[API Documentation](../api/README.md)** - Learn about the server functions
4. **[Development Guide](../development/index.md)** - Coding standards and patterns

## Strategic Context

This technical documentation complements high-level strategic planning documents in `.serena/memories/`. For architectural decisions and system design rationale, see:

- [Content Creation System Design](../../.serena/memories/content_creation_writing_interface_design.md)
- [Search & Discovery Strategy](../../.serena/memories/search_discovery_system_design.md)
- [Implementation Roadmaps](../../.serena/memories/implementation_roadmap_content_creation.md)
