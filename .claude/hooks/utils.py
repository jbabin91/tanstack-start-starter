#!/usr/bin/env python3
"""
Utility functions for Claude Code hooks
"""

import json
import os
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def load_claude_md_summary() -> str:
    """Load and summarize CLAUDE.md content"""
    try:
        claude_md_path = Path.cwd() / "CLAUDE.md"
        if not claude_md_path.exists():
            return ""
        
        content = claude_md_path.read_text(encoding="utf-8")
        
        # Extract key sections for context
        sections = [
            ("## Essential Commands", 15),
            ("## Architecture Overview", 20),
            ("## Development Patterns", 10)
        ]
        
        summary = "\n\nProject Context from CLAUDE.md:\n"
        
        for marker, lines in sections:
            start_idx = content.find(marker)
            if start_idx != -1:
                lines_content = content[start_idx:].split('\n')[:lines]
                summary += f"\n{chr(10).join(lines_content)}\n"
        
        return summary
    except Exception:
        return ""


def get_available_subagents() -> List[str]:
    """Get list of available subagents"""
    try:
        agents_dir = Path.cwd() / ".claude" / "agents"
        if not agents_dir.exists():
            return []
        
        agents = [f.stem for f in agents_dir.glob("*.md")]
        return agents
    except Exception:
        return []


def suggest_subagent(prompt: str) -> Optional[str]:
    """Check if prompt might benefit from a subagent"""
    prompt_lower = prompt.lower()
    
    subagent_patterns = {
        'code-reviewer': ['review', 'check code', 'code quality', 'best practices'],
        'refactoring-specialist': ['refactor', 'split file', 'too large', 'reorganize'],
        'authentication-specialist': ['auth', 'login', 'session', 'better-auth'],
        'database-architect': ['schema', 'database design', 'drizzle', 'migration'],
        'performance-engineer': ['slow', 'performance', 'optimize', 'bundle size'],
        'security-auditor': ['security', 'vulnerability', 'secure', 'protection'],
        'test-automator': ['test', 'testing', 'coverage', 'unit test'],
        'debugger': ['error', 'bug', 'not working', 'exception', 'undefined'],
    }
    
    for agent, patterns in subagent_patterns.items():
        if any(pattern in prompt_lower for pattern in patterns):
            return agent
    
    return None


def get_recently_modified_files(minutes: int = 30) -> List[str]:
    """Get recently modified files"""
    try:
        result = subprocess.run(
            f"find src -type f -name '*.ts' -o -name '*.tsx' -mmin -{minutes} | head -20",
            shell=True,
            capture_output=True,
            text=True
        )
        
        return result.stdout.strip().split('\n') if result.stdout.strip() else []
    except Exception:
        return []


def get_git_branch_info() -> Dict[str, str]:
    """Get current git branch info"""
    try:
        branch_result = subprocess.run(
            "git branch --show-current",
            shell=True,
            capture_output=True,
            text=True
        )
        
        status_result = subprocess.run(
            "git status --porcelain",
            shell=True,
            capture_output=True,
            text=True
        )
        
        branch = branch_result.stdout.strip() or "main"
        status = status_result.stdout.strip()
        status_desc = f"{len(status.split())} files changed" if status else "clean"
        
        return {"current": branch, "status": status_desc}
    except Exception:
        return {"current": "unknown", "status": "unknown"}


# Legacy function no longer used - work context now saved via centralized logging
# def save_work_context(context: Dict) -> None:
#     """Save work context"""
#     pass


def load_work_context() -> Optional[Dict]:
    """Load most recent work context from centralized logs"""
    try:
        logs_dir = Path.cwd() / ".claude" / "logs"
        if not logs_dir.exists():
            return None
        
        most_recent_context = None
        most_recent_timestamp = None
        
        # Read all log files to find the most recent work context
        for log_file in sorted(logs_dir.glob("hooks_log_*.jsonl"), reverse=True):
            with open(log_file) as f:
                for line in f:
                    if not line.strip():
                        continue
                    entry = json.loads(line)
                    
                    # Look for work context events
                    if (entry.get("hook") == "work_context" and 
                        entry.get("data", {}).get("type") == "work_context"):
                        
                        timestamp = entry.get("timestamp")
                        if (most_recent_timestamp is None or 
                            timestamp > most_recent_timestamp):
                            most_recent_timestamp = timestamp
                            most_recent_context = entry["data"]
        
        return most_recent_context
    except Exception:
        return None


# Legacy function no longer used - subagent usage now tracked via centralized logging
# def track_subagent_usage(usage: Dict) -> None:
#     """Track subagent usage"""
#     pass


def get_subagent_stats() -> Dict[str, Dict[str, int]]:
    """Get subagent usage stats from centralized logs"""
    try:
        logs_dir = Path.cwd() / ".claude" / "logs"
        if not logs_dir.exists():
            return {}
        
        stats = {}
        
        # Read all log files
        for log_file in logs_dir.glob("hooks_log_*.jsonl"):
            with open(log_file) as f:
                for line in f:
                    if not line.strip():
                        continue
                    entry = json.loads(line)
                    
                    # Look for subagent usage events
                    if (entry.get("hook") == "subagent_usage" and 
                        entry.get("data", {}).get("type") == "subagent_usage"):
                        
                        usage_data = entry["data"]
                        agent_type = usage_data.get("subagent_type")
                        
                        if not agent_type:
                            continue
                            
                        if agent_type not in stats:
                            stats[agent_type] = {"total": 0, "success": 0}
                        
                        stats[agent_type]["total"] += 1
                        if usage_data.get("success", True):
                            stats[agent_type]["success"] += 1
        
        # Convert to success rates
        result = {}
        for agent_type, data in stats.items():
            result[agent_type] = {
                "count": data["total"],
                "successRate": data["success"] / data["total"] if data["total"] > 0 else 0
            }
        
        return result
    except Exception:
        return {}


def run_command(command: str) -> Tuple[bool, str, str]:
    """Run a command and return success, stdout, stderr"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)