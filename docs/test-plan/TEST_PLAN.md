# Software Test Plan — Doughly Crumbl

**Project:** Doughly Crumbl — Artisan Bakery Web Application
**Group:** G5 — Cabatana
**Branch:** refactor/vertical-slice-architecture
**Version:** 1.0
**Date:** April 28, 2026

---

## 1. Project Information

| Field | Value |
|---|---|
| Project | Doughly Crumbl |
| Stack | Spring Boot 3.5.0 / React 18 / PostgreSQL (Supabase) |
| Test framework (backend) | JUnit 5 + Mockito + Spring Boot Test |
| Test framework (frontend) | Vite build + manual regression |
| Java version | 17 |
| Node version | 20+ |
| Browser | Chrome (primary), Firefox (secondary) |

---

## 2. Scope

### In scope
- Backend unit tests: ProductService, OrderService, DeliveryService (fee tiers)
- Backend integration tests: CartController (MockMvc)
- Functional AC coverage: AC-10 through AC-18
- Order status transition validation
- User authentication (register, login, JWT)
- Product listing with search and category filter

### Out of scope
- Mobile (Android) — not implemented
- PayMongo live webhook — sandbox only
- Lalamove/Borzo API — not integrated
- Browser compatibility beyond Chrome/Firefox
- Load testing and performance benchmarks

---

## 3. Test Approach

| Type | Tool | Scope |
|---|---|---|
| Unit | JUnit 5 + Mockito | Service logic, fee calculation, status transitions |
| Integration | @WebMvcTest + MockMvc | Controller endpoints with mocked services |
| Manual regression | Browser + Postman | Full user flows: login → order → admin confirm |

---

## 4. Test Environment

| Component | Value |
|---|---|
| Backend | `./mvnw spring-boot:run` on port 8080 |
| Frontend | `npm run dev` on port 5173 |
| Database | Supabase PostgreSQL (shared dev instance) |
| Auth | JWT, 24h expiry |

---

## 5. Functional Requirements Coverage Table

| Req ID | Description | Test Type | Status |
|---|---|---|---|
| AC-10 | Add product to order bag | Manual | Pending |
| AC-11 | Update quantity in bag | Manual | Pending |
| AC-12 | Remove product from bag | Manual + Unit | Pending |
| AC-13 | Collapse/expand order bag | Manual | Pending |
| AC-14 | Proceed to checkout | Manual | Pending |
| AC-15 | Delivery fee calculation | Unit | Pending |
| AC-16 | Payment via PayMongo (manual flow) | Manual | Pending |
| AC-17 | Successful payment — order created | Integration | Pending |
| AC-18 | Failed/cancelled payment — bag preserved | Manual | Pending |
| AUTH-1 | Register new user | Integration | Pending |
| AUTH-2 | Login and receive JWT | Integration | Pending |
| PROD-1 | List products with search/filter | Unit | Pending |
| ORD-1 | Create order from cart | Unit | Pending |
| ORD-2 | Valid status transition | Unit | Pending |
| ORD-3 | Invalid status transition rejected | Unit | Pending |

---

## 6. Test Cases

### TC-01 — Register new user

| Field | Value |
|---|---|
| ID | TC-01 |
| Requirement | AUTH-1 |
| Type | Manual + Integration |
| Precondition | Application running; email not yet registered |
| Steps | 1. Navigate to `/register` 2. Fill name, email, password (min 8 chars, 1 upper, 1 digit), confirm password, address, phone 3. Submit |
| Expected | 200 OK; JWT token returned; user redirected to `/menu` |
| Pass Criteria | `localStorage['auth']` contains `token`, `role: CUSTOMER` |

---

### TC-02 — Login with valid credentials

| Field | Value |
|---|---|
| ID | TC-02 |
| Requirement | AUTH-2 |
| Type | Manual + Integration |
| Precondition | User registered |
| Steps | 1. Navigate to `/login` 2. Enter email + password 3. Submit |
| Expected | 200 OK; JWT stored; redirect to `/menu` |
| Pass Criteria | Auth token present; no error toast |

