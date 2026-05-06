---
description: Save session state and prepare for shutdown
---

You are performing the end-of-session handoff ritual.
Do all of the following steps in order without asking
for confirmation:

1. Run: git branch --show-current
2. Run: git log --oneline -5
3. Run: git status --short
4. Run: ls mobile/app/src/main/res/layout/ to get current layout files
5. Run: ls mobile/app/src/main/res/drawable/ to count drawables

Then update the "Where We Are Right Now" section of
CLAUDE.md at the project root with:
- Today's date
- Current branch
- Exact current focus (which GROUP, which file)
- Every file completed since last handoff
- Every file in progress right now with its exact state
- Every file not yet started in the current group
- The next file to work on when resuming
- Any blockers or decisions made this session
- The last commit hash

Then run:
  git add CLAUDE.md .claude/session-state.txt
  git commit -m "chore: session handoff [auto]"
  git log --oneline -1

Finally tell me:
  "Session saved. Resume tomorrow with: claude --continue"
