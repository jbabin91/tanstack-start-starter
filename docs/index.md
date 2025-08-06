# Documentation

This documentation is organized using a tiered system that works seamlessly with both AI agents and human developers.

## Documentation Structure

### 📋 Strategic Planning (`.serena/memories/`)

High-level strategic decisions, system designs, and architectural planning:

- **System Design Documents**: Comprehensive feature specifications and user experience designs
- **Implementation Roadmaps**: Phase-by-phase development plans with technical details
- **Technical Specifications**: Detailed technical requirements and API designs
- **Project Planning**: Strategic decisions and architectural considerations

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

Strategic planning documents in `.serena/memories/` reference detailed technical documentation in `/docs/`. Look for links like:

- `[API Documentation](../docs/api/posts.md)` - Links from memories to docs
- `[System Design](../.serena/memories/search_discovery_system_design.md)` - Links from docs to memories

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
- [Architecture Overview](./architecture/index.md)
- [Deployment Guide](./deployment.md)

### For Users

- [User Guides](./guides/index.md)
- [Writing and Publishing](./guides/writing-and-publishing.md)
- [Organization Management](./guides/organization-management.md)

### For Strategic Planning

- [Content Creation System Design](../.serena/memories/content_creation_writing_interface_design.md)
- [Search & Discovery System](../.serena/memories/search_discovery_system_design.md)
- [Navigation & Dashboard Architecture](../.serena/memories/ux_architecture_navigation_design.md)
- [Implementation Roadmaps](../.serena/memories/implementation_roadmap_content_creation.md)

## Contributing to Documentation

When adding new features or making architectural changes:

1. **Strategic decisions** → Document in `.serena/memories/`
2. **Implementation details** → Document in `/docs/`
3. **Cross-reference** → Link between strategic and technical docs
4. **Review** → Ensure both AI agents and humans can navigate effectively
