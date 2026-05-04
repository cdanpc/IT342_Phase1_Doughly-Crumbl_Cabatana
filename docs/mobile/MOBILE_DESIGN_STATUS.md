# Mobile Design Status Report — Doughly Crumbl
**Date:** 2026-04-30
**Platform:** Android (Kotlin + XML layouts)
**Audit status:** CLEAN — all 17 identified gaps resolved

---

## 1. Project Overview

**App:** Doughly Crumbl — a cookie ordering mobile app with a customer-facing side and a full admin management side.

**Package:** `com.example.mobile`
**Min SDK:** 24 | **Target SDK:** 34
**Architecture:** MVVM (ViewModel + Repository) with ViewBinding. No Jetpack Compose — pure XML layouts.
**Backend:** Spring Boot REST API at `http://10.0.2.2:8080/api/` (local emulator). JWT auth via `AuthInterceptor`.

---

## 2. Design System

### Color palette (`res/values/colors.xml`)

| Token | Hex | Role |
|---|---|---|
| `primary` | `#C8874E` | Toolbar bg, FAB, filled buttons, price text, active nav icon |
| `primary_dark` | `#A0693A` | Pressed states, status bar |
| `primary_light` | `#F5E6D3` | Chip highlights, selected states |
| `accent` | `#8B4513` | Secondary accents |
| `background` | `#FAFAFA` | Root screen background |
| `surface` | `#FFFFFF` | Cards, bottom nav, bottom sheet backgrounds |
| `on_primary` | `#FFFFFF` | Text/icons on primary-colored surfaces |
| `text_primary` | `#1A1A1A` | All body/title text |
| `text_secondary` | `#757575` | Subtitles, captions, metadata |
| `error` | `#D32F2F` | Error messages, delete icon tint |
| `success` | `#388E3C` | Success feedback |
| `warning` | `#FFA726` | Warning states |
| `info` | `#42A5F5` | Edit icon tint, informational |
| `divider` | `#E0E0E0` | Separator `<View>` elements, card borders |
| `status_pending` | `#FFA726` | PENDING order chip/badge |
| `status_active` | `#42A5F5` | CONFIRMED / PREPARING chip/badge |
| `status_done` | `#66BB6A` | READY / DELIVERED chip/badge |
| `status_cancelled` | `#EF5350` | CANCELLED chip/badge |

### Typography conventions
| Role | Size | Style | Color |
|---|---|---|---|
| Screen/card title | 15–20sp | bold | `text_primary` |
| Body / label | 13–15sp | normal | `text_primary` |
| Caption / metadata | 12–13sp | normal | `text_secondary` |
| Price | 13–16sp | **bold** | `primary` |
| Grand Total | 16sp | **bold** | `primary` |
| Status chip text | 11–12sp | normal | `on_primary` |

### Spacing
- Screen edge padding: `16dp`
- Card internal padding: `12–16dp`
- Item card margin: `4–8dp` vertical, `8dp` horizontal
- Section gaps: `12–20dp`
- Minimum touch target: **48dp × 48dp** (enforced on all interactive elements)

### Component rules
- All text inputs: `TextInputLayout` with `OutlinedBox` style + `app:errorEnabled="true"`
- All cards: `MaterialCardView` with `cardCornerRadius ≥ 10dp`, `cardElevation ≥ 2dp`
- All list screens: `SwipeRefreshLayout` wrapping a `FrameLayout` with `RecyclerView` + `tvEmpty` + `ProgressBar`
- All images: `Glide` with `.placeholder(android.R.drawable.ic_menu_gallery).centerCrop()`
- All lists: `ListAdapter<T, VH>` + `DiffUtil.ItemCallback` (no `notifyDataSetChanged()`)
- Status order color mapping (chips and dashboard cards): pending=`status_pending`, confirmed/preparing=`status_active`, ready/delivered=`status_done`, cancelled=`status_cancelled`

### Theme
`Theme.DoughlyCrumbl` extends `Theme.MaterialComponents.DayNight.NoActionBar`. Four `StatusChip.*` styles defined (Pending, Active, Done, Cancelled).

---

## 3. Screen Inventory

### Customer flow (host: `MainActivity` with `BottomNavigationView`)

