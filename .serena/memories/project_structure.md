# Project Structure and Architecture

## Root Structure

```sh
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components (local copies)
│   ├── layouts/       # Layout components
│   └── errors/        # Error boundary components
├── modules/           # Feature modules (see module pattern below)
├── lib/               # Core utilities and configuration
├── routes/            # File-based routes (see routing pattern)
├── configs/           # Configuration files
├── providers/         # React context providers
├── hooks/             # Shared custom hooks
├── utils/             # Utility functions
└── types/             # Global type definitions
```

## Module Pattern

Each feature module follows this structure:

```sh
src/modules/[feature]/
├── api/              # Server functions and query definitions
├── components/       # Feature-specific components
├── hooks/            # Feature-specific hooks
├── types/            # Feature-specific types
└── utils/            # Feature-specific utilities
```

## Routing Pattern

```sh
src/routes/
├── _app/             # Protected routes (requires auth)
├── _auth/            # Authentication routes (login, register, etc.)
├── _public/          # Public routes (accessible without auth)
└── api/              # API endpoints (prefer server functions)
```

## Key Libraries and Config

- All configs in root: `eslint.config.js`, `.prettierrc.js`, `drizzle.config.ts`
- Database schemas: `src/lib/db/schemas/`
- Authentication: `src/lib/auth/`
- Environment: `src/configs/env.ts`
