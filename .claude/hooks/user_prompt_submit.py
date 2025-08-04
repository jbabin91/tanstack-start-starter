#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import sys
from pathlib import Path
from datetime import datetime

def debug_mode_active() -> bool:
    """Check if debug mode is enabled"""
    return os.getenv("CLAUDE_HOOKS_DEBUG", "0") == "1"

def log_debug(message: str):
    """Log debug message if debug mode is active"""
    if debug_mode_active():
        print(f"🐛 [DEBUG] {message}", file=sys.stderr)

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        log_debug("User prompt submit hook started")
        
        # Ensure logs directory exists
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'user_prompt_submit.json'
        
        # Read existing log data or initialize empty list
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        # Add timestamp and append new data
        log_entry = input_data.copy()
        log_entry['timestamp'] = datetime.now().isoformat()
        log_data.append(log_entry)
        
        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        if debug_mode_active():
            print("🐛 [DEBUG] User prompt logged - always showing output in debug mode", file=sys.stderr)
            sys.exit(2)  # Always visible in debug mode
        else:
            sys.exit(0)
        
    except json.JSONDecodeError as e:
        log_debug(f"JSON decode error: {e}")
        sys.exit(0)
    except Exception as e:
        log_debug(f"Exception occurred: {type(e).__name__}: {e}")
        sys.exit(0)

if __name__ == "__main__":
    main()