# Software Test Plan — Doughly Crumbl

**Project:** Doughly Crumbl — Artisan Bakery Web Application
**Group:** G5 — Cabatana
**Branch:** refactor/vertical-slice-architecture
**Version:** 1.0
**Date:** April 28, 2026

> Full content populated in Part 5 of the vertical slice refactoring session.
> Structure defined here; test cases to be written after VSA refactor is complete.

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

> To be populated in Part 5 of the refactoring session.

---

## 7. Automated Test Cases

> To be populated in Part 7 of the refactoring session.

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
