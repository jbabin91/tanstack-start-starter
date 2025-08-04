#!/bin/bash
# Helper script to query hook logs

LOGS_DIR=".claude/logs"

case "$1" in
    "subagents")
        echo "📊 Subagent Usage Stats:"
        cat $LOGS_DIR/hooks_log_*.jsonl | \
        jq -r 'select(.hook == "subagent_usage" and .data.type == "subagent_usage")' | \
        jq -r '.data | "\(.timestamp) - \(.subagent_type): \(.task)"'
        ;;
    "context")
        echo "📦 Work Context Events:"
        cat $LOGS_DIR/hooks_log_*.jsonl | \
        jq -r 'select(.hook == "work_context")' | \
        jq -r '"\(.timestamp) - \(.data.compact_type) compact: \(.data.lastModifiedFiles | length) files modified"'
        ;;
    "quality")
        echo "🔧 Quality Check Events:"
        cat $LOGS_DIR/hooks_log_*.jsonl | \
        jq -r 'select(.hook == "post_tool_use" and .data.quality_check_completed)' | \
        jq -r '"\(.timestamp) - \(.data.file_path): activity=\(.data.activity_occurred), issues=\(.data.has_issues)"'
        ;;
    "today")
        TODAY=$(date +%Y%m%d)
        echo "📅 Today's Hook Activity ($TODAY):"
        cat $LOGS_DIR/hooks_log_${TODAY}*.jsonl | \
        jq -r '"\(.timestamp) - \(.hook): \(.data | keys | @csv)"' | head -20
        ;;
    "errors")
        echo "❌ Hook Errors:"
        cat $LOGS_DIR/hooks_log_*.jsonl | \
        jq -r 'select(.data.error == true)' | \
        jq -r '"\(.timestamp) - \(.hook): \(.data.exception)"'
        ;;
    *)
        echo "Usage: $0 {subagents|context|quality|today|errors}"
        echo ""
        echo "Examples:"
        echo "  $0 subagents  - Show subagent usage"
        echo "  $0 context    - Show work context saves"
        echo "  $0 quality    - Show quality check results"
        echo "  $0 today      - Show today's activity"
        echo "  $0 errors     - Show hook errors"
        ;;
esac