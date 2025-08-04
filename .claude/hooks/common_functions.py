#!/usr/bin/env python3
"""
Common logging utility for Claude Code hooks.

Provides centralized logging functionality with date-based log files.
All hook events are logged to hooks_log_yyyymmdd_sessionid.jsonl files using JSON Lines format.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict


def extract_session_id(input_data: Dict[str, Any]) -> str:
    """
    Extract session ID from Claude Code input data.
    
    Args:
        input_data: Input data from Claude Code hook
        
    Returns:
        Session ID string, or "unknown" if not found
    """
    # Try to get session ID from various possible locations in the input data
    session_data = input_data.get("session", {})
    session_id = session_data.get("session_id")
    
    if not session_id:
        # Fallback: try to get from top-level
        session_id = input_data.get("session_id")
    
    if not session_id:
        # Fallback: try to get from context
        context = input_data.get("context", {})
        session_id = context.get("session_id")
    
    return session_id or "unknown"


def log_event(hook_name: str, event_data: Dict[str, Any], session_id: str = None) -> None:
    """
    Log a hook event to the date-based log file.
    
    Args:
        hook_name: Name of the hook generating the event
        event_data: Event data to log
        session_id: Optional session ID to include in filename
    """
    log_dir = Path(__file__).parent.parent / "logs"
    log_dir.mkdir(exist_ok=True)
    
    # Create date-based log filename with optional session ID suffix
    date_str = datetime.now().strftime("%Y%m%d")
    if session_id and session_id != "unknown":
        log_file = log_dir / f"hooks_log_{date_str}_{session_id}.jsonl"
    else:
        log_file = log_dir / f"hooks_log_{date_str}.jsonl"
    
    timestamp = datetime.now().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "hook": hook_name,
        "data": event_data
    }
    
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        # Fallback: write to stderr if logging fails
        import sys
        fallback_entry = {
            "error": "logging_failed",
            "original_hook": hook_name,
            "exception": str(e),
            "timestamp": timestamp
        }
        print(json.dumps(fallback_entry), file=sys.stderr)