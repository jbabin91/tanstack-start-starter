#!/usr/bin/env python3
"""
PreCompact Hook
Saves work context before Claude Code compacts the conversation using centralized logging
"""

import json
import sys
from datetime import datetime

from common_functions import log_event, extract_session_id
from utils import get_git_branch_info, get_recently_modified_files


def extract_current_task(input_data: dict) -> str:
    """Extract current task from input data"""
    # In a real implementation, you might analyze recent messages
    # For now, we'll just note that a compact is happening
    last_message = input_data.get('lastUserMessage', "Unknown task")
    return f"Working on: {last_message}"


def main():
    try:
        input_data = json.loads(sys.stdin.read())
        
        # Extract session ID for logging
        session_id = extract_session_id(input_data)
        
        # Extract current work context
        work_context = {
            "type": "work_context",
            "compact_type": input_data.get("type", "unknown"),
            "timestamp": datetime.now().isoformat(),
            "lastModifiedFiles": get_recently_modified_files(60),  # Last hour
            "currentTask": extract_current_task(input_data),
            "branchInfo": get_git_branch_info(),
            "session_info": {
                "message_count": input_data.get("message_count", 0),
                "context_size": input_data.get("context_size", 0)
            }
        }
        
        # Log to centralized system instead of separate file
        log_event("work_context", work_context, session_id)
        
        # Log what we're preserving
        print(f"📦 Preserving context before compact:", file=sys.stderr)
        print(f"- Files modified: {len(work_context['lastModifiedFiles'])}", file=sys.stderr)
        print(f"- Branch: {work_context['branchInfo']['current']} ({work_context['branchInfo']['status']})", file=sys.stderr)
        print(f"- Task: {work_context['currentTask']}", file=sys.stderr)
        
        sys.exit(0)
    except Exception as e:
        # Log error
        log_event("pre_compact", {"error": True, "exception": str(e)}, session_id)
        # Exit with 0 to allow compact to continue
        sys.exit(0)


if __name__ == "__main__":
    main()