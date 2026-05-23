# Doughly Crumbl — Claude Code Memory
> Auto-loaded every session. Keep this concise and current.
> Update the "Where We Are Right Now" section at the end of every session.

Active trackers:
- Web: `docs/WEB_SYSTEM_PROGRESS.md`
- Mobile: `docs/MOBILE_SYSTEM_PROGRESS.md`
Older progress/contracts/audits that used to live in `docs/` were moved to
`docs/archive/legacy-progress-docs/` and are historical only. Do not treat
archived docs as current implementation truth without verifying against code.

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
| docs/WEB_SYSTEM_PROGRESS.md | Active web-first progress tracker, feature status, to dos, backlog, backend contract notes, and component/design refactor audit |
| docs/MOBILE_SYSTEM_PROGRESS.md | Active Android progress tracker, feature status, to dos, backlog, backend contract notes, and mobile design/refactor audit |
| docs/mobile/mobile-design-prompts.md | 18 screen design specs |
| docs/mobile/MOBILE_DESIGN_STATUS.md | Mobile progress tracker |
| docs/mobile/ANDROID_UI_AUDIT.md | UI audit findings |
| docs/test-plan/TEST_PLAN.md | Software test plan |
| docs/test-plan/REGRESSION_REPORT.md | Regression report |
| docs/designs/mobile/ | Design screenshots by screen number |
| .claude/memory/best-practices.md | Enforced dev standards BP-01 through BP-13 |
| docs/archive/legacy-progress-docs/ | Historical docs only; do not use as current truth |

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

Last updated: 2026-05-23

Branch: mobile/core-features

Current state:
  Active web frontend refactor session. All web TypeScript compiles cleanly.
  Mobile and backend code untouched this session.

  Web — this session (2026-05-23):
    FULL TOKEN MIGRATION COMPLETE across the order flow.

    index.css — 21 new design tokens added:
      --color-overlay, --color-surface-neutral, --color-input-bg,
      --color-border-subtle, --color-warning-border, --color-warning-text,
      --color-success-border, --color-success-text, --color-success-text-dark,
      --color-info-border, --color-info-text, --color-orange,
      --color-pickup-bg, --color-pickup-text, --color-delivery-bg,
      --color-delivery-text, --color-error-muted, --color-star-dark,
      --shadow-modal, --radius-xl.

    CheckoutModal.tsx — last inline style removed (notes wrapper div).
    CheckoutModal.css — fully rewritten. Zero hardcoded hex values.

    OrderDetailPage.tsx — all inline styles removed:
      - Status chip replaced with OrderStatusBadge component.
      - Helper banner: getHelperBannerClass() derives CSS modifier from status.
      - Banner icons: color prop removed; icons now inherit currentColor from
        parent .cod__status-banner--{variant} container.
      - CheckCircle icons: cod__proof-icon class replaces color="#16a34a".
      - Spinner: cod__card-spinner class replaces style={{ width, height }}.
      - Removed getStatusColor import (no longer used in TSX).
    OrderDetailPage.css — fully rewritten. Zero hardcoded hex values.

    OrderConfirmationPage.css — all 4 hardcoded values replaced with tokens.

    AdminOrderDetail.tsx — all inline styles removed:
      - Status chip replaced with OrderStatusBadge component.
      - Cancellation reason label: od__info-label--error class.
      - Override ChevronDown: od__override-chevron/--open CSS classes.
      - Removed getStatusColor import.
    AdminOrderDetail.css — fully rewritten. Zero hardcoded hex values.

    AdminOrders.tsx — full inline style extraction complete. All table/page
      CSS classes in AdminOrders.css. Status chip now uses OrderStatusBadge.
    AdminDashboard.tsx — expanded from 4 to 6 stat cards (Total Products,
      Total Orders, Needs Attention, Payment Pending, In Progress, Revenue).
      Stat icon color variants moved to CSS modifier classes. Recent Orders
      table added (last 8 orders, clickable rows, OrderStatusBadge).
    NotificationDetailModal — new component at components/notifications/.
      Shows notification type badge, full message, date/time, "View Order"
      button (routes by type + user role), "Mark as Read" button.
    NotificationDropdown — now calls onSelectNotification instead of
      navigating directly. Dropdown closes before modal opens (no stacking).
    Header.tsx — manages selectedNotification state; renders
      NotificationDetailModal in Fragment; ensures only one modal open at a time.

  TypeScript check: npm.cmd exec -- tsc -b → 0 errors (2026-05-23).

  Backend .env (from 2026-05-19):
    backend/.env created with Supabase pooler credentials. Gitignored.
    Backend startup not yet confirmed. To verify:
      Open cmd.exe → cd backend → mvnw.cmd spring-boot:run

  Latest Android debug build:
    .\gradlew.bat :app:assembleDebug → BUILD SUCCESSFUL (2026-05-23)

