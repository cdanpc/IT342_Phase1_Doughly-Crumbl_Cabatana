# Best Practices — Doughly Crumbl
> These are enforced standards, not suggestions.
> Apply every one of these on every task, every session.

---

## BP-01 — API Contract First

Before implementing any new endpoint or changing an
existing one:
1. Update docs/api.md FIRST with the method, path,
   auth requirement, request body, and response body
2. Only then implement the backend
3. Only then update web and mobile to consume it

Never let the backend and frontend drift. If a field
name changes in the backend response, update api.md,
then update the web TypeScript interface, then update
the mobile Kotlin data class — all in the same commit.

Violation example to avoid: BUG-3 (Order.kt field names
drifted from backend response — caused runtime crashes).

---

## BP-02 — Shared Data Models

Every entity is defined ONCE in docs/data-models.md.
The Java entity, TypeScript interface, and Kotlin data
class are all derived from that document.

When implementing a new feature:
1. Define the entity in docs/data-models.md first
2. Write the Java entity to match exactly
3. Write the TypeScript interface to match exactly
4. Write the Kotlin data class to match exactly
5. Field names must be identical across all three

Never rename a field on one platform without updating
all three and updating docs/data-models.md.

---

## BP-03 — Consistent Auth Across All Platforms

Auth behavior must be identical on web and mobile:

Web (already implemented — use as reference):
  - Token stored in localStorage key "auth"
  - Axios interceptor catches 401 → clears storage
    → redirects to /login

Mobile (must mirror web exactly — BUG-5 pending):
  - Token stored in EncryptedSharedPreferences (BUG-4)
  - AuthInterceptor must catch 401 → clear session
    → redirect to LoginActivity (BUG-5)

Never add auth handling that works on one platform
but not the other. If web handles token expiry,
mobile must handle it the same way.

---

## BP-04 — No Hardcoded Values — Ever

Hardcoding is banned. No exceptions.

Mobile:
  - Colors: always @color/colorXxx — never #RRGGBB
  - Dimensions: always @dimen/xxxName — never 16dp
  - Strings: always @string/xxx — never "literal text"
  - URLs: always BuildConfig.BASE_URL — never hardcoded
  - API keys: always local.properties — never in source

Web:
  - Colors: always CSS variables or Tailwind tokens
  - URLs: always import.meta.env.VITE_API_URL
  - API keys: always .env files — never in source

Backend:
  - Secrets: always application.properties (gitignored)
  - All app.* properties: always @ConfigurationProperties

Enforcement: before every commit, grep for hardcoded
values:
  grep -r "#[0-9A-Fa-f]\{6\}" mobile/app/src/main/res/layout/
  grep -r "localhost\|10\.0\.2\.2" mobile/app/src/main/java/
  grep -r "localhost" web/src/ --include="*.ts" --include="*.tsx"

---

## BP-05 — Design Tokens are the Single Source of Style

The design system lives in one place per platform.
If the brand color changes, one file changes — not 50.

Mobile single source: mobile/app/src/main/res/values/colors.xml
Web single source:    web/src/ (Tailwind config or CSS variables)
Reference document:   docs/MASTER.md Design System section

Current tokens (never change without updating all platforms):
  Primary:    #6B1A2B  →  @color/colorPrimary
  Background: #FAF7F4  →  @color/colorBackground
  Surface:    #FFFFFF  →  @color/colorSurface
  Font:       Poppins  →  @font/poppins

---

## BP-06 — Feature Parity Across Platforms

Every feature must be implemented consistently on both
web and mobile. Partial implementations create bugs.

Before marking a feature COMPLETE in tasks.md:
  □ Backend endpoint exists and is tested
  □ Web frontend implements the feature
  □ Mobile implements the feature
  □ Both platforms handle loading, success, empty, error
  □ Both platforms show the same error messages to users

If a feature cannot be completed on mobile in the
current session, mark it as PARTIAL in CLAUDE.md with
a note explaining what is missing. Never mark COMPLETE
when only one platform is done.

---

## BP-07 — Error Handling is Mandatory on Every Screen

Every screen must implement all four states:
  1. Loading — show skeleton or spinner
  2. Success — show the data
  3. Empty — show empty state illustration + CTA
  4. Error — show error message + retry button

Mobile pattern (apply to every Fragment and Activity):
  viewModel.uiState.observe(viewLifecycleOwner) { state ->
    when (state) {
      is UiState.Loading -> showLoading()
      is UiState.Success -> showContent(state.data)
      is UiState.Empty   -> showEmptyState()
      is UiState.Error   -> showError(state.message)
    }
  }

Web pattern (apply to every page component):
  if (loading) return <SkeletonLoader />
  if (error)   return <ErrorState message={error} onRetry={refetch} />
  if (!data)   return <EmptyState />
  return <Content data={data} />

