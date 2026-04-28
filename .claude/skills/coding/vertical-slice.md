# Vertical Slice Architecture Rules — Doughly Crumbl

## Core principle
Each feature owns all its layers: controller, service, repository, entity, DTOs.
Cross-cutting concerns (security, exceptions, config) live in `shared/`.

## Backend slice structure
```
features/<slice>/
├── <Slice>Controller.java     ← REST endpoints
├── <Slice>Service.java        ← Business logic
├── <Slice>Repository.java     ← JPA repository interface
├── <Slice>.java               ← Entity (if this slice owns the table)
├── <Slice>Request.java        ← Incoming DTO
└── <Slice>Response.java       ← Outgoing DTO
```

## What belongs in shared/
- `shared/config/` — SecurityConfig, CorsConfig, WebSocketConfig, @ConfigurationProperties classes
- `shared/exception/` — GlobalExceptionHandler, ResourceNotFoundException, ErrorResponse
- `shared/util/` — HaversineCalculator, DateUtils, any utility with no feature affinity

## Rule: if used by 2+ slices → shared/
If a class is imported by more than one feature package, move it to `shared/`.
Entities referenced by multiple features (e.g. `User` referenced in `Order`) stay in their
own slice (`user/`) — other slices hold a JPA reference, not a copy.

## Frontend slice structure
```
features/<slice>/
├── <Slice>Page.tsx            ← Page-level component (routed)
├── <SubComponent>.tsx         ← Feature-specific sub-components
└── <SubComponent>.css         ← Co-located styles
```

## What belongs in shared/
- `shared/components/` — Button, Input, Badge, Avatar, Modal (used by 2+ features)
- `shared/hooks/` — useAuth, useCart, useOrders
- `shared/utils/` — formatPrice, formatDate, apiClient
- `shared/constants/` — design tokens, API base URL, delivery tier values
- `shared/types/` — TypeScript interfaces shared across features

## Naming conventions
| Item | Convention | Example |
|---|---|---|
| Backend slice folder | lowercase | `order`, `cart`, `auth` |
| Backend class | PascalCase + role suffix | `OrderService`, `OrderController` |
| Frontend slice folder | lowercase | `orders`, `cart`, `menu` |
| Frontend component | PascalCase | `OrderCard`, `CartSummary` |
| Frontend page | PascalCase + Page | `MenuPage`, `CheckoutPage` |

## Move-only rule during refactor
When moving files into slices, do NOT rewrite business logic.
Move the file, fix the import paths, compile/build, commit.
Logic rewrites are separate PRs.

## Import path rule
After moving, all imports must use the new path.
Run `./mvnw compile` (backend) or `npm run build` (frontend) after every slice moved.
Zero errors before moving the next slice.
