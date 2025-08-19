# Documentation

This documentation is organized using a tiered system that works seamlessly with both AI agents and human developers.

## Documentation Structure

### 📋 Strategic Planning & Context

Strategic planning information is maintained through:

- **Task Master**: Structured task management with AI-powered planning in `.taskmaster/`
- **Claude Code Context**: Essential project context and patterns in `CLAUDE.md`
- **Architecture Documentation**: Comprehensive system design in `/docs/architecture/`
- **Development Guidelines**: Implementation patterns and standards in `/docs/development/`

### 📚 Technical Documentation (`/docs/`)

Detailed implementation guides, API references, and developer resources:

- **Overview**: Project introduction and getting started guides
- **Architecture**: System architecture, database schemas, and technical design
- **Development**: Setup guides, coding standards, and development workflows
- **API**: Detailed API documentation and integration guides
- **Security**: Authentication flows, permissions, and security best practices
- **Deployment**: Production deployment and infrastructure guides
- **Guides**: User-facing guides for writing, collaboration, and organization management

## Cross-References

Documentation is interconnected across the project:

- **Task Master** references detailed technical documentation in `/docs/`
- **CLAUDE.md** imports essential context from `/docs/` files using `@` references
- **Architecture docs** link to implementation guides and API references
- **Development guides** reference component patterns and testing strategies

## Documentation Automation

The documentation system includes automated hooks that:

- **Cross-reference tracking** - Automatically updates links between memories and docs
- **Phase detection** - Provides project context based on current development phase
- **Context injection** - Automatically includes relevant project status in AI interactions

## Quick Navigation

### For Developers

- [Quick Start Guide](./overview/quickstart.md)
- [Development Setup](./development/setup.md)
- [API Reference](./api/index.md)
- [Database Schema](./api/database.md)
- [Architecture Overview](./architecture/index.md)
- [Security Documentation](./security/index.md)

### For Users

- [User Guides](./guides/index.md)
- [Writing and Publishing](./guides/writing-and-publishing.md)
- [Organization Management](./guides/organization-management.md)

### For Project Planning

- [Claude Code Integration](./CLAUDE.md)
- [Architecture Decision Records](./architecture/index.md)
- [Database Design](./api/database.md)
- [Development Patterns](./development/index.md)

## Contributing to Documentation

When adding new features or making architectural changes:

1. **Task Planning** → Create tasks in Task Master for structured implementation
2. **Implementation details** → Document patterns and APIs in `/docs/`
3. **Context Updates** → Update `CLAUDE.md` with essential patterns and commands
4. **Cross-reference** → Link between architectural docs and implementation guides
5. **Review** → Ensure both AI agents and humans can navigate effectively
