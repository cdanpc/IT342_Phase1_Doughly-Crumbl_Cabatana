#!/bin/bash
# Runs after significant tool use to auto-preserve context
# Writes current git state to .claude/session-state.txt

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "none")
MODIFIED=$(git status --short 2>/dev/null | head -20)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

cat > .claude/session-state.txt << EOF
Last saved: $TIMESTAMP
Branch: $BRANCH
Last commit: $LAST_COMMIT

Modified files:
$MODIFIED
EOF