---

### TC-03 — Login with invalid password

| Field | Value |
|---|---|
| ID | TC-03 |
| Requirement | AUTH-2 |
| Type | Manual |
| Steps | Enter wrong password and submit |
| Expected | 401 response; error message displayed; no redirect |

---

### TC-04 — Browse product list with search

| Field | Value |
|---|---|
| ID | TC-04 |
| Requirement | PROD-1 |
| Type | Manual + Unit |
| Precondition | Logged in; at least one seeded product |
| Steps | 1. Navigate to `/menu` 2. Type "chocolate" in search bar |
| Expected | Products matching "chocolate" shown; non-matching products hidden |
| Pass Criteria | ProductService.getProducts(search="chocolate") returns correct page |

---

### TC-05 — Filter products by category

| Field | Value |
|---|---|
| ID | TC-05 |
| Requirement | PROD-1 |
| Type | Manual |
| Steps | 1. On `/menu`, click "CLASSIC" category chip |
| Expected | Only CLASSIC category products displayed |

---

### TC-06 — Add item to cart (AC-10)

| Field | Value |
|---|---|
| ID | TC-06 |
| Requirement | AC-10 |
| Type | Manual |
| Precondition | Logged in as CUSTOMER; on `/menu` |
| Steps | 1. Click "Add to Cart" on any product 2. Open order bag |
| Expected | Item appears in sidebar order panel with correct name, price, quantity |
| Pass Criteria | `cart.items` contains the added product; cart badge updates |

---

### TC-07 — Update item quantity (AC-11)

| Field | Value |
|---|---|
| ID | TC-07 |
| Requirement | AC-11 |
| Type | Manual |
| Precondition | At least one item in cart |
| Steps | 1. Open order panel 2. Click + to increase quantity |
| Expected | Quantity increments; subtotal recalculates in real time |

---

### TC-08 — Remove item from cart (AC-12)

| Field | Value |
|---|---|
| ID | TC-08 |
| Requirement | AC-12 |
| Type | Manual |
| Steps | 1. In order panel, click trash icon on an item |
| Expected | Item removed; total updates; empty state shown if last item removed |

---

### TC-09 — Collapse / expand order bag (AC-13)

| Field | Value |
|---|---|
| ID | TC-09 |
| Requirement | AC-13 |
| Type | Manual |
| Steps | 1. Click cart icon in header to toggle order panel |
| Expected | Order panel slides in/out; main content shifts to accommodate |

---

### TC-10 — Proceed to checkout (AC-14)

| Field | Value |
|---|---|
| ID | TC-10 |
| Requirement | AC-14 |
| Type | Manual |
| Precondition | Cart has at least one item |
| Steps | 1. In order panel, click "Proceed to Checkout" |
| Expected | Checkout modal opens with order summary, fulfillment toggle, delivery/pickup details, payment method selection |

---

### TC-11 — Delivery fee quoted after order placed (AC-15)

| Field | Value |
|---|---|
| ID | TC-11 |
| Requirement | AC-15 |
| Type | Manual + Unit |
| Steps | 1. Place order with delivery 2. Admin logs in 3. Admin navigates to order 4. Admin sets delivery fee 5. Customer refreshes order detail |
| Expected | Order status transitions to `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED`; quoted fee shown on customer order page |
| Automated | `DeliveryServiceTest` covers all fee tier boundaries |

---

### TC-12 — Submit proof of payment (AC-16)

| Field | Value |
|---|---|
| ID | TC-12 |
| Requirement | AC-16 |
| Type | Manual |
| Precondition | Order in `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED` state |
| Steps | 1. Customer opens order detail 2. Clicks "Submit Payment" 3. Uploads proof image 4. Confirms |
| Expected | Status changes to `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION`; upload succeeds |

