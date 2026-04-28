# ADR-001: Adopt Vertical Slice Architecture

**Date:** April 28, 2026
**Status:** Accepted
**Branch:** refactor/vertical-slice-architecture

---

## Context

The Doughly Crumbl backend was originally structured using a horizontal layer-based
architecture: `controller/`, `service/`, `repository/`, `model/`, `dto/`. As the
feature set grew (auth, products, cart, orders, payment, delivery, notifications),
navigating across layers to trace a single feature became cumbersome. Adding a new
feature required touching 5–6 different directories simultaneously.

The frontend had a similar issue: all pages in `pages/`, all components in
`components/`, with no clear ownership boundaries per feature.

---

## Decision

Refactor both backend and frontend to **Vertical Slice Architecture (VSA)**:
- Each feature owns all its layers in a single folder
- Cross-cutting concerns (security, exceptions, config, shared utils) live in `shared/`
- No cross-slice imports — slices only import from `shared/`

---

## Target Package (Backend)
```
features/auth/     features/product/  features/cart/
features/order/    features/payment/  features/delivery/
features/user/     features/notification/
shared/config/     shared/exception/  shared/util/
```

## Target Package (Frontend)
```
features/menu/     features/cart/     features/checkout/
features/orders/   features/auth/     features/profile/
shared/components/ shared/hooks/      shared/utils/
layout/
```

---

## Consequences

**Positive:**
- Feature-first navigation: all files for a feature are co-located
- Easier to add, remove, or replace a feature without touching unrelated code
- Reduces merge conflicts between team members working on different features
- Aligns with the graded submission requirement for VSA demonstration

**Negative:**
- One-time migration cost: all import paths must be updated
- Compile check required after each file move
- Entities referenced by multiple features (e.g. `User` in `Order`) require
  discipline — reference via JPA, never copy the entity

---

## Migration approach
- Move one slice at a time (see `.claude/workflows/refactor-slice.md`)
- Run `./mvnw compile` after each backend slice
- Run `npm run build` after each frontend slice
- Commit after each slice is moved and compiling