| Screen | File(s) | Layout file | Status |
|---|---|---|---|
| Splash / router | `SplashActivity.kt` | *(no layout — immediate redirect)* | ✅ Complete |
| Login | `LoginActivity.kt` + `LoginViewModel.kt` | `activity_login.xml` | ✅ Complete |
| Register | `RegisterActivity.kt` + `RegisterViewModel.kt` | `activity_register.xml` | ✅ Complete |
| Home (product grid) | `HomeFragment.kt` + `HomeViewModel.kt` + `ProductAdapter.kt` | `fragment_home.xml` + `item_product.xml` | ✅ Complete |
| Cart | `CartFragment.kt` + `CartViewModel.kt` + `CartItemAdapter.kt` | `fragment_cart.xml` + `item_cart.xml` | ✅ Complete |
| Orders list | `OrdersFragment.kt` + `OrdersViewModel.kt` + `OrderAdapter.kt` | `fragment_orders.xml` + `item_order.xml` | ✅ Complete |
| Order detail | `OrderDetailActivity.kt` + `OrderDetailViewModel.kt` + `OrderItemAdapter.kt` | `activity_order_detail.xml` + `item_order_item.xml` | ✅ Complete |
| Profile | `ProfileFragment.kt` | `fragment_profile.xml` | ✅ Complete |

### Admin flow (host: `AdminActivity` with `BottomNavigationView`)

| Screen | File(s) | Layout file | Status |
|---|---|---|---|
| Admin shell | `AdminActivity.kt` | `activity_admin.xml` | ✅ Complete |
| Dashboard | `AdminDashboardFragment.kt` + `AdminDashboardViewModel.kt` | `fragment_admin_dashboard.xml` | ✅ Complete |
| Products list | `AdminProductsFragment.kt` + `AdminProductsViewModel.kt` + `AdminProductAdapter.kt` | `fragment_admin_products.xml` + `item_admin_product.xml` | ✅ Complete |
| Add / Edit product | `AdminAddEditProductActivity.kt` + `AdminAddEditProductViewModel.kt` | `activity_admin_add_edit_product.xml` | ✅ Complete |
| Orders list (with filter) | `AdminOrdersFragment.kt` + `AdminOrdersViewModel.kt` | `fragment_admin_orders.xml` | ✅ Complete |
| Order detail + status | `AdminOrderDetailActivity.kt` + `AdminOrderDetailViewModel.kt` | `activity_admin_order_detail.xml` | ✅ Complete |

**Total:** 19 XML layouts, 57 Kotlin files (ViewModels, Repositories, Adapters, Activities, Fragments, Models, Network)

---

## 4. Key UX Patterns Implemented

### Role-based routing
`SplashActivity` → checks `SessionManager.isLoggedIn()` and `isAdmin()`:
- Not logged in → `LoginActivity`
- Logged in + admin → `AdminActivity`
- Logged in + customer → `MainActivity`

### Order status state machine (`OrderStatusHelper`)
```
PENDING → CONFIRMED | CANCELLED
CONFIRMED → PREPARING | CANCELLED
PREPARING → READY | CANCELLED
READY → DELIVERED
DELIVERED | CANCELLED → (terminal)
```
Admin order detail screen dynamically renders one `MaterialButton` per allowed transition. Buttons are programmatically created and cleared on each order load.

### Admin dashboard stats
No dedicated backend stats endpoint exists. Stats are derived client-side from `GET /admin/orders` by grouping all orders by status. Four colored stat cards shown (Pending, Confirmed, Preparing, Ready).

### Admin product image upload
Two paths: (1) gallery picker via `ActivityResultLauncher<String>` → multipart upload to `/api/admin/products/{id}/image`; (2) manual URL paste into `etImageUrl`. Preview shown via Glide in `ivPreview`.

### Cart → order flow
On successful `placeOrder()`, `CartFragment` navigates to the Orders tab via `BottomNavigationView.selectedItemId = R.id.nav_orders`.

### Delivery fee quoting (admin)
Admin enters a fee in `etDeliveryFee` on `AdminOrderDetailActivity` → `btnQuoteFee` calls `PATCH /admin/orders/{id}/delivery-fee`. Customer sees the quoted fee and grand total on their `OrderDetailActivity`.

---

## 5. Design Audit Results (completed 2026-04-30)

**Tool used:** `/android-ui` (custom project skill)
**Files scanned:** 19 layouts + 17 Kotlin UI files = 36 total
**Gaps found:** 17
**Gaps resolved:** 17 / 17 (100%)

### What was fixed

| Category | Gaps | All fixed? |
|---|---|---|
| Forms — `app:errorEnabled="true"` on TextInputLayouts | 10 fields across 3 screens | ✅ Yes |
| Accessibility — missing `contentDescription` on ImageViews | 4 images | ✅ Yes |
| Accessibility — touch targets below 48dp | 4 buttons | ✅ Yes |
| Brand — price text not bold in cart item | 1 | ✅ Yes |
| Brand — "Preparing" dashboard card wrong color | 1 | ✅ Yes |
| Loading state — swipeRefresh reset too early | 1 (AdminDashboardFragment) | ✅ Yes |

### Current design health: ALL GREEN

