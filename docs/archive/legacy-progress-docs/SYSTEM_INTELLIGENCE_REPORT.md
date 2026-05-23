# SYSTEM INTELLIGENCE REPORT — Doughly Crumbl
> Generated: 2026-05-01. Based on live codebase inspection. Docs are cited where they agree; code always wins on discrepancies.

---

## 1. System Overview

Doughly Crumbl is an artisan cookie bakery ordering system for a physical store located at Don Gil Garcia St., Capitol Site, Cebu City. Customers browse the menu, place orders, and track delivery or pickup status. Admins manage products, review incoming orders, quote delivery fees, and confirm payments through a manual proof-of-payment workflow.

**Users and roles:**

| Role | Capabilities |
|---|---|
| CUSTOMER | Browse products (public), add to cart, checkout (delivery or pickup), view own orders, submit proof of payment, cancel own order before PREPARING |
| ADMIN | All customer capabilities plus: full product CRUD, view all orders, quote delivery fees, update order status through the state machine, view proof-of-payment images |

**Deployment state:** Development only. Backend runs at `localhost:8080`; web at `localhost:5173` (Vite dev server); mobile uses `10.0.2.2:8080` (Android emulator localhost alias). No production deployment configuration exists. Database is Supabase-hosted PostgreSQL with Hibernate `ddl-auto=update`.

---

## 2. Authentication & Authorization

### Login and Registration

Both web and mobile use JWT-based authentication. No OAuth2 is wired up in the running code (an `AppOAuth2Properties` config class exists but is unused).

- `POST /api/auth/register` — `AuthController` accepts `RegisterRequest` (name, email, password, confirmPassword, address, phoneNumber). `AuthService` checks password match, checks email uniqueness, BCrypt-encodes password, sets `role = "CUSTOMER"` and `provider = "LOCAL"`, saves to `users` table, returns `AuthResponse` (JWT token, userId, name, email, role).
- `POST /api/auth/login` — `AuthService` checks email existence first (returns `BadRequestException` with specific message), then uses `AuthenticationManager` with `DaoAuthenticationProvider`. Returns same `AuthResponse` shape.
- Logout is client-side only: web clears `localStorage('auth')`; mobile calls `SessionManager.clearSession()` which clears `SharedPreferences`.

### Role Assignment and Enforcement

- Role is a plain `String` field on the `User` entity (`"CUSTOMER"` or `"ADMIN"`). No enum.
- `SecurityConfig` enforces `/api/admin/**` requires `hasRole('ADMIN')`. All other authenticated routes use `@AuthenticationPrincipal`.
- `AdminController` has a class-level `@PreAuthorize("hasRole('ADMIN')")` as a second enforcement layer.
- `JwtTokenProvider` embeds `userId`, `email`, `role` as claims. `JwtAuthFilter` reconstructs `CustomUserDetails` from the token and sets the `SecurityContext`.

### Token Storage

| Client | Storage | Expiry handling |
|---|---|---|
| Web | `localStorage` key `"auth"` (JSON: token, userId, name, email, role) | Axios interceptor catches 401, removes `localStorage('auth')`, redirects to `/login` |
| Mobile | `SharedPreferences` (plain, not EncryptedSharedPreferences — [GAP] docs say EncryptedSharedPreferences but code uses plain) key `"doughly_session"` | No 401 auto-redirect logic visible in mobile code |

### Protected Routes / Screens

**Web:** `ProtectedRoute` wraps customer routes; `ProtectedRoute requireAdmin` wraps admin routes. `GuestRoute` wraps login/register (redirects authenticated users away). Routes are defined in `AppRouter.tsx`.

**Mobile:** `SplashActivity` reads `SessionManager.isLoggedIn()` on launch, routes to `LoginActivity` or `MainActivity` (customer) or `AdminActivity` (admin). No per-screen auth guard beyond the splash gate.

---

## 3. Feature Inventory

### User Registration
- **Status:** COMPLETE
- **Backend:** `POST /api/auth/register` — `AuthController` → `AuthService`
- **Web:** `RegisterPage.tsx` — full form with name, email, address, phoneNumber, password, confirmPassword
- **Mobile:** `RegisterActivity.kt` + `RegisterViewModel.kt`
- **Gaps:** None critical.

### User Login / Logout
- **Status:** COMPLETE
- **Backend:** `POST /api/auth/login` — `AuthController` → `AuthService`
- **Web:** `LoginPage.tsx` with role-based redirect (ADMIN → `/admin`, CUSTOMER → `/menu`)
- **Mobile:** `LoginActivity.kt` → `LoginViewModel.kt`, same redirect logic
- **Gaps:** No refresh token; JWTs expire without renewal path.

### Product Listing (Search / Filter / Pagination)
- **Status:** COMPLETE (backend + web); PARTIAL (mobile — search works, no category filter UI)
- **Backend:** `GET /api/products?search=&category=&page=&size=` — `ProductController` → `ProductService.getAllAvailableProducts()` → `ProductRepository.findAllAvailable()` (JPQL)
- **Web:** `MenuPage.tsx` — search bar, category filter dropdown, paginated product grid with skeleton loading
- **Mobile:** `HomeFragment.kt` + `HomeViewModel.kt` — SearchView triggers `loadProducts(query)`, but no category filter UI
- **Gaps:** Mobile lacks category filter. `ProductService.getAllAvailableProducts` does not thread through the `search` param — it calls `productRepository.findAllAvailable(category, pageable)` without the `search` parameter [MISMATCH vs docs: search filtering not wired into the repository call in backend].

### Product Detail Page
- **Status:** NOT STARTED (web); EXISTS (mobile as list item tap shows detail)
- **Backend:** `GET /api/products/{id}` — implemented
- **Web:** [GAP] No `ProductDetailPage.tsx`. Confirmed decision to skip; add-to-cart is from card grid directly. tasks.md marks this as `[ ]` (unchecked).
- **Mobile:** `OrderDetailActivity.kt` handles order detail (not product detail). No dedicated product detail screen.

