#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "cchooks>=0.1.3",
# ]
# ///

"""
Modern UserPromptSubmit hook using cchooks SDK
Provides context injection, prompt validation, and subagent suggestions
"""

import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from cchooks import create_context, UserPromptSubmitContext


def suggest_subagent(prompt: str) -> Optional[str]:
    """Check if prompt might benefit from a subagent"""
    prompt_lower = prompt.lower()

    subagent_patterns = {
        'fullstack-developer': ['full stack', 'api', 'database', 'frontend', 'backend', 'complete feature'],
        'frontend-developer': ['ui', 'component', 'react', 'styling', 'responsive', 'interface'],
        'backend-developer': ['database', 'schema', 'api endpoint', 'drizzle', 'migration', 'server'],
        'authentication-specialist': ['auth', 'login', 'session', 'better-auth', 'permission', 'security'],
        'code-reviewer': ['review', 'check code', 'code quality', 'best practices', 'refactor'],
        'refactoring-specialist': ['refactor', 'split file', 'too large', 'reorganize', 'clean up'],
        'database-architect': ['schema design', 'database design', 'optimize query', 'performance'],
        'performance-engineer': ['slow', 'performance', 'optimize', 'bundle size', 'speed up'],
        'security-auditor': ['security', 'vulnerability', 'secure', 'protection', 'audit'],
        'test-automator': ['test', 'testing', 'coverage', 'unit test', 'e2e'],
        'debugger': ['error', 'bug', 'not working', 'exception', 'undefined', 'fix'],
        'typescript-expert': ['type', 'typescript', 'generic', 'interface', 'type error'],
        'accessibility-specialist': ['accessibility', 'a11y', 'screen reader', 'wcag', 'keyboard'],
        'email-specialist': ['email', 'resend', 'template', 'notification', 'transactional'],
        'ui-ux-designer': ['design', 'user experience', 'layout', 'wireframe', 'mockup'],
    }

    for agent, patterns in subagent_patterns.items():
        if any(pattern in prompt_lower for pattern in patterns):
            return agent

    return None


def extract_context_hints(prompt: str) -> List[str]:
    """Extract context hints from the prompt"""
    hints = []

    # Look for file references
    file_patterns = [
        r'(?:file|in|from|edit|update|modify|create)\s+([a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+)',
        r'([a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+)\s+(?:file|component)',
        r'`([a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+)`',
    ]

    for pattern in file_patterns:
        matches = re.findall(pattern, prompt, re.IGNORECASE)
        for match in matches:
            if Path(match).exists():
                hints.append(f"📄 Referenced file exists: {match}")
            else:
                hints.append(f"📄 Referenced file: {match} (not found)")

    # Look for component/function references
    component_patterns = [
        r'(?:component|function|class)\s+([A-Z][a-zA-Z0-9]+)',
        r'([A-Z][a-zA-Z0-9]+)\s+(?:component|function|class)',
        r'`([A-Z][a-zA-Z0-9]+)`',
    ]

    for pattern in component_patterns:
        matches = re.findall(pattern, prompt, re.IGNORECASE)
        for match in matches:
            hints.append(f"🧩 Component/Function reference: {match}")

    # Look for technology mentions
    tech_keywords = {
        'react': '⚛️ React',
        'typescript': '📘 TypeScript',
        'tanstack': '🚀 TanStack',
        'drizzle': '💧 Drizzle ORM',
        'tailwind': '🎨 TailwindCSS',
        'shadcn': '🎨 shadcn/ui',
        'better-auth': '🔐 better-auth',
        'resend': '📧 Resend'
    }

    for keyword, icon in tech_keywords.items():
        if keyword in prompt.lower():
            hints.append(f"{icon} technology mentioned")

    return hints


