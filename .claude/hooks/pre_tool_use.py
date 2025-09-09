#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern PreToolUse hook using cchooks SDK
Blocks dangerous commands and .env file access to prevent accidental data loss
"""

import re
import sys
from cchooks import create_context, PreToolUseContext


def is_dangerous_rm_command(command):
    """
    Detection of truly dangerous rm commands.
    Only blocks commands that could cause serious system damage.
    """
    # Normalize command by removing extra spaces and converting to lowercase
    normalized = ' '.join(command.lower().split())
    
    # Only block rm -rf targeting dangerous system paths
    dangerous_patterns = [
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+/',          # rm -rf /
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+/\*',       # rm -rf /*
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+~',         # rm -rf ~
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+\$HOME',    # rm -rf $HOME
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+\.\.',      # rm -rf ..
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+\.',        # rm -rf . (current dir)
        r'\brm\s+.*-[a-z]*r[a-z]*f\s+\*',        # rm -rf * (all files)
    ]
    
    # Check for truly dangerous patterns only
    for pattern in dangerous_patterns:
        if re.search(pattern, normalized):
            return True
    
    return False


def is_env_file_access(tool_name, tool_input):
    """
    Check if any tool is trying to access .env files containing sensitive data.
    """
    if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write', 'Bash']:
        # Check file paths for file-based tools
        if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write']:
            file_path = tool_input.get('file_path', '')
            if '.env' in file_path and not file_path.endswith('.env.sample'):
                return True
        
        # Check bash commands for .env file access
        elif tool_name == 'Bash':
            command = tool_input.get('command', '')
            # Pattern to detect .env file access (but allow .env.sample)
            env_patterns = [
                r'\b\.env\b(?!\.sample)',  # .env but not .env.sample
                r'cat\s+.*\.env\b(?!\.sample)',  # cat .env
                r'echo\s+.*>\s*\.env\b(?!\.sample)',  # echo > .env
                r'touch\s+.*\.env\b(?!\.sample)',  # touch .env
                r'cp\s+.*\.env\b(?!\.sample)',  # cp .env
                r'mv\s+.*\.env\b(?!\.sample)',  # mv .env
            ]
            
            for pattern in env_patterns:
                if re.search(pattern, command):
                    return True
    
    return False

def remind_coding_standards(tool_name, tool_input):
    """Remind about coding standards for code-related operations"""
    code_tools = ['Edit', 'MultiEdit', 'Write']
    
    if tool_name in code_tools:
        file_path = tool_input.get('file_path', '')
        
        # Check if this is a TypeScript/JavaScript file
        if file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
            print("📝 CODING STANDARDS REMINDER:", file=sys.stderr)
            print("   • FUNCTION DECLARATIONS: Use function name() {} (not arrow functions)", file=sys.stderr)
            print("   • TYPE over interface: Use type MyType = {} (except declaration merging)", file=sys.stderr)
            print("   • @/ IMPORTS ONLY: Never use relative imports (../ or ./)", file=sys.stderr)
            print("   • ICONS COMPONENT: Use <Icons.activity /> (not direct lucide imports)", file=sys.stderr)
            print("   • CUSTOM HOOKS: Use object parameters: usePost({ id })", file=sys.stderr)
            print("   • TANSTACK START: Use createServerFn() and getWebRequest() patterns", file=sys.stderr)
            print("   • DATABASE: Use modern pgTable array syntax: (table) => [...]", file=sys.stderr)
            print("   • QUALITY: Run pnpm typecheck && pnpm lint && pnpm format", file=sys.stderr)
            print("   • REFERENCE: See CLAUDE.md for complete standards", file=sys.stderr)
            print("", file=sys.stderr)  # Empty line for readability


def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a PreToolUse context
        if not isinstance(context, PreToolUseContext):
            print("❌ Invalid context - expected PreToolUse", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Remind about coding standards for code operations
        remind_coding_standards(context.tool_name, context.tool_input)
        
        # Check for .env file access (blocks access to sensitive environment files)
        if is_env_file_access(context.tool_name, context.tool_input):
            print("🚫 BLOCKED: Access to .env files containing sensitive data is prohibited", file=sys.stderr)
            print("Use .env.sample for template files instead", file=sys.stderr)
            context.output.exit_error("Environment file access blocked for security")
            return
        
        # Check for dangerous rm commands
        if context.tool_name == "Bash":
            command = context.tool_input.get("command", "")
            
            if is_dangerous_rm_command(command):
                print("🚫 BLOCKED: Dangerous rm command detected and prevented", file=sys.stderr)
                print(f"   Command: {command}", file=sys.stderr)
                context.output.exit_error("Dangerous command blocked for safety")
                return
        
        # All checks passed - allow operation
        context.output.exit_success()
        
    except Exception as e:
        print(f"❌ PreToolUse hook error: {e}", file=sys.stderr)
        # Use fallback exit on error - don't block operations due to hook failures
        sys.exit(0)


if __name__ == "__main__":
    main()