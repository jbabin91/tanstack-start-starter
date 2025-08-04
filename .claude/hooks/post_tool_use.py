#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import re
import sys
import subprocess
from pathlib import Path


def run_lint_fix(file_path: str) -> dict:
    """Run lint fix and parse results"""
    try:
        result = subprocess.run(
            ['pnpm', 'lint:fix', file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        output = result.stdout + result.stderr
        
        # Parse ESLint output for errors/warnings
        error_match = re.search(r'(\d+) error', output)
        warning_match = re.search(r'(\d+) warning', output)
        fixed_match = re.search(r'(\d+) problem.*fixed', output)
        
        return {
            "success": result.returncode == 0,
            "fixedCount": int(fixed_match.group(1)) if fixed_match else 0,
            "errorCount": int(error_match.group(1)) if error_match else 0,
            "warningCount": int(warning_match.group(1)) if warning_match else 0,
            "output": output
        }
    except Exception:
        return {"success": False, "fixedCount": 0, "errorCount": 0, "warningCount": 0, "output": ""}


def run_type_check() -> dict:
    """Run TypeScript type checking"""
    try:
        result = subprocess.run(
            ['pnpm', 'typecheck'],
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout + result.stderr
        }
    except Exception:
        return {"success": False, "output": ""}


def run_format(file_path: str) -> dict:
    """Run formatting and check if changes were made"""
    try:
        # First check if file needs formatting
        check_result = subprocess.run(
            ['pnpm', 'prettier', '-c', file_path],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if check_result.returncode == 0:
            return {"success": True, "changed": False}
        
        # File needs formatting, apply it
        format_result = subprocess.run(
            ['pnpm', 'prettier', '-w', file_path],
            capture_output=True,
            text=True,
            timeout=15
        )
        return {"success": format_result.returncode == 0, "changed": format_result.returncode == 0}
    except Exception:
        return {"success": False, "changed": False}


def check_new_files() -> list:
    """Check for new untracked files that need quality checks"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            return []
        
        new_files = []
        for line in result.stdout.split('\n'):
            if line.startswith('??'):  # Untracked files
                file_path = line[3:].strip()
                if file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.md', '.mdx')):
                    new_files.append(file_path)
        
        return new_files
    except Exception:
        return []


def process_file_quality_checks(file_path: str, input_data: dict):
    """Process quality checks for a single file"""
    if not Path(file_path).exists():
        return
    
    is_typescript_file = file_path.endswith(('.ts', '.tsx'))
    is_code_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'))
    is_formattable_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.md', '.mdx'))
    
    file_name = Path(file_path).name
    print(f"\n🔧 Running quality checks on {file_name}...", file=sys.stderr)
    
    has_issues = False
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
    
    # Log quality check results to JSON file
    log_dir = Path.cwd() / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'post_tool_use.json'
    
    # Read existing log data or initialize empty list
    if log_path.exists():
        with open(log_path, 'r') as f:
            try:
                log_data = json.load(f)
            except (json.JSONDecodeError, ValueError):
                log_data = []
    else:
        log_data = []
    
    # Append new quality check results
    quality_results = input_data.copy()
    quality_results.update({
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
    })
    log_data.append(quality_results)
    
    # Write back to file with formatting
    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    # Choose exit code based on activity and issues
    if has_issues:
        print("\n⚠️  Please fix the issues above before continuing\n", file=sys.stderr)
        sys.exit(2)  # Issues found - make output visible to user
    elif activity_occurred:
        print("✨ All quality checks passed!\n", file=sys.stderr)
        sys.exit(2)  # Activity occurred - make output visible to show what happened
    else:
        # No activity, no issues - silent success
        pass


def main():
    try:
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Ensure logs directory exists
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'post_tool_use.json'
        
        # Read existing log data or initialize empty list
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        # Append initial event data
        log_entry = input_data.copy()
        log_entry.update({
            "tool_invoked": input_data.get("tool", {}),
            "session_context": input_data.get("session", {})
        })
        log_data.append(log_entry)
        
        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        tool = input_data.get("tool", {})
        
        # Check for new files that need quality checks regardless of tool used
        new_files = check_new_files()
        if new_files:
            print(f"\n🆕 Found {len(new_files)} untracked files that need quality checks...", file=sys.stderr)
            for file_path in new_files:
                process_file_quality_checks(file_path, input_data)
            return
        
        if not tool or tool.get("name") not in ["Write", "Edit", "MultiEdit"]:
            sys.exit(0)
        
        file_path = tool.get("parameters", {}).get("file_path")
        if not file_path or not Path(file_path).exists():
            sys.exit(0)
        
        # Process the file that was just modified
        process_file_quality_checks(file_path, input_data)
        
    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()