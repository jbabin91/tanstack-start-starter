#!/usr/bin/env python3
"""
PostToolUse Hook
Smart code quality checks with detailed feedback and comprehensive logging
"""

import json
import re
import sys
from pathlib import Path

from common_functions import log_event, extract_session_id
from utils import run_command


def run_lint_fix(file_path: str) -> dict:
    """Run lint fix and parse results"""
    success, stdout, stderr = run_command(f'pnpm lint:fix "{file_path}"')
    
    output = stdout + stderr
    
    # Parse ESLint output for errors/warnings
    error_match = re.search(r'(\d+) error', output)
    warning_match = re.search(r'(\d+) warning', output)
    fixed_match = re.search(r'(\d+) problem.*fixed', output)
    
    return {
        "success": success,
        "fixedCount": int(fixed_match.group(1)) if fixed_match else 0,
        "errorCount": int(error_match.group(1)) if error_match else 0,
        "warningCount": int(warning_match.group(1)) if warning_match else 0,
        "output": output
    }


def run_type_check() -> dict:
    """Run TypeScript type checking"""
    success, stdout, stderr = run_command("pnpm typecheck")
    return {
        "success": success,
        "output": stdout + stderr
    }


def run_format(file_path: str) -> dict:
    """Run formatting and check if changes were made"""
    # First check if file needs formatting
    check_success, _, _ = run_command(f'pnpm prettier -c "{file_path}"')
    
    if check_success:
        return {"success": True, "changed": False}
    
    # File needs formatting, apply it
    format_success, _, _ = run_command(f'pnpm prettier -w "{file_path}"')
    return {"success": format_success, "changed": format_success}


def main():
    try:
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Extract session ID for logging
        session_id = extract_session_id(input_data)
        
        # Log the event with structured data
        log_event("post_tool_use", {
            "tool_invoked": input_data.get("tool", {}),
            "session_context": input_data.get("session", {})
        }, session_id)
        
        tool = input_data.get("tool", {})
        if not tool or tool.get("name") not in ["Write", "Edit", "MultiEdit"]:
            # Log early exit
            log_event("post_tool_use", {
                "early_exit": True,
                "reason": "Tool not relevant for quality checks",
                "tool_name": tool.get("name", "unknown")
            }, session_id)
            sys.exit(0)
        
        file_path = tool.get("parameters", {}).get("file_path")
        if not file_path or not Path(file_path).exists():
            # Log early exit
            log_event("post_tool_use", {
                "early_exit": True,
                "reason": "File path invalid or doesn't exist",
                "file_path": file_path
            }, session_id)
            sys.exit(0)
        
        is_typescript_file = file_path.endswith(('.ts', '.tsx'))
        is_code_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'))
        is_formattable_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.md', '.mdx'))
        
        file_name = Path(file_path).name
        print(f"\n🔧 Running quality checks on {file_name}...", file=sys.stderr)
        
        has_issues = False
        
        # Track activity for output decision
        activity_occurred = False
        
        # Format first
        if is_formattable_file:
            format_result = run_format(file_path)
            if format_result["changed"]:
                print("📝 Code formatted", file=sys.stderr)
                activity_occurred = True
        
        # Then lint and fix
        if is_code_file:
            lint_result = run_lint_fix(file_path)
            
            if lint_result["fixedCount"] > 0:
                print(f"✨ Fixed {lint_result['fixedCount']} linting issues", file=sys.stderr)
                activity_occurred = True
            
            if lint_result["errorCount"] > 0:
                print(f"❌ {lint_result['errorCount']} linting errors need manual attention", file=sys.stderr)
                has_issues = True
                activity_occurred = True
            
            if lint_result["warningCount"] > 0:
                print(f"⚠️  {lint_result['warningCount']} linting warnings", file=sys.stderr)
                activity_occurred = True
        
        # Finally type check
        if is_typescript_file:
            type_result = run_type_check()
            if not type_result["success"]:
                print("💥 TypeScript errors detected", file=sys.stderr)
                # Show first few lines of type errors
                lines = type_result["output"].split('\n')[:5]
                for line in lines:
                    if line.strip():
                        print(f"   {line}", file=sys.stderr)
                has_issues = True
                activity_occurred = True
            else:
                print("✅ Types are valid", file=sys.stderr)
                activity_occurred = True
        
        # Log quality check results
        quality_results = {
            "quality_check_completed": True,
            "file_path": file_path,
            "file_type": {
                "typescript": is_typescript_file,
                "code": is_code_file,
                "formattable": is_formattable_file
            },
            "activity_occurred": activity_occurred,
            "has_issues": has_issues,
            "checks_performed": {
                "formatting": is_formattable_file,
                "linting": is_code_file,
                "type_checking": is_typescript_file
            }
        }
        log_event("post_tool_use", quality_results, session_id)
        
        # Choose exit code based on activity and issues
        if has_issues:
            print("\n⚠️  Please fix the issues above before continuing\n", file=sys.stderr)
            log_event("post_tool_use", {"visible_output": True, "reason": "Issues found"}, session_id)
            sys.exit(2)  # Issues found - make output visible to user
        elif activity_occurred:
            print("✨ All quality checks passed!\n", file=sys.stderr)
            log_event("post_tool_use", {"visible_output": True, "reason": "Activity occurred"}, session_id)
            sys.exit(2)  # Activity occurred - make output visible to show what happened
        else:
            # No activity, no issues - silent success
            log_event("post_tool_use", {"visible_output": False, "reason": "No activity needed"}, session_id)
            sys.exit(0)
        
    except Exception as e:
        # Log error with detailed information
        log_event("post_tool_use", {
            "error": True,
            "exception": str(e),
            "type": "post_tool_use_error"
        }, session_id)
        print(f"Hook error: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()