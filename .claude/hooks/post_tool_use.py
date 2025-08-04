#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import re
import sys
import subprocess
import time
from pathlib import Path
from fnmatch import fnmatch


def find_project_root() -> Path:
    """Find project root by looking for common project markers"""
    current = Path.cwd()
    while current != current.parent:
        # Check for various project root indicators
        markers = [
            current / ".git",
            current / "package.json",
            current / "Makefile",
            current / "go.mod",
            current / "Cargo.toml",
            current / "setup.py",
            current / "pyproject.toml",
            current / ".claude" / "hooks-config.py"
        ]
        
        if any(marker.exists() for marker in markers):
            log_debug(f"Project root found: {current}")
            return current
        
        current = current.parent
    
    # No project root found, return current directory
    log_debug(f"No project root found, using: {Path.cwd()}")
    return Path.cwd()

def load_configuration() -> dict:
    """Load configuration from multiple sources with precedence"""
    config = {
        # Default values
        "enabled": True,
        "debug": False,
        "use_project_commands": True,
        "timeout_seconds": 30,
        "max_lint_fixes": 50,
    }
    
    # 1. Global config from environment
    if os.getenv("CLAUDE_HOOKS_ENABLED", "").lower() == "false":
        config["enabled"] = False
    if os.getenv("CLAUDE_HOOKS_DEBUG", "0") == "1":
        config["debug"] = True
    if os.getenv("CLAUDE_HOOKS_USE_PROJECT_COMMANDS", "").lower() == "false":
        config["use_project_commands"] = False
    
    # 2. Global config file
    global_config = Path.home() / ".claude-hooks.conf"
    if global_config.exists():
        try:
            # Simple key=value format
            for line in global_config.read_text().split('\n'):
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    key = key.strip().lower()
                    value = value.strip().strip('"\'')
                    
                    if key == "enabled":
                        config["enabled"] = value.lower() == "true"
                    elif key == "debug":
                        config["debug"] = value == "1"
                    elif key == "use_project_commands":
                        config["use_project_commands"] = value.lower() == "true"
        except Exception as e:
            log_debug(f"Error loading global config: {e}")
    
    # 3. Project config (highest precedence)
    project_root = find_project_root()
    project_config = project_root / ".claude" / "hooks-config.py"
    if project_config.exists():
        try:
            # Execute Python config file safely
            config_globals = {}
            exec(project_config.read_text(), config_globals)
            
            # Extract known configuration variables
            if "CLAUDE_HOOKS_ENABLED" in config_globals:
                config["enabled"] = config_globals["CLAUDE_HOOKS_ENABLED"]
            if "CLAUDE_HOOKS_DEBUG" in config_globals:
                config["debug"] = config_globals["CLAUDE_HOOKS_DEBUG"]
            if "CLAUDE_HOOKS_USE_PROJECT_COMMANDS" in config_globals:
                config["use_project_commands"] = config_globals["CLAUDE_HOOKS_USE_PROJECT_COMMANDS"]
            if "CLAUDE_HOOKS_TIMEOUT_SECONDS" in config_globals:
                config["timeout_seconds"] = config_globals["CLAUDE_HOOKS_TIMEOUT_SECONDS"]
                
        except Exception as e:
            log_debug(f"Error loading project config: {e}")
    
    log_debug(f"Final configuration: {config}")
    return config

def has_make_target(target: str, makefile_path: Path) -> bool:
    """Check if Makefile has the specified target"""
    try:
        content = makefile_path.read_text()
        # Look for target: at start of line (allowing for tabs/spaces)
        pattern = rf'^\s*{re.escape(target)}\s*:'
        return bool(re.search(pattern, content, re.MULTILINE))
    except Exception:
        return False

def find_lint_command(file_path: str) -> list[str]:
    """Find project-specific lint command with fallback"""
    project_root = find_project_root()
    
    # 1. Check for make lint target
    makefile = project_root / "Makefile"
    if makefile.exists() and has_make_target("lint", makefile):
        log_debug("Using make lint command")
        return ["make", "lint", f"FILE={file_path}"]
    
    # 2. Check for scripts/lint
    scripts_lint = project_root / "scripts" / "lint"
    if scripts_lint.exists() and scripts_lint.is_file():
        log_debug("Using scripts/lint command")
        return [str(scripts_lint), file_path]
    
    # 3. Fall back to pnpm
    log_debug("Using fallback pnpm lint:fix command")
    return ["pnpm", "lint:fix", file_path]

