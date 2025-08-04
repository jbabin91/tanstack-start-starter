#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern PreCompact hook using cchooks SDK
Runs before context compaction to log conversation state
"""

import sys
from cchooks import create_context, PreCompactContext

def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a PreCompact context
        if not isinstance(context, PreCompactContext):
            print("❌ Invalid context - expected PreCompact", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Log before compaction (silent operation)
        # Context contains conversation_length, message_count, etc.
        
        # Always exit silently for pre-compact events
        context.output.exit_success()
        
    except Exception as e:
        print(f"❌ PreCompact hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)

if __name__ == "__main__":
    main()