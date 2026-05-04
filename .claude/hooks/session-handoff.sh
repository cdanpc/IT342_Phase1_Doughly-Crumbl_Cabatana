#!/bin/bash
# Runs when Claude Code session ends
# Reminds Claude to update CLAUDE.md before closing

echo ""
echo "════════════════════════════════════════"
echo "  SESSION ENDING — Run handoff ritual:"
echo "  1. Update CLAUDE.md Where We Are section"
echo "  2. git add CLAUDE.md && git commit -m 'chore: session handoff'"
echo "  3. Note your resume command: claude --continue"
echo "════════════════════════════════════════"
