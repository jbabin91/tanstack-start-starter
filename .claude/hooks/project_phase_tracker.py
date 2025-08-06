#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Project Phase Tracker Hook using cchooks SDK
Tracks development phases based on todo completion patterns
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from cchooks import create_context, PostToolUseContext


def analyze_todo_completion(todos: List[Dict[str, Any]]) -> Optional[Dict[str, str]]:
    """Analyze completed todos to detect phase transitions"""
    
    completed_todos = [t for t in todos if t.get('status') == 'completed']
    in_progress_todos = [t for t in todos if t.get('status') == 'in_progress']
    pending_todos = [t for t in todos if t.get('status') == 'pending']
    
    if not completed_todos:
        return None
    
    # Phase detection patterns
    phase_patterns = {
        'Planning': [
            'plan', 'design', 'architecture', 'specification', 'document',
            'ux', 'ui design', 'roadmap', 'strategy'
        ],
        'Implementation': [
            'implement', 'create', 'build', 'develop', 'add feature',
            'component', 'api', 'database', 'migration', 'hook'
        ],
        'Testing': [
            'test', 'testing', 'coverage', 'unit test', 'integration test',
            'e2e', 'quality', 'validation'
        ],
        'Deployment': [
            'deploy', 'production', 'release', 'build', 'ci/cd',
            'environment', 'docker', 'infrastructure'
        ],
        'Documentation': [
            'documentation', 'readme', 'guide', 'tutorial', 'docs',
            'api docs', 'reference'
        ]
    }
    
    # Analyze recent completions
    recent_completions = completed_todos[-5:]  # Last 5 completed
    completion_text = ' '.join([t.get('content', '').lower() for t in recent_completions])
    
    # Score each phase
    phase_scores = {}
    for phase, patterns in phase_patterns.items():
        score = sum(1 for pattern in patterns if pattern in completion_text)
        if score > 0:
            phase_scores[phase] = score
    
    if not phase_scores:
        return None
    
    # Get the highest scoring phase
    current_phase = max(phase_scores.keys(), key=lambda k: phase_scores[k])
    
    # Determine next logical phase
    phase_sequence = ['Planning', 'Implementation', 'Testing', 'Documentation', 'Deployment']
    current_index = phase_sequence.index(current_phase) if current_phase in phase_sequence else 0
    next_phase = phase_sequence[min(current_index + 1, len(phase_sequence) - 1)]
    
    return {
        'current_phase': current_phase,
        'next_phase': next_phase,
        'confidence': phase_scores[current_phase],
        'active_todos': len(in_progress_todos),
        'pending_todos': len(pending_todos)
    }


def update_project_status(phase_info: Dict[str, str]):
    """Update the project status file"""
    status_path = Path('.serena/memories/project_status.md')
    
    # Load existing status or create new
    milestones = []
    if status_path.exists():
        with open(status_path, 'r') as f:
            content = f.read()
            # Extract milestones section if it exists
            if '## Milestones' in content:
                milestones_section = content.split('## Milestones')[1].split('##')[0]
                milestones = [line.strip() for line in milestones_section.split('\n') if line.strip().startswith('-')]
    
    # Add new milestone if phase changed
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M')
    new_milestone = f"- **{phase_info['current_phase']} Phase Active** - {current_time}"
    
    # Don't duplicate recent milestones
    if not any(phase_info['current_phase'] in milestone for milestone in milestones[-3:]):
        milestones.append(new_milestone)
    
    # Keep only last 10 milestones
    milestones = milestones[-10:]
    
    status_content = f"""# Project Development Status

**Last Updated:** {current_time} (via phase tracker hook)

## Current Phase: {phase_info['current_phase']}

**Next Phase:** {phase_info['next_phase']}  
**Confidence Score:** {phase_info['confidence']}/5  
**Active Todos:** {phase_info['active_todos']}  
**Pending Todos:** {phase_info['pending_todos']}

## Development Context

Based on recent todo completion patterns, the project is currently in the **{phase_info['current_phase']}** phase.

### What This Means:
"""
    
    # Add phase-specific context
    phase_descriptions = {
        'Planning': 'Strategic decisions, UX design, and architectural planning are the focus.',
        'Implementation': 'Active development of features, components, and functionality.',
        'Testing': 'Quality assurance, test coverage, and validation activities.',
        'Documentation': 'Creating guides, API docs, and reference materials.',
        'Deployment': 'Production readiness, infrastructure, and release preparation.'
    }
    
    status_content += f"- {phase_descriptions.get(phase_info['current_phase'], 'Development activities in progress.')}\n"
    status_content += f"- Next logical step: Prepare for **{phase_info['next_phase']}** phase\n\n"
    
    status_content += "## Milestones\n\n"
    for milestone in milestones:
        status_content += f"{milestone}\n"
    
    status_content += f"""
## AI Assistant Context

When providing suggestions or asking for next steps, consider that we're in the **{phase_info['current_phase']}** phase. 
Focus recommendations on {phase_info['current_phase'].lower()}-appropriate activities and prepare for transition to {phase_info['next_phase']}.
"""
    
    with open(status_path, 'w') as f:
        f.write(status_content)


