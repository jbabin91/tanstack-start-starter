# TaskMaster Integration Guide

## Overview

This guide demonstrates how to use the comprehensive implementation guides in `/docs/implementation/` with TaskMaster for efficient development planning and execution.

## Quick Start Workflow

### 1. Choose Your Feature Implementation

Select from our comprehensive implementation guides:

```sh
# User management features
.taskmaster/docs/sample-prd-user-profiles.md

# Content creation platform
.taskmaster/docs/sample-prd-content-creation.md

# Social networking features
.taskmaster/docs/sample-prd-social-platform.md

# Search and discovery system
.taskmaster/docs/sample-prd-search-discovery.md
```

### 2. Parse PRD into TaskMaster

```sh
# Parse any sample PRD to generate tasks
task-master parse-prd .taskmaster/docs/sample-prd-user-profiles.md

# For additional features, append to existing tasks
task-master parse-prd .taskmaster/docs/sample-prd-social-platform.md --append
```

### 3. Analyze and Expand Tasks

```sh
# Analyze complexity for better planning
task-master analyze-complexity --research

# Expand high-complexity tasks into subtasks
task-master expand --all --research
```

### 4. Start Development

```sh
# Find the next available task
task-master next

# Review task details with implementation references
task-master show <task-id>

# Begin implementation using the referenced guide
```

## Implementation Guide Integration

### How PRDs Reference Implementation Guides

Each sample PRD directly references specific sections in the implementation guides:

**User Profile PRD Example:**

```markdown
### Epic 1: Enhanced Profile Management

**Reference**: [User Profiles Guide - Profile Management](../../../docs/implementation/user-profiles.md#profile-management)

#### Story 1.1: Complete User Profile CRUD

- Implementation patterns available in referenced guide
- Server functions, React Query hooks, and components pre-designed
- Database schema already exists and is ready to use
```

### Benefits of This Integration

1. **Immediate Implementation**: All technical patterns are pre-designed in implementation guides
2. **Database Ready**: Schemas exist and support advanced features from day one
3. **Type Safety**: Full TypeScript patterns with proper validation
4. **Performance Optimized**: Proper indexing, caching, and query patterns
5. **Best Practices**: React Query, better-auth, and TanStack Start patterns

## Development Workflow with Implementation Guides

### Step-by-Step Process

1. **Parse PRD**: Generate tasks from comprehensive feature requirements
2. **Reference Guide**: Each task references specific implementation guide sections
3. **Copy Patterns**: Implementation guides provide copy-paste ready code
4. **Customize**: Adapt patterns to specific requirements
5. **Test**: Patterns include testing approaches and considerations

### Example: Implementing User Profile Features

```sh
# 1. Parse user profiles PRD
task-master parse-prd .taskmaster/docs/sample-prd-user-profiles.md

# 2. Get next task (e.g., "Complete User Profile CRUD")
task-master next

# 3. Review task details with implementation reference
task-master show 1.1

# 4. Open implementation guide section
# /docs/implementation/user-profiles.md#profile-management

# 5. Copy server function pattern:
# export const updateUserProfile = createServerFn(/* pre-designed pattern */)

# 6. Implement using existing database schema
# 7. Update task with progress
task-master update-subtask --id=1.1 --prompt="Implemented updateUserProfile server function using guide patterns"
```

## Advanced Usage Patterns

### Multi-Feature Development

Combine multiple PRDs for comprehensive platform development:

```sh
# Start with user profiles
task-master parse-prd .taskmaster/docs/sample-prd-user-profiles.md

# Add content creation
task-master parse-prd .taskmaster/docs/sample-prd-content-creation.md --append

# Add social features
task-master parse-prd .taskmaster/docs/sample-prd-social-platform.md --append

# Add search capabilities
task-master parse-prd .taskmaster/docs/sample-prd-search-discovery.md --append

# Analyze full project complexity
task-master analyze-complexity --research

# Expand all major tasks
task-master expand --all --research
```

### Incremental Feature Development

Focus on specific phases or epics:

```sh
# Parse full PRD but focus on Phase 1 tasks
task-master parse-prd .taskmaster/docs/sample-prd-content-creation.md

# Update tasks to defer advanced features
task-master update --from=5 --prompt="Defer Phase 2+ features to next iteration"

# Work through MVP features first
task-master next  # Start with core features
```

## Implementation Guide Structure

### What Each Guide Contains

**Server Functions**: Complete TanStack Start v1.87+ patterns

```typescript
export const createPost = createServerFn({ method: 'POST' })
  .validator(/* Arktype validation */)
  .handler(async (data) => {
    // Complete implementation with auth, validation, error handling
  });
```

**React Query Integration**: TkDodo hierarchical patterns

```typescript
export const postQueries = {
  all: () => ['posts'] as const,
  details: () => [...postQueries.all(), 'detail'] as const,
  // ... complete query patterns
};
```

**Database Schemas**: Modern Drizzle patterns

```typescript
export const posts = pgTable(
  'posts',
  {
    // Complete schema with proper indexing
  },
  (table) => [
    // Performance indexes included
  ],
);
```

