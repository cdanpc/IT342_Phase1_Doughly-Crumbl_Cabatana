# ✅ TASKS.md — Development Task Tracker

> Use this file to track what's done, in progress, and pending across all modules.
> Update this file as features are completed. Format: `[x]` = done, `[ ]` = pending, `[~]` = in progress.
>
> **Last updated:** March 6, 2026

---

## 🔧 Backend Tasks

### Project Setup
- [x] Initialize Spring Boot project with Maven (Spring Boot 3.5.0, Java 17)
- [x] Configure PostgreSQL datasource (Supabase-hosted PostgreSQL with HikariCP)
- [x] Set up Spring Security + JWT filter chain (`SecurityConfig`, `JwtAuthFilter`, `JwtTokenProvider`, `CustomUserDetails`)
- [x] Create base exception handler (`GlobalExceptionHandler` — handles ResourceNotFound, BadRequest, Unauthorized, BadCredentials, AccessDenied, validation errors, catch-all)
- [x] Configure CORS for web and mobile clients (`CorsConfig` — localhost:5173, 10.0.2.2:8080)

### Database
- [x] Write and run migration: `users` table (auto-created via Hibernate `ddl-auto=update`)
- [x] Write and run migration: `products` table
- [x] Write and run migration: `carts` table
- [x] Write and run migration: `cart_items` table (with unique constraint on cart_id + product_id)
- [x] Write and run migration: `orders` table
- [x] Write and run migration: `order_items` table (with product snapshot: productName, unitPrice)
- [x] Add indexes (product search, order lookups — via JPA/Hibernate auto-generation)

### Auth Module
- [x] `User` entity + `UserRepository` (fields: id, name, email, password, address, phoneNumber, role, createdAt)
- [x] `RegisterRequest` / `LoginRequest` DTOs (with Jakarta validation: @NotBlank, @Email, @Size)
- [x] `AuthResponse` DTO (token, userId, name, email, role)
- [x] `JwtTokenProvider` (generate, validate, extract claims — HMAC-based with jjwt 0.12.6)
- [x] `JwtAuthFilter` (intercept + set SecurityContext — Bearer token extraction)
- [x] `AuthService` (register with password match + duplicate email check, login via AuthenticationManager)
- [x] `AuthController` (POST /api/auth/register → 201, POST /api/auth/login → 200)

### Product Module
- [x] `Product` entity + `ProductRepository` (custom `findAllAvailable` JPQL with search + category filter + pagination)
- [x] `ProductResponse` DTO + `ProductRequest` DTO (for create/update)
- [x] `ProductService` (getAll with search/filter, getById, admin CRUD methods)
- [x] `ProductController` (GET /api/products with pagination, GET /api/products/{id})

### Cart Module
- [x] `Cart` + `CartItem` entities + repositories (OneToOne User, OneToMany items)
- [x] `CartResponse` DTO (with nested `CartItemResponse`)
- [x] `CartService` (getCart, addItem with merge-if-existing, updateItem, removeItem, clearCart — all with ownership checks)
- [x] `CartController` (GET, POST, PUT, DELETE /api/cart)
- [x] Auto-create cart on first add-to-cart (lazy creation)

### Order Module
- [x] `Order` + `OrderItem` entities + repositories (status enum, delivery fields, timestamps)
- [x] `CheckoutRequest` / `OrderResponse` DTOs + `UpdateOrderStatusRequest`
- [x] `OrderService` (placeOrder from cart + clear cart, getMyOrders, getOrderById with ownership check, admin methods)
- [x] `OrderController` (POST /api/orders, GET /api/orders/my-orders, GET /api/orders/{id})

### Admin Module
- [x] `AdminController` (full product CRUD + order management at /api/admin, secured with @PreAuthorize("hasRole('ADMIN')"))
- [x] Admin logic in `ProductService` / `OrderService` (getAllProducts, getAllOrders with status filter, updateOrderStatus with validation)
- [x] Secure all `/api/admin/**` routes with `ROLE_ADMIN`

---

## 🌐 Web Frontend Tasks

### Setup
- [x] Initialize React + TypeScript + Vite project (React 18.3.1, TypeScript 5.9.3, Vite 7.3.1)
- [x] Install and configure React Router (react-router-dom 7.13.1 — `AppRouter.tsx` with public, customer, and admin route groups)
- [x] Set up Axios instance with base URL and JWT interceptor (`axiosInstance.ts` — Bearer token from localStorage, 401 auto-redirect)
- [x] Set up global state (auth context + cart context with localStorage persistence and toast notifications)
- [x] Configure protected routes (`ProtectedRoute` with optional `requireAdmin`, `GuestRoute` for unauthenticated-only pages)

### Auth
- [x] `LoginPage` — email/password form, show/hide password toggle, error banner, redirect based on role (admin → dashboard, customer → menu)
- [x] `RegisterPage` — firstName, lastName, email, address, phoneNumber, password, confirmPassword with client-side validation
- [x] Logout — clear token + redirect (integrated in `Sidebar` component)

