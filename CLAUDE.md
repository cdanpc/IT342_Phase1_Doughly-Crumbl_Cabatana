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

GROUP 9 — Informational screens: COMPLETE
  activity_care_guide.xml + CareGuideActivity.kt
  activity_about_faq.xml + AboutFaqActivity.kt
  activity_payment_instructions.xml + PaymentInstructionsActivity.kt
  All 3 registered in AndroidManifest. ProfileFragment links all 3.
  QR drawables: qr_gcash.jpg, qr_maya.jpg, qr_bpi.jpg exist in drawable/.
  Roots converted to ConstraintLayout (2026-05-16).

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

Backend is authoritative. Status strings are plain strings in the database, not a Java enum.

Current customer/admin flow:
  Delivery:
    AWAITING_DELIVERY_QUOTE
      -> DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED
      -> PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
      -> PAYMENT_CONFIRMED
      -> PREPARING
      -> OUT_FOR_DELIVERY
      -> COMPLETED

  Pickup, cash on pickup:
    ORDER_PLACED -> PREPARING -> READY -> COMPLETED

  Pickup, prepaid:
    ORDER_PLACED
      -> PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
      -> PAYMENT_CONFIRMED
      -> PREPARING
      -> READY
      -> COMPLETED

Legacy/compatibility statuses still exist in code:
  PENDING, CONFIRMED, DELIVERED

Important backend transition rules:
  - submit-payment moves DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED or ORDER_PLACED
    to PAYMENT_SUBMITTED_AWAITING_CONFIRMATION and sets paymentStatus=SUBMITTED.
  - Admin confirms payment by moving PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
    to PAYMENT_CONFIRMED.
  - PAYMENT_CONFIRMED, CONFIRMED, or ORDER_PLACED may move to PREPARING.
  - PREPARING may move to READY or OUT_FOR_DELIVERY.
  - READY or OUT_FOR_DELIVERY may move to COMPLETED.
  - CANCELLED is allowed through backend strategy except terminal states.

Mobile status presentation is centralized in:
  mobile/app/src/main/java/com/example/mobile/util/OrderStatusUi.kt

Do not reintroduce duplicate status label/color/timeline maps in Activities or Adapters.

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

Last updated: 2026-05-16

Branch: mobile/core-features

Current state:
  Mobile app is in active hardening/polish state. All core screens exist.
  Latest Android debug build: BUILD SUCCESSFUL.
  Last verified command:
    cd mobile
    .\gradlew.bat :app:assembleDebug
    Result: BUILD SUCCESSFUL (2026-05-16, this session)

  No backend or web code was changed this session.

Major mobile work completed this session (UI feedback & error display hardening):

  Press/tap feedback (ripple) — applied across entire app:
    - bg_button_primary_ripple.xml (NEW) — RippleDrawable for filled primary buttons
    - bg_button_primary_selector.xml — updated: removed state_pressed swap, uses ripple
    - bg_button_outlined.xml — converted from plain shape to RippleDrawable
    - bg_card_login.xml — converted from plain shape to RippleDrawable
    - include_payment_gcash.xml — added android:foreground="@drawable/ripple_card"
    - include_payment_maya.xml — added android:foreground="@drawable/ripple_card"
    - include_payment_bank.xml — added android:foreground="@drawable/ripple_card"
    - include_payment_cash.xml — added android:foreground="@drawable/ripple_card"
    - activity_checkout.xml (cardDelivery, cardPickup) — added foreground ripple_card
    - activity_login.xml (tvForgotPassword, tvRegister) — selectableItemBackgroundBorderless
    - activity_register.xml (tvLogin) — selectableItemBackgroundBorderless

  Error display fix (TextInputLayout border expansion bug):
    - bg_input.xml — added state_activated="true" entry pointing to bg_input_error
    - activity_login.xml — added external tvEmailError, tvPasswordError TextViews;
      TILs use errorEnabled="false" + til.isActivated for border state only
    - activity_register.xml — same pattern for all 6 fields; added errorBanner card
    - LoginActivity.kt — showFieldError() + clearErrorOnType() helpers
    - RegisterActivity.kt — same helpers; all 6 field validations use showFieldError()

  Cart/checkout UX:
    - CartFragment.kt — order confirmation now uses Snackbar with "View Orders" action
      instead of auto-navigating (user controls the tab switch); errors use Snackbar
      with "Retry" action
    - CheckoutActivity.kt — removed Toast from orderPlaced observer; fixed
      hardcoded dp/sp replaced with getDimension()/getDimensionPixelSize()

  strings.xml additions:
    - error, order_placed_success, view_orders, retry

New drawables added (all in drawable/):
  bg_button_primary_ripple.xml (NEW this session)
  bg_button_danger_outlined.xml, bg_button_success.xml (previous session)
  bg_timeline_dot_complete.xml, bg_timeline_dot_active.xml, bg_timeline_dot_pending.xml
  bg_warning_banner.xml (previous session)

New layouts added this session:
  include_payment_bank.xml, include_payment_cash.xml,
  include_payment_gcash.xml, include_payment_maya.xml
  bottom_sheet_product_detail.xml

New Kotlin files added this session:
  ProductDetailBottomSheet.kt
  ApiErrorParser.kt, ApiHostInterceptor.kt, ApiServerDiscovery.kt
  OrderStatusUi.kt

Known remaining risks / next best tasks:
  1. Physical device QA needed — same Wi-Fi as backend on port 8080.
  2. Dynamic LAN scan can take a few seconds on first cold launch; consider a
     visible loading/connection indicator if this is confusing to testers.
  3. Checkout still passes fulfillment/payment method through deliveryNotes string.
     Long-term: add explicit backend fields and align web/mobile DTOs.
  4. UI text still needs on-device check for any lingering mojibake from old encoding.
  5. Web StatusTimeline pickup order differs from backend; align if doing web work.
  6. tvForgotPassword and Google sign-in in login are UI-only placeholders (dialogs);
     actual password reset and OAuth are not wired to backend yet.

How to continue:
  1. Run mobile build:
       cd mobile
       .\gradlew.bat :app:assembleDebug
  2. Start backend:
       cd backend
       .\mvnw spring-boot:run
  3. Test golden path on device/emulator:
       auth -> menu -> add to cart -> cart -> checkout delivery/pickup ->
       order detail -> payment proof -> admin quote/confirm/status ->
       notifications -> profile info screens.
  4. If connection fails on physical device, check Windows Firewall for port 8080
     and verify phone/laptop are on the same LAN subnet.

Last known build:
  Mobile: .\gradlew.bat :app:assembleDebug -> BUILD SUCCESSFUL (2026-05-16)

Last commit: 6e36049 chore: session handoff [auto]
