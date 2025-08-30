# Project Overview

## Purpose

TanStack Start Starter - A full-stack React blogging platform built with modern technologies. This is a comprehensive starter template that includes authentication, database management, UI components, and testing infrastructure.

## Tech Stack

### Core Framework

- **TanStack Start v1.131+** - Full-stack React framework with Vite bundling
- **React 19** - Latest React with modern patterns
- **TypeScript** - Strict type safety with modern configuration
- **Vite** - Build tool and dev server

### Database & Backend

- **PostgreSQL** with **Drizzle ORM** - Type-safe database operations
- **better-auth** - Authentication with multi-session support
- **Arktype** - Runtime validation (faster than Zod)
- **Resend** - Email service integration

### UI & Styling

- **ShadCN/UI** - Component library (local copies in src/components/ui/)
- **TailwindCSS v4** - Latest Tailwind with modern features
- **Radix UI** - Headless UI primitives
- **class-variance-authority (cva)** - Variant-based styling
- **Lucide React** - Icon system

### State Management & Data Fetching

- **TanStack Query** - Server state management
- **TanStack Router** - File-based routing with type safety
- **React Hook Form** - Form management
- **next-themes** - Theme management

### Testing & Quality

- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **Storybook** - Component development and testing
- **ESLint** - Linting with React and accessibility rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality enforcement

## Key Features

- Multi-session authentication system
- Organization-based multi-tenancy
- Content creation and publishing
- Component-driven UI with comprehensive Storybook stories
- Full-text search capabilities
- Email verification and transactional emails
- Comprehensive testing setup (unit, integration, e2e)
- Modern development workflow with hot reload

## Architecture Highlights

- File-based routing with TanStack Router
- Modular feature organization in src/modules/
- Type-safe server functions instead of REST APIs
- Component library with variants and semantic colors
- Database schema with proper indexing and relationships
