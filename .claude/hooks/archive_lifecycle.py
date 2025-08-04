#!/usr/bin/env python3
"""
Archive Lifecycle Management
Manages cleanup of completed work artifacts based on time and completion status
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path


def check_archive_lifecycle(weeks_threshold=4):
    """
    Check archived files and suggest cleanup for items older than threshold
    """
    archive_dir = Path(".claude/archive")
    if not archive_dir.exists():
        return []
    
    suggestions = []
    current_time = datetime.now()
    threshold_date = current_time - timedelta(weeks=weeks_threshold)
    
    # Check each archived file
    for file_path in archive_dir.glob("*.md"):
        try:
            # Get file modification time
            mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
            
            if mod_time < threshold_date:
                weeks_old = int((current_time - mod_time).days / 7)
                suggestions.append({
                    "file": file_path.name,
                    "weeks_old": weeks_old,
                    "action": "consider_deletion",
                    "reason": f"Archived {weeks_old} weeks ago"
                })
                
        except Exception:
            continue
    
    return suggestions


def archive_work_file(file_name, completion_notes=""):
    """
    Move a work-in-progress file to archive with completion metadata
    """
    wip_file = Path(f".claude/work-in-progress/{file_name}")
    archive_file = Path(f".claude/archive/{file_name}")
    
    if not wip_file.exists():
        return False
    
    try:
        # Move file to archive
        wip_file.rename(archive_file)
        
        # Add completion metadata as comment
        if completion_notes:
            with open(archive_file, 'r') as f:
                content = f.read()
            
            metadata = f"""
<!-- ARCHIVED: {datetime.now().isoformat()} -->
<!-- COMPLETION: {completion_notes} -->

{content}
"""
            with open(archive_file, 'w') as f:
                f.write(metadata)
        
        return True
    except Exception:
        return False


def main():
    """
    Run archive lifecycle check and output suggestions
    """
    try:
        # Read input (if provided)
        input_data = {}
        if not sys.stdin.isatty():
            try:
                input_data = json.loads(sys.stdin.read())
            except json.JSONDecodeError:
                pass
        
        # Check for cleanup suggestions
        suggestions = check_archive_lifecycle()
        
        if suggestions:
            print("\n🗂️ Archive Cleanup Suggestions:", file=sys.stderr)
            for item in suggestions:
                print(f"   📦 {item['file']} ({item['weeks_old']} weeks old)", file=sys.stderr)
            
            if len(suggestions) >= 3:
                print("   💡 Consider running archive cleanup", file=sys.stderr)
        
        # Show current work status
        wip_dir = Path(".claude/work-in-progress")
        archive_dir = Path(".claude/archive")
        
        wip_count = len(list(wip_dir.glob("*.md"))) if wip_dir.exists() else 0
        archive_count = len(list(archive_dir.glob("*.md"))) if archive_dir.exists() else 0
        
        if wip_count > 0 or archive_count > 0:
            print(f"\n📊 Work Status: {wip_count} active, {archive_count} archived", file=sys.stderr)
        
        sys.exit(0)
        
    except Exception:
        # Don't block on error
        sys.exit(0)


if __name__ == "__main__":
    main()