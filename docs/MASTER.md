# MASTER.md — Doughly Crumbl
> Claude Code operating manual. Read this at the start of every session. This file is the bridge across the no-shared-memory gap.

---

## Project Identity

**Project:** Doughly Crumbl — Artisan Bakery Web Application
**Stack:** Spring Boot (Java) · React (Vite) · PostgreSQL · PayMongo API · OpenStreetMap Nominatim API
**Store Location:** Don Gil Garcia St., Capitol Site, Cebu City
**Contact:** 09165667589 | FB: Doughly Crumbl | IG: @doughlycrumbl
**Design Tool:** stitch.withgoogle.com (UI prototyping)
**Repo:** IT342_Doughly-Crumbl_G5_Cabatana

---

## Session Zero Protocol

On every new session, before writing a single line of code:

1. Read this file (`MASTER.md`) in full
2. Read `FEATURES.md` — current feature inventory and completion status
3. Run `git status` and `git log --oneline -10` — verify live state, trust it over memory
4. Check which ACs are In Progress in `tasks.md`
5. Verify the backend is running: `./mvnw spring-boot:run` or check active ports
6. Verify the frontend is running: `npm run dev` from the frontend directory
7. Report what you found — one summary, not twenty questions

---

## The Six Universal Gates

These are mandatory checkpoints. They are not optional. Every gate fires on its trigger.

### GATE(session-start)
Fires: At the beginning of every session.
- Read `MASTER.md`, `FEATURES.md`, `tasks.md`
- Run `git status`, `git log --oneline -10`
- Verify backend and frontend are reachable
- Check for any half-done work (IN FLIGHT from last handoff)
- Every claim from the previous session is a hypothesis until verified against live state

### GATE(pre-commit)
Fires: Before every `git commit`.
- Secret scan the diff — no `.env` values, no API keys, no credentials in staged files
- Confirm Java backend compiles: `./mvnw compile`
- Confirm frontend builds without errors: `npm run build`
- Review staged files for unexpected additions: build artifacts, node_modules, IDE files
- Never bypass `.gitignore` or pre-commit hooks without explicit authorization

### GATE(self-audit)
Fires: After implementing any feature or fix.
- One audit pass is never enough — audit, fix, re-audit until clean
- Run available tests: `./mvnw test` for backend
- Check against the Quality Contract (see below)
- Do not declare done after the first sweep — done is what survives the second audit

### GATE(post-work)
Fires: After completing any task.
- Update `FEATURES.md` checkbox for completed items
- Update `tasks.md` — move ACs from In Progress to Completed as appropriate
- Update `MASTER.md` if any architectural decision, stack change, or workflow rule changed
- Verify the push landed: `git log --oneline -3`
- Report what was done — specific, not vague

### GATE(push-verify)
Fires: After every `git push`.
- Confirm push succeeded and working tree is clean
- Confirm tags are pushed if releasing: `git tag -l`
- Confirm version strings are consistent across `pom.xml` and `package.json`
- Check that CI is not broken (GitHub Actions if configured)
- Asymmetry between local and remote is where releases break

### GATE(session-handoff)
Fires: At the end of every session, or when context becomes heavy.
- Produce the locked handoff schema (see Handoff Schema section below)
- Proactively recommend ending the session at natural breakpoints
- One session = one coherent unit of work
- Do not wait to be asked — when the session is at a natural boundary, say so and produce the handoff

---

## Three Standing Rules

These are always active. Not gates — reflexes.

**α — One task at a time.**
Sequential, not batched. Finish before proposing the next. For any task that requires a manual human action (account creation, token paste, third-party UI click), give a numbered step list and wait for confirmation before continuing.

**β — No unrequested complexity.**
No speculative abstractions. No backward-compatibility shims for code with no users yet. No helper utilities for one-time operations. Match the scope of changes to what was asked. Three similar lines of code are better than a premature abstraction for a future that will not arrive.

**γ — Confirm risky actions first.**
Destructive operations, force-pushes, database migrations, anything affecting shared state — pause and ask before doing. Authorization for one action does not transfer to other actions. The cost of a confirmation is small; the cost of an unwanted migration or force-push is catastrophic and asymmetric.

---

## Quality Contract

This is what "done" means for Doughly Crumbl. The self-audit GATE enforces this on every feature.

**Backend (Spring Boot)**
- All endpoints return correct HTTP status codes (200, 201, 400, 401, 404, 500)
- No unhandled exceptions — every service method has proper try/catch or `@ExceptionHandler`
- Input validation on all request bodies using `@Valid` and Jakarta constraints
- No hardcoded secrets — all sensitive values in `application.properties` with `@ConfigurationProperties`
- All `@ConfigurationProperties` classes registered so IDE warnings are clean
- JPA entities have proper relationships, no `N+1` query patterns in lists
- Compile clean: `./mvnw compile` must succeed with zero errors

