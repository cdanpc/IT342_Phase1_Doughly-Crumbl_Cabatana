# Doughly Crumbl — Claude Code Memory
> Auto-loaded every session. Keep this concise and current.
> Update the "Where We Are Right Now" section at the end of every session.

---

## What This Project Is

Artisan bakery ordering app with three platforms:
- Backend API (Spring Boot)
- Web frontend (React)
- Android mobile app (Kotlin, View-based XML)

Store: Don Gil Garcia St., Capitol Site, Cebu City
Contact: 09165667589 | FB: Doughly Crumbl | IG: @doughlycrumbl

---

## Stack

| Platform | Technology |
|---|---|
| Backend | Spring Boot 3.5.13, Java 17, PostgreSQL (Supabase), Hibernate |
| Web | React 18, Vite 7, TypeScript 5.9, Axios, plain CSS |
| Mobile | Android (Kotlin), View-based XML, Retrofit, MVVM, LiveData |
| Auth | JWT only — OAuth2 config class exists but is unused |
| Payments | Manual proof-of-payment upload — PayMongo planned but not started |
| Delivery | Manual admin quote — DeliveryFeeCalculator exists but is not wired (AC-15) |

---

## Active Branch

main

---

## Architecture — Vertical Slice (applied to all platforms)

Backend: features/<slice>/ + shared/
  Slices: auth, cart, delivery (empty placeholder), notification,
          order, payment, product, user
  Shared: config/, exception/, util/

Web: features/<slice>/ + shared/ + layout/
  Slices: auth, menu, orders, checkout, admin, landing, care-guide, about
  Shared: api/, components/, hooks/, types/, utils/
  Layout: AppLayout, Header, Sidebar, OrderPanel

Mobile: com.example.mobile.<feature>/ui/ + <feature>/data/
  Features: auth, home, cart (includes checkout), orders,
            admin, profile, notifications
  Shared: model/, network/, util/
  Note: ui/theme/ (Color.kt, Theme.kt, Type.kt) are leftover Compose
        boilerplate — do not touch, do not add to.

---

## Mobile Implementation Status

Foundation (complete — do not touch):
  colors.xml     — crimson #6B1A2B, full token palette, zero hardcoded hex
  dimens.xml     — all dimension tokens (radii, heights, spacing, targets)
  themes.xml     — Material3 NoActionBar, Poppins via Google Fonts provider
  drawables      — bg_input (4 states: default/focused/error/disabled),
                   bg_button_primary_selector (default/pressed/disabled),
                   bg_button_outlined, bg_card, bg_card_login,
                   bg_card_top_rounded, bg_chip_active, bg_chip_inactive,
                   bg_chip_selected, bg_chip_unselected,
                   bg_auth_header, bg_bottom_sheet,
                   bg_fulfillment_selected/unselected,
                   bg_payment_selected/unselected,
                   bg_dashed_circle (image upload placeholder),
                   bg_error_banner, bg_skeleton_rect, bg_badge_dot,
                   bg_gradient_crimson, bg_divider, bg_google_btn,
                   bg_image_rounded, bg_logo_gcash, bg_logo_maya,
                   bg_strength_track/weak/medium/strong/empty,
                   bg_circle_white, bg_circle_white_alpha

  Missing drawables (needed for ORDER screens — create in GROUP 4 fix):
    bg_timeline_dot_complete, bg_timeline_dot_active, bg_timeline_dot_pending
    bg_button_success, bg_button_danger_outlined, bg_warning_banner

GROUP 1 — Auth screens: COMPLETE
  activity_splash.xml + SplashActivity.kt
  activity_login.xml + LoginActivity.kt
  activity_register.xml + RegisterActivity.kt + RegisterViewModel.kt

GROUP 2 — Customer shell + Home: COMPLETE
  activity_main.xml — 5-tab bottom nav (Menu, Cart, Orders, Alerts, Profile)
  fragment_home.xml — hero banner, search, category chips, product grid
  item_product.xml + item_product_skeleton.xml
  HomeFragment.kt + HomeViewModel.kt + ProductAdapter.kt + SkeletonAdapter.kt

GROUP 3 — Cart + Checkout: COMPLETE
  fragment_cart.xml + item_cart.xml
  CartFragment.kt + CartViewModel.kt + CartItemAdapter.kt
  activity_checkout.xml
  CheckoutActivity.kt — fulfillment toggle, address fields, payment selector,
                         validation, placeOrder() with CheckoutRequest
  CheckoutViewModel.kt — loadCart() + placeOrder(request: CheckoutRequest)