Major work completed since last handoff:

  Previous sessions (carried forward from 2026-05-17):

  Backend/profile support:
    - Added backend profile feature package for customer profile, favorites,
      and delivery address support.
    - Product lookup behavior was adjusted in product repository/service and
      ProductServiceTest was updated.

  Mobile network/session:
    - Added ApiErrorParser.kt for actionable API error messages.
    - Added ApiHostInterceptor.kt and ApiServerDiscovery.kt for automatic LAN
      backend host discovery instead of hardcoded manual LAN IP changes.
    - RetrofitClient.kt and network_security_config.xml were updated for this.

  Mobile home/customer product flow:
    - HomeFragment/HomeViewModel/ProductAdapter now use ViewModel-backed
      add-to-cart, favorite toggle, pending states, search, category filters,
      skeleton loading, and product detail bottom sheet.
    - Product cards are now horizontal list cards with product image on the left
      and right-side actions.
    - Favorite button has no visible button background; outline heart when
      inactive, filled heart when favorited.
    - Add-to-cart on home card is now a cart icon button with no visible round
      background. It shows outline cart when idle, filled cart icon in primary
      color while the add request is pending, then returns to outline so users
      understand they can tap again to add more quantity.
    - Bottom nav cart icon now uses selector drawable: outline when inactive,
      filled when selected.

  Mobile product detail:
    - Added ProductDetailBottomSheet.kt and bottom_sheet_product_detail.xml.
    - Product detail shows image, name, price, category, rating, description,
      quantity stepper, and add-to-cart price.
    - Latest layout change: quantity stepper moved to the left and Add button
      sits in the same row to the right for a cleaner bottom action area.
    - Product detail quantity is capped at 1..10 and updates CTA price.

  Mobile cart/checkout/orders/profile:
    - Cart, checkout, orders, order detail, notifications, profile, and admin
      screens have received broader UI and wiring updates in the dirty worktree.
    - Checkout supports fulfillment/payment UI and uses CheckoutRequest mobile
      model changes.
    - Order status presentation is centralized in OrderStatusUi.kt; keep it
      centralized and do not duplicate status maps in Activities/Adapters.
    - Profile now has customer profile/favorites/address data model/repository
      additions in progress.

  Mobile design/assets:
    - Layout files: 35 | Drawable files: 89
    - Added/updated many drawables for icons, timeline dots, payment options,
      quantity stepper, cart selector, heart states, and product detail.

Files most recently touched (prior session, 2026-05-17):
  - mobile/app/src/main/res/layout/item_product.xml
  - mobile/app/src/main/java/com/example/mobile/home/ui/ProductAdapter.kt
  - mobile/app/src/main/java/com/example/mobile/home/ui/HomeViewModel.kt
  - mobile/app/src/main/java/com/example/mobile/home/ui/HomeFragment.kt
  - mobile/app/src/main/res/layout/bottom_sheet_product_detail.xml
  - mobile/app/src/main/java/com/example/mobile/home/ui/ProductDetailBottomSheet.kt
  - mobile/app/src/main/res/menu/customer_nav_menu.xml
  - mobile/app/src/main/res/drawable/ic_nav_cart_filled.xml
  - mobile/app/src/main/res/drawable/ic_nav_cart_selector.xml

