---
description: Orient yourself at the start of a new session
---

You are starting a new session. Orient yourself fully
before doing anything else. Do all of the following:

1. Read CLAUDE.md at the project root in full
2. Read .claude/session-state.txt if it exists
3. Run: git branch --show-current
4. Run: git log --oneline -5
5. Run: git status --short
6. Run: ls mobile/app/src/main/res/layout/ | wc -l
   (count how many layout files exist)
7. Run: ls mobile/app/src/main/res/drawable/ | wc -l
   (count how many drawables exist)

Then produce a session briefing in this exact format:

---
SESSION BRIEFING
================
Date: [today]
Branch: [current branch]
Last commit: [hash + message]

Where we left off:
[exact copy of "Where We Are Right Now" from CLAUDE.md]

Current working state:
- Layout files: [count] exist
- Drawable files: [count] exist
- Modified files: [list from git status]

Ready to continue with: [next file to work on]

Active bugs to keep in mind:
[list from CLAUDE.md Active Bugs section]

Type "go" to start working on the next task.
---

Do not start working until the user says "go" or
gives you an explicit instruction.