### Cart (Add / Update / Remove / View)
- **Status:** COMPLETE (backend + web); PARTIAL (mobile — functional but placeOrder uses wrong API shape)
- **Backend:** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart` — all in `CartController` → `CartService`
- **Web:** `CartContext.tsx` manages global cart state; `OrderPanel.tsx` renders cart items with +/- controls and trash icon
- **Mobile:** `CartFragment.kt` + `CartViewModel.kt` + `CartRepository.kt` — functional cart display with qty controls and remove
- **Gaps:** Mobile `CartViewModel.placeOrder()` calls `repository.placeOrder()` → `ApiService.placeOrder()` which is `POST orders` with no body. Backend `POST /api/orders` requires a `CheckoutRequest` body. [MISMATCH] Mobile checkout is broken — it will hit a 400 or fail deserialisation.

### Checkout
- **Status:** COMPLETE (web — full modal with fulfillment toggle, address, payment method selection); NOT STARTED (mobile — no checkout screen beyond the broken placeOrder call from CartFragment)
- **Backend:** `POST /api/orders` — `OrderController.placeOrder()` → `OrderService.placeOrder()` → `OrderFactory.createOrderFromCart()`
- **Web:** `CheckoutModal.tsx` — fulfillment toggle (PICKUP/DELIVERY), address fields (street, barangay, city, landmark), phone number, payment method selector (GCash, Maya, Bank Transfer, Cash on Pickup), order notes, confirmation sub-modal
- **Mobile:** [GAP] No `CheckoutActivity` or checkout screen. Mobile sends `POST /api/orders` with empty body.

### Delivery Fee Calculation
- **Status:** PARTIAL — `DeliveryFeeCalculator.java` exists (4 zones: ≤3km=₱80, ≤8km=₱120, ≤15km=₱160, >15km=₱200) but is [NOT WIRED] into any controller or service. Admin manually quotes a fee via `PUT /api/admin/orders/{id}/delivery-fee`.
- **Backend:** Manual quote endpoint: `AdminController.quoteDeliveryFee()` → `OrderService.quoteDeliveryFee()`
- **Web:** Checkout modal shows "To be quoted" placeholder for delivery fee. `AdminOrderDetail.tsx` renders a delivery fee input field and quote button.
- **Gaps:** `DeliveryFeeCalculator` is a standalone `@Component` that is never injected. OpenStreetMap geocoding is not implemented. [MISMATCH vs MASTER.md] MASTER.md describes tiered pricing (0–3km=₱50, 3–6km=₱80, 6–10km=₱120) but the code has different tiers (≤3km=₱80, ≤8km=₱120, ≤15km=₱160, >15km=₱200) and neither matches docs exactly.

### Payment (Proof Upload)
- **Status:** COMPLETE (backend + web); NOT STARTED (mobile)
- **Backend:** `PUT /api/orders/{id}/submit-payment` (`OrderController`) — accepts optional `MultipartFile proof`, saves via `FileUploadService` (local disk, UUID filename, 5MB limit, JPEG/PNG/WebP/GIF). `FileController` serves files at `GET /api/uploads/{filename}`.
- **Web:** `PaymentInstructionsPage.tsx` — shows QR codes, account details, `ProofUploadForm.tsx` component for image upload; `handleSubmitWithProof()` calls `submitPayment(orderId, file)`.
- **Mobile:** [GAP] No payment instructions screen or proof upload UI.
- **PayMongo:** [NOT STARTED] `AppPayMongoProperties` config class exists (`app.paymongo.secret-key`, `app.paymongo.public-key`), but no `PaymentController`, no `PayMongoClient`, no actual API calls.

### Order Placement
- **Status:** COMPLETE (web); BROKEN (mobile — sends empty body to API)
- **Backend:** `OrderFactory.createOrderFromCart()` determines initial status: if `deliveryNotes` contains `"Fulfillment: PICKUP"` → `ORDER_PLACED`; otherwise → `AWAITING_DELIVERY_QUOTE`
- **Web:** After successful place: clears cart, closes modal, navigates to `/order-success` with order data in router state

### Order Listing (Customer)
- **Status:** COMPLETE (backend + web + mobile)
- **Backend:** `GET /api/orders/my-orders` → `OrderService.getMyOrders()`, returns summary DTOs
- **Web:** `OrdersPage.tsx` — list of orders with status badges
- **Mobile:** `OrdersFragment.kt` + `OrdersViewModel.kt` — RecyclerView with `OrderAdapter`, tap navigates to `OrderDetailActivity`
- **Gaps:** Mobile `ApiService.getOrders()` calls `GET /api/orders` but the backend endpoint is `GET /api/orders/my-orders` [MISMATCH]. This will return 404 or wrong data on mobile.

### Order Detail (Customer)
- **Status:** COMPLETE (web); PARTIAL (mobile — displays but uses wrong API path and Order model missing several fields)
- **Backend:** `GET /api/orders/{id}` with ownership check
- **Web:** `OrderDetailPage.tsx` — full breakdown with items, delivery info, proof image display, status badge
- **Mobile:** `OrderDetailActivity.kt` — displays status, items, subtotal, delivery fee, grand total. `Order.kt` model has `id`, `status`, `totalAmount`, `deliveryFee`, `createdAt`, `items`, `customerName`, `customerEmail`. Missing: `paymentStatus`, `deliveryAddress`, `contactNumber`, `deliveryNotes`, `proofImageUrl`, `cancellationReason`.

### Order Status Timeline
- **Status:** COMPLETE (web — `StatusTimeline.tsx`); PARTIAL (mobile — chip shows status string, no visual timeline)
- **Web:** `StatusTimeline.tsx` shared component renders all status stages visually. `OrderDetailPage.tsx` and `AdminOrderDetail.tsx` both use it.
- **Mobile:** Status shown as a chip with colour coding only.

### Notifications (In-App / WebSocket)
- **Status:** COMPLETE (backend); COMPLETE (web); NOT STARTED (mobile)
- **Backend:** `NotificationController` (`GET /api/notifications`, `GET /api/notifications/unread-count`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`). `NotificationService` persists to DB and pushes via STOMP WebSocket to `/topic/notifications/{userId}`. `WebSocketNotificationObserver` implements `OrderObserver` and triggers on all order events.
- **Web:** `NotificationContext.tsx` — STOMP client connects to `ws://localhost:8080/ws/websocket`, subscribes to `/topic/notifications/{userId}`, maintains list and unread count. `NotificationDropdown.tsx` renders the bell icon UI.
- **Mobile:** [GAP] No WebSocket client, no notification screen, no badge. Mobile API service has no notification endpoints.

