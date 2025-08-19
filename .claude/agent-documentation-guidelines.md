# Agent Documentation Guidelines

## Documentation Storage Strategy

### ✅ `.claude/` Directory → Temporary Agent Collaboration

**Use for:**

- Agent handoff summaries and status reports
- Implementation planning documents
- Work-in-progress specifications
- Collaboration artifacts between agents
- Files that become obsolete once work is complete
- "How to implement X" guides for current work

**Examples:**

- `.claude/session-management-summary.md` - Agent collaboration results
- `.claude/session-ui-implementation.md` - Temporary implementation guide
- `.claude/feature-planning.md` - Work-in-progress planning
- `.claude/agent-handoff.md` - Status between agent collaborations

### ✅ `serena/memories` → Long-term Project Knowledge

**Use for:**

- Established architectural patterns and decisions
- Permanent technical conventions
- Project standards and guidelines
- Information that will be useful weeks/months later
- Reusable patterns and best practices

**Examples:**

- `session_database_architecture` - Long-term schema design
- `authentication_security_patterns` - Established security approaches
- `component_audit_guidelines` - Permanent audit standards
- `code_style_conventions` - Project coding standards

### ❌ Project Root → Keep Clean

**Avoid creating:**

- Documentation files in project root
- Temporary `.md` files outside `.claude/`
- Architecture documents as separate project files

## Agent Workflow

### During Active Collaboration:

1. **Create temporary docs in `.claude/`** for agent coordination
2. **Use descriptive kebab-case names** (e.g., `session-ui-implementation.md`)
3. **Include "temporary" note** at bottom of file
4. **Reference specific file locations** and next steps

### After Work Completion:

1. **Delete temporary `.claude/` files** when work is done
2. **Move permanent architectural decisions** to Serena memory if valuable long-term
3. **Update existing project docs** (CLAUDE.md, README.md) if needed
4. **Clean up any project root files** created during work

### For Permanent Knowledge:

1. **Use Serena memory** with `feature_document_type` naming
2. **Focus on reusable information** that helps future development
3. **Document architectural decisions** and their rationale
4. **Establish patterns** that other agents can follow

## Memory Naming Convention

### Pattern: `{feature}_{document_type}`

**Document Types:**

- `_patterns` - Established code patterns and conventions
- `_architecture` - Technical architecture and design decisions
- `_guidelines` - Rules, standards, and best practices
- `_security_guide` - Security-specific guidance
- `_performance_guide` - Performance-related knowledge

## When to Use Each Approach

### `.claude/` Temporary Files When:

- Coordinating between multiple agents on active work
- Planning implementation phases
- Documenting "what needs to be built"
- Creating handoff summaries
- Working through complex multi-step features

### `serena/memories` When:

- Documenting established architectural decisions
- Creating reusable patterns for future features
- Establishing project conventions
- Preserving security or performance guidance
- Recording "why we chose this approach"

## File Lifecycle

### Temporary Files (`.claude/`):

```txt
Create → Use for collaboration → Complete work → Delete
```

### Permanent Knowledge (`serena/memories`):

```txt
Identify valuable pattern → Create memory → Reference in future work
```

This approach keeps the project repository clean while enabling effective agent collaboration and preserving valuable long-term knowledge.