**Frontend (React + Vite)**
- Design system values always used: Crimson `#6B1A2B`, Off-white `#FAF7F4`, White `#FFFFFF`
- Font: Inter or Poppins (Google Fonts)
- Icons: Lucide only — no mixing icon libraries
- Border radius: 8–10px across all components
- Shadow: `0 2px 8px rgba(0,0,0,0.08)` standard
- No hardcoded colors outside the design system
- Build must succeed: `npm run build` with zero errors
- No console errors in browser dev tools on page load

**Acceptance Criteria**
- Every feature must satisfy all its AC conditions before being marked complete in `FEATURES.md`
- AC language is Given/When/Then/And — test against each clause explicitly

**Danger Map**
- `PayMongo integration` — never log secret keys; always use sandbox in development
- `OpenStreetMap Nominatim API` — rate limited to 1 req/sec; never call in a loop
- `Database migrations` — always confirm before running against a non-empty database
- `Order status transitions` — state machine must be respected; no skipping states
- `application.properties` — never commit real secrets; use environment variables in production

---

## Memory Taxonomy

When a new memory worth keeping is discovered, classify it and save it here or in the relevant section.

**Feedback memories** — corrections and validations
- Do not use `page.map(this::toResponse)` without verifying `toResponse(Entity)` exists in the same class
- All custom `app.*` properties in `application.properties` require a corresponding `@ConfigurationProperties` class
- Use `claude-sonnet-4-5-20250929` or `claude-sonnet-4-6` as model string — short names like `claude-sonnet-4-5` return 400

**Pattern memories** — whenever you touch X, always do Y
- Whenever adding a new `app.*` property, always add the corresponding field to the relevant `@ConfigurationProperties` class in the same commit
- Whenever implementing a new order status, always update the status timeline stepper in the My Orders UI

**Reference memories** — commands and URLs that actually work
- Backend start: `./mvnw spring-boot:run` from `/backend`
- Frontend start: `npm run dev` from `/frontend` (or wherever `package.json` is)
- Backend compile check: `./mvnw compile`
- Backend tests: `./mvnw test`
- Frontend build check: `npm run build`
- PayMongo sandbox dashboard: https://dashboard.paymongo.com
- OpenStreetMap Nominatim API: `https://nominatim.openstreetmap.org/search?q=<address>&format=json`

**Dead-end memories** — ruled out approaches
- Manual delivery fee quote flow (seller manually enters fee after order) — ruled out in favor of automated OpenStreetMap distance-based tiered pricing (AC-15)
- Grab/FoodPanda integration — not applicable at this stage; using PayMongo + Lalamove/Borzo instead

**Constraint memories** — client/project requirements that cannot change
- Delivery only available within 10km of store (Don Gil Garcia St., Capitol Site, Cebu City)
- No vegan or gluten-free products — do not add these to the menu data
- Minimum order: 4 units per cookie type
- Cash payment only available for pickup orders, not delivery

---

## Delivery Fee Tier (AC-15)

| Distance from Store | Fee |
|---|---|
| 0 – 3 km | ₱50.00 |
| 3 – 6 km | ₱80.00 |
| 6 – 10 km | ₱120.00 |
| Beyond 10 km | Not available — block checkout |

Geocoding: OpenStreetMap Nominatim API (free, no API key, max 1 req/sec).
Distance calculation: Haversine formula (straight-line) is acceptable for MVP.

---

## Order Status State Machine

Valid transitions only. No skipping states.

```
Order Placed
    → Preparing          (after payment confirmed)
    → Cancelled          (any time before Preparing)

Preparing
    → Out for Delivery   (delivery orders)
    → Ready for Pickup   (pickup orders)
    → Cancelled          (with reason)

Out for Delivery
    → Completed

Ready for Pickup
    → Completed

Completed              (terminal state)
Cancelled              (terminal state)
```

---

## API & Integration Reference

| Integration | Purpose | Env | Key Location |
|---|---|---|---|
| PayMongo | GCash / Maya / card payments | Sandbox → Production | `app.paymongo.secret-key` / `app.paymongo.public-key` |
| OpenStreetMap Nominatim | Address geocoding, distance calc | Production (free) | No key required |
| Lalamove / Borzo | On-demand rider booking (future) | — | TBD |

---

## Design System Reference