### Products
- [x] `MenuPage` — hero banner, fetch products with search + category filter dropdown, product grid with responsive columns, skeleton loading
- [x] Product card component (inline in MenuPage — image, name, add-to-cart button, price, star rating)
- [ ] `ProductDetailPage` — full product info + add to cart (not implemented; users add to cart directly from card grid)

### Cart
- [x] Cart display (via `OrderPanel` — right sidebar showing items, quantities, totals; always visible in AppLayout)
- [x] Add to cart from product card (via cart icon button on each product card)
- [x] Update quantity in cart (via +/- controls in OrderPanel)
- [x] Remove item from cart (via trash icon in OrderPanel)

### Checkout & Orders
- [x] `CheckoutPage` — delivery form (address, phone, notes) + order summary with delivery fee (₱80)
- [x] `OrderConfirmationPage` — success state with order ID, status badge, line items, total
- [x] `OrdersPage` — order history list with status badges, click to view detail
- [x] `OrderDetailPage` — full order breakdown with delivery info (address, phone, notes), items table, total

### Admin Panel
- [x] `AdminDashboard` — stats cards (Total Products, Total Orders, Pending, Delivered) + quick links to manage products/orders
- [x] `AdminProducts` — product table with search, image/name/category/price/available columns, Add/Edit modal with full form, delete with confirmation
- [x] `AdminOrders` — orders table with status filter pills (ALL, PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED), View action per row
- [x] `AdminOrderDetail` — status progress bar with flow visualization, "Move to next status" button, "Cancel Order" button, delivery info, line items

### Layout & Components
- [x] `Sidebar` — 120px fixed left, profile avatar with initials, role-based navigation (customer vs admin), logout button
- [x] `Header` — sticky 68px, DC logo, search bar (customer-only), cart icon with badge count (customer-only)
- [x] `OrderPanel` — 320px fixed right, cart items with qty controls, subtotal/delivery/total summary, "Confirm Order" → checkout (hidden for admin)
- [x] `AppLayout` — three-column shell composing Sidebar + main content (Header + Outlet) + OrderPanel
- [x] `LandingPage` — full-viewport crimson hero with navbar, headline, Order Now + Meet Cookie CTAs

---

## 📱 Mobile Tasks

> **Note:** Mobile is View-based XML (not Compose). Architecture: MVVM + ViewBinding + Retrofit.
> Last updated: 2026-05-06

### Setup
- [x] Initialize Android project (Kotlin, View-based XML, MVVM)
- [x] Set up Retrofit + OkHttp with JWT Bearer interceptor
- [x] Configure Material3 theme, Poppins font, color/dimen tokens
- [x] Set up `EncryptedSharedPreferences` for token storage (BUG-4 fixed 2026-05-06)
- [x] AuthInterceptor catches 401 → clears session → redirects to LoginActivity (BUG-5 fixed 2026-05-06)

### Auth
- [x] `SplashActivity` — role-based routing (admin → AdminActivity, customer → MainActivity)
- [x] `LoginActivity` + `LoginViewModel` — email/password + API call
- [x] `RegisterActivity` + `RegisterViewModel` — registration form + validation
- [x] JWT persisted in EncryptedSharedPreferences via `SessionManager`

### Products / Home
- [x] `HomeFragment` + `HomeViewModel` — hero banner, search, category chips, product grid
- [x] `ProductAdapter` + `SkeletonAdapter` — loading state shimmer
- [ ] Product detail screen — skipped by design decision (add-to-cart from grid)

### Cart
- [x] `CartFragment` + `CartViewModel` + `CartItemAdapter` — items, quantity stepper, remove
- [x] `CheckoutActivity` + `CheckoutViewModel` — fulfillment toggle, address, payment selector, `placeOrder()`

### Orders
- [x] `OrdersFragment` + `OrdersViewModel` + `OrderAdapter` — order history list
- [x] `OrderDetailActivity` + `OrderDetailViewModel` — status banner, 5-step timeline, delivery details, cancel + reorder buttons
- [x] `OrderDetailViewModel.cancelOrder()` — calls `PUT /orders/{id}/cancel`

### Notifications
- [x] `NotificationsFragment` + `NotificationsViewModel` + `NotificationAdapter` — real API call to `GET /notifications`
- [x] Mark-as-read on tap; Mark-all-read button
- [ ] Badge count on nav tab (requires unread count polling)

### Profile
- [x] `ProfileFragment` + `ProfileViewModel` — crimson header, initials avatar, order stats row
- [x] `CareGuideActivity`, `AboutFaqActivity`, `PaymentInstructionsActivity` — informational screens

### Admin
- [x] `AdminActivity` — 4-tab shell (Dashboard, Orders, Products, Profile)
- [x] `AdminDashboardFragment` + `AdminDashboardViewModel` — stats cards, recent orders
- [x] `AdminOrdersFragment` + `AdminOrdersViewModel` + `AdminOrderAdapter`
- [x] `AdminOrderDetailActivity` + `AdminOrderDetailViewModel` — status update, delivery fee input
- [x] `AdminProductsFragment` + `AdminProductsViewModel` + `AdminProductAdapter`
- [x] `AdminAddEditProductActivity` + `AdminAddEditProductViewModel` — create/edit product
- [x] `AdminProfileFragment` — admin info + logout

