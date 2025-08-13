# Claude Code Hooks Configuration
# Project-specific configuration for hook behavior
# Location: .claude/hooks-config.py

# Enable/disable all hooks for this project
CLAUDE_HOOKS_ENABLED = True

# Enable debug mode (always shows hook output for troubleshooting)
CLAUDE_HOOKS_DEBUG = False

# Use project-specific commands (make lint, scripts/lint) vs generic tools (pnpm lint)
CLAUDE_HOOKS_USE_PROJECT_COMMANDS = True

# Timeout for individual operations (seconds)
CLAUDE_HOOKS_TIMEOUT_SECONDS = 30

# Maximum number of lint fixes to apply in one run
CLAUDE_HOOKS_MAX_LINT_FIXES = 50

# Example: Disable hooks during major refactoring
# CLAUDE_HOOKS_ENABLED = False

# Example: Enable debug mode for troubleshooting
# CLAUDE_HOOKS_DEBUG = True

# Example: Force use of generic tools instead of project commands
# CLAUDE_HOOKS_USE_PROJECT_COMMANDS = False
