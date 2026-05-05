---
name: doughly-crumbl-android
description: >
  Project-specific Android conventions for the Doughly
  Crumbl bakery app. Apply whenever working on any mobile
  screen, layout, ViewModel, Repository, or API call.
  Always apply this skill alongside android-dev and
  android-ux for every mobile task.
---

# Doughly Crumbl — Android Skill

## Project Identity
App: Doughly Crumbl — artisan bakery ordering system
Package: com.example.mobile
Architecture: MVVM — Activity/Fragment → ViewModel → Repository → ApiService

## Design System (never deviate)
Primary / Crimson:    #6B1A2B  →  @color/colorPrimary
Primary Dark:         #4A1020  →  @color/colorPrimaryDark
Primary Light:        #F5E8EB  →  @color/colorPrimaryLight
Background:           #FAF7F4  →  @color/colorBackground
Surface:              #FFFFFF  →  @color/colorSurface
Text Primary:         #1A1A2E  →  @color/colorTextPrimary
Text Secondary:       #6B6B6B  →  @color/colorTextSecondary
Text Muted:           #AAAAAA  →  @color/colorTextMuted
Border:               #E8E0D8  →  @color/colorBorder
Success:              #1A7A4A  →  @color/colorSuccess
Warning:              #F59E0B  →  @color/colorWarning
Error:                #DC2626  →  @color/colorError
Font:                 Poppins  →  @font/poppins (Google Fonts)

Rules — enforced on every layout:
  NEVER hardcode hex values — always @color/
  NEVER hardcode dp values — always @dimen/
  NEVER hardcode strings — always @string/
  ConstraintLayout as root on all layouts
  Minimum touch target 48dp on all clickable elements
  All inputs use @drawable/bg_input (4 states)
  All primary buttons use @drawable/bg_button_primary_selector

## Package Structure
com.example.mobile.
├── auth/
│   ├── ui/          LoginActivity, RegisterActivity, SplashActivity,
│   │                LoginViewModel, RegisterViewModel
│   └── data/        AuthRepository
├── home/
│   ├── ui/          HomeFragment, HomeViewModel, ProductAdapter,
│   │                SkeletonAdapter
│   └── data/        ProductRepository
├── cart/
│   ├── ui/          CartFragment, CartViewModel, CartItemAdapter,
│   │                CheckoutActivity, CheckoutViewModel
│   └── data/        CartRepository
├── orders/
│   ├── ui/          OrdersFragment, OrdersViewModel, OrderAdapter,
│   │                OrderDetailActivity, OrderDetailViewModel,
│   │                OrderItemAdapter
│   └── data/        OrderRepository
├── notifications/
│   └── ui/          NotificationsFragment
├── profile/
│   └── ui/          ProfileFragment
├── admin/
│   ├── ui/          AdminActivity, AdminDashboardFragment,
│   │                AdminDashboardViewModel,
│   │                AdminOrdersFragment, AdminOrdersViewModel,
│   │                AdminOrderDetailActivity, AdminOrderDetailViewModel,
│   │                AdminProductsFragment, AdminProductsViewModel,
│   │                AdminProductAdapter,
│   │                AdminAddEditProductActivity,
│   │                AdminAddEditProductViewModel
│   └── data/        AdminRepository
├── model/           All data classes — single source of truth
│   │                Always read docs/data-models.md before writing
│   │                any model. Always use @SerializedName on every field.
│   Order, OrderItem, Cart, CartItem, Product,
│   Notification, AuthRequest, AuthResponse, CheckoutRequest,
│   UpdateOrderStatusRequest, RegisterRequest,
│   CartItemRequest, PagedResponse, MessageResponse
├── network/         ApiService, RetrofitClient, AuthInterceptor
└── util/            SessionManager

## Network Layer
Base URL (emulator):  http://10.0.2.2:8080/api/
Base URL (device):    http://<local-ip>:8080/api/
Auth:                 Bearer token from SessionManager
Interceptor:          AuthInterceptor adds Authorization header
                      BUG-5 pending: must also catch 401 → clear
                      session → redirect to LoginActivity
Client:               OkHttpClient with AuthInterceptor + logging

## Data Models — Verified Against Backend (2026-05-04)
Source of truth: docs/data-models.md
All models use @SerializedName. Field names MUST match backend JSON.
Read the backend *Response.java before writing any model.

Order          — orderId, orderDate, status, paymentStatus,
                 deliveryAddress?, contactNumber?, deliveryNotes?,
                 proofImageUrl?, cancellationReason?,
                 items: List<OrderItem>, totalAmount, itemCount?

