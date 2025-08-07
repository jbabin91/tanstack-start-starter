#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Documentation Memory Sync Hook using cchooks SDK
Updates cross-references when serena memories change
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime

from cchooks import create_context, PostToolUseContext


def should_process_memory(file_path: str) -> bool:
    """Check if this is a memory file we should process"""
    if not file_path.startswith('.serena/memories/'):
        return False
    
    if file_path.endswith('.md'):
        return True
        
    return False


def extract_doc_references(content: str) -> List[str]:
    """Extract documentation references from memory content"""
    import re
    
    references = []
    
    # Look for markdown links to docs
    doc_patterns = [
        r'\[.*?\]\(\.\./docs/([^)]+)\)',  # [text](../docs/path)
        r'\[.*?\]\(/docs/([^)]+)\)',      # [text](/docs/path)
        r'docs/([a-zA-Z0-9_/-]+\.md)',   # direct references
    ]
    
    for pattern in doc_patterns:
        matches = re.findall(pattern, content)
        references.extend(matches)
    
    return list(set(references))  # Remove duplicates


def update_documentation_index(memory_file: str, doc_refs: List[str]):
    """Update the documentation index with cross-references"""
    index_path = Path('.serena/memories/documentation_index.md')
    
    # Create index if it doesn't exist
    if not index_path.exists():
        index_content = """# Documentation Cross-Reference Index

This file maintains cross-references between serena memories and documentation.

## Memory → Documentation Links

"""
    else:
        with open(index_path, 'r') as f:
            index_content = f.read()
    
    # Update or add this memory's references
    memory_name = Path(memory_file).stem
    
    # Remove old entry for this memory
    lines = index_content.split('\n')
    new_lines = []
    skip_section = False
    
    for line in lines:
        if line.startswith(f'### {memory_name}'):
            skip_section = True
            continue
        elif skip_section and line.startswith('### '):
            skip_section = False
        
        if not skip_section:
            new_lines.append(line)
    
    # Add new entry
    if doc_refs:
        new_lines.append(f'\n### {memory_name}')
        new_lines.append(f'**Memory File:** {memory_file}')
        new_lines.append('**References:**')
        for ref in doc_refs:
            new_lines.append(f'- [docs/{ref}](../../docs/{ref})')
        new_lines.append('')
    
    # Write updated index
    with open(index_path, 'w') as f:
        f.write('\n'.join(new_lines))


def update_project_context():
    """Update project context with latest memory activity"""
    context_path = Path('.serena/memories/project_context.md')
    
    # Get recent memory modifications
    memories_dir = Path('.serena/memories')
    if not memories_dir.exists():
        return
    
    memory_files = list(memories_dir.glob('*.md'))
    memory_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
    
    recent_memories = []
    for f in memory_files[:5]:  # Last 5 modified
        if f.name not in ['project_context.md', 'documentation_index.md']:
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            recent_memories.append({
                'file': f.name,
                'modified': mtime.strftime('%Y-%m-%d %H:%M')
            })
    
    # Update context file
    context_content = f"""# Current Project Context - Auto-Updated

**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M')} (via memory sync hook)

## Recent Memory Activity
"""
    
    for memory in recent_memories:
        context_content += f"- **{memory['file']}** - {memory['modified']}\n"
    
    context_content += f"""
## Documentation Status
- Cross-references maintained in [docs/index.md](../../docs/index.md)
- {len(memory_files)} memory files total
- Auto-sync active ✅

## Next Steps
Check recent memory updates above for current planning context.
"""
    
    with open(context_path, 'w') as f:
        f.write(context_content)


def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a PostToolUse context
        if not isinstance(context, PostToolUseContext):
            context.output.exit_success()
            return
        
        # Only process memory write tools
        if context.tool_name != "mcp__serena__write_memory":
            context.output.exit_success()
            return
        
        # Get memory name from tool input
        memory_name = context.tool_input.get("memory_name")
        content = context.tool_input.get("content", "")
        
        if not memory_name:
            context.output.exit_success()
            return
        
        memory_file = f'.serena/memories/{memory_name}.md'
        
        print(f"📝 Syncing documentation references for {memory_name}...", file=sys.stderr)
        
        # Extract documentation references
        doc_refs = extract_doc_references(content)
        
        # Update documentation index
        update_documentation_index(memory_file, doc_refs)
        
        # Update project context
        update_project_context()
        
        if doc_refs:
            print(f"   🔗 Found {len(doc_refs)} documentation references", file=sys.stderr)
            for ref in doc_refs[:3]:  # Show first 3
                print(f"   📄 docs/{ref}", file=sys.stderr)
        
        print("   ✅ Documentation index updated", file=sys.stderr)
        
        # Format and lint the updated files
        print("   🎨 Running format and lint:md...", file=sys.stderr)
        try:
            subprocess.run(["pnpm", "format"], check=False, capture_output=True)
            subprocess.run(["pnpm", "lint:md:fix"], check=False, capture_output=True)
            print("   ✅ Format and lint:md completed", file=sys.stderr)
        except Exception as e:
            print(f"   ⚠️  Format/lint warning: {e}", file=sys.stderr)
        
        context.output.exit_success("Memory documentation sync completed")
            
    except Exception as e:
        print(f"❌ Doc memory sync error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)


if __name__ == "__main__":
    main()