# Recurring Code Patterns — Doughly Crumbl

## Backend

### Service → Controller flow
- Service returns DTO (never entity)
- Controller is thin: validate input, call service, return ResponseEntity
- Never call repository directly from controller

### Adapter usage
- `ProductAdapter.toDto(Product)` maps entity → `ProductResponse`
- `OrderAdapter` maps `Order` → `OrderResponse`
- Always use the adapter — never inline the mapping in the service

### Exception handling
- Throw `ResourceNotFoundException("Product", id)` for missing entities
- `GlobalExceptionHandler` catches and maps to proper HTTP status
- Never return null — throw or return Optional

### @ConfigurationProperties pattern
- Every `app.*` property in `application.properties` must have a matching class in `config/properties/`
- `AppJwtProperties`, `AppPayMongoProperties`, `AppUploadProperties`, `AppOAuth2Properties`
- Register with `@EnableConfigurationProperties` in the main class

### Repository queries
- Custom JPQL lives in the repository interface with `@Query`
- `findAllAvailable(category, pageable)` in `ProductRepository` uses `@Query`
- Avoid `findAll()` on large tables — always paginate

## Frontend

### API calls
- All HTTP calls go through `axiosInstance.ts` (base URL + JWT interceptor)
- Feature-specific API files: `productApi.ts`, `orderApi.ts`, `notificationApi.ts`
- Never use `fetch()` directly

### State management
- `AuthContext` — current user, token, login/logout
- `CartContext` — cart items, add/update/remove, persisted in localStorage
- `NotificationContext` — real-time WebSocket notifications

### Component structure
- Pages live in `pages/` (or `features/<name>/` after VSA refactor)
- Shared layout: `Sidebar`, `Header`, `AppLayout`, `OrderPanel`
- Lucide icons only: `import { IconName } from 'lucide-react'`

### Routing
- Routes defined in `AppRouter.tsx`
- `ProtectedRoute` wraps customer routes (requires auth)
- `GuestRoute` wraps login/register (redirect if already logged in)
- `requireAdmin` prop on `ProtectedRoute` for admin-only pages