OrderItem      — productName, quantity, unitPrice, subtotal
                 (flat fields — no nested Product object)

Cart           — cartId, items: List<CartItem>, totalAmount, itemCount

CartItem       — cartItemId, productId, productName, productImageUrl?,
                 unitPrice, quantity, subtotal
                 (flat fields — no nested Product object)

Product        — id, name, description?, price, imageUrl?,
                 category, available
                 (field is `id` not `productId` — backend sends `id`)

Notification   — id, orderId?, type, title, message, isRead, createdAt
                 (field is `id` not `notificationId`)

## UI State Pattern (apply to every ViewModel)
Every ViewModel exposes a sealed UiState:
  sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    object Empty : UiState<Nothing>()
    data class Error(val message: String) : UiState<Nothing>()
  }

Every Fragment/Activity observes all 4 states:
  Loading → show skeleton or ProgressBar
  Success → show content
  Empty   → show empty state with CTA button
  Error   → show message from API response + retry button

## Order Status State Machine
Never skip states. Never invent new status strings.
Valid status strings (plain strings, not enum):
  PENDING → CONFIRMED
  CONFIRMED | PAYMENT_CONFIRMED | ORDER_PLACED → PREPARING
  PREPARING → READY
  READY → DELIVERED
  Any state except DELIVERED / COMPLETED / CANCELLED → CANCELLED

Valid values: PENDING, CONFIRMED, PAYMENT_CONFIRMED, ORDER_PLACED,
              PREPARING, READY, DELIVERED, COMPLETED, CANCELLED

Status color mapping (set programmatically in adapters):
  PENDING, ORDER_PLACED  → R.color.statusOrderPlaced
  CONFIRMED, PREPARING   → R.color.statusPreparing
  READY, DELIVERED       → R.color.statusCompleted
  CANCELLED              → R.color.statusCancelled

## Active Bugs (do not introduce new instances)
BUG-3: FIXED (2026-05-04) — all model field names corrected
BUG-4: SessionManager must use EncryptedSharedPreferences
       (currently plain SharedPreferences — fix after GROUP 9)
BUG-5: AuthInterceptor must catch 401, clear session, redirect
       to LoginActivity (fix after GROUP 9)

## Current Implementation Progress
GROUP 1 Auth:              COMPLETE
GROUP 2 Shell + Home:      COMPLETE
GROUP 3 Cart + Checkout:   COMPLETE
GROUP 4 Orders:            COMPLETE (files exist — verify logic)
GROUP 5 Notifications:     COMPLETE (files exist — verify logic)
GROUP 6 Admin Shell:       COMPLETE (files exist — verify logic)
GROUP 7 Admin Orders:      COMPLETE (files exist — verify logic)
GROUP 8 Admin Products:    COMPLETE (files exist — verify logic)
GROUP 9 Informational:     NOT STARTED
  activity_care_guide.xml         — not created
  activity_about_faq.xml          — not created
  activity_payment_instructions.xml — not created

Missing (create before GROUP 9 UI work):
  docs/content/care-guide.md
  docs/content/about-faqs.md
  docs/content/payment-delivery-flow.md

Missing drawables (needed for order screens):
  bg_timeline_dot_complete
  bg_timeline_dot_active
  bg_timeline_dot_pending
  bg_button_success
  bg_button_danger_outlined
  bg_warning_banner

## Drawables Available (use these — never recreate)
bg_input, bg_input_default, bg_input_focused,
bg_input_error, bg_input_disabled,
bg_button_primary, bg_button_primary_selector,
bg_button_primary_pressed, bg_button_primary_disabled,
bg_button_outlined,
bg_card, bg_card_login, bg_card_top_rounded,
bg_chip_active, bg_chip_inactive,
bg_chip_selected, bg_chip_unselected,
bg_auth_header, bg_bottom_sheet,
bg_fulfillment_selected, bg_fulfillment_unselected,
bg_payment_selected, bg_payment_unselected,
bg_dashed_circle, bg_error_banner,
bg_skeleton_rect, bg_badge_dot,
bg_gradient_crimson, bg_divider,
bg_google_btn, bg_image_rounded,
bg_logo_gcash, bg_logo_maya,
bg_strength_track, bg_strength_weak, bg_strength_medium,
bg_strength_strong, bg_strength_empty,
bg_circle_white, bg_circle_white_alpha
