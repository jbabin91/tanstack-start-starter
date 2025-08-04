#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern SubagentStop hook using cchooks SDK
Tracks subagent completion events
"""

import sys
from cchooks import create_context, SubagentStopContext

def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a SubagentStop context
        if not isinstance(context, SubagentStopContext):
            print("❌ Invalid context - expected SubagentStop", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Log subagent completion (silent operation)
        # Context contains subagent_type, task_description, success status, etc.
        
        # Always exit silently for subagent stop events
        context.output.exit_success()
        
    except Exception as e:
        print(f"❌ SubagentStop hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)

if __name__ == "__main__":
    main()