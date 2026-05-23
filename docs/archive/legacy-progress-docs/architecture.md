# 🏗️ ARCHITECTURE.md — System Design Overview

> This file describes the high-level and component-level architecture of the Doughly Crumbl system.

---

## 1. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        CLIENTS                           │
│                                                          │
│   ┌─────────────────┐        ┌──────────────────────┐   │
│   │   Web Browser   │        │   Android Mobile App │   │
│   │ React 18 + Vite │        │ Kotlin + Jetpack     │   │
│   │ TypeScript 5.9  │        │ Compose + Material3  │   │
│   └────────┬────────┘        └──────────┬───────────┘   │
└────────────┼────────────────────────────┼───────────────┘
             │                            │
             │     HTTPS / REST API       │
             │     JWT Bearer Token       │
             ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot 3.5.0)             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │               Spring Security Layer                │  │
│  │  JWT Filter → AuthenticationProvider → Role Guard  │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │              REST Controllers Layer               │    │
│  │  AuthController | ProductController | CartCtrl   │    │
│  │  OrderController | AdminController               │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │               Service Layer                       │    │
│  │  AuthService | ProductService | CartService       │    │
│  │  OrderService | AdminService                      │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │          Repository Layer (Spring Data JPA)       │    │
│  │  UserRepo | ProductRepo | CartRepo | OrderRepo    │    │
│  └────────────────────┬─────────────────────────────┘    │
└───────────────────────┼──────────────────────────────────┘
                        │ JDBC / Hibernate
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
│  users | products | carts | cart_items                  │
│  orders | order_items                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture

### Layer Responsibilities

| Layer          | Package                          | Responsibility                                  |
|----------------|----------------------------------|-------------------------------------------------|
| Controller     | `com.doughlycrumbl.controller`   | Handle HTTP requests, input validation, routing |
| Service        | `com.doughlycrumbl.service`      | Business logic, transaction management          |
| Repository     | `com.doughlycrumbl.repository`   | Database CRUD via Spring Data JPA               |
| Model/Entity   | `com.doughlycrumbl.model`        | JPA entities mapped to DB tables                |
| DTO            | `com.doughlycrumbl.dto`          | Request/response transfer objects               |
| Security       | `com.doughlycrumbl.security`     | JWT, filters, user details service              |
| Exception      | `com.doughlycrumbl.exception`    | Global exception handler, custom exceptions     |
| Config         | `com.doughlycrumbl.config`       | Spring beans, security config, CORS config      |

### Recommended Package Structure
```
backend/src/main/java/com/doughlycrumbl/
├── config/
│   ├── SecurityConfig.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── CartController.java
│   ├── OrderController.java
│   └── admin/
│       └── AdminController.java
├── service/
│   ├── AuthService.java
│   ├── ProductService.java
│   ├── CartService.java
│   ├── OrderService.java
│   └── UserDetailsServiceImpl.java
├── repository/
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   ├── OrderRepository.java
│   └── OrderItemRepository.java
├── model/
│   ├── User.java
│   ├── Product.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   └── OrderItem.java
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── AddToCartRequest.java
│   │   ├── CheckoutRequest.java
│   │   └── ProductRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── ProductResponse.java
│       ├── CartResponse.java
│       └── OrderResponse.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthFilter.java
│   └── CustomUserDetails.java
└── exception/
    ├── GlobalExceptionHandler.java
    ├── ResourceNotFoundException.java
    └── UnauthorizedException.java
```

---

## 3. Web Frontend Architecture

### Structure
```
web/src/
├── api/                  # Axios instances & API call functions
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── productApi.ts
│   ├── cartApi.ts
│   └── orderApi.ts
├── components/           # Reusable UI components
│   ├── common/           # Button, Input, Modal, Navbar, etc.
│   └── product/          # ProductCard, ProductGrid, etc.
├── pages/                # Route-level page components
│   ├── HomePage.tsx
│   ├── ProductListPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrderConfirmationPage.tsx
│   ├── OrderHistoryPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminProducts.tsx
│       └── AdminOrders.tsx
├── store/                # Global state (Context API or Zustand)
│   ├── authStore.ts
│   └── cartStore.ts
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Helpers, formatters, constants
└── routes/               # React Router config + route guards
    └── AppRouter.tsx
```

---

## 4. Mobile Architecture (Android)