**React Components**: Complete UI patterns

```typescript
function PostEditor({ postId }: { postId: string }) {
  // Complete component with hooks, error handling, accessibility
}
```

### Guide Cross-References

Implementation guides reference each other appropriately:

- **User Profiles** → References social features for following system
- **Content Creation** → References user profiles for author management
- **Social Features** → References content creation for activity feeds
- **Search Discovery** → References all features for comprehensive search

## Database Schema Advantage

### Pre-Built Comprehensive Schemas

All implementation guides leverage existing database schemas:

```sql
-- User profiles (already exists)
users (id, email, username, name, bio, website, location, ...)

-- Content management (already exists)
posts (id, title, content, author_id, organization_id, ...)
drafts (id, post_id, user_id, content, is_auto_save, ...)
post_co_authors (id, post_id, user_id, role, ...)

-- Social features (already exists)
user_follows (id, follower_id, following_id, ...)
post_likes (id, post_id, user_id, ...)

-- Search optimization (already exists)
-- GIN indexes, trigram indexes, materialized views
```

### Schema Evolution Strategy

Implementation guides show how to extend existing schemas:

```sql
-- Additional tables for advanced features
user_privacy_settings (user_id, profile_visibility, ...)
post_analytics (post_id, views, engagement, ...)
search_queries (id, query, user_id, result_count, ...)
```

## TaskMaster Integration Benefits

### Structured Development

1. **Clear Phases**: PRDs break features into manageable phases
2. **Task Dependencies**: Proper ordering of implementation tasks
3. **Progress Tracking**: Mark tasks complete as you implement features
4. **Context Preservation**: Update tasks with implementation notes

### Research-Enhanced Planning

```sh
# Use research mode for better task generation
task-master parse-prd --research .taskmaster/docs/sample-prd-content-creation.md

# Research-enhanced task expansion
task-master expand --id=<task-id> --research

# Research-backed task updates
task-master update-task --id=<task-id> --prompt="Need WebSocket for real-time collaboration" --research
```

### Implementation Logging

Track your implementation progress within TaskMaster:

```sh
# Log implementation decisions
task-master update-subtask --id=1.1 --prompt="Used better-auth organization plugin for multi-tenant support"

# Log technical challenges
task-master update-subtask --id=2.3 --prompt="WebSocket reconnection logic needed for collaborative editing"

# Log completion with references
task-master update-subtask --id=3.1 --prompt="Completed using search-discovery guide PostgreSQL full-text patterns"
```

## Best Practices

### Development Workflow Integration

1. **Start with PRD Parsing**: Use sample PRDs as starting points
2. **Reference Implementation Guides**: Always check the referenced guide sections
3. **Copy-Adapt Pattern**: Copy patterns from guides, adapt to specific needs
4. **Update Tasks with Context**: Log what worked and what needed modification
5. **Mark Tasks Complete**: Only after implementation and testing

### Task Management Best Practices

```sh
# Review task before starting
task-master show <task-id>

# Set task to in-progress when starting
task-master set-status --id=<task-id> --status=in-progress

# Update with implementation notes during development
task-master update-subtask --id=<task-id> --prompt="Implementation notes..."

# Mark complete only when fully tested
task-master set-status --id=<task-id> --status=done
```

### Multi-Session Development

For large features, use multiple Claude Code sessions:

```sh
# Terminal 1: Main feature implementation
cd project && claude
task-master next  # Work on core features

# Terminal 2: Testing and validation
cd project && claude
task-master show <testing-task-id>  # Focus on testing tasks

# Terminal 3: Documentation updates
cd project && claude
task-master show <docs-task-id>  # Update documentation
```

## Troubleshooting

### Common Issues

**Implementation Guide References Not Working**

- Ensure you're referencing the correct guide section
- Check that the implementation guide exists in `/docs/implementation/`
- Verify the anchor links match the guide headings

**Database Schema Mismatches**

- Implementation guides assume the existing database schema
- Check `src/lib/db/schemas/` for current schema definitions
- Run database migrations if schema updates are needed

**TanStack Start Version Issues**

- Implementation guides use TanStack Start v1.87+ patterns
- Ensure imports use `@tanstack/react-start` not `@tanstack/start`
- Check that `getWebRequest` comes from correct import path

### Getting Help

1. **Review Implementation Guides**: Check `/docs/implementation/` for technical patterns
2. **Check Database Schema**: Verify schema exists in `src/lib/db/schemas/`
3. **Validate API Patterns**: Ensure server functions follow v1.87+ patterns
4. **Test Query Patterns**: Verify React Query hooks use TkDodo hierarchical patterns

## Conclusion

This integration approach provides:

- **Rapid Development**: Pre-designed implementation patterns
- **Comprehensive Features**: Full-featured PRDs with database support
- **Structured Planning**: TaskMaster task breakdown and tracking
- **Quality Implementation**: Best practices built into all patterns
- **Scalable Architecture**: Database schemas support advanced features from day one

The combination of comprehensive PRDs, detailed implementation guides, and TaskMaster project management creates an efficient development workflow that scales from MVP to full-featured platform.