---

### TC-13 — Order created with correct order ID (AC-17)

| Field | Value |
|---|---|
| ID | TC-13 |
| Requirement | AC-17 |
| Type | Manual + Integration |
| Steps | 1. Complete checkout 2. Observe order confirmation page |
| Expected | Order confirmation page shows `orderId`; order appears in `/orders` list |

---

### TC-14 — Bag preserved after failed payment (AC-18)

| Field | Value |
|---|---|
| ID | TC-14 |
| Requirement | AC-18 |
| Type | Manual |
| Steps | 1. Open checkout 2. Do NOT complete; close modal |
| Expected | Cart items still present; no order created |

---

### TC-15 — Admin can update order status

| Field | Value |
|---|---|
| ID | TC-15 |
| Requirement | ORD-2 |
| Type | Manual + Unit |
| Steps | 1. Admin opens order 2. Changes status to PREPARING 3. Saves |
| Expected | Status updates; customer receives WebSocket notification |

---

### TC-16 — Invalid status transition rejected

| Field | Value |
|---|---|
| ID | TC-16 |
| Requirement | ORD-3 |
| Type | Unit |
| Description | Attempt to move order from `ORDER_PLACED` → `COMPLETED` (skips steps) |
| Expected | Service throws `BadRequestException`; HTTP 400 returned |

---

## 7. Automated Test Cases

### 7.1 ProductServiceTest

| Method | Description |
|---|---|
| `getProducts_returnsPagedResults` | Mock repo returns 3 products; assert page content and totalElements |
| `getProducts_filterByCategory` | Mock with category filter; assert only matching products returned |
| `getProducts_searchByName` | Mock with search string; assert adapter called for each result |
| `createProduct_savesAndReturnsDto` | Mock repo.save(); assert returned DTO matches input |
| `updateProduct_notFound_throwsException` | Repo returns empty; assert ResourceNotFoundException |

### 7.2 DeliveryServiceTest (all 4 fee tiers)

| Method | Description |
|---|---|
| `calculateFee_zone1_returns80` | Distance ≤ 3 km → ₱80 |
| `calculateFee_zone2_returns120` | Distance 3–8 km → ₱120 |
| `calculateFee_zone3_returns160` | Distance 8–15 km → ₱160 |
| `calculateFee_zone4_returns200` | Distance > 15 km → ₱200 |

### 7.3 OrderServiceTest

| Method | Description |
|---|---|
| `createOrder_fromCart_success` | Mock cart, product, user; assert Order entity saved with correct items |
| `updateStatus_validTransition_succeeds` | ORDER_PLACED → CONFIRMED → PREPARING; assert saved status |
| `updateStatus_invalidTransition_throws` | ORDER_PLACED → COMPLETED; assert BadRequestException |
| `cancelOrder_penaltyApplied_ifPreparing` | Mock order in PREPARING; cancel; assert CANCELLED + reason saved |

### 7.4 CartControllerIntegrationTest (MockMvc)

| Method | Description |
|---|---|
| `addToCart_authenticated_returns200` | POST `/api/cart/items` with valid JWT; assert 200 and cart response |
| `addToCart_unauthenticated_isRejected` | POST without JWT; assert 4xx (Spring Security blocks request) |
| `removeCartItem_existingItem_returns200` | DELETE `/api/cart/items/{id}`; assert 200 and updated cart |

---

## 8. Test Execution Commands

```bash
# Backend — from /backend
./mvnw compile                              # compile check only
./mvnw test                                 # all tests
./mvnw test -Dtest=ProductServiceTest       # single class
./mvnw test -Dtest=DeliveryServiceTest      # delivery fee tier tests
./mvnw test -Dtest=OrderServiceTest         # order service tests
./mvnw test -Dtest=CartControllerIntegrationTest  # MockMvc tests

# Frontend — from /web
npm run build                               # TypeScript + Vite build
npm run dev                                 # dev server for manual testing
```
