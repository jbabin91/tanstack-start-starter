#!/usr/bin/env python3
"""
UserPromptSubmit Hook
Enhances prompts with project context and suggests relevant subagents
Reverted to manual JSON parsing for compatibility with Claude Code's hook format
"""

import json
import sys

from utils import get_available_subagents, load_claude_md_summary, suggest_subagent


def main():
    try:
        input_data = json.loads(sys.stdin.read())
        
        prompt = input_data.get('prompt', '')
        
        # Load project context
        claude_md_context = load_claude_md_summary()
        
        # Check for subagent suggestions
        suggested_agent = suggest_subagent(prompt)
        available_agents = get_available_subagents()
        
        # Build enhanced prompt
        enhanced_prompt = prompt
        
        # Add subagent suggestion if relevant
        if suggested_agent and suggested_agent in available_agents:
            enhanced_prompt += f"\n\n💡 Consider using the {suggested_agent} subagent for this task."
        
        # Add context from CLAUDE.md
        if claude_md_context:
            enhanced_prompt += claude_md_context
        
        # Output enhanced prompt
        print(json.dumps({"prompt": enhanced_prompt}))
        sys.exit(0)
    except Exception:
        # On any error, pass through the original prompt
        sys.exit(0)


if __name__ == "__main__":
    main()