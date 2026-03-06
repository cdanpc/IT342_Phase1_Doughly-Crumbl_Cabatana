# 🤖 AI CONTEXT PROMPT — Doughly Crumbl Ordering System

> **Read this file first before assisting with any code, feature, or task in this project.**
> This is the master context file that orients AI assistants to the full project scope.

---

## 🧁 Project Identity

| Field           | Detail                                      |
|----------------|----------------------------------------------|
| **Project Name**| Doughly Crumbl – Official Ordering Website   |
| **Domain**      | E-commerce / Food & Beverage                 |
| **Type**        | Full-stack Web + Mobile Ordering System      |
| **Status**      | In Development                               |
| **Backend**     | Spring Boot 3.5.0 / Java 17                  |
| **Web**         | React 18 / TypeScript 5.9 / Vite 7           |

---

## 🎯 Problem We Are Solving

Doughly Crumbl currently takes orders via **direct messages and informal channels**, causing:
- Order miscommunication and missing details
- No structured order tracking
- Poor scalability and unprofessional workflow

**The solution** is a full ordering system: customers browse products, place orders, and admins manage everything through a proper panel.

---

## 👥 User Roles

| Role       | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `CUSTOMER` | Registers, browses products, manages cart, places orders, views order history |
| `ADMIN`    | Manages products (CRUD), views and updates all orders, manages users        |

---

## 🗂️ Repository Structure

```
doughly-crumbl/
├── backend/          # Java 17 + Spring Boot 4.0.3
├── web/              # React 19 + TypeScript 5.9 + Vite 7
├── mobile/           # Android Kotlin 1.9 + Jetpack Compose
├── prompt.md         # ← YOU ARE HERE (AI context)
├── flow.md           # User & system flows
├── architecture.md   # System architecture overview
├── api.md            # Full API contract reference
├── database.md       # PostgreSQL schema & ERD notes
├── conventions.md    # Code style & naming conventions per stack
└── tasks.md          # Sprint tasks & feature tracker
```

---

## ⚙️ Tech Stack — At a Glance

### Backend (`/backend`)
- **Language:** Java 17
- **Framework:** Spring Boot 3.5.0 (Maven)
- **ORM:** Spring Data JPA
- **Security:** Spring Security + OAuth2 Client
- **Database:** PostgreSQL
- **Utilities:** Lombok, Spring Validation, Spring Web MVC

### Web Frontend (`/web`)
- **Library:** React 18
- **Language:** TypeScript 5.9
- **Bundler:** Vite 7
- **Styling:** TBD (follow `conventions.md`)

### Mobile (`/mobile`)
- **Platform:** Android
- **Language:** Kotlin 1.9
- **UI:** Jetpack Compose + Material3
- **Build:** Gradle

---

## ✅ Features IN SCOPE

- User registration and authentication (email/password)
- Pastry product listing with search functionality
- Shopping cart management (add, remove, update quantities)
- Checkout process with delivery information
- Order placement with confirmation
- Admin panel for product and order management
- Responsive web interface
- PostgreSQL relational database

## ❌ Features OUT OF SCOPE (Do NOT implement)

- Real payment gateway integration
- Product reviews and ratings
- Automated inventory forecasting
- Email notification system
- Social media login
- Push notifications
- Advanced analytics dashboard

---

## 🧠 AI Assistant Rules

When helping with this project, always:

1. **Check the relevant doc first** — refer to `api.md` for endpoints, `database.md` for schema, `flow.md` for logic flows.
2. **Respect the tech stack** — do not suggest alternative frameworks or languages unless explicitly asked.
3. **Stay in scope** — do not implement or suggest out-of-scope features listed above.
4. **Follow conventions** — naming, structure, and patterns are defined in `conventions.md`.
5. **Use the correct module** — always confirm whether a task belongs to `backend/`, `web/`, or `mobile/` before writing code.
6. **Preserve existing patterns** — when editing code, match the style of the surrounding code.
7. **Database changes require migration** — any schema changes must include a SQL migration script.
8. **Security is enforced on the backend** — never trust frontend-only validation; backend must always validate and authorize.

---

## 🔗 Key Reference Files

| What you need             | File to read         |
|---------------------------|----------------------|
| User journeys & app flows | `flow.md`            |
| System & component design | `architecture.md`    |
| REST API endpoints        | `api.md`             |
| DB tables & relationships | `database.md`        |
| Code style rules          | `conventions.md`     |
| Current tasks & progress  | `tasks.md`           |