GROUP 4 — Orders + Order Detail: COMPLETE (files exist — verify logic)
  fragment_orders.xml + item_order.xml + item_order_item.xml
  activity_order_detail.xml
  OrdersFragment.kt + OrdersViewModel.kt + OrderAdapter.kt
  OrderDetailActivity.kt + OrderDetailViewModel.kt + OrderItemAdapter.kt
  Missing: item_admin_order.xml (needed for admin orders list)

GROUP 5 — Notifications + Profile: COMPLETE (files exist — verify logic)
  fragment_notifications.xml + NotificationsFragment.kt
  fragment_profile.xml + ProfileFragment.kt

GROUP 6 — Admin Shell + Dashboard: COMPLETE (files exist — verify logic)
  activity_admin.xml + AdminActivity.kt
  fragment_admin_dashboard.xml + AdminDashboardFragment.kt + AdminDashboardViewModel.kt

GROUP 7 — Admin Orders + Order Detail: COMPLETE (files exist — verify logic)
  fragment_admin_orders.xml + AdminOrdersFragment.kt + AdminOrdersViewModel.kt
  activity_admin_order_detail.xml + AdminOrderDetailActivity.kt + AdminOrderDetailViewModel.kt
  Missing: item_admin_order.xml

GROUP 8 — Admin Products + Add/Edit: COMPLETE (files exist — verify logic)
  fragment_admin_products.xml + item_admin_product.xml
  AdminProductsFragment.kt + AdminProductsViewModel.kt + AdminProductAdapter.kt
  activity_admin_add_edit_product.xml
  AdminAddEditProductActivity.kt + AdminAddEditProductViewModel.kt

GROUP 9 — Informational screens: NOT STARTED
  activity_care_guide.xml    — not created
  activity_about_faq.xml     — not created
  activity_payment_instructions.xml — not created

---

## Active Bugs

BUG-3 (fix now — affects all order screens)
  Order.kt field names do not match backend OrderResponse:
  Mobile uses:   id, createdAt, deliveryFee, customerName, customerEmail
  Backend sends: orderId, orderDate, (no deliveryFee field), (no customer fields)
  Backend also sends (missing from Order.kt):
    paymentStatus, deliveryAddress, contactNumber, deliveryNotes,
    proofImageUrl, cancellationReason, itemCount
  Fix: rewrite Order.kt to mirror OrderResponse.java exactly

BUG-4 (fix after GROUP 9)
  SessionManager uses plain SharedPreferences (Context.MODE_PRIVATE)
  Must migrate to EncryptedSharedPreferences

BUG-5 (fix after GROUP 9)
  AuthInterceptor adds Bearer token but does NOT handle 401 responses
  Must: catch 401 → clear session → redirect to LoginActivity

---

## Mobile Design System

Primary / Crimson:    #6B1A2B  →  @color/colorPrimary
Primary Dark:         #4A1020  →  @color/colorPrimaryDark
Primary Light / Tint: #F5E8EB  →  @color/colorPrimaryLight
Background:           #FAF7F4  →  @color/colorBackground
Surface:              #FFFFFF  →  @color/colorSurface
Text Primary:         #1A1A2E  →  @color/colorTextPrimary
Text Secondary:       #6B6B6B  →  @color/colorTextSecondary
Text Muted:           #AAAAAA  →  @color/colorTextMuted
Border:               #E8E0D8  →  @color/colorBorder
Success:              #1A7A4A  →  @color/colorSuccess
Warning:              #F59E0B  →  @color/colorWarning
Error:                #DC2626  →  @color/colorError

Font: Poppins — set in themes.xml via Google Fonts provider
      @font/poppins applied to fontFamily + android:fontFamily

Rules:
  - All colors via @color/ — never hardcode hex values
  - All dimensions via @dimen/ — never hardcode dp values
  - Input fields always use @drawable/bg_input
  - Buttons always use @drawable/bg_button_primary_selector
  - ConstraintLayout root on all layouts
  - Minimum touch target 48dp on all clickable elements
  - XML and drawables only — no Compose, no HTML, no JSX

---

## Design Reference

Stitch design file (fetch at session start when doing mobile work):
https://api.anthropic.com/v1/design/h/aRXZQUNnHfjjt0mnhmZYXQ?open_file=Doughly+Crumbl+Mobile.html

Behavioral spec: docs/mobile/mobile-design-prompts.md
If the two conflict — design file wins as visual truth.

---

## Order Status State Machine

