# TanStack Start Development Rules

## Overview

This repository contains comprehensive development guidelines and best practices for TanStack Start applications. The documentation is organized using a domain-driven hierarchy, making it easy to find relevant information for specific needs.

## Documentation Structure

```sh
.cursor/rules/
├── INDEX.mdc                # Primary navigation and index
├── domains/                 # Domain-specific guidelines
│   ├── core/               # Core principles and standards
│   │   ├── principles.mdc  # Fundamental development principles
│   │   ├── architecture.mdc# System design and patterns
│   │   └── standards.mdc   # Code quality and style
│   ├── frontend/           # Frontend-specific rules
│   │   ├── react.mdc      # React patterns and practices
│   │   ├── typescript.mdc  # TypeScript guidelines
│   │   └── testing.mdc    # Frontend testing
│   └── tanstack/          # TanStack-specific guidelines
│       ├── start.mdc      # Start framework guidelines
│       ├── query.mdc      # Query patterns
│       └── router.mdc     # Routing patterns
└── meta/                   # Documentation about documentation
    └── contributing.mdc    # How to maintain rules
```

## Quick Start

1. Start with [Core Principles](mdc:domains/core/principles.mdc) for fundamental development guidelines
2. Check [Architecture](mdc:domains/core/architecture.mdc) for system design patterns
3. Review [Standards](mdc:domains/core/standards.mdc) for code quality guidelines
4. Visit domain-specific guidelines as needed:
   - [React Guidelines](mdc:domains/frontend/react.mdc)
   - [TypeScript Guidelines](mdc:domains/frontend/typescript.mdc)
   - [Testing Guidelines](mdc:domains/frontend/testing.mdc)
   - [TanStack Start Guidelines](mdc:domains/tanstack/start.mdc)
   - [Query Guidelines](mdc:domains/tanstack/query.mdc)
   - [Router Guidelines](mdc:domains/tanstack/router.mdc)

## Contributing

Please read our [Contributing Guidelines](mdc:meta/contributing.mdc) for details on:

- How to maintain documentation
- File format and structure
- Writing style and standards
- Review process
- Version control guidelines

## Navigation

1. Use the [INDEX.mdc](mdc:INDEX.mdc) file as your primary navigation hub
2. Browse domain directories for specific areas of interest
3. Follow related guideline links within each document
4. Use your IDE's search functionality to find specific topics

## File Format

All guideline documents (.mdc) follow a consistent structure:

```markdown
---
description: Purpose of the document
globs: Files this applies to
---

# Title

## Overview

Purpose and scope

## Related Guidelines

Cross-references

## Main Content

Organized by topic
```

## Best Practices

1. Always start with core principles
2. Follow established patterns
3. Keep documentation current
4. Maintain cross-references
5. Update INDEX.mdc when adding files

## Support

For questions or issues:

1. Check existing documentation
2. Review related guidelines
3. Consult team leads
4. Follow best practices