def run_lint_fix(file_path: str) -> dict:
    """Run lint fix using project-aware command detection"""
    try:
        lint_command = find_lint_command(file_path)
        log_debug(f"Running lint command: {' '.join(lint_command)}")
        
        result = subprocess.run(
            lint_command,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=find_project_root()
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
    except Exception as e:
        log_debug(f"Lint command failed: {e}")
        return {"success": False, "fixedCount": 0, "errorCount": 0, "warningCount": 0, "output": str(e)}


def find_typecheck_command() -> list[str]:
    """Find project-specific typecheck command with fallback"""
    project_root = find_project_root()
    
    # 1. Check for make typecheck target
    makefile = project_root / "Makefile"
    if makefile.exists() and has_make_target("typecheck", makefile):
        log_debug("Using make typecheck command")
        return ["make", "typecheck"]
    
    # 2. Check for scripts/typecheck
    scripts_typecheck = project_root / "scripts" / "typecheck"
    if scripts_typecheck.exists() and scripts_typecheck.is_file():
        log_debug("Using scripts/typecheck command")
        return [str(scripts_typecheck)]
    
    # 3. Fall back to pnpm
    log_debug("Using fallback pnpm typecheck command")
    return ["pnpm", "typecheck"]

def run_type_check() -> dict:
    """Run TypeScript type checking using project-aware command detection"""
    try:
        typecheck_command = find_typecheck_command()
        log_debug(f"Running typecheck command: {' '.join(typecheck_command)}")
        
        result = subprocess.run(
            typecheck_command,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=find_project_root()
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout + result.stderr
        }
    except Exception as e:
        log_debug(f"Typecheck command failed: {e}")
        return {"success": False, "output": str(e)}


def find_format_command(file_path: str) -> tuple[list[str], list[str]]:
    """Find project-specific format commands with fallback. Returns (check_cmd, format_cmd)"""
    project_root = find_project_root()
    
    # 1. Check for make format target
    makefile = project_root / "Makefile"
    if makefile.exists() and has_make_target("format", makefile):
        log_debug("Using make format command")
        return (["make", "format-check", f"FILE={file_path}"], ["make", "format", f"FILE={file_path}"])
    
    # 2. Check for scripts/format
    scripts_format = project_root / "scripts" / "format"
    if scripts_format.exists() and scripts_format.is_file():
        log_debug("Using scripts/format command")
        return ([str(scripts_format), "--check", file_path], [str(scripts_format), file_path])
    
    # 3. Fall back to pnpm prettier
    log_debug("Using fallback pnpm prettier command")
    return (["pnpm", "prettier", "-c", file_path], ["pnpm", "prettier", "-w", file_path])

def run_format(file_path: str) -> dict:
    """Run formatting using project-aware command detection"""
    try:
        check_cmd, format_cmd = find_format_command(file_path)
        log_debug(f"Running format check command: {' '.join(check_cmd)}")
        
        # First check if file needs formatting
        check_result = subprocess.run(
            check_cmd,
            capture_output=True,
            text=True,
            timeout=15,
            cwd=find_project_root()
        )
        
        if check_result.returncode == 0:
            return {"success": True, "changed": False}
        
        # File needs formatting, apply it
        log_debug(f"Running format command: {' '.join(format_cmd)}")
        format_result = subprocess.run(
            format_cmd,
            capture_output=True,
            text=True,
            timeout=15,
            cwd=find_project_root()
        )
        return {"success": format_result.returncode == 0, "changed": format_result.returncode == 0}
    except Exception as e:
        log_debug(f"Format command failed: {e}")
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


def debug_mode_active() -> bool:
    """Check if debug mode is enabled"""
    return os.getenv("CLAUDE_HOOKS_DEBUG", "0") == "1"

def log_debug(message: str):
    """Log debug message if debug mode is active"""
    if debug_mode_active():
        print(f"🐛 [DEBUG] {message}", file=sys.stderr)

class ErrorTracker:
    """Track errors and warnings for comprehensive summary reporting"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.fixes = []
    
    def add_error(self, message: str):
        """Add an error that blocks continuation"""
        self.errors.append(f"❌ {message}")
    
    def add_warning(self, message: str):
        """Add a warning that doesn't block but should be noted"""
        self.warnings.append(f"⚠️  {message}")
    
    def add_fix(self, message: str):
        """Add a successful fix that was applied"""
        self.fixes.append(f"✨ {message}")
    
    def has_issues(self) -> bool:
        """Check if there are any blocking errors"""
        return len(self.errors) > 0
    
    def has_activity(self) -> bool:
        """Check if any fixes were applied or issues found"""
        return len(self.errors) > 0 or len(self.warnings) > 0 or len(self.fixes) > 0
    
    def print_summary(self):
        """Print comprehensive summary of all issues and fixes"""
        if self.fixes:
            for fix in self.fixes:
                print(f"   {fix}", file=sys.stderr)
        
        if self.warnings:
            for warning in self.warnings:
                print(f"   {warning}", file=sys.stderr)
        
        if self.errors:
            print(f"\n❌ Found {len(self.errors)} BLOCKING issue(s):", file=sys.stderr)
            for error in self.errors:
                print(f"   {error}", file=sys.stderr)
            print("\n⚠️  ALL issues above must be fixed before continuing!", file=sys.stderr)

def time_operation(operation_name: str):
    """Context manager for timing operations in debug mode"""
    class Timer:
        def __enter__(self):
            if debug_mode_active():
                self.start = time.time_ns() // 1_000_000  # milliseconds
            return self
        
        def __exit__(self, *args):
            if debug_mode_active():
                end = time.time_ns() // 1_000_000
                duration = end - self.start
                log_debug(f"{operation_name}: {duration}ms")
    
    return Timer()

def has_inline_disable(file_path: str) -> bool:
    """Check if file has inline disable comment in first 5 lines"""
    try:
        path = Path(file_path)
        if not path.exists():
            return False
        
        content = path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')[:5]  # Check first 5 lines
        
        disable_patterns = [
            r'claude-hooks-disable',
            r'claude-hooks:disable', 
            r'@claude-hooks-disable'
        ]
        
        for line in lines:
            for pattern in disable_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    log_debug(f"Found inline disable in {file_path}: {line.strip()}")
                    return True
        
        return False
    except Exception as e:
        log_debug(f"Error checking inline disable for {file_path}: {e}")
        return False

def load_ignore_patterns() -> list[str]:
    """Load patterns from .claude/hooks-ignore file"""
    project_root = find_project_root()
    ignore_file = project_root / ".claude" / "hooks-ignore"
    
    if not ignore_file.exists():
        log_debug("No .claude/hooks-ignore file found")
        return []
    
    try:
        patterns = []
        content = ignore_file.read_text(encoding='utf-8')
        for line in content.split('\n'):
            line = line.strip()
            # Skip comments and empty lines
            if line and not line.startswith('#'):
                patterns.append(line)
        
        log_debug(f"Loaded {len(patterns)} ignore patterns")
        return patterns
    except Exception as e:
        log_debug(f"Error loading ignore patterns: {e}")
        return []

def matches_ignore_patterns(file_path: str, patterns: list[str]) -> bool:
    """Check if file matches any ignore pattern"""
    if not patterns:
        return False
    
    project_root = find_project_root()
    
    # Make path relative to project root for pattern matching
    try:
        path = Path(file_path)
        if path.is_absolute():
            relative_path = path.relative_to(project_root)
        else:
            relative_path = path
        
        relative_str = str(relative_path)
        basename = path.name
        
        for pattern in patterns:
            # Directory patterns ending with /**
            if pattern.endswith('/**'):
                dir_pattern = pattern[:-3]  # Remove /**
                if relative_str.startswith(dir_pattern + '/') or relative_str == dir_pattern:
                    log_debug(f"File {file_path} matches directory pattern: {pattern}")
                    return True
            
            # Glob patterns
            elif '*' in pattern or '?' in pattern:
                if fnmatch(relative_str, pattern) or fnmatch(basename, pattern):
                    log_debug(f"File {file_path} matches glob pattern: {pattern}")
                    return True
            
            # Exact matches
            elif relative_str == pattern or basename == pattern:
                log_debug(f"File {file_path} matches exact pattern: {pattern}")
                return True
        
        return False
    except Exception as e:
        log_debug(f"Error matching patterns for {file_path}: {e}")
        return False

def is_generated_file(file_path: str) -> bool:
    """Check if file appears to be generated code"""
    path = Path(file_path)
    name = path.name
    
    # Common generated file patterns
    generated_patterns = [
        '*.gen.ts', '*.generated.ts', '*.d.ts',
        'routeTree.gen.ts', '*.pb.ts', '*.pb.js',
        '*.min.js', '*.min.css',
        '__generated__/*', 'generated/*',
        '.next/*', 'dist/*', 'build/*',
        'node_modules/*'
    ]
    
    for pattern in generated_patterns:
        if fnmatch(str(path), pattern) or fnmatch(name, pattern):
            log_debug(f"File {file_path} appears to be generated: matches {pattern}")
            return True
    
    return False

def should_skip_file(file_path: str) -> bool:
    """Check if file should be skipped based on multiple criteria"""
    # Check inline disable comments
    if has_inline_disable(file_path):
        return True
    
    # Check .claude/hooks-ignore patterns
    ignore_patterns = load_ignore_patterns()
    if matches_ignore_patterns(file_path, ignore_patterns):
        return True
    
    # Check if file appears to be generated
    if is_generated_file(file_path):
        return True
    
    return False

def process_file_quality_checks(file_path: str, input_data: dict):
    """Process quality checks for a single file"""
    log_debug(f"Starting quality checks for: {file_path}")
    
    if not Path(file_path).exists():
        log_debug(f"File doesn't exist, skipping: {file_path}")
        return
    
    # Check if we should skip this file
    if should_skip_file(file_path):
        log_debug(f"Skipping file based on ignore rules: {file_path}")
        print(f"⏭️  Skipping {Path(file_path).name} (ignored)", file=sys.stderr)
        return
    
    # Initialize error tracker for this file
    tracker = ErrorTracker()
    
    is_typescript_file = file_path.endswith(('.ts', '.tsx'))
    is_code_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'))
    is_formattable_file = file_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.md', '.mdx'))
    
    file_name = Path(file_path).name
    if debug_mode_active():
        print(f"\n🔧 [DEBUG MODE] Running quality checks on {file_name}...", file=sys.stderr)
        print(f"🐛 File type detection: TS={is_typescript_file}, Code={is_code_file}, Formattable={is_formattable_file}", file=sys.stderr)
    else:
        print(f"\n🔧 Running quality checks on {file_name}...", file=sys.stderr)
    
    # Remove old tracking variables - using ErrorTracker now
    
    # Format first
    if is_formattable_file:
        with time_operation("Formatting"):
            format_result = run_format(file_path)
        if format_result["changed"]:
            tracker.add_fix("Code formatted")
        elif not format_result["success"]:
            tracker.add_error("Formatting failed")
        log_debug(f"Format result: {format_result}")
    
    # Then lint and fix
    if is_code_file:
        with time_operation("Linting"):
            lint_result = run_lint_fix(file_path)
        log_debug(f"Lint result: {lint_result}")
        
        if lint_result["fixedCount"] > 0:
            tracker.add_fix(f"Fixed {lint_result['fixedCount']} linting issues")
        
        if lint_result["errorCount"] > 0:
            tracker.add_error(f"{lint_result['errorCount']} linting errors need manual attention")
        
        if lint_result["warningCount"] > 0:
            tracker.add_warning(f"{lint_result['warningCount']} linting warnings")
    
    # Finally type check
    if is_typescript_file:
        with time_operation("Type checking"):
            type_result = run_type_check()
        log_debug(f"Type check result: {type_result}")
        
        if not type_result["success"]:
            tracker.add_error("TypeScript errors detected")
            # Show first few lines of type errors
            print("💥 TypeScript errors:", file=sys.stderr)
            lines = type_result["output"].split('\n')[:5]
            for line in lines:
                if line.strip():
                    print(f"   {line}", file=sys.stderr)
        else:
            tracker.add_fix("Types are valid")
    
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
    
    # Print comprehensive summary
    tracker.print_summary()
    
    # Choose exit code based on activity and issues
    if debug_mode_active():
        print(f"\n🐛 [DEBUG] Quality check summary: errors={len(tracker.errors)}, warnings={len(tracker.warnings)}, fixes={len(tracker.fixes)}", file=sys.stderr)
        print("🐛 [DEBUG] Debug mode active - always showing output", file=sys.stderr)
        sys.exit(2)  # Always visible in debug mode
    elif tracker.has_issues():
        sys.exit(2)  # Issues found - make output visible to user
    elif tracker.has_activity():
        print("\n✅ Quality checks completed!\n", file=sys.stderr)
        sys.exit(2)  # Activity occurred - make output visible to show what happened
    else:
        # No activity, no issues - silent success
        pass


def main():
    try:
        # Load configuration
        config = load_configuration()
        
        # Check if hooks are disabled
        if not config["enabled"]:
            log_debug("Hooks disabled by configuration")
            sys.exit(0)
        
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        log_debug("Post tool use hook started")
        log_debug(f"Input data keys: {list(input_data.keys())}")
        log_debug(f"Configuration: {config}")
        
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
        with time_operation("Git status check"):
            new_files = check_new_files()
        
        log_debug(f"Found {len(new_files)} new files: {new_files}")
        
        if new_files:
            print(f"\n🆕 Found {len(new_files)} untracked files that need quality checks...", file=sys.stderr)
            for file_path in new_files:
                process_file_quality_checks(file_path, input_data)
            return
        
        if not tool or tool.get("name") not in ["Write", "Edit", "MultiEdit"]:
            log_debug(f"Tool '{tool.get('name', 'unknown')}' not relevant for quality checks")
            sys.exit(0)
        
        file_path = tool.get("parameters", {}).get("file_path")
        log_debug(f"Processing file: {file_path}")
        
        if not file_path or not Path(file_path).exists():
            log_debug(f"File path invalid or doesn't exist: {file_path}")
            sys.exit(0)
        
        # Process the file that was just modified
        process_file_quality_checks(file_path, input_data)
        
    except Exception as e:
        log_debug(f"Exception occurred: {type(e).__name__}: {e}")
        print(f"Hook error: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()