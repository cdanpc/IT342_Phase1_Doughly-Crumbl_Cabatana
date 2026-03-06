# 📡 API.md — REST API Contract Reference

> All endpoints, request bodies, and response shapes for the Doughly Crumbl backend.
> Base URL: `/api`

---

## Auth Endpoints

### POST `/api/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@email.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "name": "Jane Doe",
  "email": "jane@email.com",
  "role": "CUSTOMER"
}
```

---

### POST `/api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "jane@email.com",
  "password": "securepassword123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "name": "Jane Doe",
  "email": "jane@email.com",
  "role": "CUSTOMER"
}
```

**Error `401`:** Invalid credentials.

---

## Product Endpoints

### GET `/api/products`
Get all products. Supports search and category filter. **Public.**

**Query Params:**
| Param      | Type   | Required | Description               |
|------------|--------|----------|---------------------------|
| `search`   | string | No       | Search by name/description|
| `category` | string | No       | Filter by category        |
| `page`     | int    | No       | Page number (default: 0)  |
| `size`     | int    | No       | Page size (default: 12)   |

**Response `200`:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Classic Chocolate Chip",
      "description": "Our signature cookie with rich chocolate chips.",
      "price": 85.00,
      "imageUrl": "/images/choc-chip.jpg",
      "category": "CLASSIC",
      "available": true
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "currentPage": 0
}
```

---

### GET `/api/products/{id}`
Get single product detail. **Public.**

**Response `200`:**
```json
{
  "id": 1,
  "name": "Classic Chocolate Chip",
  "description": "Full product description here...",
  "price": 85.00,
  "imageUrl": "/images/choc-chip.jpg",
  "category": "CLASSIC",
  "available": true
}
```

---

## Cart Endpoints

> All cart endpoints require `Authorization: Bearer <token>` header.

### GET `/api/cart`
Get current user's cart.

**Response `200`:**
```json
{
  "cartId": 1,
  "items": [
    {
      "cartItemId": 1,
      "productId": 1,
      "productName": "Classic Chocolate Chip",
      "productImageUrl": "/images/choc-chip.jpg",
      "unitPrice": 85.00,
      "quantity": 2,
      "subtotal": 170.00
    }
  ],
  "totalAmount": 170.00,
  "itemCount": 2
}
```

---

### POST `/api/cart/items`
Add a product to the cart.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response `201`:** Returns updated cart (same as GET `/api/cart`).

---

### PUT `/api/cart/items/{cartItemId}`
Update quantity of a cart item.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response `200`:** Returns updated cart.

---

### DELETE `/api/cart/items/{cartItemId}`
Remove a specific item from the cart.

**Response `200`:** Returns updated cart.

---

### DELETE `/api/cart`
Clear entire cart.

**Response `204`:** No content.

---

## Order Endpoints

> Requires authentication.

### POST `/api/orders`
Place an order from current cart.

**Request Body:**
```json
{
  "deliveryAddress": "123 Bakery Street, Cebu City",
  "contactNumber": "09171234567",
  "deliveryNotes": "Leave at the door"
}
```

**Response `201`:**
```json
{
  "orderId": 101,
  "orderDate": "2025-01-15T10:30:00",
  "status": "PENDING",
  "deliveryAddress": "123 Bakery Street, Cebu City",
  "contactNumber": "09171234567",
  "deliveryNotes": "Leave at the door",
  "items": [
    {
      "productName": "Classic Chocolate Chip",
      "quantity": 2,
      "unitPrice": 85.00,
      "subtotal": 170.00
    }
  ],
  "totalAmount": 170.00
}
```

---

### GET `/api/orders/my-orders`
Get all orders for current authenticated customer.

**Response `200`:**
```json
[
  {
    "orderId": 101,
    "orderDate": "2025-01-15T10:30:00",
    "status": "CONFIRMED",
    "totalAmount": 170.00,
    "itemCount": 2
  }
]
```

---

### GET `/api/orders/{id}`
Get full detail of a specific order. Customer can only view their own orders.

**Response `200`:** Full order object (same as POST `/api/orders` response).

**Error `403`:** If customer tries to view another user's order.

---

## Admin Endpoints

> All admin endpoints require `Authorization: Bearer <token>` with `role: ADMIN`.

### GET `/api/admin/products`
Get all products with full admin detail.

**Response `200`:** List of all products including unavailable ones.

---

### POST `/api/admin/products`
Create a new product.

**Request Body:**
```json
{
  "name": "Matcha Dream",
  "description": "Premium matcha-infused cookie with white choc chips.",
  "price": 95.00,
  "imageUrl": "/images/matcha.jpg",
  "category": "SPECIALTY",
  "available": true
}
```

**Response `201`:** Created product object.

---

### PUT `/api/admin/products/{id}`
Update an existing product.

**Request Body:** Same fields as POST (all optional — partial update supported).

**Response `200`:** Updated product object.

---

### DELETE `/api/admin/products/{id}`
Delete a product.

**Response `204`:** No content.

---

### GET `/api/admin/orders`
Get all orders from all customers.

**Query Params:**
| Param    | Type   | Description              |
|----------|--------|--------------------------|
| `status` | string | Filter by order status   |
| `page`   | int    | Pagination               |
| `size`   | int    | Page size                |

**Response `200`:** Paginated list of all orders.

---

### GET `/api/admin/orders/{id}`
Get full order detail for any order.

**Response `200`:** Full order object.

---

### PUT `/api/admin/orders/{id}/status`
Update the status of an order.

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

Valid values: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`

**Response `200`:** Updated order object.

---

## Standard Error Response Shape

All error responses follow this format:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 5",
  "timestamp": "2025-01-01T12:00:00"
}
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| `200`       | Success                          |
| `201`       | Created                          |
| `204`       | No Content (delete success)      |
| `400`       | Bad Request / Validation Failed  |
| `401`       | Unauthorized (no/invalid token)  |
| `403`       | Forbidden (wrong role)           |
| `404`       | Resource not found               |
| `500`       | Internal server error            |