def check_prompt_quality(prompt: str) -> List[str]:
    """Check prompt quality and provide suggestions"""
    issues = []

    # Check if prompt is too short
    if len(prompt.strip()) < 10:
        issues.append("⚠️ Prompt seems very short - consider adding more context")

    # Check for vague requests
    vague_patterns = [
        r'^(help|fix|create|make|do)\s*$',
        r'^(how do i|can you|please)\s*$',
        r'^(i want|i need)\s*$'
    ]

    for pattern in vague_patterns:
        if re.match(pattern, prompt.strip(), re.IGNORECASE):
            issues.append("💡 Consider being more specific about what you want to achieve")
            break

    # Check for missing context clues
    if not any(keyword in prompt.lower() for keyword in ['file', 'component', 'function', 'feature', 'bug', 'error']):
        if len(prompt.split()) > 3:  # Only for longer prompts
            issues.append("💡 Consider mentioning specific files or components")

    return issues


def inject_project_context() -> str:
    """Inject relevant project context"""
    context_parts = []

    # Add recent activity context
    logs_dir = Path(".claude/logs")
    if logs_dir.exists():
        post_tool_log = logs_dir / "post_tool_use.json"
        if post_tool_log.exists():
            try:
                import json
                with open(post_tool_log) as f:
                    log_data = json.load(f)
                    if log_data and isinstance(log_data, list):
                        recent_files = []
                        for entry in log_data[-3:]:  # Last 3 entries
                            if "tool_input" in entry:
                                file_path = entry["tool_input"].get("file_path")
                                if file_path and file_path not in recent_files:
                                    recent_files.append(file_path)

                        if recent_files:
                            context_parts.append(f"Recent files worked on: {', '.join(recent_files)}")
            except Exception:
                pass

    # Add git context
    try:
        import subprocess
        branch_result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True,
            text=True,
            timeout=3
        )
        if branch_result.returncode == 0:
            branch = branch_result.stdout.strip()
            context_parts.append(f"Current branch: {branch}")
    except Exception:
        pass

    if context_parts:
        return "\n\n" + "📋 **Current Context:**\n" + "\n".join(f"- {part}" for part in context_parts)

    return ""


def main():
    """Main hook entry point using cchooks"""
    try:
        # Create context using cchooks
        context = create_context()

        # Ensure this is a UserPromptSubmit context
        if not isinstance(context, UserPromptSubmitContext):
            print("❌ Invalid context - expected UserPromptSubmit", file=sys.stderr)
            context.output.exit_success()
            return

        prompt = context.prompt

        # Log the prompt for debugging/analytics
        log_dir = Path(".claude/logs")
        log_dir.mkdir(exist_ok=True)
        log_path = log_dir / "user_prompt_submit.json"

        try:
            if log_path.exists():
                with open(log_path) as f:
                    log_data = json.load(f)
            else:
                log_data = []
        except:
            log_data = []

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "prompt_length": len(prompt),
            "word_count": len(prompt.split())
        }
        log_data.append(log_entry)

        with open(log_path, 'w') as f:
            import json
            json.dump(log_data, f, indent=2)

        # Check for subagent suggestions
        suggested_agent = suggest_subagent(prompt)
        if suggested_agent:
            print(f"💡 This prompt might benefit from the **{suggested_agent}** subagent", file=sys.stderr)

        # Extract context hints
        hints = extract_context_hints(prompt)
        if hints:
            print("🔍 Context detected:", file=sys.stderr)
            for hint in hints[:3]:  # Limit to 3 hints
                print(f"   {hint}", file=sys.stderr)

        # Check prompt quality
        quality_issues = check_prompt_quality(prompt)
        if quality_issues:
            for issue in quality_issues:
                print(f"   {issue}", file=sys.stderr)

        # Inject project context if it would be helpful
        if len(prompt.split()) > 5:  # Only for substantial prompts
            project_context = inject_project_context()
            if project_context:
                # Add context to the prompt
                enhanced_prompt = prompt + project_context
                # Output the enhanced prompt for Claude to see
                print(enhanced_prompt)
                context.output.exit_success()
                return

        # No context injection needed - just pass through
        context.output.exit_success()

    except Exception as e:
        print(f"❌ UserPromptSubmit hook error: {e}", file=sys.stderr)
        # Use fallback exit on error
        sys.exit(0)


if __name__ == "__main__":
    main()
