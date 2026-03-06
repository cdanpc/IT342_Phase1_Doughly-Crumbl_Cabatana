# 🍪 Doughly Crumbl — Freshly Baked Happiness

> A full-stack ordering system for a bakery/pastry business, built as a group project for **IT342 — Integrative Programming and Technologies**.

---

## 📌 Project Overview

**Doughly Crumbl** is an e-commerce ordering platform that replaces informal DM-based ordering with a structured system where customers can browse pastry products, manage a shopping cart, place delivery orders, and track order history — while admins manage products and fulfill orders through a dedicated panel.

| Field            | Detail                                             |
|------------------|----------------------------------------------------|
| **Course**       | IT342 — Integrative Programming and Technologies   |
| **Group**        | Group 5 — Cabatana                                 |
| **Domain**       | E-commerce / Food & Beverage                       |
| **Status**       | Phase 1 Complete (Backend + Web Frontend)           |

---

## 🛠️ Tech Stack

| Layer       | Technology                                           |
|-------------|------------------------------------------------------|
| **Backend** | Java 17, Spring Boot 3.5.0, Spring Security, JWT, Spring Data JPA |
| **Database**| PostgreSQL (hosted on Supabase)                      |
| **Web**     | React 18, TypeScript 5.9, Vite 7                    |
| **Mobile**  | Android — Kotlin 1.9, Jetpack Compose *(planned)*   |

### Key Libraries

- **Backend:** Lombok, jjwt 0.12.6, BCrypt, HikariCP
- **Web:** React Router DOM 7, Axios, Lucide React (icons), React Hot Toast

---

## 📁 Repository Structure

```
├── backend/        → Spring Boot REST API (Maven)
├── web/            → React + TypeScript SPA (Vite)
├── mobile/         → Android app scaffold (Gradle)
├── docs/           → Project documentation
│   ├── api.md          API endpoint reference
│   ├── architecture.md System design & component overview
│   ├── conventions.md  Code style & naming rules
│   ├── database.md     PostgreSQL schema & ERD
│   ├── flow.md         User journeys & system flows
│   ├── prompt.md       AI assistant context
│   ├── setup.md        Environment setup guide
│   ├── tasks.md        Development task tracker
│   └── wireframes.md   UI wireframe specifications
└── README.md       → You are here
```

---

## 👥 User Roles

| Role         | Capabilities                                                              |
|--------------|---------------------------------------------------------------------------|
| **CUSTOMER** | Register, login, browse products, search/filter, manage cart, place orders, view order history |
| **ADMIN**    | All customer abilities + manage products (CRUD), view all orders, update order status |

---

## ✅ Features Implemented

### Backend (Spring Boot)
- JWT-based authentication (register / login)
- Product catalog with search, category filter, and pagination
- Shopping cart with add, update quantity, remove, and clear
- Order placement (built from cart with delivery info)
- Order history and detail views (customer-scoped)
- Admin endpoints: product CRUD, order listing with status filter, order status updates
- Role-based access control (`CUSTOMER` / `ADMIN`)
- CORS configuration for web and mobile clients
- Global exception handling with structured error responses

### Web Frontend (React)
- **Landing Page** — hero section with CTAs
- **Register / Login** — form validation, JWT token storage, role-based redirect
- **Menu Page** — product grid with hero banner, category dropdown filter, search, skeleton loading
- **Shopping Cart** — persistent side panel with quantity controls and order summary
- **Checkout** — delivery form (address, phone, notes), order placement
- **Order History** — list view with status badges, detail view with item breakdown
- **Admin Dashboard** — stats overview (product/order counts)
- **Admin Products** — table with search, create/edit modal, delete confirmation
- **Admin Orders** — table with status filter pills, detail view with status progression and cancellation
- **App Layout** — sidebar navigation (role-aware), header with search and cart badge

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Maven (included via `mvnw` wrapper)

### Backend

```bash
cd backend
# Copy the example config and fill in your credentials:
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your DB URL, username, password, and JWT secret

# Run the server (port 8080):
./mvnw spring-boot:run
```

### Web Frontend

```bash
cd web
npm install
npm run dev        # Dev server on http://localhost:5173
npm run build      # Production build
```

---

## 🔑 Environment Configuration

The backend requires an `application.properties` file (excluded from version control for security). Copy the template and fill in your values:

```properties
# Database
spring.datasource.url=jdbc:postgresql://YOUR_HOST:5432/postgres
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JWT
app.jwt.secret=YOUR_SECRET_KEY_MIN_32_CHARACTERS
app.jwt.expiration-ms=86400000
```

---

## 📊 Progress

| Module          | Status          |
|-----------------|-----------------|
| Backend API     | ✅ Complete      |
| Web Frontend    | ✅ Complete      |
| Mobile App      | ⬜ Not started   |
| Unit Tests      | ⬜ Not started   |

See [docs/tasks.md](docs/tasks.md) for the full task tracker.

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api.md) | All REST endpoints with request/response formats |
| [Architecture](docs/architecture.md) | System design, component diagram, tech decisions |
| [Database Schema](docs/database.md) | Table definitions, relationships, ERD notes |
| [User Flows](docs/flow.md) | Customer and admin journey diagrams |
| [Conventions](docs/conventions.md) | Naming, structure, and coding style rules |
| [Setup Guide](docs/setup.md) | Step-by-step environment setup |
| [Wireframes](docs/wireframes.md) | UI specifications with CSS values |
| [Task Tracker](docs/tasks.md) | Sprint progress and completion status |
