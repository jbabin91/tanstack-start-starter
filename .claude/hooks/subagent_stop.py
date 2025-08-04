#!/usr/bin/env python3
"""
SubagentStop Hook
Tracks subagent usage to improve future suggestions using centralized logging
"""

import json
import sys
from datetime import datetime

from common_functions import log_event, extract_session_id


def main():
    try:
        input_data = json.loads(sys.stdin.read())
        
        # Extract session ID for logging
        session_id = extract_session_id(input_data)
        
        # Access subagent information from input data
        subagent_type = input_data.get('subagentType', '')
        if not subagent_type:
            log_event("subagent_stop", {"early_exit": True, "reason": "No subagent type provided"}, session_id)
            return
        
        # Track the usage with centralized logging
        usage_data = {
            "type": "subagent_usage",
            "subagent_type": subagent_type,
            "task": input_data.get('task', 'Unknown task'),
            "success": input_data.get('success', True),
            "execution_time": input_data.get('execution_time'),
            "metadata": {
                "prompt_length": len(input_data.get('prompt', '')),
                "tools_used": input_data.get('tools_used', [])
            }
        }
        
        # Log to centralized system
        log_event("subagent_usage", usage_data, session_id)
        
        # Provide feedback
        if usage_data["success"]:
            print(f"\n✅ {subagent_type} subagent completed successfully", file=sys.stderr)
            print("💡 This agent is now tracked for future recommendations\n", file=sys.stderr)
        
        sys.exit(0)
    except Exception as e:
        # Log error
        log_event("subagent_stop", {"error": True, "exception": str(e)}, session_id)
        sys.exit(0)


if __name__ == "__main__":
    main()