The backend GlobalExceptionHandler returns ErrorResponse
with a message field. Always display that message to
the user — never show a generic "Something went wrong."

---

## BP-08 — Git Discipline

Branch strategy:
  main          ← stable, always deployable, submission branch
  develop       ← integration, all features merge here
  feature/xxx   ← individual features (web or mobile)
  fix/bug-name  ← named bug fixes
  refactor/xxx  ← structural changes

Commit message format:
  feat(mobile): add checkout activity layout
  feat(web): implement order detail page
  fix(mobile): BUG-1 correct getOrders endpoint
  fix(backend): wire DeliveryFeeCalculator to OrderService
  chore: session handoff
  docs: update api.md with checkout endpoint
  test: add CartControllerIntegrationTest

Rules:
  - Never commit directly to main
  - Never commit secrets, .env files, or local.properties
  - Every bug fix references the bug ID in the message
  - Every commit must build without errors
  - Run the build check before every commit:
      mobile:  ./gradlew :app:assembleDebug
      backend: ./mvnw compile
      web:     npm run build

---

## BP-09 — Security Non-Negotiables

These are mandatory, not optional:

□ Auth tokens in EncryptedSharedPreferences (not plain)
  Status: BUG-4 — pending fix after GROUP 9

□ No API keys in source code — ever
  backend: application.properties (in .gitignore)
  mobile:  local.properties (in .gitignore)
  web:     .env (in .gitignore)

□ Backend validates all inputs with @Valid
  Never trust client-side validation alone

□ Android app requests only necessary permissions
  Camera and storage for proof upload — nothing else

□ JWT secret is long (32+ chars) and never hardcoded
  Check: grep "jwt.secret" backend/src/main/resources/application.properties
  It must reference an environment variable in production

□ 401 auto-redirect on both platforms
  Web: done via Axios interceptor
  Mobile: pending (BUG-5)

Before every submission or release, run this audit:
  grep -r "password\|secret\|api_key\|token" \
    --include="*.kt" --include="*.java" \
    --include="*.ts" --include="*.tsx" \
    mobile/app/src/main/java/ web/src/ \
    | grep -v "//\|test\|Test\|mock"

---

## BP-10 — Test on Real Device Before Submission

Emulators lie. Real devices expose real bugs.

Before every submission, test the full order flow
on a physical Android device:

  □ Login and register
  □ Browse products — search and filter work
  □ Add to cart — badge updates
  □ Proceed to checkout — all fields work
  □ Place order — API call succeeds
  □ Upload proof of payment — gallery/camera picker works
  □ View order status — correct status shown
  □ Admin login — correct role redirect
  □ Admin update order status — state machine respected

Specific things real devices expose that emulators miss:
  - Font rendering for Poppins on API 26-29
  - Touch target sizes on small screens (5" and under)
  - File picker behavior for proof of payment upload
  - Network latency on real connections vs loopback
  - Back button behavior in checkout flow

---

## BP-11 — Living Documentation

Every change to the system must be reflected in docs.

When you add a feature:
  → Update docs/api.md with new endpoints
  → Update docs/data-models.md with new entities
  → Update docs/flow.md if user flow changes
  → Update tasks.md to mark ACs complete

When you fix a bug:
  → Add to .claude/memory/mistakes.md
  → Update CLAUDE.md Active Bugs section

When you make an architecture decision:
  → Add an ADR to docs/decisions/
  → Update docs/architecture.md

When you end a session:
  → Run /handoff
  → CLAUDE.md "Where We Are Right Now" is updated
  → Commit with message "chore: session handoff"

Documentation is not optional. Undocumented decisions
become mystery bugs six sessions later.

---

## BP-12 — Before Starting Any Task

Run this mental checklist before writing a single line:

  □ Have I read CLAUDE.md this session?
  □ Do I know which GROUP and file I am working on?
  □ Is there an existing pattern in .claude/memory/patterns.md
    for what I am about to build?
  □ Is there a matching bug in Active Bugs that I must
    fix in this task?
  □ Do I know what the success condition is?
    (which AC does this satisfy?)
  □ Will I run the build check when I am done?

If any answer is no — stop and resolve it first.

---

## BP-13 — Definition of Done

A task is DONE when ALL of these are true:

  □ The feature works correctly in the running app
  □ All four states are handled (loading/success/empty/error)
  □ Build passes: ./gradlew :app:assembleDebug
  □ No hardcoded hex or dp values introduced
  □ No new compiler warnings introduced
  □ The AC conditions in tasks.md are all satisfied
  □ CLAUDE.md is updated to reflect the new status
  □ The change is committed with a correct commit message

Done does not mean "the code is written."
Done means "it works and the project state is recorded."