Valid transitions only — never skip states.
Status strings are plain strings in the database (not a Java enum).

  PENDING → CONFIRMED
  CONFIRMED | PAYMENT_CONFIRMED | ORDER_PLACED → PREPARING
  PREPARING → READY
  READY → DELIVERED
  Any state except DELIVERED / COMPLETED / CANCELLED → CANCELLED (with reason)

Valid status strings: PENDING, CONFIRMED, PAYMENT_CONFIRMED,
                      ORDER_PLACED, PREPARING, READY, DELIVERED,
                      COMPLETED, CANCELLED

---

## Key Files

| File | Purpose |
|---|---|
| docs/MASTER.md | Gate rules, handoff schema, memory taxonomy |
| docs/tasks.md | Full AC list AC-10 to AC-18 with Given/When/Then |
| docs/SYSTEM_INTELLIGENCE_REPORT.md | Full codebase audit |
| docs/mobile/mobile-design-prompts.md | 18 screen design specs |
| docs/mobile/MOBILE_DESIGN_STATUS.md | Mobile progress tracker |
| docs/mobile/ANDROID_UI_AUDIT.md | UI audit findings |
| docs/test-plan/TEST_PLAN.md | Software test plan |
| docs/test-plan/REGRESSION_REPORT.md | Regression report |
| docs/designs/mobile/ | Design screenshots by screen number |

Note: docs/content/ files (care-guide.md, about-faqs.md, payment-delivery-flow.md)
      do not exist yet — create them before implementing GROUP 9.

---

## Commands

  # Backend
  ./mvnw spring-boot:run          → starts on port 8080 (run from /backend)
  ./mvnw compile                  → compile check only
  ./mvnw test                     → all backend tests
  ./mvnw test -Dtest=ClassName    → single test class

  # Web
  npm run dev                     → starts on port 5173 (run from /web)
  npm run build                   → TypeScript + Vite build check

  # Mobile
  ./gradlew :app:assembleDebug    → build check (run after every group)
  ./gradlew :app:clean            → clean build artifacts

---

## How to Resume a Session

Start of every new session — type this in the chat:
  /resume

End of every session — type this in the chat:
  /handoff

That's it. Two commands. Everything else is automatic.

---

## Session Rules (always active)

- Run ./gradlew :app:assembleDebug after every implementation group
- Fix any build error before moving to the next group
- Do not modify backend or web frontend code unless fixing a named bug
- Do not rewrite ViewModel or Repository logic unless fixing a named bug
- All colors via @color/ tokens — never hardcode hex
- All dimensions via @dimen/ tokens — never hardcode dp
- XML layouts only — no Compose, no HTML, no JSX
- ConstraintLayout root on all layouts
- After every session: update "Where We Are Right Now" below and commit

---

## Where We Are Right Now

Last updated: 2026-05-04

Branch: main

Current state:
  This session was setup-only — no code written.
  Docs restructured, CLAUDE.md verified against live codebase,
  session persistence system fully installed.

Layout files: 23 exist
Drawable files: 53 exist (bg_* + ic_*)

Completed this session:
  - docs/ restructured: mobile/, reports/, content/, archive/ subfolders created
  - docs/CLAUDE.md moved to project root as CLAUDE.md
  - CLAUDE.md fully rewritten with verified facts (branch, stack, group statuses, bugs, state machine, fee tiers)
  - Session persistence system installed:
      .claude/hooks/post-session-save.sh  (PostToolUse → session-state.txt)
      .claude/hooks/session-handoff.sh    (Stop hook reminder)
      .claude/commands/handoff.md         (/handoff command)
      .claude/commands/resume.md          (/resume command)
      .claude/memory/global.md            (project identity)
      .claude/memory/patterns.md          (code patterns)
      .claude/memory/mistakes.md          (known pitfalls)

Nothing in progress:
  Clean slate. No half-done implementation work.

Next session — start here (in order):
  1. Fix BUG-3: rewrite Order.kt to mirror backend OrderResponse.java
     File: mobile/app/src/main/java/com/example/mobile/model/Order.kt
     Change: id→orderId, createdAt→orderDate, remove deliveryFee/customerName/customerEmail,
             add paymentStatus, deliveryAddress, contactNumber, deliveryNotes,
             proofImageUrl, cancellationReason, itemCount
  2. Create item_admin_order.xml — missing from GROUP 7 admin orders list
  3. Implement GROUP 9 — activity_care_guide.xml, activity_about_faq.xml,
     activity_payment_instructions.xml

Blockers:
  docs/content/ files (care-guide.md, about-faqs.md, payment-delivery-flow.md)
  do not exist yet — must be created before GROUP 9 content can be implemented

Last commit:
  aef681f chore: implement session persistence system
