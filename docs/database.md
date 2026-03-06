# 🗄️ DATABASE.md — PostgreSQL Schema Reference

> All table definitions, relationships, and constraints for the Doughly Crumbl system.
> Database: PostgreSQL | ORM: Spring Data JPA / Hibernate

---

## Entity Relationship Overview

```
users
  │
  ├── (1) ──────── (1) carts
  │                     │
  │                     └── (1) ──── (many) cart_items
  │                                        │
  └── (1) ──────── (many) orders            └── (FK) products
                         │
                         └── (1) ──── (many) order_items
                                             │
                                             └── (FK) products
```

---

## Table: `users`

| Column       | Type          | Constraints                   | Description           |
|--------------|---------------|-------------------------------|-----------------------|
| `id`         | BIGSERIAL     | PRIMARY KEY                   | Auto-increment ID     |
| `name`       | VARCHAR(100)  | NOT NULL                      | Full display name     |
| `email`      | VARCHAR(150)  | NOT NULL, UNIQUE              | Login email           |
| `password`   | VARCHAR(255)  | NOT NULL                      | BCrypt hashed         |
| `role`       | VARCHAR(20)   | NOT NULL, DEFAULT 'CUSTOMER'  | CUSTOMER or ADMIN     |
| `created_at` | TIMESTAMP     | DEFAULT NOW()                 | Account creation time |

```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

## Table: `products`

| Column        | Type          | Constraints       | Description                   |
|---------------|---------------|-------------------|-------------------------------|
| `id`          | BIGSERIAL     | PRIMARY KEY       | Auto-increment ID             |
| `name`        | VARCHAR(150)  | NOT NULL          | Product name                  |
| `description` | TEXT          |                   | Product description           |
| `price`       | NUMERIC(10,2) | NOT NULL          | Price in PHP                  |
| `image_url`   | VARCHAR(500)  |                   | Image path or URL             |
| `category`    | VARCHAR(50)   |                   | Product category label        |
| `available`   | BOOLEAN       | DEFAULT TRUE      | Whether product is listed     |
| `created_at`  | TIMESTAMP     | DEFAULT NOW()     | Creation timestamp            |
| `updated_at`  | TIMESTAMP     | DEFAULT NOW()     | Last updated timestamp        |

```sql
CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)   NOT NULL,
    description TEXT,
    price       NUMERIC(10,2)  NOT NULL,
    image_url   VARCHAR(500),
    category    VARCHAR(50),
    available   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

---

## Table: `carts`

| Column       | Type      | Constraints          | Description              |
|--------------|-----------|----------------------|--------------------------|
| `id`         | BIGSERIAL | PRIMARY KEY          | Auto-increment ID        |
| `user_id`    | BIGINT    | FK → users(id), UNIQUE | One cart per user      |
| `created_at` | TIMESTAMP | DEFAULT NOW()        | Creation timestamp       |

```sql
CREATE TABLE carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Table: `cart_items`

| Column       | Type          | Constraints              | Description          |
|--------------|---------------|--------------------------|----------------------|
| `id`         | BIGSERIAL     | PRIMARY KEY              | Auto-increment ID    |
| `cart_id`    | BIGINT        | FK → carts(id)           | Parent cart          |
| `product_id` | BIGINT        | FK → products(id)        | Product reference    |
| `quantity`   | INT           | NOT NULL, CHECK > 0      | Quantity ordered     |
| `added_at`   | TIMESTAMP     | DEFAULT NOW()            | When item was added  |

```sql
CREATE TABLE cart_items (
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT    NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT    NOT NULL REFERENCES products(id),
    quantity   INT       NOT NULL CHECK (quantity > 0),
    added_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);
```

---

## Table: `orders`

| Column            | Type          | Constraints          | Description                      |
|-------------------|---------------|----------------------|----------------------------------|
| `id`              | BIGSERIAL     | PRIMARY KEY          | Auto-increment ID                |
| `user_id`         | BIGINT        | FK → users(id)       | Customer who placed the order    |
| `status`          | VARCHAR(20)   | NOT NULL             | See order status enum below      |
| `delivery_address`| TEXT          | NOT NULL             | Delivery address string          |
| `contact_number`  | VARCHAR(20)   | NOT NULL             | Customer contact                 |
| `delivery_notes`  | TEXT          |                      | Optional delivery instructions   |
| `total_amount`    | NUMERIC(10,2) | NOT NULL             | Order total at time of placement |
| `order_date`      | TIMESTAMP     | DEFAULT NOW()        | When order was placed            |
| `updated_at`      | TIMESTAMP     | DEFAULT NOW()        | Last status update               |

**Order Status Enum Values:** `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`

```sql
CREATE TABLE orders (
    id               BIGSERIAL      PRIMARY KEY,
    user_id          BIGINT         NOT NULL REFERENCES users(id),
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    delivery_address TEXT           NOT NULL,
    contact_number   VARCHAR(20)    NOT NULL,
    delivery_notes   TEXT,
    total_amount     NUMERIC(10,2)  NOT NULL,
    order_date       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

---

## Table: `order_items`

| Column       | Type          | Constraints           | Description                    |
|--------------|---------------|-----------------------|--------------------------------|
| `id`         | BIGSERIAL     | PRIMARY KEY           | Auto-increment ID              |
| `order_id`   | BIGINT        | FK → orders(id)       | Parent order                   |
| `product_id` | BIGINT        | FK → products(id)     | Product snapshot reference     |
| `product_name`| VARCHAR(150) | NOT NULL              | Snapshot of name at order time |
| `unit_price` | NUMERIC(10,2) | NOT NULL              | Snapshot of price at order time|
| `quantity`   | INT           | NOT NULL, CHECK > 0   | Quantity ordered               |
| `subtotal`   | NUMERIC(10,2) | NOT NULL              | unit_price × quantity          |

> ⚠️ `product_name` and `unit_price` are stored as **snapshots** to preserve order history even if the product is later edited or deleted.

```sql
CREATE TABLE order_items (
    id           BIGSERIAL      PRIMARY KEY,
    order_id     BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   BIGINT         REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150)   NOT NULL,
    unit_price   NUMERIC(10,2)  NOT NULL,
    quantity     INT            NOT NULL CHECK (quantity > 0),
    subtotal     NUMERIC(10,2)  NOT NULL
);
```

---

## Indexes

```sql
-- Speed up product search
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_category ON products(category);

-- Speed up order lookups by user
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Speed up cart item lookups
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

---

## Notes

- All monetary values use `NUMERIC(10,2)` — avoid `FLOAT` for currency.
- Passwords are **always BCrypt hashed** before storage.
- Order items snapshot `product_name` and `unit_price` to protect order history integrity.
- Cart is auto-created when a user registers (or lazily on first add-to-cart).
- Cascade deletes: deleting a user removes their cart; deleting a cart removes cart items; deleting an order removes order items.
