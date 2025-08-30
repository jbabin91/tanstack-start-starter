# Codebase Structure

## Project Structure

```sh
src/
├── components/           # Reusable UI components
│   ├── ui/              # ShadCN/UI components (local copies)
│   │   ├── button/      # Button component with stories and tests
│   │   ├── card/        # Card components
│   │   ├── form/        # Form components
│   │   └── ...          # Other UI components
│   ├── layouts/         # Layout components
│   ├── errors/          # Error boundary components
│   ├── icons.tsx        # Centralized icon component
│   └── mode-toggle.tsx  # Theme toggle
├── modules/             # Feature modules
│   ├── {feature}/       # Feature-specific code
│   │   ├── api/         # Server functions
│   │   ├── hooks/       # React Query hooks
│   │   ├── components/  # Feature components
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Feature utilities
├── lib/                 # Core utilities and configurations
│   ├── auth/            # Authentication setup
│   ├── db/              # Database connection and schemas
│   └── ...              # Other core utilities
├── routes/              # File-based routing
│   ├── _app/            # Protected routes
│   ├── _public/         # Public routes
│   └── api/             # API endpoints
├── utils/               # Utility functions
│   └── cn.ts            # Class name utility (NOT in lib/)
├── styles/              # Global styles
├── hooks/               # Shared React hooks
├── providers/           # React context providers
├── configs/             # Configuration files
└── types/               # Global TypeScript types
```

## Key Files & Patterns

### Component Organization

- **ShadCN/UI components**: Local copies in `src/components/ui/`
- **Component structure**: Each UI component has:
  - `component.tsx` - Main component implementation
  - `component.stories.tsx` - Storybook stories
  - `index.ts` - Exports
- **Icons**: Centralized in `src/components/icons.tsx`
- **Utilities**: Class name utility at `src/utils/cn.ts`

### Module Pattern

Each feature follows consistent structure:

- `api/` - Server functions (one per file)
- `hooks/` - React Query integration
- `components/` - Feature-specific components
- `types/` - TypeScript type definitions
- `utils/` - Feature-specific utilities

### Configuration Files

- `components.json` - ShadCN/UI configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.js` - ESLint rules and plugins
- `drizzle.config.ts` - Database configuration
- `vite.config.ts` - Build configuration

### Important Conventions

- **Path aliases**: Always use `@/` for src imports
- **Component exports**: Use named exports, not default
- **File naming**: kebab-case for files, PascalCase for components
- **Story naming**: Follow Storybook hierarchy: 'UI/Inputs/Button'
