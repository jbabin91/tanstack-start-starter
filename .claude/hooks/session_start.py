#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern SessionStart hook using cchooks SDK
Loads project context when Claude Code starts or resumes sessions
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from cchooks import create_context, SessionStartContext


def get_git_status() -> tuple[Optional[str], Optional[int]]:
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


def get_recently_modified_files(minutes: int = 30) -> List[str]:
    """Get recently modified files"""
    try:
        result = subprocess.run(
            f"find src -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \\) -mmin -{minutes} | head -10",
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return result.stdout.strip().split('\n') if result.stdout.strip() else []
    except Exception:
        return []


def load_development_context() -> List[str]:
    """Load relevant development context for the session."""
    context_parts = []
    
    # Add git information
    branch, changes = get_git_status()
    if branch:
        context_parts.append(f"🌿 Current branch: {branch}")
        if changes and changes > 0:
            context_parts.append(f"📝 Uncommitted changes: {changes} files")
    
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
    
    # Check for project configuration
    if Path("CLAUDE.md").exists():
        context_parts.append("📋 Project has CLAUDE.md configuration")
    
    # Check package.json for project type
    if Path("package.json").exists():
        try:
            import json
            with open("package.json") as f:
                pkg_data = json.load(f)
                if "dependencies" in pkg_data:
                    # Detect key frameworks
                    deps = pkg_data["dependencies"]
                    frameworks = []
                    if "@tanstack/react-router" in deps:
                        frameworks.append("TanStack Router")
                    if "react" in deps:
                        frameworks.append("React")
                    if "drizzle-orm" in deps:
                        frameworks.append("Drizzle ORM")
                    if frameworks:
                        context_parts.append(f"🛠️ Stack: {', '.join(frameworks)}")
        except Exception:
            pass
    
    return context_parts




def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a SessionStart context
        if not isinstance(context, SessionStartContext):
            print("❌ Invalid context - expected SessionStart", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Handle different session start types
        if context.source == "resume":
            # Load previous work context
            # Previous context now provided by cchooks automatically
            print(f"\n🔄 Resuming session (context provided by cchooks)", file=sys.stderr)
        
        elif context.source == "startup":
            print("\n🚀 Starting new Claude Code session", file=sys.stderr)
            
            # Show recently modified files for context
            recent_files = get_recently_modified_files(60)  # Last hour
            if recent_files:
                print("📂 Recently modified files:", file=sys.stderr)
                for file_path in recent_files[:5]:
                    print(f"   - {file_path}", file=sys.stderr)
        
        elif context.source == "clear":
            print("\n🧹 Starting fresh session (history cleared)", file=sys.stderr)
        
        # Show development context for all session types
        context_parts = load_development_context()
        if context_parts:
            print("\n📋 Development Context:", file=sys.stderr)
            for part in context_parts:
                print(f"   {part}", file=sys.stderr)
        
        # Subagent stats now tracked by cchooks automatically
        
        print("", file=sys.stderr)  # Add spacing
        
        # Always exit with success - output is added to session context
        context.output.exit_success()
        
    except Exception as e:
        print(f"❌ SessionStart hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)


if __name__ == "__main__":
    main()