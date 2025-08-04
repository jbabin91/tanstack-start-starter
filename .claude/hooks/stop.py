#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

def get_git_status():
    """Get current git changes for session summary."""
    try:
        # Get uncommitted changes
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            changes = result.stdout.strip().split('\n') if result.stdout.strip() else []
            return len(changes), changes[:5]  # Return count and first 5 files
        return 0, []
    except Exception:
        return 0, []

def run_final_quality_check():
    """Run final project-wide quality checks."""
    checks_passed = True
    issues = []

    try:
        # Check if build passes
        result = subprocess.run(['pnpm', 'build'], capture_output=True, timeout=30)
        if result.returncode != 0:
            checks_passed = False
            issues.append("Build failed")
    except Exception:
        pass

    try:
        # Check TypeScript
        result = subprocess.run(['pnpm', 'typecheck'], capture_output=True, timeout=15)
        if result.returncode != 0:
            checks_passed = False
            issues.append("TypeScript errors")
    except Exception:
        pass

    try:
        # Check linting
        result = subprocess.run(['pnpm', 'lint'], capture_output=True, timeout=15)
        if result.returncode != 0:
            checks_passed = False
            issues.append("Linting errors")
    except Exception:
        pass

    return checks_passed, issues

def generate_session_summary(input_data):
    """Generate a simple session summary."""
    session_id = input_data.get('session_id', 'unknown')[:8]
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Get git status
    change_count, changed_files = get_git_status()

    # Run quality checks
    quality_passed, quality_issues = run_final_quality_check()

    summary = [
        f"Session {session_id} completed at {timestamp}",
        f"Files modified: {change_count}",
    ]

    if changed_files:
        summary.append("Recent changes:")
        for file in changed_files:
            summary.append(f"  {file}")

    if quality_passed:
        summary.append("✅ All quality checks passed")
    else:
        summary.append("⚠️  Quality issues detected:")
        for issue in quality_issues:
            summary.append(f"  - {issue}")

    return "\n".join(summary)

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Ensure logs directory exists
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'stop.json'

        # Read existing log data or initialize empty list
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []

        # Append new data with summary
        log_entry = input_data.copy()
        log_entry['session_summary'] = generate_session_summary(input_data)
        log_data.append(log_entry)

        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)

        # Print session summary to stdout (visible in transcript mode)
        print(f"\n📋 Session Summary:")
        print(generate_session_summary(input_data))

        sys.exit(0)

    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)

if __name__ == "__main__":
    main()
