# Claude Code Prompt — Vertical Slice Refactoring + Full Regression Testing
> Paste this into Claude Code as your session zero prompt for this task.

---

```
Read MASTER.md and tasks.md before doing anything else. Then proceed.

This session covers two linked objectives:
1. Restructure the project's .claude/ folder and top-level docs layout using a clean, modular AI-first architecture
2. Begin Vertical Slice Architecture refactoring across backend, web, and mobile

All work must be done on a new branch. Do not touch main.

────────────────────────────────────────────────────────
PART 0 — PRE-FLIGHT
────────────────────────────────────────────────────────

Before anything else:
· Run git status and git log --oneline -10
· Confirm main branch is clean, stable, and all completed features are merged
· Verify backend compiles: ./mvnw compile
· Verify frontend builds: npm run build from the web directory
· Report what you find. If anything is broken or unmerged, stop and tell me before proceeding.

────────────────────────────────────────────────────────
PART 1 — BRANCH CREATION
────────────────────────────────────────────────────────

Create a new branch from main:

  git checkout main
  git pull origin main
  git checkout -b refactor/vertical-slice-architecture

Push the branch immediately so it exists on remote:

  git push -u origin refactor/vertical-slice-architecture

Confirm the branch is active and clean before proceeding.

────────────────────────────────────────────────────────
PART 2 — RESTRUCTURE THE .claude/ FOLDER
────────────────────────────────────────────────────────

The current .claude/ folder exists but is unstructured. Restructure it into the
following layout. Only create folders that are relevant to the Doughly Crumbl
system — do not create empty placeholder folders.

  .claude/
  ├── config.json                  ← Claude Code settings (keep existing)
  ├── memory/
  │   ├── global.md                ← Project-wide context: stack, store info, contacts
  │   ├── patterns.md              ← Recurring code patterns for this project
  │   └── mistakes.md              ← Known pitfalls and past bugs to avoid
  ├── skills/
  │   ├── coding/
  │   │   ├── spring-boot.md       ← Spring Boot patterns: @ConfigurationProperties,
  │   │   │                           exception handling, JPA, REST conventions
  │   │   ├── react.md             ← React patterns: component structure, hooks,
  │   │   │                           state management, Lucide icons usage
  │   │   └── vertical-slice.md    ← Vertical slice rules: feature folder structure,
  │   │                               what goes in each slice, naming conventions
  │   └── testing/
  │       ├── unit-tests.md        ← JUnit 5 + Mockito patterns for backend
  │       └── integration.md       ← Spring Boot test slices, MockMvc patterns
  ├── agents/
  │   ├── architect.md             ← Responsible for structure decisions, slice boundaries,
  │   │                               naming, cross-cutting concerns
  │   ├── coder.md                 ← Responsible for implementing features within a slice
  │   ├── tester.md                ← Responsible for test plans, test cases, regression runs
  │   └── reviewer.md              ← Responsible for code review, quality contract checks
  └── workflows/
      ├── build-feature.md         ← Step-by-step workflow for adding a new feature slice
      ├── run-tests.md             ← How to run unit, integration, and regression tests
      └── refactor-slice.md        ← Step-by-step process for moving a layer-based file
                                       into its correct vertical slice

Populate each file with real, useful content based on the Doughly Crumbl stack.
Do not leave files empty. Write concise, actionable content in each.

────────────────────────────────────────────────────────
PART 3 — RESTRUCTURE TOP-LEVEL DOCS/
────────────────────────────────────────────────────────

The current docs/ folder has grown organically and has mixed concerns. Reorganize it:

  docs/
  ├── architecture.md              ← Keep and update — add vertical slice diagram
  ├── api.md                       ← Keep — REST endpoint reference
  ├── database.md                  ← Keep — schema, relationships
  ├── setup.md                     ← Keep — local dev setup instructions
  ├── conventions.md               ← Keep — naming, code style rules
  ├── flow.md                      ← Keep — order flow, payment flow
  ├── MASTER.md                    ← Keep — session discipline (already exists)
  ├── tasks.md                     ← Keep — AC tracker (already exists)
  ├── decisions/
  │   ├── vertical-slice-adr.md    ← NEW: Architecture Decision Record for VSA adoption
  │   └── payment-delivery-adr.md  ← NEW: ADR for payment and delivery approach
  ├── test-plan/
  │   ├── TEST_PLAN.md             ← NEW: Full software test plan (see Part 5)
  │   └── REGRESSION_REPORT.md    ← NEW: Regression test report template (see Part 6)
  └── runbooks/
      ├── deploy.md                ← NEW: How to deploy backend and frontend
      └── rollback.md              ← NEW: How to roll back a bad release

Move files that already exist to their correct location. Update any internal links.
Do not delete anything — only reorganize and add.

────────────────────────────────────────────────────────
PART 4 — VERTICAL SLICE REFACTORING (BACKEND)
────────────────────────────────────────────────────────

The current backend is organized by technical layer (controllers/, services/,
repositories/, entities/). Refactor it to Vertical Slice Architecture where each
feature owns all its layers.

Target structure:

  backend/src/main/java/edu/cit/cabatana/doughlycrumbl/
  ├── shared/
  │   ├── config/                  ← AppJwtProperties, AppPayMongoProperties,
  │   │                               AppUploadProperties, AppOAuth2Properties,
  │   │                               SecurityConfig, CorsConfig
  │   ├── exception/               ← GlobalExceptionHandler, DoughlyException,
  │   │                               ErrorResponse
  │   └── util/                    ← HaversineCalculator, DateUtils, etc.
  ├── features/
  │   ├── auth/
  │   │   ├── AuthController.java
  │   │   ├── AuthService.java
  │   │   ├── AuthRequest.java
  │   │   ├── AuthResponse.java
  │   │   └── JwtUtil.java
  │   ├── product/
  │   │   ├── ProductController.java
  │   │   ├── ProductService.java
  │   │   ├── ProductRepository.java
  │   │   ├── Product.java          ← Entity
  │   │   ├── ProductRequest.java
  │   │   ├── ProductResponse.java
  │   │   └── ProductDataSeeder.java
  │   ├── order/
  │   │   ├── OrderController.java
  │   │   ├── OrderService.java
  │   │   ├── OrderRepository.java
  │   │   ├── Order.java            ← Entity
  │   │   ├── OrderItem.java        ← Entity
  │   │   ├── OrderRequest.java
  │   │   ├── OrderResponse.java
  │   │   └── OrderStatus.java      ← Enum: ORDER_PLACED, PREPARING, OUT_FOR_DELIVERY,
  │   │                                       READY_FOR_PICKUP, COMPLETED, CANCELLED
  │   ├── cart/
  │   │   ├── CartController.java
  │   │   ├── CartService.java
  │   │   ├── CartItem.java
  │   │   ├── CartRequest.java
  │   │   └── CartResponse.java
  │   ├── payment/
  │   │   ├── PaymentController.java
  │   │   ├── PaymentService.java
  │   │   ├── PayMongoClient.java
  │   │   ├── PaymentRequest.java
  │   │   └── PaymentResponse.java
  │   ├── delivery/
  │   │   ├── DeliveryController.java
  │   │   ├── DeliveryService.java
  │   │   ├── DeliveryFeeCalculator.java  ← Haversine + tiered pricing logic
  │   │   ├── DeliveryRequest.java
  │   │   └── DeliveryResponse.java
  │   └── user/
  │       ├── UserController.java
  │       ├── UserService.java
  │       ├── UserRepository.java
  │       ├── User.java             ← Entity
  │       ├── UserRequest.java
  │       └── UserResponse.java

Rules for this refactor:
· Move files — do not rewrite business logic during the move
· Fix all import paths after moving
· Run ./mvnw compile after every feature slice is moved — fix errors before moving the next
· If a class is used by more than one feature, it belongs in shared/
· The ProductService toResponse() error from diagnostics must be fixed during this move
  (add the private ProductResponse toResponse(Product p) method to ProductService)

────────────────────────────────────────────────────────
PART 5 — VERTICAL SLICE REFACTORING (WEB FRONTEND)
────────────────────────────────────────────────────────

The current web/ React frontend should be reorganized by feature:

  web/src/
  ├── shared/
  │   ├── components/              ← Reusable: Button, Input, Badge, Avatar, Modal
  │   ├── hooks/                   ← useAuth, useCart, useOrders
  │   ├── utils/                   ← formatPrice, formatDate, apiClient
  │   ├── constants/               ← design tokens, API base URL, delivery tiers
  │   └── types/                   ← TypeScript interfaces or JSDoc types
  ├── features/
  │   ├── menu/
  │   │   ├── MenuPage.jsx
  │   │   ├── ProductCard.jsx
  │   │   ├── ProductGrid.jsx
  │   │   ├── CategoryFilter.jsx   ← The dropdown filter component
  │   │   └── HeroBanner.jsx
  │   ├── cart/
  │   │   ├── OrderBag.jsx         ← The right sidebar Order Bag panel
  │   │   ├── OrderBagItem.jsx     ← Individual item with qty stepper + trash icon
  │   │   └── CartSummary.jsx      ← Subtotal, delivery fee, total, confirm button
  │   ├── checkout/
  │   │   ├── CheckoutPage.jsx
  │   │   ├── FulfillmentToggle.jsx
  │   │   ├── AddressInput.jsx
  │   │   ├── DeliveryFeeDisplay.jsx
  │   │   └── PaymentMethodSelector.jsx
  │   ├── orders/
  │   │   ├── MyOrdersPage.jsx
  │   │   ├── OrderCard.jsx
  │   │   ├── OrderDetailDrawer.jsx
  │   │   ├── OrderStatusBadge.jsx
  │   │   └── OrderTimeline.jsx    ← Status stepper component
  │   ├── auth/
  │   │   ├── LoginPage.jsx
  │   │   └── RegisterPage.jsx
  │   └── profile/
  │       └── ProfilePage.jsx
  └── layout/
      ├── Sidebar.jsx              ← Left nav sidebar with profile section
      ├── Header.jsx               ← Top header: logo, search, cart icon, shop toggle, avatar
      └── AppLayout.jsx            ← Wrapper that composes Sidebar + Header + page content

Rules:
· Move files only — do not rewrite component logic during the move
· Update all import paths after moving
· Run npm run build after every feature folder is moved — fix errors before the next
· Shared components used by more than one feature go in shared/components/

────────────────────────────────────────────────────────
PART 6 — TEST PLAN CREATION
────────────────────────────────────────────────────────

Create docs/test-plan/TEST_PLAN.md covering all implemented functional requirements.

Structure the test plan as follows:

  # Software Test Plan — Doughly Crumbl

  ## 1. Project Information
  ## 2. Scope — what is tested and what is not
  ## 3. Test Approach — unit, integration, regression, manual
  ## 4. Test Environment — Java version, Spring Boot version, Node version, browser
  ## 5. Functional Requirements Coverage Table
     | Req ID | Description | Test Type | Status |
  ## 6. Test Cases
     For each AC (AC-10 through AC-18 minimum):
     | TC ID | AC Ref | Steps | Expected Result | Actual Result | Pass/Fail |
  ## 7. Automated Test Cases
     List each test class and method, what it covers, and how to run it
  ## 8. Test Execution Commands
     Exact commands to run all tests

Write the test plan with real content based on the ACs in tasks.md.
Cover at minimum: AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18.
Also cover: product listing, user authentication, order status transitions.

────────────────────────────────────────────────────────
PART 7 — AUTOMATED TESTS (BACKEND)
────────────────────────────────────────────────────────

Write automated tests for the backend. Prioritize the features most critical to
the submission. Use JUnit 5 + Mockito for unit tests and @SpringBootTest /
MockMvc for integration tests.

Minimum coverage required:

  ProductServiceTest.java
  · testGetAllProducts_returnsPaginatedList()
  · testToResponse_mapsAllFields()           ← fixes the toResponse() bug path

  DeliveryServiceTest.java
  · testCalculateFee_within3km_returns50()
  · testCalculateFee_between3and6km_returns80()
  · testCalculateFee_between6and10km_returns120()
  · testCalculateFee_beyond10km_throwsException()

  OrderServiceTest.java
  · testCreateOrder_validPayload_returnsOrderResponse()
  · testUpdateOrderStatus_validTransition_succeeds()
  · testUpdateOrderStatus_invalidTransition_throwsException()

  CartControllerIntegrationTest.java (MockMvc)
  · testAddToCart_validProduct_returns201()
  · testRemoveFromCart_existingItem_returns200()
  · testGetCart_returnsCurrentItems()

Place tests in:
  backend/src/test/java/edu/cit/cabatana/doughlycrumbl/features/<feature>/

Run all tests after writing: ./mvnw test
Fix any failures before moving on.

────────────────────────────────────────────────────────
PART 8 — REGRESSION TEST REPORT TEMPLATE
────────────────────────────────────────────────────────

Create docs/test-plan/REGRESSION_REPORT.md with this structure:

  # Full Regression Test Report
  Filename: FullRegressionReport_G5_DoughlyCrumbl.pdf (export from this doc)

  ## 1. Project Information
     - Project: Doughly Crumbl
     - Group: G5 — Cabatana
     - Branch: refactor/vertical-slice-architecture
     - Date: [date of test run]

  ## 2. Refactoring Summary
     - What changed (layer-based → vertical slice)
     - Files moved per feature
     - Compile and build status before and after

  ## 3. Updated Project Structure
     - Tree of the new backend structure
     - Tree of the new frontend structure
     - Tree of the new .claude/ structure

  ## 4. Test Plan Summary
     - Total test cases written
     - Coverage by feature

  ## 5. Automated Test Evidence
     [Placeholder: paste test output screenshots here]
     [Placeholder: paste ./mvnw test summary here]

  ## 6. Regression Test Results
     | AC / Feature | Expected | Actual | Pass/Fail | Notes |

  ## 7. Issues Found
     | Issue ID | Description | Severity | Status |

  ## 8. Fixes Applied
     | Fix ID | Issue Ref | What Was Changed | Commit |

Leave sections 5–8 as templates with clear placeholder labels.
These will be filled in manually or in the next session after tests run.

────────────────────────────────────────────────────────
STANDING RULES FOR THIS SESSION
────────────────────────────────────────────────────────

· Move one feature slice at a time. Compile/build after each move. Fix before continuing.
· Do not rewrite business logic during the structural refactor — move only.
· Save every architectural decision made during this session to MASTER.md immediately.
· If a compile or build error occurs that you cannot fix in 2 attempts, stop and report it.
· At the end of the session, produce the full session handoff using the locked schema
  from MASTER.md (STATUS / LAST SESSION / IN FLIGHT / BLOCKERS / NEXT CANDIDATES /
  MEMORY UPDATES / GATE CHECKS / SESSION NOTES).

Today's first task: Run pre-flight checks (Part 0), then create the branch (Part 1).
Propose the order of Parts 2–8 based on what you see in the repo, then wait for my OK.
```