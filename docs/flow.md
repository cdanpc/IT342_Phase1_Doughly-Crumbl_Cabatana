# 🔄 FLOW.md — User & System Flows

> Reference this file to understand how users navigate the app and how data moves through the system.

---

## 1. Authentication Flow

### 1.1 Customer Registration
```
[Landing Page]
     ↓
[Click "Sign Up"]
     ↓
[Fill: name, email, password, confirm password]
     ↓
[POST /api/auth/register]
     ↓
Backend: validate → hash password → save user (role=CUSTOMER)
     ↓
[Return JWT token + user info]
     ↓
[Redirect → Product Listing Page]
```

### 1.2 Customer Login
```
[Login Page]
     ↓
[Fill: email, password]
     ↓
[POST /api/auth/login]
     ↓
Backend: validate credentials → issue JWT
     ↓
[Store token in memory / secure cookie]
     ↓
[Redirect → Product Listing Page]
```

### 1.3 Admin Login
```
Same as Customer Login
     ↓
[POST /api/auth/login]
     ↓
JWT payload includes role=ADMIN
     ↓
[Redirect → Admin Dashboard]
```

---

## 2. Customer Shopping Flow

### 2.1 Browse & Search Products
```
[Product Listing Page]
     ↓
[GET /api/products?search=&category=]
     ↓
[Display product cards: image, name, price, short description]
     ↓
[Click product → Product Detail Page]
     ↓
[GET /api/products/{id}]
```

### 2.2 Cart Management
```
[Product Detail Page]
     ↓
[Select quantity → Click "Add to Cart"]
     ↓
[POST /api/cart/items]  ← authenticated
     ↓
[Cart icon updates with item count]
     ↓
[Cart Page → GET /api/cart]
     ↓
Customer can:
  ├── Update quantity → [PUT /api/cart/items/{cartItemId}]
  └── Remove item    → [DELETE /api/cart/items/{cartItemId}]
```

### 2.3 Checkout & Order Placement
```
[Cart Page]
     ↓
[Click "Proceed to Checkout"]
     ↓
[Checkout Page]
     ↓
[Fill: delivery address, contact number, delivery notes (optional)]
     ↓
[Review order summary]
     ↓
[Click "Place Order"]
     ↓
[POST /api/orders]
     ↓
Backend:
  1. Validate cart is not empty
  2. Calculate total
  3. Create Order (status=PENDING)
  4. Create OrderItems from cart
  5. Clear cart
     ↓
[Order Confirmation Page — display order ID & summary]
```

### 2.4 Order History
```
[Profile / My Orders Page]
     ↓
[GET /api/orders/my-orders]
     ↓
[Display list: order ID, date, total, status]
     ↓
[Click order → GET /api/orders/{id}]
     ↓
[Display full order detail with items]
```

---

## 3. Admin Flow

### 3.1 Product Management
```
[Admin Dashboard → Products Tab]
     ↓
[GET /api/admin/products]
     ↓
Admin can:
  ├── Add product    → [POST /api/admin/products]
  ├── Edit product   → [PUT /api/admin/products/{id}]
  └── Delete product → [DELETE /api/admin/products/{id}]
```

### 3.2 Order Management
```
[Admin Dashboard → Orders Tab]
     ↓
[GET /api/admin/orders]
     ↓
Admin can:
  ├── View order detail → [GET /api/admin/orders/{id}]
  └── Update status     → [PUT /api/admin/orders/{id}/status]
       └── Status transitions:
            PENDING → CONFIRMED → PREPARING → READY → DELIVERED
            Any state → CANCELLED
```

---

## 4. Order Status State Machine

```
                ┌─────────────┐
                │   PENDING   │  ← Order placed by customer
                └──────┬──────┘
                       │ Admin confirms
                ┌──────▼──────┐
                │  CONFIRMED  │
                └──────┬──────┘
                       │ Admin starts prep
                ┌──────▼──────┐
                │  PREPARING  │
                └──────┬──────┘
                       │ Ready for pickup/delivery
                ┌──────▼──────┐
                │    READY    │
                └──────┬──────┘
                       │ Delivered
                ┌──────▼──────┐
                │  DELIVERED  │
                └─────────────┘

         ↕ Can cancel from any state except DELIVERED
                ┌─────────────┐
                │  CANCELLED  │
                └─────────────┘
```

---

## 5. Data Flow Summary

```
[Web/Mobile Client]
       │
       │ HTTPS + JWT Bearer Token
       ▼
[Spring Boot REST API]
       │
       ├── AuthController  → Spring Security / JWT
       ├── ProductController → ProductService → ProductRepository
       ├── CartController    → CartService    → CartRepository
       ├── OrderController   → OrderService   → OrderRepository
       └── AdminController   → (all services with ROLE_ADMIN check)
       │
       ▼
[PostgreSQL Database]
  Tables: users, products, carts, cart_items, orders, order_items
```

---

## 6. Authentication Guard Rules

| Route Pattern           | Access            |
|-------------------------|-------------------|
| `GET /api/products/**`  | Public            |
| `POST /api/auth/**`     | Public            |
| `GET /api/cart`         | CUSTOMER or ADMIN |
| `POST /api/orders`      | CUSTOMER          |
| `GET /api/orders/my-*`  | CUSTOMER          |
| `GET /api/admin/**`     | ADMIN only        |
| `POST /api/admin/**`    | ADMIN only        |
| `PUT /api/admin/**`     | ADMIN only        |
| `DELETE /api/admin/**`  | ADMIN only        |
