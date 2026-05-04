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
| Backend | Spring Boot 3.5, Java 17, PostgreSQL (Supabase), Hibernate |
| Web | React 18, Vite, TypeScript, Axios, TailwindCSS |
| Mobile | Android (Kotlin), View-based XML, Retrofit, MVVM, LiveData |
| Auth | JWT only — OAuth2 config class exists but is unused |
| Payments | Manual proof-of-payment upload — PayMongo planned but not started |
| Delivery | Manual admin quote — OpenStreetMap Nominatim planned (AC-15) |

---

## Active Branch

refactor/vertical-slice-architecture

---

## Architecture — Vertical Slice (applied to all platforms)

Backend: features/<slice>/ + shared/
  Slices: auth, cart, order, product, notification, payment, user

Web: features/<slice>/ + shared/ + layout/
  Slices: auth, menu, orders, checkout, admin, landing, care-guide, about

Mobile: com.example.mobile.<feature>/ui/ + <feature>/data/
  Features: auth, home, cart, orders, checkout (in progress),
            admin, profile, notifications (not started)
  Shared: model/, network/, util/

---

## Mobile Implementation Status

Foundation (complete — do not touch):
  colors.xml     — crimson #6B1A2B, full token palette, zero hardcoded hex
  dimens.xml     — all dimension tokens (radii, heights, spacing, targets)
  themes.xml     — Material3 NoActionBar, Poppins via Google Fonts provider
  drawables      — bg_input (4 states), bg_button_primary_selector,
                   bg_card, bg_chip_active/inactive, bg_auth_header,
                   bg_bottom_sheet, bg_fulfillment_selected/unselected,
                   bg_payment_selected, bg_timeline_dot_*,
                   bg_image_upload (dashed), bg_warning_banner,
                   bg_button_success, bg_button_danger_outlined

GROUP 1 — Auth screens: COMPLETE
  activity_splash.xml + SplashActivity.kt
  activity_login.xml + LoginActivity.kt (with error banner)
  activity_register.xml + RegisterActivity.kt (password strength bar)

GROUP 2 — Customer shell + Home: COMPLETE
  activity_main.xml — 5-tab bottom nav (Menu, Cart, Orders, Alerts, Profile)
  fragment_home.xml — hero banner, search, category chips, product grid
  item_product.xml + item_product_skeleton.xml
  HomeFragment.kt — category chip filter wired

GROUP 3 — Cart + Checkout: IN PROGRESS
  fragment_cart.xml  DONE
  item_cart.xml      DONE
  CartFragment.kt    DONE (Proceed to Checkout opens CheckoutActivity)
  activity_checkout.xml   IN PROGRESS
  CheckoutActivity.kt     NOT STARTED
  CheckoutViewModel.kt    NOT STARTED

GROUP 4 — Orders + Order Detail + Payment:  NOT STARTED
GROUP 5 — Notifications + Profile:          NOT STARTED
GROUP 6 — Admin Shell + Dashboard:          NOT STARTED
GROUP 7 — Admin Orders + Order Detail:      NOT STARTED
GROUP 8 — Admin Products + Add/Edit:        NOT STARTED
GROUP 9 — Informational screens:            NOT STARTED

---

## Active Bugs (do not regress — fix in the group listed)

BUG-1 (fix in GROUP 4)
  ApiService.getOrders() calls GET /api/orders
  Must be: GET /api/orders/my-orders

BUG-2 (fix in GROUP 3 — CheckoutActivity)
  CartViewModel.placeOrder() sends POST /api/orders with no body
  Must send full CheckoutRequest:
  { fulfillmentType, street, barangay, city, landmark,
    phoneNumber, paymentMethod, orderNotes }

BUG-3 (fix in GROUP 4)
  Order.kt data class field names do not match backend response
  Backend returns: orderId, orderDate, totalAmount, fulfillmentType,
  paymentMethod, paymentStatus, deliveryFee, orderNotes,
  cancellationReason

BUG-4 (fix after GROUP 9)
  SessionManager uses plain SharedPreferences
  Must migrate to EncryptedSharedPreferences

BUG-5 (fix after GROUP 9)
  No 401 auto-redirect in AuthInterceptor
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

Valid transitions only — never skip states:

  ORDER_PLACED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → COMPLETED
                                       → READY_FOR_PICKUP  → COMPLETED
  Any state before COMPLETED → CANCELLED (with reason)

---

## Delivery Fee Tiers (AC-15)

  0–3 km   →  ₱80
  3–8 km   →  ₱120
  8–15 km  →  ₱160
  >15 km   →  Not available

Calculator: DeliveryFeeCalculator.java exists but is NOT yet
wired into any controller. Fix is part of AC-15 scope.

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
| docs/content/care-guide.md | Cookie care page content |
| docs/content/about-faqs.md | About and FAQ page content |
| docs/content/payment-delivery-flow.md | Payment and delivery spec |
| docs/test-plan/TEST_PLAN.md | Software test plan |
| docs/test-plan/REGRESSION_REPORT.md | Regression report |
| docs/designs/mobile/ | Design screenshots by screen number |

---

## Commands

  # Backend
  ./mvnw spring-boot:run          → starts on port 8080
  ./mvnw compile                  → compile check only
  ./mvnw test                     → all backend tests
  ./mvnw test -Dtest=ClassName    → single test class

  # Web
  npm run dev                     → starts on port 5173 (from /web)
  npm run build                   → TypeScript + Vite build check

  # Mobile
  ./gradlew :app:assembleDebug    → build check (run after every group)
  ./gradlew :app:clean            → clean build artifacts

  # Session resume
  claude --continue               → resume last session
  claude --resume                 → pick from recent sessions

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

Last updated: [DATE — update this every session]

Current focus: Mobile — GROUP 3 Cart + Checkout
Next file to work on: activity_checkout.xml

What's done this session:
  [fill in at end of session]

What's in progress:
  activity_checkout.xml — fulfillment toggle, address fields,
  payment method selector, sticky total + Place Order button

What's next after current group:
  GROUP 4 — Orders + Order Detail + Payment
  Fix BUG-1 and BUG-3 in this group

Blockers:
  None currently

Last commit:
  [paste last git log --oneline -1 output here]