Every screen passes:
- ✅ Brand compliance (color tokens, no hardcoded hex, bold prices)
- ✅ Material Design 3 (TextInputLayout OutlinedBox, MaterialCardView, Chip, FAB, BottomNavigationView)
- ✅ Accessibility (contentDescription on all images, 48dp touch targets on all interactive elements)
- ✅ Layout performance (nestedScrollingEnabled=false, fixed image dimensions, no double ScrollView)
- ✅ Loading & empty states (ProgressBar + tvEmpty on every list screen, SwipeRefreshLayout on all data screens)
- ✅ Forms (errorEnabled, correct inputType per field, submit buttons disabled during load)
- ✅ Kotlin code quality (LinearLayoutManager set before adapter, ListAdapter throughout, Glide placeholder on all loads, _binding = null in onDestroyView, isRefreshing reset in both success and error observers)

---

## 6. Known Limitations / Out of Scope

These are architectural or backend constraints — not design gaps:

| Item | Detail |
|---|---|
| No dedicated stats endpoint | Admin dashboard stats computed client-side from all orders |
| No push notifications | Backend has a notification system but mobile does not subscribe to WebSocket |
| No pagination UI | Home screen fetches products with `page=0&size=50`; no infinite scroll or page controls |
| No offline support | All data fetched live; no local caching |
| Delivery fee is admin-set | Customers cannot enter a delivery fee; they see it after admin quotes it |
| Image upload requires existing product | Product must be created first, then image uploaded; URL paste is the alternative for new products |
| `CartItemRequest` sends `productId=0` on update | Backend `updateCartItem` endpoint likely uses path `itemId` only; this is a known backend contract assumption to verify |

---

## 7. File Structure Reference

```
mobile/app/src/main/
├── java/com/example/mobile/
│   ├── auth/
│   │   ├── data/AuthRepository.kt
│   │   └── ui/  LoginActivity, LoginViewModel, RegisterActivity, RegisterViewModel, SplashActivity
│   ├── home/
│   │   ├── data/ProductRepository.kt
│   │   └── ui/  HomeFragment, HomeViewModel, ProductAdapter
│   ├── cart/
│   │   ├── data/CartRepository.kt
│   │   └── ui/  CartFragment, CartViewModel, CartItemAdapter
│   ├── orders/
│   │   ├── data/OrderRepository.kt
│   │   └── ui/  OrdersFragment, OrdersViewModel, OrderAdapter,
│   │             OrderDetailActivity, OrderDetailViewModel, OrderItemAdapter
│   ├── profile/
│   │   └── ui/  ProfileFragment
│   ├── admin/
│   │   ├── data/AdminRepository.kt
│   │   └── ui/  AdminActivity, AdminDashboardFragment, AdminDashboardViewModel,
│   │             AdminProductsFragment, AdminProductsViewModel, AdminProductAdapter,
│   │             AdminAddEditProductActivity, AdminAddEditProductViewModel,
│   │             AdminOrdersFragment, AdminOrdersViewModel,
│   │             AdminOrderDetailActivity, AdminOrderDetailViewModel,
│   │             OrderStatusHelper (object, in AdminOrderDetailViewModel.kt)
│   ├── model/   AuthRequest, AuthResponse, RegisterRequest, Product, ProductRequest,
│   │             PagedResponse, Cart, CartItem, CartItemRequest,
│   │             Order, OrderItem, UpdateOrderStatusRequest, MessageResponse
│   ├── network/ ApiService, RetrofitClient, AuthInterceptor
│   ├── util/    SessionManager
│   └── MainActivity.kt
└── res/
    ├── layout/  19 XML files (see Screen Inventory above)
    ├── values/  colors.xml, strings.xml, themes.xml
    └── menu/    customer_nav_menu.xml, admin_nav_menu.xml
```

---

## 8. What the Next Agent Should Know

- **Do not modify themes.xml or colors.xml** — the design system is finalized and all screens reference these tokens correctly.
- **All forms already have `app:errorEnabled="true"`** — setting `.error` on any `TextInputLayout` will work correctly.
- **All RecyclerViews already have a LayoutManager set** — no "No layout manager attached" crash risk.
- **Glide is the image loading library** — all image loads use `.placeholder()` and `.centerCrop()`.
- **No Jetpack Compose** — the project is 100% XML + ViewBinding. Do not introduce Compose.
- **Package is `com.example.mobile`**, not `com.example.doughlycrumbl` or any other variant.
- **Base URL** is `http://10.0.2.2:8080/api/` — this is the Android emulator loopback for localhost.
- **Admin detection** is via `SessionManager.isAdmin()` which checks `role == "ADMIN"`.
- **Status color mapping is app-wide:** PENDING=`status_pending`, CONFIRMED/PREPARING=`status_active`, READY/DELIVERED=`status_done`, CANCELLED=`status_cancelled`. This is enforced in `OrderAdapter`, `AdminOrderDetailActivity`, and `AdminDashboardFragment`.