def update_project_context_with_phase(phase_info: Dict[str, str]):
    """Update project context with current phase"""
    context_path = Path('.serena/memories/project_context.md')
    
    if context_path.exists():
        with open(context_path, 'r') as f:
            content = f.read()
    else:
        content = "# Current Project Context - Auto-Updated\n\n"
    
    # Update the phase section
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if line.startswith('## Development Phase:'):
            # Replace with updated phase info
            new_lines.append(f"## Development Phase: {phase_info['current_phase']}")
            new_lines.append(f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M')} (via phase tracker)")
            new_lines.append("")
            new_lines.append(f"**Current Focus:** {phase_info['current_phase']} activities")
            new_lines.append(f"**Next Phase:** {phase_info['next_phase']}")
            new_lines.append(f"**Active Tasks:** {phase_info['active_todos']} in progress")
            new_lines.append("")
            continue
        new_lines.append(line)
    
    # If no phase section exists, add it at the top
    if not any(line.startswith('## Development Phase:') for line in lines):
        header_lines = new_lines[:2]  # Keep title and first blank line
        phase_section = [
            f"## Development Phase: {phase_info['current_phase']}",
            f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M')} (via phase tracker)",
            "",
            f"**Current Focus:** {phase_info['current_phase']} activities",
            f"**Next Phase:** {phase_info['next_phase']}",  
            f"**Active Tasks:** {phase_info['active_todos']} in progress",
            ""
        ]
        new_lines = header_lines + phase_section + new_lines[2:]
    
    with open(context_path, 'w') as f:
        f.write('\n'.join(new_lines))


def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a PostToolUse context
        if not isinstance(context, PostToolUseContext):
            context.output.exit_success()
            return
        
        # Only process TodoWrite tool
        if context.tool_name != "TodoWrite":
            context.output.exit_success()
            return
        
        # Get todos from tool input
        todos = context.tool_input.get("todos", [])
        
        if not todos:
            context.output.exit_success()
            return
        
        print("📊 Analyzing project phase from todo patterns...", file=sys.stderr)
        
        # Analyze todo completion patterns
        phase_info = analyze_todo_completion(todos)
        
        if not phase_info:
            context.output.exit_success()
            return
        
        print(f"   🎯 Detected phase: **{phase_info['current_phase']}**", file=sys.stderr)
        print(f"   ➡️  Next phase: {phase_info['next_phase']}", file=sys.stderr)
        print(f"   📈 Confidence: {phase_info['confidence']}/5", file=sys.stderr)
        
        # Update project status and context
        update_project_status(phase_info)
        update_project_context_with_phase(phase_info)
        
        print("   ✅ Project status updated", file=sys.stderr)
        
        context.output.exit_success("Project phase tracking completed")
            
    except Exception as e:
        print(f"❌ Phase tracker error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)


if __name__ == "__main__":
    main()