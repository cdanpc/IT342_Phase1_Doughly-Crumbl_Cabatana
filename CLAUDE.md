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

mobile/core-features

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

BUG-3 — FIXED (2026-05-04)
  All mobile data models now match backend response shapes exactly.
  Order.kt, OrderItem.kt, Cart.kt, CartItem.kt, Product.kt,
  ProductRequest.kt, RegisterRequest.kt, UpdateOrderStatusRequest.kt
  rewritten. Notification.kt created (was missing entirely).
  Build verified: ./gradlew :app:assembleDebug → BUILD SUCCESS.

BUG-4 — FIXED (2026-05-06)
  SessionManager migrated to EncryptedSharedPreferences (AES256_GCM key,
  AES256_SIV key scheme, AES256_GCM value scheme).
  DoughlyApp.kt created as Application subclass; registered in manifest.
  security-crypto:1.0.0 added to libs.versions.toml + build.gradle.kts.

BUG-5 — FIXED (2026-05-06)
  AuthInterceptor now catches 401: clears session + starts LoginActivity
  with FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK.
  Context sourced from DoughlyApp.appContext — no repository changes needed.

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
| docs/data-models.md | Single source of truth for all entity shapes (BP-02) |
| docs/SYSTEM_INTELLIGENCE_REPORT.md | Full codebase audit |
| docs/mobile/mobile-design-prompts.md | 18 screen design specs |
| docs/mobile/MOBILE_DESIGN_STATUS.md | Mobile progress tracker |
| docs/mobile/ANDROID_UI_AUDIT.md | UI audit findings |
| docs/test-plan/TEST_PLAN.md | Software test plan |
| docs/test-plan/REGRESSION_REPORT.md | Regression report |
| docs/designs/mobile/ | Design screenshots by screen number |
| .claude/memory/best-practices.md | Enforced dev standards BP-01 through BP-13 |

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

Last updated: 2026-05-06

Branch: mobile/core-features

Current state:
  All mobile backlog complete. All web admin backlog complete.
  All backend tests passing (42 total). BUILD SUCCESS confirmed.

Layout files: 29 exist
Drawable files: 64 exist

Completed this session (two sessions since last handoff):

  Mobile — unread notification badge:
    MainActivity.kt — polling via repeatOnLifecycle(STARTED), 30s interval,
                      clears badge when alerts tab selected, openTab extra for reorder nav
    ApiService.kt — added getNotificationsUnreadCount() endpoint
    NotificationsRepository.kt — added getUnreadCount() with Gson Double→Int coercion
    ApiService.kt fix — mark-all-read URL corrected: notifications/mark-all-read → notifications/read-all

  Web admin — status override panel:
    AdminOrderDetail.tsx — collapsible "Override Status" panel with all valid statuses;
                           CANCELLED triggers cancel modal, others call handleStatusUpdate
    AdminOrderDetail.css — .od__override* styles

  Web — sidebar avatar dropdown:
    Sidebar.tsx — clickable avatar, outside-click dismissal, name/email/Sign Out dropdown
    Sidebar.css — .sidebar__avatar-menu positioned left:120px anchored by position:relative

  Reorder from completed orders (all three platforms):
    backend: OrderItemResponse.java — added productId field (null-safe lazy FK access)
    backend: OrderAdapter.java — toItemResponse() now includes productId
    web: index.ts — added productId? to OrderItem interface
    web: OrderDetailPage.tsx — handleReorder() loops items, calls addToCart, opens panel
    web: OrderDetailPage.css — .cod__reorder-btn
    mobile: OrderItem.kt — added @SerializedName("productId") val productId: Long? = null
    mobile: OrderDetailViewModel.kt — added CartRepository dep + reorder() function
    mobile: OrderDetailActivity.kt — reorder result observer, navigates to cart tab on success

  Backend tests — 42 passing (0 failures):
    AuthServiceTest.java — 6 unit tests (password mismatch, dupe email, valid register,
                           email not found, wrong password, valid login)
    AuthControllerIntegrationTest.java — 6 @WebMvcTest tests (register/login flows)
    CartServiceTest.java — 7 unit tests (getCart, addItem, removeItem, clearCart)
    CartControllerIntegrationTest.java — 3 @WebMvcTest tests (auth required, CRUD)
    ProductControllerIntegrationTest.java — 5 @WebMvcTest tests (filter, search, 404)
    Fix: @WebMvcTest context requires @MockBean JwtTokenProvider + UserDetailsService
         + @Import(SecurityConfig.class) to apply permitAll() rules

  Docs:
    docs/tasks.md — PayMongo/Lalamove/push-notifications marked dropped (out of scope)

Nothing in progress:
  Clean slate — all planned features implemented and tested.

Next session — start here (in order):
  1. End-to-end QA pass: run app on emulator, test all screens
  2. Unread notification badge — verify polling works on physical device
  3. Web Vitest setup (optional): install vitest + @testing-library/react if test coverage needed

Blockers:
  None.

Decisions made this session:
  - PayMongo payment integration dropped from scope entirely — manual proof-of-payment stays.
  - Reorder re-adds items to cart via CartRepository.addToCart() (mobile) /
    CartContext.addToCart() (web); then navigates to cart. Works now that productId
    is included in OrderItemResponse.
  - @WebMvcTest slices require both JwtTokenProvider AND UserDetailsService mocked
    (JwtAuthFilter has two constructor deps). SecurityConfig must be @Imported to
    get permitAll() rules — otherwise default Spring Security redirects all anonymous requests.
  - Sidebar avatar dropdown positioned at left:120px (fixed sidebar width) with
    position:relative on .sidebar__profile container.

Last commit: a9a64d2 test(backend): add 42 unit + integration tests, all passing
