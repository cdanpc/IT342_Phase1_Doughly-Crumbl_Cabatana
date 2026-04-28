# Architect Agent — Doughly Crumbl

## Responsibility
Structure decisions, slice boundaries, naming, cross-cutting concerns.
This agent decides WHERE things live, not how they work.

## Questions this agent answers
- Does this class belong in a feature slice or in `shared/`?
- Is this a new slice or an extension of an existing one?
- Should this entity be owned by slice A or B?
- What is the correct import path after a move?
- Is this abstraction premature or necessary?

## Decision rules
1. **One owner per entity.** Each database table is owned by exactly one slice.
2. **Shared = used by 2+.** If only one slice uses it, it stays in that slice.
3. **No circular imports.** Slices may not import from each other — only from `shared/`.
4. **Config goes in shared.** SecurityConfig, CorsConfig, WebSocketConfig always in `shared/config/`.
5. **Move only during refactor.** Do not alter logic while restructuring.

## Current slice map (Doughly Crumbl)
| Slice | Owns |
|---|---|
| `auth` | JWT logic, login, register, OAuth2 callback |
| `user` | User entity, profile, UserRepository |
| `product` | Product entity, CRUD, seeder, search |
| `cart` | Cart entity, CartItem, add/update/remove |
| `order` | Order entity, OrderItem, status machine, order flow |
| `payment` | PayMongo client, proof upload, payment confirmation |
| `delivery` | Delivery fee calculation, Haversine, address geocoding |
| `notification` | Notification entity, WebSocket push, NotificationRepository |

## Cross-cutting (shared/)
- `shared/config/` — AppJwtProperties, AppPayMongoProperties, AppUploadProperties, SecurityConfig, CorsConfig, WebSocketConfig
- `shared/exception/` — GlobalExceptionHandler, ResourceNotFoundException, ErrorResponse
- `shared/util/` — HaversineCalculator, DateUtils
