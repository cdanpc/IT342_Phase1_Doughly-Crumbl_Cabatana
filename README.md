# Doughly Crumbl — Freshly Baked Happiness

> A full-stack ordering system for a bakery/pastry business, built as a group project for **IT342 — Integrative Programming and Technologies**.

---

## Project Overview

**Doughly Crumbl** is an e-commerce ordering platform that replaces informal DM-based ordering with a structured system where customers can browse pastry products, manage a shopping cart, place delivery or pickup orders, and track order history — while admins manage products and fulfill orders through a dedicated panel available on both web and mobile.

| Field        | Detail                                           |
|--------------|--------------------------------------------------|
| **Course**   | IT342 — Integrative Programming and Technologies |
| **Group**    | Group 5 — Cabatana                               |
| **Domain**   | E-commerce / Food & Beverage                     |
| **Store**    | Don Gil Garcia St., Capitol Site, Cebu City      |
| **Status**   | Phase 1 Complete — Backend + Web + Mobile        |

---

## Tech Stack

| Layer        | Technology                                                              |
|--------------|-------------------------------------------------------------------------|
| **Backend**  | Java 17, Spring Boot 3.5, Spring Security, JWT, Spring Data JPA, Hibernate |
| **Database** | PostgreSQL (hosted on Supabase)                                         |
| **Web**      | React 18, TypeScript 5.9, Vite 7, React Router DOM 7, Axios            |
| **Mobile**   | Android — Kotlin, View-based XML layouts, Retrofit, MVVM, LiveData      |

### Key Libraries

**Backend:** Lombok, jjwt 0.12.6, BCrypt, HikariCP

**Web:** Lucide React (icons), React Hot Toast, plain CSS (no UI framework)

**Mobile:** Retrofit 2, OkHttp, Material Components 3, EncryptedSharedPreferences, Glide

---

## Repository Structure

```
├── backend/         Spring Boot REST API (Maven)
├── web/             React + TypeScript SPA (Vite)
├── mobile/          Android app (Kotlin, View-based XML, Gradle)
├── docs/            Project documentation
│   ├── MASTER.md        Gate rules and handoff schema
│   ├── tasks.md         Full AC list with Given/When/Then specs
│   ├── data-models.md   Single source of truth for entity shapes
│   └── ...
├── images/          Brand assets (logos, QR codes)
└── README.md
```

---

## User Roles

| Role         | Capabilities                                                                                     |
|--------------|--------------------------------------------------------------------------------------------------|
| **CUSTOMER** | Register, login, browse products, search/filter by category, manage cart, place delivery/pickup orders, track order history, submit payment proof, cancel orders, reorder |
| **ADMIN**    | All customer abilities + manage products (CRUD), view all orders, update order status, quote delivery fees, confirm payments, cancel with reason |

---

## Features Implemented

### Backend (Spring Boot)

- JWT-based authentication — register, login, role-based access control (`CUSTOMER` / `ADMIN`)
- Product catalog — search, category filter, pagination
- Shopping cart — add, update quantity, remove, clear; persisted per user
- Order placement — built from cart, supports delivery and pickup fulfillment types
- Delivery fee quoting — admin sets fee, customer is notified
- Payment proof upload — customer uploads image, admin confirms
- Order status machine — `ORDER_PLACED → CONFIRMED → PREPARING → READY/OUT_FOR_DELIVERY → COMPLETED`, with `CANCELLED` available from most states
- Order history — customer-scoped list and detail endpoints
- Admin endpoints — product CRUD, all-orders listing with status filter, status updates, cancellation with reason
- Notification system — persisted per-user notifications on key order events
- Reorder endpoint — re-adds a completed order's items to the active cart
- File upload — proof of payment images stored on server
- Global exception handling — structured error responses
- CORS configuration — allows web (`localhost:5173`) and mobile clients
- **42 passing unit + integration tests**

### Web Frontend (React + TypeScript)

