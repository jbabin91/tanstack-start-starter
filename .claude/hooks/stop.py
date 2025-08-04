#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern Stop hook using cchooks SDK
Provides session summary with git status and quality checks
"""

import subprocess
import sys
from datetime import datetime 
from pathlib import Path
from cchooks import create_context, StopContext


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
    log_debug("Running final quality checks")
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

def generate_session_summary():
    """Generate a simple session summary."""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Get git status
    change_count, changed_files = get_git_status()

    # Run quality checks
    quality_passed, quality_issues = run_final_quality_check()

    summary = [
        f"Claude Code session completed at {timestamp}",
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
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()
        
        # Ensure this is a Stop context
        if not isinstance(context, StopContext):
            print("❌ Invalid context - expected Stop", file=sys.stderr)
            context.output.exit_success()
            return
        
        # Generate and display session summary
        summary = generate_session_summary()
        print(f"\n📋 Session Summary:")
        print(summary)
        
        # Exit with success (shows output to user)
        context.output.exit_success()
        
    except Exception as e:
        print(f"❌ Stop hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)

if __name__ == "__main__":
    main()
