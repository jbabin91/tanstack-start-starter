#!/usr/bin/env python3
"""
SessionStart Hook
Restores context when resuming a Claude Code session
Reverted to manual JSON parsing for compatibility with Claude Code's hook format
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from utils import get_subagent_stats, load_work_context


def get_git_status():
    """Get current git status information."""
    try:
        # Get current branch
        branch_result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True,
            text=True,
            timeout=5
        )
        current_branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "unknown"
        
        # Get uncommitted changes count
        status_result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if status_result.returncode == 0:
            changes = status_result.stdout.strip().split('\n') if status_result.stdout.strip() else []
            uncommitted_count = len(changes)
        else:
            uncommitted_count = 0
        
        return current_branch, uncommitted_count
    except Exception:
        return None, None


def load_development_context():
    """Load relevant development context for the session."""
    context_parts = []
    
    # Add git information
    branch, changes = get_git_status()
    if branch:
        context_parts.append(f"🌿 Current branch: {branch}")
        if changes and changes > 0:
            context_parts.append(f"📝 Uncommitted changes: {changes} files")
    
    # Load project-specific context files if they exist
    context_files = [
        "CLAUDE.md",
        ".github/README.md", 
        "TODO.md",
        ".claude/CONTEXT.md"
    ]
    
    # Check for active work in progress
    work_in_progress_dir = Path(".claude/work-in-progress")
    if work_in_progress_dir.exists():
        wip_files = list(work_in_progress_dir.glob("*.md"))
        if wip_files:
            context_parts.append(f"🚧 Active work: {len(wip_files)} files in progress")
            # Show most recently modified work file
            if wip_files:
                latest_work = max(wip_files, key=lambda f: f.stat().st_mtime)
                context_parts.append(f"   📝 Latest: {latest_work.name}")
    
    # Check for archived work  
    archive_dir = Path(".claude/archive")
    if archive_dir.exists():
        archive_files = list(archive_dir.glob("*.md"))
        if archive_files:
            context_parts.append(f"📦 Archived: {len(archive_files)} completed features")
    
    for file_path in context_files:
        if Path(file_path).exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read().strip()
                    if content and file_path == "CLAUDE.md":
                        # Just note that project has CLAUDE.md configured
                        context_parts.append("📋 Project has CLAUDE.md configuration")
                        break
            except Exception:
                pass
    
    return context_parts


def main():
    try:
        input_data = json.loads(sys.stdin.read())
        
        session_type = input_data.get('sessionType', 'startup')  # "startup", "resume", or "clear"
        
        if session_type == "resume":
            # Load previous work context
            previous_context = load_work_context()
            
            if previous_context:
                timestamp = datetime.fromisoformat(previous_context["timestamp"])
                hours_since = int((datetime.now() - timestamp).total_seconds() / 3600)
                
                print(f"\n🔄 Resuming session from {hours_since} hours ago:", file=sys.stderr)
                print("📂 Last modified files:", file=sys.stderr)
                
                for file_path in previous_context["lastModifiedFiles"][:5]:
                    print(f"   - {file_path}", file=sys.stderr)
                
                branch_info = previous_context["branchInfo"]
                print(f"🌿 Branch: {branch_info['current']} ({branch_info['status']})", file=sys.stderr)
                
                if previous_context.get("currentTask"):
                    print(f"📋 Previous task: {previous_context['currentTask']}\n", file=sys.stderr)
        
        # Show development context for all session types
        context_parts = load_development_context()
        if context_parts:
            print("\n📋 Development Context:", file=sys.stderr)
            for part in context_parts:
                print(f"   {part}", file=sys.stderr)
        
        # Show subagent usage stats on any session start
        stats = get_subagent_stats()
        most_used = sorted(stats.items(), key=lambda x: x[1]["count"], reverse=True)[:3]
        
        if most_used:
            print("\n🤖 Your most used subagents:", file=sys.stderr)
            for agent, data in most_used:
                success_rate = int(data["successRate"] * 100)
                print(f"   - {agent}: {data['count']} uses ({success_rate}% success)", file=sys.stderr)
            print("", file=sys.stderr)
        
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == "__main__":
    main()