### Admin Product Management
- **Status:** COMPLETE (backend + web + mobile)
- **Backend:** `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/{id}`, `POST /api/admin/products/upload-image` — all in `AdminController`
- **Web:** `AdminProducts.tsx` — table with search, Add/Edit modal, delete with confirmation, image upload
- **Mobile:** `AdminProductsFragment.kt` + `AdminProductsViewModel.kt` + `AdminProductAdapter.kt` + `AdminAddEditProductActivity.kt` — full CRUD with image upload

### Admin Order Management
- **Status:** COMPLETE (backend); COMPLETE (web); PARTIAL (mobile — lists orders, has detail, lacks some new-flow status support)
- **Backend:** `GET /api/admin/orders`, `GET /api/admin/orders/{id}`, `PUT /api/admin/orders/{id}/status`, `PUT /api/admin/orders/{id}/delivery-fee`
- **Web:** `AdminOrders.tsx` — table with status filter pills, pagination. `AdminOrderDetail.tsx` — full status timeline, move-to-next-status button, cancel modal with reason, delivery fee input, proof image viewer.
- **Mobile:** `AdminOrdersFragment.kt` + `AdminOrderDetailActivity.kt` — lists orders, shows detail, has delivery fee quote button, has dynamic status transition buttons via `OrderStatusHelper.allowedTransitions()`. Mobile status color coding still uses legacy status names only (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`).

### User Profile
- **Status:** PARTIAL — displays name/email/role and logout; no edit functionality
- **Web:** Profile data shown in Sidebar header. No dedicated ProfilePage.
- **Mobile:** `ProfileFragment.kt` — shows name, email, role, logout button.

### Care Guide Page
- **Status:** COMPLETE (web — `CareGuidePage.tsx` exists and is routed at `/care-guide`); NOT STARTED (mobile)

### About / FAQ Page
- **Status:** COMPLETE (web — `AboutPage.tsx` exists and is routed at `/about`); NOT STARTED (mobile)

---

## 4. Data Models

### User (`users` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| name | String(100) | required |
| email | String(150) | unique, required |
| password | String | BCrypt-encoded |
| address | String(255) | optional |
| phoneNumber | String(20) | optional |
| provider | String(30) | "LOCAL" (OAuth2 `@Component` exists but unused) |
| providerId | String(255) | nullable, for OAuth2 |
| role | String(20) | "CUSTOMER" or "ADMIN" — plain String, no enum |
| createdAt | LocalDateTime | auto-set |

### Product (`products` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| name | String(150) | required |
| description | TEXT | optional |
| price | BigDecimal(10,2) | required |
| imageUrl | String(500) | optional |
| category | String(50) | e.g. "CLASSIC", "SPECIALTY", "SEASONAL", "BEST_SELLERS" — plain String, no enum |
| available | Boolean | default true |
| createdAt / updatedAt | LocalDateTime | auto-set |

### Cart (`carts` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| user | User (OneToOne, FK) | unique per user |
| items | List\<CartItem\> (OneToMany) | cascade ALL, orphanRemoval |
| createdAt | LocalDateTime | auto-set |

### CartItem (`cart_items` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| cart | Cart (ManyToOne) | |
| product | Product (ManyToOne) | |
| quantity | Integer | |
| (unique constraint) | cart_id + product_id | enforced via repository |

### Order (`orders` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| user | User (ManyToOne) | |
| status | String(60) | default "PENDING"; see state machine section |
| paymentStatus | String(30) | default "UNPAID"; values: UNPAID, SUBMITTED, PAID, CANCELLED |
| deliveryAddress | TEXT | required |
| contactNumber | String(20) | required |
| deliveryNotes | TEXT | optional; encodes fulfillment method and payment method |
| proofImageUrl | String(500) | nullable; path to uploaded proof image |
| cancellationReason | TEXT | nullable |
| totalAmount | BigDecimal(10,2) | required |
| items | List\<OrderItem\> (OneToMany) | cascade ALL, orphanRemoval |
| orderDate | LocalDateTime | auto-set (creation) |
| updatedAt | LocalDateTime | auto-set (update) |

**Note:** `deliveryFee` is NOT a separate column. The total with delivery fee is folded into `totalAmount` when admin quotes the fee via `quoteDeliveryFee()`.

### OrderItem (`order_items` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| order | Order (ManyToOne) | |
| product | Product (ManyToOne, nullable) | product snapshot — product can be deleted |
| productName | String(150) | snapshot at order time |
| unitPrice | BigDecimal(10,2) | snapshot at order time |
| quantity | Integer | |
| subtotal | BigDecimal(10,2) | |

### Notification (`notifications` table)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK, auto) | |
| user | User (ManyToOne) | recipient |
| orderId | Long | nullable |
| type | String(50) | e.g. ORDER_PLACED, STATUS_CHANGED, ORDER_CANCELLED, NEW_ORDER, PAYMENT_SUBMITTED |
| title | String(150) | |
| message | TEXT | |
| read (is_read) | Boolean | default false |
| createdAt | LocalDateTime | auto-set |

---

## 5. API Endpoints

### Auth Endpoints (no auth required)
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| POST | `/api/auth/register` | `AuthController` | Public | Returns 201 + `AuthResponse` |
| POST | `/api/auth/login` | `AuthController` | Public | Returns 200 + `AuthResponse` |

### Product Endpoints
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/products` | `ProductController` | Public | Params: search, category, page, size. Returns paginated map |
| GET | `/api/products/{id}` | `ProductController` | Public | Returns `ProductResponse` |

### Cart Endpoints (authenticated)
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/cart` | `CartController` | Any auth | Returns `CartResponse` |
| POST | `/api/cart/items` | `CartController` | Any auth | Body: `AddToCartRequest`. Returns 201 + `CartResponse` |
| PUT | `/api/cart/items/{cartItemId}` | `CartController` | Any auth | Body: `UpdateCartItemRequest`. Returns updated `CartResponse` |
| DELETE | `/api/cart/items/{cartItemId}` | `CartController` | Any auth | Returns updated `CartResponse` |
| DELETE | `/api/cart` | `CartController` | Any auth | Returns 204 |

### Order Endpoints (authenticated)
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| POST | `/api/orders` | `OrderController` | Any auth | Body: `CheckoutRequest`. Returns 201 + `OrderResponse` |
| GET | `/api/orders/my-orders` | `OrderController` | Any auth | Returns list of summary `OrderResponse` |
| GET | `/api/orders/{id}` | `OrderController` | Any auth | Ownership enforced. Returns full `OrderResponse` |
| PUT | `/api/orders/{id}/cancel` | `OrderController` | Any auth | Param: `reason` (optional). Customer self-cancel |
| PUT | `/api/orders/{id}/submit-payment` | `OrderController` | Any auth | Param: `proof` (MultipartFile, optional). Advances to `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION` |

### Notification Endpoints (authenticated)
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/notifications` | `NotificationController` | Any auth | Returns list of `NotificationResponse` |
| GET | `/api/notifications/unread-count` | `NotificationController` | Any auth | Returns `{"count": N}` |
| PUT | `/api/notifications/{id}/read` | `NotificationController` | Any auth | Returns 204 |
| PUT | `/api/notifications/read-all` | `NotificationController` | Any auth | Returns 204 |

### Admin Endpoints (ADMIN role required)
| Method | Path | Controller | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/admin/products` | `AdminController` | ADMIN | Params: page, size. Returns paginated map |
| POST | `/api/admin/products` | `AdminController` | ADMIN | Body: `ProductRequest`. Returns 201 |
| PUT | `/api/admin/products/{id}` | `AdminController` | ADMIN | Body: `ProductRequest`. Returns updated product |
| DELETE | `/api/admin/products/{id}` | `AdminController` | ADMIN | Returns 204 |
| POST | `/api/admin/products/upload-image` | `AdminController` | ADMIN | Param: `file` (MultipartFile). Returns `{"url": "..."}` |
| GET | `/api/admin/orders` | `AdminController` | ADMIN | Params: status, page, size |
| GET | `/api/admin/orders/{id}` | `AdminController` | ADMIN | Returns full `OrderResponse` |
| PUT | `/api/admin/orders/{id}/status` | `AdminController` | ADMIN | Body: `UpdateOrderStatusRequest` (status, optional reason) |
| PUT | `/api/admin/orders/{id}/delivery-fee` | `AdminController` | ADMIN | Param: `fee` (BigDecimal). Adds to totalAmount, sets `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED` |

### File Serving
| Method | Path | Notes |
|---|---|---|
| GET | `/api/uploads/{filename}` | `FileController` serves uploaded images. Public (permitted in SecurityConfig) |

### WebSocket
- Endpoint: `/ws` (SockJS) / `/ws/websocket` (native WS)
- Subscribe: `/topic/notifications/{userId}` — receives `NotificationResponse` payloads
- App prefix: `/app` (not currently used for any send paths)

---

## 6. Navigation & Screen Flows

### Web Routes (from `AppRouter.tsx` and `routes.ts`)

| Route | Component | Access | Notes |
|---|---|---|---|
| `/` | `LandingPage` | Guest only | Crimson hero, "Order Now" + "Meet Cookie" CTAs |
| `/login` | `LoginPage` | Guest only | Role-based redirect on success |
| `/register` | `RegisterPage` | Guest only | |
| `/menu` | `MenuPage` (AppLayout) | Auth required | Product grid with search/filter |
| `/orders` | `OrdersPage` (AppLayout) | Auth required | Order history |
| `/orders/:id` | `OrderDetailPage` (AppLayout) | Auth required | Full order detail + status timeline |
| `/orders/:id/payment` | `PaymentInstructionsPage` (AppLayout) | Auth required | QR codes, proof upload |
| `/order-success` | `OrderConfirmationPage` (AppLayout) | Auth required | Success state with order data from router state |
| `/care-guide` | `CareGuidePage` (AppLayout) | Auth required | Static content |
| `/about` | `AboutPage` (AppLayout) | Auth required | Static content |
| `/admin` | `AdminDashboard` (AppLayout) | ADMIN required | Stats + quick links |
| `/admin/products` | `AdminProducts` (AppLayout) | ADMIN required | Product CRUD table |
| `/admin/orders` | `AdminOrders` (AppLayout) | ADMIN required | Order table with status filter |
| `/admin/orders/:id` | `AdminOrderDetail` (AppLayout) | ADMIN required | Status management, delivery fee, proof image |

**Customer journey:** Landing → Login/Register → Menu → (add items) → OrderPanel sidebar → CheckoutModal → PaymentInstructionsPage → OrdersPage

**Admin journey:** Login → AdminDashboard → AdminProducts or AdminOrders → AdminOrderDetail (quote fee, update status, view proof)

### Mobile Navigation (Activity / Fragment based)

**Entry:** `SplashActivity` → checks `SessionManager.isLoggedIn()` and `isAdmin()`

**Customer flow:**
- `LoginActivity` → `MainActivity` (bottom nav host)
  - `HomeFragment` — product grid with search, add-to-cart
  - `CartFragment` — cart items with qty controls, "Place Order" button
  - `OrdersFragment` → `OrderDetailActivity`
  - `ProfileFragment` — name/email/role display, logout

**Admin flow:**
- `LoginActivity` → `AdminActivity` (bottom nav host)
  - `AdminDashboardFragment`
  - `AdminProductsFragment` → `AdminAddEditProductActivity`
  - `AdminOrdersFragment` → `AdminOrderDetailActivity` (with delivery fee input, status transition buttons)

**From `RegisterActivity`:** Accessible from `LoginActivity` via "Register" link

**Bottom nav menus:**
- Customer: Home, Cart, Orders, Profile (`customer_nav_menu.xml`)
- Admin: Dashboard, Products, Orders (`admin_nav_menu.xml`)

---

## 7. State Management

### Web

| Context | File | State Managed | Persistence |
|---|---|---|---|
| `AuthContext` | `shared/hooks/AuthContext.tsx` | `user` (AuthUser), `isLoading`, `isAuthenticated`, `isAdmin` | `localStorage('auth')` — JSON blob |
| `CartContext` | `shared/hooks/CartContext.tsx` | `cart` (Cart), `isLoading`, `isOrderPanelOpen`, `isCheckoutOpen`, item count | Server-side via API calls; local state synced after each mutation |
| `NotificationContext` | `shared/hooks/NotificationContext.tsx` | `notifications[]`, `unreadCount`, STOMP client ref | In-memory + server on load; real-time via WebSocket |

**Auth persistence:** Full `AuthUser` blob stored in `localStorage`. Token extracted in `axiosInstance.ts` request interceptor on every API call. On 401, token is cleared and user is redirected to `/login`.

**Cart persistence:** Cart state is NOT stored in localStorage. On app mount, `CartContext` calls `fetchCart()` from the API when `isAuthenticated` is true. This means cart is always server-sourced.

### Mobile

| Feature | ViewModel | LiveData / State |
|---|---|---|
| Auth | `LoginViewModel`, `RegisterViewModel` | `authResponse`, `isLoading`, `error` |
| Home/Products | `HomeViewModel` | `products`, `isLoading`, `error` |
| Cart | `CartViewModel` | `cart`, `isLoading`, `error`, `orderPlaced` |
| Orders | `OrdersViewModel` | `orders`, `isLoading`, `error` |
| Order Detail | `OrderDetailViewModel` | `order`, `isLoading`, `error` |
| Admin Dashboard | `AdminDashboardViewModel` | stats |
| Admin Products | `AdminProductsViewModel` | `products`, `isLoading`, `error` |
| Admin Orders | `AdminOrdersViewModel` | `orders`, `isLoading`, `error` |
| Admin Order Detail | `AdminOrderDetailViewModel` | `order`, `isLoading`, `error` |

**Token storage:** `SessionManager` uses plain `SharedPreferences` (not `EncryptedSharedPreferences` as specified in docs — [MISMATCH]).

**Pattern:** All ViewModels follow LiveData pattern. Coroutines launched in `viewModelScope`. No StateFlow used. Repository classes directly hold a `SessionManager` reference and build `RetrofitClient` per call, which is inefficient (no singleton ApiService instance).

---

## 8. Design System — Current Implementation

### Web
CSS custom properties defined in global CSS (actual variables from `CheckoutModal.tsx` inline styles and layout files):
- `var(--color-primary)` — used throughout. Spec: `#6B1A2B` (Crimson)
- `var(--color-primary-light)` — light tint of primary
- `var(--color-border)` — dividers
- `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`
- `var(--font-display)` — Poppins; body uses Inter
- `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-full)`
- `var(--shadow-card)` — `0 2px 8px rgba(0,0,0,0.08)` per spec

CSS variables are referenced consistently. No hardcoded colors found in the component files reviewed (all inline styles use `var(--...)`). Design spec compliance appears good in web.

**Icon library:** Lucide (verified in `CheckoutModal.tsx`, `AdminOrderDetail.tsx`, `PaymentInstructionsPage.tsx`). No other icon libraries imported.

### Mobile
From `res/values/colors.xml`:
- `primary` = `#C8874E` — [MISMATCH] Spec says Crimson `#6B1A2B`. Mobile uses a warm orange, not crimson.
- `primary_dark` = `#A0693A`
- `primary_light` = `#F5E6D3`
- `background` = `#FAFAFA` — matches spec `#FAF7F4` closely but not exact
- `surface` = `#FFFFFF` — matches spec

**Critical design mismatch:** Mobile primary color `#C8874E` (orange/warm brown) vs web primary `#6B1A2B` (crimson). These are completely different brand colors, creating visual inconsistency between platforms.

The `Color.kt` file exists but contains only a comment `// Compose removed — colours defined in res/values/colors.xml`, confirming Jetpack Compose was abandoned in favor of traditional View-based XML UI.

**Reusable layouts (mobile):**
- `item_product.xml` — product card
- `item_cart.xml` — cart item row
- `item_order.xml` — order list row
- `item_order_item.xml` — order detail line item
- `item_admin_product.xml` — admin product row

**Reusable components (web):**
- `StatusTimeline.tsx` — used in OrderDetailPage and AdminOrderDetail
- `ProofUploadForm.tsx` — used in PaymentInstructionsPage
- `ProtectedRoute.tsx` / `GuestRoute` — routing guards
- `NotificationDropdown.tsx` — bell icon in Header

---

## 9. Order Status State Machine

### Status Values in Code

The `OrderService.VALID_STATUSES` set contains:
```
PENDING (legacy)
CONFIRMED (legacy)
DELIVERED (legacy)
ORDER_PLACED
AWAITING_DELIVERY_QUOTE
DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED
PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
PAYMENT_CONFIRMED
PREPARING
OUT_FOR_DELIVERY
READY
COMPLETED
CANCELLED
```

### Strategy Classes (registered in `OrderStatusContext`)
| Strategy Class | Target Status | Valid Source(s) |
|---|---|---|
| `PendingToConfirmedStrategy` | `CONFIRMED` | `PENDING` (+ items + address required) |
| `ConfirmedToPreparingStrategy` | `PREPARING` | `CONFIRMED`, `PAYMENT_CONFIRMED`, `ORDER_PLACED` |
| `PreparingToReadyStrategy` | `READY` | `PREPARING` |
| `ReadyToDeliveredStrategy` | `DELIVERED` | `READY` |
| `CancelOrderStrategy` | `CANCELLED` | Any except DELIVERED, COMPLETED, CANCELLED |

### Direct Transitions (no Strategy class — hardcoded map in `OrderStatusContext`)
| Target | Valid Sources |
|---|---|
| `PAYMENT_CONFIRMED` | `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION` |
| `OUT_FOR_DELIVERY` | `PREPARING` |
| `COMPLETED` | `OUT_FOR_DELIVERY`, `READY` |

### Gaps in State Machine
- `AWAITING_DELIVERY_QUOTE` is a valid initial status set by `OrderFactory`, but there is **no strategy or direct-transition entry for moving FROM `AWAITING_DELIVERY_QUOTE` to any state**. The admin uses `quoteDeliveryFee()` which directly sets `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED` without going through `OrderStatusContext`. [GAP — bypasses strategy pattern]
- `DELIVERED` status is a strategy target but `COMPLETED` replaces it in the new flow. Both exist creating ambiguity in the admin UI (web shows `COMPLETED`, mobile `AdminOrderDetailActivity` color codes `READY` and `DELIVERED` as "done" but not `COMPLETED`).
- [MISMATCH] `flow.md` describes `PENDING → CONFIRMED → PREPARING → READY → DELIVERED → CANCELLED`. The code has the more complex new-flow statuses. Docs are outdated.
- [MISMATCH] `MASTER.md` state machine says `Order Placed → Preparing (after payment confirmed)` and `Cancelled (any time before Preparing)`. The code has `ORDER_PLACED → AWAITING_DELIVERY_QUOTE → DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED → PAYMENT_SUBMITTED_AWAITING_CONFIRMATION → PAYMENT_CONFIRMED → PREPARING`.

---

## 10. Payment Flow — Current Implementation

### PayMongo
[NOT STARTED] `AppPayMongoProperties` config class (`app.paymongo.secret-key`, `app.paymongo.public-key`) is defined but no controller, client, or service uses it.

### Manual Proof-of-Payment Flow (Implemented)

**Full trace:**

1. Customer places order → status `ORDER_PLACED` (pickup) or `AWAITING_DELIVERY_QUOTE` (delivery)
2. For delivery: Admin quotes fee → `PUT /api/admin/orders/{id}/delivery-fee?fee=X` → `OrderService.quoteDeliveryFee()` adds fee to `totalAmount`, sets status `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED`, notifies customer via WebSocket
3. Customer views payment instructions at `PaymentInstructionsPage.tsx` → scans QR or selects Cash on Pickup
4. Customer uploads proof → `PUT /api/orders/{id}/submit-payment` (multipart) → `OrderService.submitPayment()` → `FileUploadService.saveImage()` → saves to local disk at `app.upload.dir`, sets `proofImageUrl`, sets status `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION`, sets `paymentStatus = "SUBMITTED"`
5. Admin views proof at `GET /api/uploads/{filename}` (served by `FileController`)
6. Admin confirms payment → `PUT /api/admin/orders/{id}/status` with `{"status": "PAYMENT_CONFIRMED"}` → `OrderService.updateOrderStatus()` → validates via `OrderStatusContext` (direct transition: source must be `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION`) → sets `paymentStatus = "PAID"`
7. Admin moves to preparing → `PUT /api/admin/orders/{id}/status` with `{"status": "PREPARING"}` → `ConfirmedToPreparingStrategy.canTransition()` validates source is `PAYMENT_CONFIRMED`

**Delivery fee calculation (manual vs automated):**
- Web checkout modal shows "delivery fee to be quoted" placeholder
- Admin enters fee manually in `AdminOrderDetail.tsx` input field
- `DeliveryFeeCalculator.java` exists but is NEVER called from any endpoint — it is a dead `@Component`

**Proof file storage risk:** Files stored to local disk (`app.upload.dir`). If the server restarts or is containerized, files are lost. No cloud storage (S3/Supabase Storage) integration.

---

## 11. Notifications

### Backend
- `Notification` entity persisted to `notifications` table
- `NotificationService.send()` saves to DB and pushes STOMP message to `/topic/notifications/{userId}`
- `WebSocketConfig` configures STOMP broker at `/ws` with SockJS, simple in-memory broker at `/topic`
- `WebSocketNotificationObserver` implements `OrderObserver` and fires on: `onOrderPlaced`, `onOrderStatusChanged`, `onOrderCancelled`
- Notifies: customer for all their own events; all ADMIN users for new orders and payment proof submissions
- `OrderEventPublisher` wires observers (logs: `LoggingObserver`, email: `EmailNotificationObserver` [STUB], inventory: `InventoryObserver` [STUB], websocket: `WebSocketNotificationObserver`)

### Web
- `NotificationContext.tsx` — STOMP client connects to native WebSocket `ws://localhost:8080/ws/websocket` (no SockJS on frontend). This works for the native WS path Spring exposes alongside SockJS. Reconnects every 5 seconds on disconnect.
- Real-time notifications prepended to state on arrival
- `NotificationDropdown.tsx` — bell icon renders unread count badge and notification list

### Mobile
[GAP] No WebSocket client. No notification screen. No badge on bottom nav. Mobile only gets order state changes if user manually refreshes.

### Observer Stubs
- `EmailNotificationObserver` — [STUB] no SMTP or email service connected; fires `onOrderPlaced` / `onOrderStatusChanged` / `onOrderCancelled` but body of methods not examined further
- `InventoryObserver` — [STUB] fires on order placed; no actual inventory deduction logic

---

## 12. Known Issues & Gaps

### API Mismatches (Code vs Code — confirmed bugs)

1. **Mobile orders endpoint wrong:** `ApiService.getOrders()` calls `GET /api/orders` but the backend route is `/api/orders/my-orders`. Mobile order list will fail with 404 or unexpected response.

2. **Mobile checkout broken:** `ApiService.placeOrder()` is `POST /api/orders` with no request body. Backend requires `CheckoutRequest` body with `deliveryAddress` and `contactNumber` (both `@NotNull`). Mobile checkout will fail with 400 validation error.

3. **Product search not wired in backend:** `ProductService.getAllAvailableProducts(search, category, page, size)` receives `search` but passes only `category` to `productRepository.findAllAvailable(category, pageable)`. The `search` parameter is silently dropped. Web search bar sends the param but backend ignores it.

4. **Mobile Order model missing fields:** `Order.kt` has `id, status, totalAmount, deliveryFee, createdAt, items, customerName, customerEmail`. Backend `OrderResponse` returns `orderId, orderDate, status, paymentStatus, deliveryAddress, contactNumber, deliveryNotes, proofImageUrl, cancellationReason, items, totalAmount, itemCount`. Field name mismatch: backend uses `orderId` not `id`, `orderDate` not `createdAt`.

5. **Mobile status color mapping incomplete:** `AdminOrderDetailActivity.statusColor()` maps `PENDING, CONFIRMED, PREPARING, READY, DELIVERED` but not `ORDER_PLACED, AWAITING_DELIVERY_QUOTE, DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED, PAYMENT_SUBMITTED_AWAITING_CONFIRMATION, PAYMENT_CONFIRMED, OUT_FOR_DELIVERY, COMPLETED, CANCELLED`. Most new-flow statuses fall to the else clause (status_cancelled color).

6. **Mobile token storage not encrypted:** `SessionManager` uses plain `SharedPreferences` instead of `EncryptedSharedPreferences` (security gap documented as a decision in tasks.md but never implemented).

### Missing Features

7. **DeliveryFeeCalculator never called:** `DeliveryFeeCalculator.java` is a `@Component` with four distance zones but is never injected or used anywhere. The admin-manual-quote flow is the only working delivery fee mechanism.

8. **No mobile checkout screen:** Mobile has no `CheckoutActivity`. Cart's "Place Order" button fires the broken API call directly with no address/contact input.

9. **No mobile notifications:** No WebSocket, no notification screen, no badge.

10. **No PayMongo integration:** Properties class defined, no implementation.

11. **No refresh token:** JWTs expire with no renewal path. Users are logged out on expiry and must re-authenticate.

12. **Admin panel gaps (web):** From tasks.md backlog — admin "view proof of payment" is partially done (AdminOrderDetail shows proof image URL); admin delivery fee input is implemented; admin cancel with reason is implemented. Remaining: "Admin manual order status override at any stage" (partially done — admin can send any VALID_STATUSES value).

13. **QR code images are static local files:** `PaymentInstructionsPage.tsx` maps QR codes to `/gcash-qr.jpg`, `/maya-qr.jpg`, `/bpi-qr.jpg`. These are static assets that must exist in the web public directory or requests will 404. Image `onError` hides the image silently.

14. **Fulfillment method encoded in deliveryNotes string:** `OrderFactory` detects pickup via `request.getDeliveryNotes().contains("Fulfillment: PICKUP")`. This is fragile — any note change could break detection. No dedicated `fulfillmentMethod` field on Order entity.

### Doc vs Code Mismatches

15. **architecture.md package paths wrong:** Docs show `com.doughlycrumbl.*` but actual packages are `edu.cit.cabatana.doughlycrumbl.*`.

16. **flow.md state machine outdated:** Shows `PENDING → CONFIRMED → PREPARING → READY → DELIVERED`; code has 13-value status set with new payment flow.

17. **MASTER.md delivery tiers wrong:** Shows ₱50/₱80/₱120 tiers; code shows ₱80/₱120/₱160/₱200 with different km boundaries.

18. **tasks.md mobile section wrong:** Says "Only the default Android project template exists." Mobile in fact has full feature-slice implementation with 9 packages and 50+ files.

### Test Gaps

19. `CartControllerIntegrationTest` references `cartService` as a field but there is no `@MockBean CartService cartService` declaration visible in the test file — test likely fails to compile/run.

---

## 13. Vertical Slice Architecture — Compliance Check

### Backend

**Actual structure:** `edu.cit.cabatana.doughlycrumbl.`
- `features/auth/` — AuthController, AuthService, JwtTokenProvider, JwtAuthFilter, CustomUserDetails, LoginRequest, RegisterRequest, AuthResponse, UserDetailsServiceImpl
- `features/cart/` — Cart, CartItem entities, CartRepository, CartItemRepository, CartService, CartController, CartAdapter, AddToCartRequest, UpdateCartItemRequest, CartResponse
- `features/notification/` — Notification entity, NotificationRepository, NotificationService, NotificationController, NotificationResponse, WebSocketNotificationObserver
- `features/order/` — Order, OrderItem entities, OrderRepository, OrderItemRepository, OrderService, OrderController, AdminController, OrderFactory, OrderItemFactory, OrderAdapter, OrderStatusContext, OrderStatusStrategy (interface), PendingToConfirmedStrategy, ConfirmedToPreparingStrategy, PreparingToReadyStrategy, ReadyToDeliveredStrategy, CancelOrderStrategy, CancelOrderStrategy, OrderObserver, OrderEventPublisher, LoggingObserver, EmailNotificationObserver, InventoryObserver, DeliveryFeeCalculator, CheckoutRequest, UpdateOrderStatusRequest, OrderResponse
- `features/payment/` — FileUploadService, FileController
- `features/product/` — Product entity, ProductRepository, ProductService, ProductController, ProductAdapter, ProductRequest, ProductResponse, ProductDataSeeder, ProductSchemaFixer
- `features/user/` — User entity, UserRepository, AdminDataSeeder
- `shared/config/` — SecurityConfig, CorsConfig, WebSocketConfig, AppJwtProperties, AppOAuth2Properties, AppPayMongoProperties, AppUploadProperties
- `shared/exception/` — GlobalExceptionHandler, BadRequestException, ErrorResponse, ResourceNotFoundException, UnauthorizedException
- `shared/util/` — EntityToDtoAdapter

**Compliance:** VSA fully implemented in backend. No strays outside `features/` or `shared/`.

**Note:** `AdminController` lives in `features/order/` (not a separate `features/admin/` slice). This is reasonable as it delegates to `ProductService` and `OrderService`, but violates strict VSA since it crosses into the product slice.

### Web Frontend

**Actual structure:** `web/src/`
- `features/about/` — AboutPage.tsx
- `features/admin/` — AdminDashboard, AdminOrderDetail, AdminOrders, AdminProducts
- `features/auth/` — LoginPage, RegisterPage
- `features/care-guide/` — CareGuidePage
- `features/checkout/` — CheckoutModal
- `features/landing/` — LandingPage
- `features/menu/` — MenuPage
- `features/orders/` — OrderConfirmationPage, OrderDetailPage, OrdersPage, PaymentInstructionsPage
- `layout/` — AppLayout, Header, OrderPanel, Sidebar
- `routes/` — AppRouter
- `shared/api/` — axiosInstance, authApi, cartApi, notificationApi, orderApi, productApi
- `shared/components/` — NotificationDropdown, ProofUploadForm, ProtectedRoute, StatusTimeline
- `shared/hooks/` — AuthContext, CartContext, NotificationContext
- `shared/types/` — index.ts
- `shared/utils/` — formatters, routes

**Compliance:** VSA well-implemented. `layout/` is a reasonable separate concern outside `features/`. No strays.

### Mobile

**Actual structure:** `com.example.mobile.`
- `auth/data/` — AuthRepository
- `auth/ui/` — LoginActivity, LoginViewModel, RegisterActivity, RegisterViewModel, SplashActivity
- `admin/data/` — AdminRepository
- `admin/ui/` — AdminActivity, AdminDashboardFragment + ViewModel, AdminOrderDetailActivity + ViewModel, AdminOrdersFragment + ViewModel, AdminProductsFragment + ViewModel, AdminProductAdapter, AdminAddEditProductActivity + ViewModel
- `cart/data/` — CartRepository
- `cart/ui/` — CartFragment, CartViewModel, CartItemAdapter
- `home/data/` — ProductRepository
- `home/ui/` — HomeFragment, HomeViewModel, ProductAdapter
- `model/` — shared data classes (AuthRequest, AuthResponse, Cart, CartItem, CartItemRequest, MessageResponse, Order, OrderItem, PagedResponse, Product, ProductRequest, RegisterRequest, UpdateOrderStatusRequest)
- `network/` — ApiService, AuthInterceptor, RetrofitClient
- `orders/data/` — OrderRepository
- `orders/ui/` — OrderAdapter, OrderDetailActivity, OrderDetailViewModel, OrderItemAdapter, OrdersFragment, OrdersViewModel
- `profile/ui/` — ProfileFragment
- `ui/theme/` — Color.kt (stub), Theme.kt, Type.kt
- `util/` — SessionManager

**Compliance:** Feature-based package organization implemented. `model/` and `network/` are shared concerns outside feature packages — appropriate. No strays. Well-structured for a View-based Android app.

---

## 14. Test Coverage Summary

### Existing Tests

| Test File | Type | What It Tests |
|---|---|---|
| `BackendApplicationTests.java` | Spring Boot context load | Application context starts without error |
| `CartControllerIntegrationTest.java` | `@WebMvcTest` slice | `GET /api/cart` returns 200 for auth user; `POST /api/cart/items` returns 201 with body; unauthenticated POST returns 4xx. **[BUG]** Missing `@MockBean CartService cartService` field declaration — test likely fails to compile. |
| `OrderServiceTest.java` | `@ExtendWith(MockitoExtension)` unit | updateOrderStatus: unknown status throws BadRequest; valid transition saves; strategy exception propagates; cancel sets paymentStatus CANCELLED and cancellationReason |
| `ProductServiceTest.java` | Unit (assumed) | Not read in detail but exists |
| `DeliveryServiceTest.java` | Unit | `DeliveryFeeCalculator.calculate()` for all 4 zones |

### What Is Missing

- No auth endpoint tests (register / login happy path, duplicate email, wrong password)
- No cart service unit tests
- No product controller tests
- No product service unit tests
- No order placement integration test
- No payment submission test
- No notification tests
- No web frontend tests (zero test files found in `web/src`)
- No mobile tests (not examined but mobile tasks.md has no testing section)

---

## EXECUTIVE SUMMARY

### Feature Counts

| Status | Count | Features |
|---|---|---|
| COMPLETE | 10 | User registration, User login/logout, Product listing (web+backend), Cart full CRUD (web+backend), Checkout (web), Payment proof upload (web+backend), Order placement (web), Order listing customer (web+mobile), Admin product management (all three), Admin order management (web+backend) |
| PARTIAL | 7 | Order detail customer (mobile model mismatch), Order status timeline (mobile chip only), Notifications (backend+web only), Mobile cart (no checkout), Admin order detail (mobile missing new statuses), Delivery fee calculation (calculator exists but unwired), Product search (search param dropped in backend) |
| NOT STARTED | 5 | Mobile checkout screen, Mobile notifications, PayMongo integration, User profile edit, Mobile Care Guide / About pages |

**Totals: 10 complete / 7 partial / 5 not started** across 22 feature areas.

### Biggest Risks Before Submission

1. **Mobile is functionally broken for core flows.** The two most critical mobile bugs — orders listing hitting the wrong endpoint (`/api/orders` vs `/api/orders/my-orders`) and checkout sending an empty body to `POST /api/orders` — mean customers cannot view their orders and cannot complete a purchase on mobile. These are compilation-safe bugs that only surface at runtime.

2. **Backend search is silently broken.** `ProductService.getAllAvailableProducts()` receives the `search` parameter from `ProductController` but never passes it to the repository query. The search bar on web appears to work (no error) but returns unfiltered results. The feature is marked complete in tasks.md but is not actually working.

3. **CartControllerIntegrationTest likely does not compile.** The `@MockBean CartService cartService` field is missing from the test class. If CI or grading runs `./mvnw test`, this test will fail to build, causing the entire test suite to fail. The backend would be reported as having test failures.

### Recommended Next 3 Things to Work On

**Priority 1 — Fix mobile checkout and orders endpoints (1–2 hours)**
- Fix `ApiService.getOrders()` to call `GET /api/orders/my-orders`
- Add a `CheckoutActivity` or modal in mobile, or at minimum add `CheckoutRequest` body to the existing `ApiService.placeOrder()` call with hardcoded pickup defaults so the API call succeeds
- Fix `Order.kt` data class field names to match backend (`orderId`, `orderDate` etc.)

**Priority 2 — Fix backend product search (30 minutes)**
- In `ProductRepository`, update `findAllAvailable` query to accept and apply a `search` parameter (JPQL `LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))`)
- In `ProductService.getAllAvailableProducts()`, pass `search` to the repository call

**Priority 3 — Fix CartControllerIntegrationTest compilation (15 minutes)**
- Add `@MockBean private CartService cartService;` to `CartControllerIntegrationTest.java` and ensure `when(cartService.getCart(...))` etc. compile against the actual method signatures so `./mvnw test` passes cleanly