### Structure
```
mobile/app/src/main/java/com/doughlycrumbl/
├── data/
│   ├── remote/
│   │   ├── api/          # Retrofit interfaces
│   │   └── dto/          # Response data classes
│   ├── repository/       # Repository implementations
│   └── local/            # SharedPreferences for JWT
├── domain/
│   ├── model/            # Domain models
│   └── usecase/          # Use case classes
├── ui/
│   ├── theme/            # Material3 theme, colors, typography
│   ├── navigation/       # NavHost + routes
│   └── screens/
│       ├── auth/
│       ├── products/
│       ├── cart/
│       ├── checkout/
│       └── orders/
└── di/                   # Hilt dependency injection (if used)
```

---

## 5. Security Architecture

```
Request arrives
     │
     ▼
JwtAuthFilter
  ├── Extract Bearer token from Authorization header
  ├── Validate token (signature, expiry)
  ├── Load UserDetails from DB
  └── Set SecurityContext
     │
     ▼
Spring Security Filter Chain
  ├── Check route permissions (see flow.md §6)
  ├── ROLE_CUSTOMER routes → pass if role matches
  └── ROLE_ADMIN routes → reject with 403 if not admin
     │
     ▼
Controller
```

### JWT Token Structure
```json
{
  "sub": "user@email.com",
  "userId": 1,
  "role": "CUSTOMER",
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## 6. Vertical Slice Architecture (Target — refactor/vertical-slice-architecture)

The project is being refactored from a horizontal layer-based structure to
Vertical Slice Architecture (VSA). Each feature owns all its layers.

### Target Backend Structure
```
backend/src/main/java/edu/cit/cabatana/doughlycrumbl/
├── shared/
│   ├── config/          ← SecurityConfig, CorsConfig, WebSocketConfig,
│   │                       AppJwtProperties, AppPayMongoProperties,
│   │                       AppUploadProperties, AppOAuth2Properties
│   ├── exception/       ← GlobalExceptionHandler, ResourceNotFoundException,
│   │                       ErrorResponse
│   └── util/            ← HaversineCalculator, DateUtils
└── features/
    ├── auth/            ← AuthController, AuthService, JwtUtil,
    │                       AuthRequest, AuthResponse
    ├── user/            ← UserController, UserService, UserRepository,
    │                       User (entity), UserRequest, UserResponse
    ├── product/         ← ProductController, ProductService, ProductRepository,
    │                       Product (entity), ProductRequest, ProductResponse,
    │                       ProductDataSeeder
    ├── cart/            ← CartController, CartService, CartRepository,
    │                       Cart (entity), CartItem (entity),
    │                       CartRequest, CartResponse
    ├── order/           ← OrderController, OrderService, OrderRepository,
    │                       Order (entity), OrderItem (entity), OrderStatus (enum),
    │                       OrderRequest, OrderResponse
    ├── payment/         ← PaymentController, PaymentService, PayMongoClient,
    │                       PaymentRequest, PaymentResponse
    ├── delivery/        ← DeliveryController, DeliveryService,
    │                       DeliveryFeeCalculator, DeliveryRequest, DeliveryResponse
    └── notification/    ← NotificationController, NotificationService,
                            NotificationRepository, Notification (entity),
                            NotificationResponse, WebSocketNotificationObserver
```

### Target Frontend Structure
```
web/src/
├── shared/
│   ├── components/      ← Button, Input, Badge, Avatar, Modal (used by 2+ features)
│   ├── hooks/           ← useAuth, useCart, useOrders
│   ├── utils/           ← formatPrice, formatDate, apiClient
│   ├── constants/       ← design tokens, API base URL, delivery tiers
│   └── types/           ← TypeScript interfaces shared across features
├── features/
│   ├── menu/            ← MenuPage, ProductCard, ProductGrid,
│   │                       CategoryFilter, HeroBanner
│   ├── cart/            ← OrderBag, OrderBagItem, CartSummary
│   ├── checkout/        ← CheckoutModal, FulfillmentToggle,
│   │                       AddressInput, PaymentMethodSelector
│   ├── orders/          ← MyOrdersPage, OrderCard, OrderDetailDrawer,
│   │                       OrderStatusBadge, OrderTimeline
│   ├── auth/            ← LoginPage, RegisterPage
│   └── profile/         ← ProfilePage
└── layout/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── AppLayout.tsx
```

### VSA Rules
- Each slice imports only from its own folder or from `shared/`
- No cross-slice imports (feature A never imports from feature B)
- Entity ownership: one slice owns each database table
- Shared = used by 2 or more slices

---

## 7. API Communication

- All API calls use **JSON** (`Content-Type: application/json`)
- Authentication via **Bearer Token** in `Authorization` header
- Base URL: `http://localhost:8080/api` (dev) — update for production
- Standard HTTP status codes used (200, 201, 400, 401, 403, 404, 500)
- All error responses follow the format:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 5",
  "timestamp": "2025-01-01T12:00:00"
}
```