- **Landing Page** — hero section with brand identity and CTAs
- **Auth** — register and login with form validation, JWT storage, role-based redirect
- **Menu Page** — category rail (pill navigation), product grid (5 columns / 4 with panel open), search, skeleton loading
- **Shopping Cart** — persistent right-side order panel with quantity controls, order summary, and checkout trigger
- **Checkout** — delivery/pickup toggle, address fields, payment method selection, order placement
- **Order History** — card list with shortened status badges (Getting Quote, Payment Due, Confirming, On the Way), 30s auto-refresh for active orders
- **Order Detail** — status timeline, payment proof upload modal, cancellation, reorder
- **Payment Instructions** — QR codes and account details for GCash, Maya, BPI
- **Admin Dashboard** — stats overview (product/order counts, recent activity)
- **Admin Products** — full CRUD with create/edit modal and delete confirmation
- **Admin Orders** — table with status filter, detail view with delivery fee quoting, payment confirmation, status advancement, and override
- **About Page** — bakery info, order flow walkthrough (6-step process), care guide link
- **App Layout** — role-aware sidebar, icon-only cart button with live badge, brand logo in header

### Mobile App (Android — Kotlin)

- **Splash Screen** — branded entry with session-aware redirect
- **Auth** — login and register screens with validation and JWT session management
- **Home / Menu** — hero banner, horizontal category chips, product grid with skeleton loading, search
- **Cart** — item list with quantity controls, subtotal, checkout button
- **Checkout** — delivery/pickup toggle, address fields, payment selector, order placement
- **Orders** — list with status badges (short labels, single-line, never wrap), pull-to-refresh
- **Order Detail** — status banner, 5-step timeline, item breakdown, cancel, reorder
- **Notifications** — per-user notification list with unread badge on nav tab; tap navigates to relevant order
- **Profile** — account info, order stats (completed/cancelled counts), sign out
- **Admin Shell** — separate admin activity with bottom nav for Dashboard, Products, Orders
- **Admin Dashboard** — order counts by status, revenue summary
- **Admin Products** — list with image, add/edit/delete
- **Admin Orders** — list with status and payment chips, filter
- **Admin Order Detail** — status advancement buttons, delivery fee input, cancellation
- **Security** — `EncryptedSharedPreferences` for JWT storage; `AuthInterceptor` auto-clears session on 401

---

## Order Status Labels

| Status Code                             | Badge Label    |
|-----------------------------------------|----------------|
| ORDER_PLACED                            | Order Placed   |
| AWAITING_DELIVERY_QUOTE                 | Getting Quote  |
| DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED    | Payment Due    |
| PAYMENT_SUBMITTED_AWAITING_CONFIRMATION | Confirming     |
| PAYMENT_CONFIRMED                       | Payment Confirmed |
| PREPARING                               | Preparing      |
| OUT_FOR_DELIVERY                        | On the Way     |
| READY                                   | Ready          |
| COMPLETED                               | Completed      |
| CANCELLED                               | Cancelled      |

Hovering a badge on desktop shows the full status description as a tooltip.

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Android Studio (Hedgehog or later) for mobile
- PostgreSQL database (or Supabase account)
- Maven (included via `mvnw` wrapper)

### Backend

```bash
cd backend
# Copy the example config and fill in your credentials:
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit with your DB URL, credentials, and JWT secret

./mvnw spring-boot:run        # Starts on port 8080
./mvnw test                   # Run all 42 tests
```

### Web Frontend

```bash
cd web
npm install
npm run dev        # Dev server on http://localhost:5173
npm run build      # TypeScript check + production build
```

### Mobile

Open `mobile/` in Android Studio, sync Gradle, then run on an emulator or physical device.

> **Physical device:** update `BASE_URL` in `RetrofitClient.kt` to your machine's local IP (e.g. `192.168.x.x:8080`) and ensure both device and laptop are on the same Wi-Fi network.

---

## Environment Configuration

The backend requires an `application.properties` file (excluded from version control). Copy the template and fill in your values:

```properties
# Database
spring.datasource.url=jdbc:postgresql://YOUR_HOST:5432/postgres
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JWT
app.jwt.secret=YOUR_SECRET_KEY_MIN_32_CHARACTERS
app.jwt.expiration-ms=86400000

# File uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## Progress

| Module              | Status           |
|---------------------|------------------|
| Backend API         | Complete         |
| Backend Tests       | 42 passing       |
| Web Frontend        | Complete         |
| Android Mobile App  | Complete         |

---

## Team

| Name                  | Role                        |
|-----------------------|-----------------------------|
| Chris Daniel Cabataña | Lead Developer               |
| Briana Sophia Capuno  | Developer / UI               |