| Token | Value | Usage |
|---|---|---|
| Primary / Crimson | `#6B1A2B` | Buttons, active states, accents, sidebar background |
| Background / Off-white | `#FAF7F4` | Page background |
| Surface / White | `#FFFFFF` | Cards, panels, header |
| Font | Inter or Poppins | All text |
| Icons | Lucide | All icons — no mixing |
| Border Radius | 8–10px | Cards, buttons, panels |
| Shadow | `0 2px 8px rgba(0,0,0,0.08)` | Cards, panels |
| Order Button (active page) | Outline / stroke style | Crimson border, transparent bg, crimson text |
| Order Button (default) | Solid crimson | `#6B1A2B` background, white text |

---

## Key Pages & Components

| Page / Component | Status | Notes |
|---|---|---|
| Menu / Landing Page | In Progress | Hero banner, Featured Delights, product grid |
| Product Filter Dropdown | Done (design) | Single dropdown replacing pill filters |
| Product Cards | Done (design) | Compact cards with Add button |
| Left Sidebar Nav | Done (design) | Profile at top, crimson bg, Lucide icons |
| Page Header | Done (design) | Logo + search bar, cart icon, shop toggle, avatar |
| Order Bag Sidebar | In Progress | AC-10 to AC-13 pending logic |
| My Orders Page | Done (design) | 3-click rule, status tabs, order cards |
| Order Detail Drawer | Pending | Status timeline stepper |
| Checkout Page | Pending | AC-14 to AC-18 |
| About / FAQ Page | Pending | Content ready in `about-faqs.md` |
| Care Guide Page | Pending | Content ready in `care-guide.md` |

---

## Current In-Progress ACs

See `tasks.md` for full acceptance criteria. Summary:

- **AC-10** Add Product to Order Bag — auto-expand sidebar, qty defaults to 1
- **AC-11** Update Quantity — recalculate subtotal and total in real time
- **AC-12** Remove Product — recalculate total, show empty state if bag empty
- **AC-13** Collapse/Expand Order Bag — toggle on icon click, empty state if no items
- **AC-14** Proceed to Checkout — itemized summary, address input, fulfillment toggle
- **AC-15** Delivery Fee Calculation — OpenStreetMap geocoding, tiered pricing
- **AC-16** Payment via PayMongo — sandbox mode, GCash or test card
- **AC-17** Successful Payment — create order, clear bag, confirmation page, email, notification
- **AC-18** Failed Payment — no order created, bag preserved, retry without re-entering details

---

## Handoff Schema

Claude produces this block at the end of every session. Paste it verbatim to start the next one. Every field is mandatory — "none" is valid, empty is not.

```
STATUS: [one line — what state is the project in right now]

LAST SESSION:
· [what was accomplished — specific, include commits, files changed, versions bumped]
· [...]

IN FLIGHT:
· [what is half-done — file, branch, or feature and its current state]
· [if nothing: "clean slate"]

BLOCKERS:
· [what needs a human decision or external action]
· [if none: "none"]

NEXT CANDIDATES: // ranked by priority, with scope estimate
1. [highest priority — what and roughly how big]
2. [second option]
3. [third option]

MEMORY UPDATES:
· [which memory files or sections of MASTER.md were created, updated, or pruned this session]

GATE CHECKS:
· [checklist of gates completed this session — session-start, pre-commit, self-audit, post-work, push-verify, session-handoff]

SESSION NOTES:
· [dead ends explored, surprises encountered, decisions deferred]
· [anything the next session should know that doesn't fit above]
```

---

## Recurring Maintenance Schedule

These happen automatically — Claude does not wait to be asked.

| Trigger | Task |
|---|---|
| Every 5 sessions | Scan for stale memories in this file — prune dead-ends, update changed URLs, remove reversed decisions |
| Every release | Generate changelog from `git log` since last tag — group by features, fixes, breaking changes |
| Every release | Dependency and security sweep — `./mvnw dependency:tree`, `npm audit` — report with severity |
| Every 10 sessions | Environment parity check — verify dev and staging have not drifted |
| Every session start | External state check — is the backend reachable? Is PayMongo sandbox responding? |

---

## Document Index

| File | Purpose |
|---|---|
| `MASTER.md` | This file — session discipline, gates, memory, handoff schema |
| `FEATURES.md` | Checkbox inventory of all features — updated after every task |
| `tasks.md` | Full AC list with Given/When/Then/And detail — In Progress / Backlog / Completed |
| `care-guide.md` | Cookie Care page content — ready to implement |
| `about-faqs.md` | About & FAQ page content — ready to implement |
| `payment-delivery-flow.md` | Full payment and delivery flow spec — checkout, status states, admin requirements |

---

*Last updated: April 15, 2026. Anything that should survive amnesia lives here. Anything that bridges sessions goes in the handoff. If this file is wrong, update it immediately.*