### Remaining / Low Priority
- [ ] Pagination on home screen (currently fetches page=0&size=20)
- [ ] Unread badge count on Notifications tab (needs polling or WebSocket)
- [ ] Reorder button — currently navigates to menu (no productId in OrderItem to re-add items)

---

## 🧪 Testing Tasks

### Backend
- [ ] Unit tests: `AuthService`
- [ ] Unit tests: `OrderService`
- [ ] Unit tests: `CartService`
- [ ] Integration tests: Auth endpoints
- [ ] Integration tests: Product endpoints

### Web Frontend
- [ ] Component test: `ProductCard`
- [ ] Component test: `CartPage`
- [ ] Integration test: Add to cart flow

---

## 📊 Progress Summary

| Layer              | Done | Total | Status       |
|--------------------|------|-------|--------------|
| **Backend**        | 26   | 26    | ✅ Complete   |
| **Web Frontend**   | 23   | 24    | ✅ ~96%       |
| **Mobile**         | 0    | 15    | ❌ Not started |
| **Testing**        | 0    | 8     | ❌ Not started |

---

## 📋 Notes & Decisions Log

| Date       | Decision                                                  | Made By  |
|------------|-----------------------------------------------------------|----------|
| —          | No real payment gateway (out of scope)                    | Team     |
| —          | Order items snapshot price at time of order                | Team     |
| —          | JWT stored in localStorage (web) / EncryptedSharedPrefs (mobile) | Team     |
| —          | Cart is lazily created on first add-to-cart               | Team     |
| —          | ProductDetailPage skipped; add-to-cart from card grid     | Team     |
| —          | CSS custom properties + plain CSS (no Tailwind/modules)   | Team     |
| —          | Poppins (display) + Inter (body) via Google Fonts         | Team     |
| —          | Delivery fee fixed at ₱80                                 | Team     |
| —          | Spring Security updated to non-deprecated DaoAuthenticationProvider(UserDetailsService) constructor | Team |
| April 2026 | Quote-based delivery fee system adopted (Lalamove/Borzo); manual seller input replaces fixed ₱80 fee | Team |
| April 2026 | New order status flow: ORDER_PLACED / AWAITING_DELIVERY_QUOTE → DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED → PAYMENT_SUBMITTED_AWAITING_CONFIRMATION → PAYMENT_CONFIRMED → PREPARING → READY/OUT_FOR_DELIVERY → COMPLETED | Team |

---

## 🗂️ Feature Sprint Log — April 2026

> Last updated: April 10, 2026. Tracks detailed UI/design/product tasks beyond the module-level checklist above.

### ✅ Completed

**UI / Design**
- [x] Sidebar navigation redesign — replaced logo with user profile section
- [x] Order item list component redesign
- [x] Page header redesign — logo moved beside search bar
- [x] My Orders page — 3-click rule applied
- [x] Product filter UI — replaced pill filters with single compact dropdown
- [x] Order panel — item card redesign with quantity stepper and trash icon
- [x] Order panel — auto-collapse when on My Orders page
- [x] Header — cart icon replaces "Order" button in nav

**Checkout & Payment**
- [x] Checkout page — fulfillment toggle (Pickup / Delivery)
- [x] Checkout page — delivery address input + optional landmark field
- [x] Checkout page — "delivery fee quoted on confirmation" placeholder note
- [x] Checkout page — payment method selector (GCash / Maya / Bank Transfer / Cash on Pickup)
- [x] Checkout page — Place Order advances to `AWAITING_DELIVERY_QUOTE` status
- [x] Payment instructions screen — dynamic per payment method (QR code, bank details, cash note)
- [x] Proof of payment upload — image upload with "Submit Payment" button

**Order Status Flow**
- [x] `AWAITING_DELIVERY_QUOTE` — helper text: "We're calculating your delivery fee."
- [x] `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED` — shows updated total, payment instructions, proof upload
- [x] `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION` — helper text: "We've received your proof of payment."
- [x] `PAYMENT_CONFIRMED` — advances to Preparing
- [x] My Orders — full status timeline stepper with all new states

### 🔲 Backlog

**Admin Panel**
- [ ] Admin — input field to enter quoted delivery fee per order
- [ ] Admin — trigger status update to notify customer fee has been quoted
- [ ] Admin — view uploaded proof of payment per order
- [ ] Admin — confirm payment button → advances to Payment Confirmed → Preparing
- [ ] Admin — manual order status override at any stage
- [ ] Admin — cancel order with optional reason field

**General UI**
- [ ] Right sidebar — shop/grid button opens and closes Order Bag drawer
- [ ] Order Bag — illustrated empty state with "Browse Menu" CTA
- [ ] User avatar dropdown — My Profile, Settings, Sign Out
- [ ] My Orders — Reorder button (adds all items back to cart in one click)
- [ ] Responsive layout — mobile/tablet breakpoints

**Future / Post-Launch**
- [ ] PayMongo integration — replaces manual proof of payment upload
- [ ] Lalamove API integration — replaces manual seller delivery fee quote
- [ ] Push notifications — active alerts for status changes