Known remaining risks / next best tasks:
  1. Verify backend actually starts: cd backend && .\mvnw.cmd spring-boot:run
     from a plain cmd.exe terminal (not PowerShell). Watch for DB connection
     errors — Supabase pool is on port 5432 (session pooler, not 6543).
  2. Physical device/emulator QA is still needed for the full customer golden
     path: login/register -> home -> product detail -> add to cart -> cart ->
     checkout -> orders -> payment proof -> notifications/profile.
  3. Automatic LAN scan can take a few seconds on first cold launch; consider a
     visible connection/loading state if testers think the app is frozen.
  4. Checkout still has legacy coupling around fulfillment/payment details in
     notes in some paths. Long-term fix: explicit backend DTO fields.
  5. Web Vite build is blocked by local access denied error. Re-run in a clean
     shell or fix file permission issue before web release.
  6. Login forgot-password and Google sign-in remain UI placeholders.
  7. Home add-to-cart prevents duplicate tap while a request is pending.

How to continue:
  1. Verify backend starts (first priority):
       Open cmd.exe (not PowerShell)
       cd "...IT342_Phase1_Doughly-Crumbl_Cabatana\backend"
       mvnw.cmd spring-boot:run
  2. Run mobile build:
       cd mobile
       .\gradlew.bat :app:assembleDebug
  3. Test golden path on device/emulator with backend running.
  4. If Supabase connection fails check that port 5432 (not 6543) is used and
     sslmode=require is present in the DB_URL.

Last known build:
  Mobile: .\gradlew.bat :app:assembleDebug -> BUILD SUCCESSFUL (2026-05-23)
  Backend: startup not confirmed — .env was missing until 2026-05-19

Last commit: 76a6298 chore: session handoff [auto]

---

## Token Migration — Mobile Layouts (2026-05-23)

Full design-token audit completed across all Android layout XML files.
Zero hardcoded hex values (already done). Remaining violations fixed:

  Screens fully cleaned this session:
    activity_admin_add_edit_product.xml — FULL REWRITE
      ConstraintLayout root, NestedScrollView form, all tokens,
      P0 bug fixed: tilStock/etStock replaced with SwitchMaterial switchAvailable.
    activity_admin_order_detail.xml — FULL REWRITE
      ConstraintLayout root, all tokens, 4-card layout preserved.
    fragment_admin_products.xml — targeted fixes
      Toolbar id added, all strings/dims tokenized, FAB icon → ic_add.
    item_admin_product.xml — REWRITTEN
      Platform drawables replaced (ic_edit, ic_image, ic_trash),
      48dp touch targets on edit/delete buttons (was 36dp — fixed).
    item_admin_order.xml — targeted fixes (textSize, chipMinHeight)
    activity_login.xml — targeted fixes (guideline, decorative circle dims)
    activity_main.xml — app_name string, logo size token
    fragment_admin_profile.xml — "Log Out" → @string/logout
    activity_care_guide.xml — toolbar title tokenized
    activity_about_faq.xml — toolbar title + dividers tokenized
    activity_notification_detail.xml — toolbar title + divider tokenized
    activity_payment_instructions.xml — toolbar title + QR sizes + divider

  New drawables created:
    ic_add.xml, ic_edit.xml, ic_image.xml

  New tokens added to dimens.xml:
    spacing_2, textSmall, heightChipSmall, heightChipTiny,
    strokeWidthCardThin, heightAdminProductPreview, heightDivider,
    sizeLogoInline, heightAuthHeaderGuide, sizeDecorCircle1W,
    sizeDecorCircle2, negativeDecorMarginL, negativeDecorMarginM, sizeQrCode

  New tokens added to strings.xml:
    admin_products_title, admin_product_add_content_desc,
    admin_add_product_title, admin_edit_product_title,
    admin_product_image_preview, admin_choose_image, admin_image_url_hint,
    admin_product_name_hint, admin_product_description_hint,
    admin_product_price_hint, admin_product_category_hint,
    admin_product_available, admin_save_product, admin_image_uploaded,
    admin_product_saved, admin_quote_delivery_fee_label,
    admin_delivery_fee_hint, admin_set_fee, admin_update_status_label,
    admin_edit_product_cd, admin_delete_product_cd,
    care_guide_title, about_faq_title, payment_instructions_title,
    notification_detail_title, error_required, error_invalid_price

  AdminAddEditProductActivity.kt — all hardcoded strings replaced with
    getString(R.string.*), P0 availability bug fully fixed.
