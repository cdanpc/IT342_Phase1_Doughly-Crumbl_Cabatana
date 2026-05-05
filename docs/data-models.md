# Data Models — Doughly Crumbl
> Single source of truth for all entity shapes.
> Derived from live source files on 2026-05-04.
> When a field changes on any platform, update this file first (BP-02).

---

## How to Read This Document

Each entity section shows:
- **Canonical shape** — the backend Java entity / response DTO is authoritative
- **Cross-platform parity** — ✓ match | ✗ drift (bug) | — not applicable
- **Discrepancies** — documented inline so they can be fixed

---

## AuthRequest (Login)

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| email | String | string | String | Required, valid email |
| password | String | string | String | Required |

**Parity:** ✓ All three platforms match exactly.

---

## AuthResponse

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| token | String | string | String | JWT bearer token |
| userId | Long | number | Long | User's database ID |
| name | String | string | String | Display name |
| email | String | string | String | |
| role | String | string | String | "CUSTOMER" or "ADMIN" |

**Parity:** ✓ All three platforms match exactly.

---

## RegisterRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| name | String | string | String | Max 100 chars |
| email | String | string | String | Valid email, max 150 chars |
| password | String | string | String | Min 6 chars |
| confirmPassword | String | string | — | Web/backend only; mobile omits |
| address | String | string | String | Max 255 chars |
| phoneNumber | String | string | String | Max 20 chars |

**Parity:** ✗ Mobile uses field name `phone` — backend and web use `phoneNumber`.
**Fix needed:** Rename `phone` → `phoneNumber` in `mobile/app/src/main/java/com/example/mobile/model/RegisterRequest.kt`.

---

## User

> Backend entity only — never sent whole to client. Auth endpoints return AuthResponse instead.

| Field | Java Type | Notes |
|---|---|---|
| id | Long | Auto-generated PK |
| name | String | Max 100 chars |
| email | String | Unique, max 150 chars |
| password | String | Bcrypt hashed — never exposed |
| address | String | Max 255 chars, nullable |
| phoneNumber | String | Max 20 chars, nullable |
| provider | String | "LOCAL" (default) — OAuth2 unused |
| providerId | String | Nullable — OAuth2 unused |
| role | String | "CUSTOMER" (default) or "ADMIN" |
| createdAt | LocalDateTime | Auto-set on insert |

---

## Product

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| id | Long | number | Long | Auto-generated PK |
| name | String | string | String | Max 150 chars |
| description | String | string | String | TEXT, nullable |
| price | BigDecimal | number | Double | Precision 10, scale 2 |
| imageUrl | String | string | String? | Max 500 chars, nullable |
| category | String | string | String | "CLASSIC", "SPECIALTY", "SEASONAL", "BEST_SELLERS" |
| available | Boolean | boolean | — | Backend/web only; mobile uses `stock` instead |
| stock | — | — | Int | Mobile only — does not exist in backend |
| createdAt | LocalDateTime | — | — | Backend only |
| updatedAt | LocalDateTime | — | — | Backend only |

**Parity:** ✗ Mobile `Product.kt` has field `stock` (Int) which does not exist in the backend.
Backend uses `available` (Boolean) — mobile omits this field entirely.
**Fix needed:** Remove `stock` from mobile `Product.kt`; add `available: Boolean` to match backend.

---

## ProductRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| name | String | string | String | Required |
| description | String | string | String | Optional |
| price | BigDecimal | number | Double | Required |
| imageUrl | String | string | String? | Optional |
| category | String | string | String | Optional |
| available | Boolean | boolean | — | Backend/web only |
| stock | — | — | Int | Mobile only — does not exist in backend |

**Parity:** ✗ Same `stock` vs `available` drift as `Product`. Fix alongside `Product.kt`.

---

## Cart

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| cartId / id | Long | number (cartId) | Long (id) | ✗ web uses `cartId`, mobile uses `id` |
| items | List\<CartItem\> | CartItem[] | List\<CartItem\> | ✓ |
| totalAmount / totalPrice | — | number (totalAmount) | Double (totalPrice) | ✗ field name differs |
| itemCount | — | number | — | Web only — mobile omits |
| user | User | — | — | Backend entity only — not in responses |
| createdAt | LocalDateTime | — | — | Backend only |

**Parity:** ✗ Web response uses `cartId` and `totalAmount`; mobile model uses `id` and `totalPrice`.
**Fix needed:** Align mobile `Cart.kt` to use `cartId` and `totalAmount` to match the web/backend contract.

---

## CartItem

| Field | Java / Response Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| cartItemId / id | Long | number (cartItemId) | Long (id) | ✗ name differs |
| productId | Long | number | — | Web response only |
| productName | String | string | — | Web response only; mobile uses full Product object |
| productImageUrl | String | string | — | Web response only |
| product | Product | — | Product | Mobile only — full object |
| unitPrice | BigDecimal | number | — | Web/backend response; mobile omits |
| quantity | Integer | number | Int | ✓ |
| subtotal | BigDecimal | number | — | Web/backend response; mobile omits |
| addedAt | LocalDateTime | — | — | Backend entity only |

**Parity:** ✗ Mobile `CartItem.kt` holds a full `Product` object. Web and backend responses
use flat fields (`productId`, `productName`, `unitPrice`, `subtotal`). Mobile is missing
`unitPrice` and `subtotal` which are needed to display cart totals correctly.

---

## AddToCartRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| productId | Long | number | Long | Required |
| quantity | Integer | number | Int | Required, min 1 |

**Parity:** ✓ All three platforms match.

---

## UpdateCartItemRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| quantity | Integer | number | — | Required, min 1; mobile sends full CartItemRequest instead |

**Parity:** ✗ Mobile uses `CartItemRequest` (productId + quantity) for updates. Backend expects only `quantity`.

---

## Order (Response)

> This is the BUG-3 entity. Mobile `Order.kt` drifted from backend `OrderResponse.java`.
> The canonical shape is `OrderResponse.java`. Web matches. Mobile does not.

| Field | Java (OrderResponse) | TS Type | Kotlin (current — BUGGY) | Fix |
|---|---|---|---|---|
| orderId | Long | number | id (Long) | rename `id` → `orderId` |
| orderDate | LocalDateTime | string | createdAt (String) | rename `createdAt` → `orderDate` |
| status | String | OrderStatus | String | ✓ |
| paymentStatus | String | string | — missing — | add field |
| deliveryAddress | String | string | — missing — | add field |
| contactNumber | String | string | — missing — | add field |
| deliveryNotes | String | string | — missing — | add field |
| proofImageUrl | String | string? | — missing — | add nullable field |
| cancellationReason | String | string? | — missing — | add nullable field |
| items | List\<OrderItemResponse\> | OrderItem[] | List\<OrderItem\> | ✓ (but OrderItem also needs fixing) |
| totalAmount | BigDecimal | number | Double | ✓ |
| itemCount | Integer | number? | — missing — | add nullable field |
| deliveryFee | — does not exist — | — | Double? | remove — backend never sends this |
| customerName | — does not exist — | — | String? | remove — backend never sends this |
| customerEmail | — does not exist — | — | String? | remove — backend never sends this |

**Fix:** BUG-3 — rewrite `mobile/app/src/main/java/com/example/mobile/model/Order.kt` entirely
to mirror `OrderResponse.java`. See CLAUDE.md BUG-3 for the full field list.

---

## CheckoutRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| deliveryAddress | String | string | String | Required |
| contactNumber | String | string | String | Required |
| deliveryNotes | String? | string? | String? | Optional, nullable |

**Parity:** ✓ All three platforms match exactly.

---

## UpdateOrderStatusRequest

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| status | String | OrderStatus | String | Required |
| reason | String? | string? | — | Backend/web only; mobile model omits reason |

**Parity:** ✗ Mobile `UpdateOrderStatusRequest.kt` only has `status` — missing `reason` field
needed for cancellation. Backend and web both include it.
**Fix needed:** Add `val reason: String? = null` to mobile `UpdateOrderStatusRequest.kt`.

---

## OrderItem (Response)

| Field | Java (OrderItemResponse) | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| productName | String | string | — | Mobile uses full Product object |
| quantity | Integer | number | Int | ✓ |
| unitPrice | BigDecimal | number | — | Mobile uses `price` instead |
| subtotal | BigDecimal | number | — | Mobile omits entirely |
| id | — | — | Long | Mobile only — not in backend response |
| product | — | — | Product | Mobile only — not in backend response |
| price | — | — | Double | Mobile uses `price` for unitPrice — name differs |

**Parity:** ✗ Mobile `OrderItem.kt` holds a full `Product` object and uses `price` instead of
`unitPrice`. Backend response sends flat fields (`productName`, `unitPrice`, `subtotal`).
**Fix needed:** Rewrite mobile `OrderItem.kt` to use flat fields matching `OrderItemResponse`.

---

## Notification

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| id | Long | number | — | Mobile has no Notification model |
| orderId | Long | number\|null | — | Nullable — not every notification has an order |
| type | String | string | — | e.g. "ORDER_STATUS", "PAYMENT" |
| title | String | string | — | Max 150 chars |
| message | String | string | — | TEXT |
| read | boolean | boolean | — | Default false |
| createdAt | LocalDateTime | string | — | Auto-set on insert |

**Parity:** ✗ Mobile has no `Notification` data class at all. Must be created before
`NotificationsFragment` can deserialize API responses.
**Fix needed:** Create `mobile/app/src/main/java/com/example/mobile/model/Notification.kt`.

---

## PagedResponse\<T\>

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| content | List\<T\> | T[] (as `content`) | List\<T\> | ✓ |
| totalPages | Integer | number | Int | ✓ |
| totalElements | Long | number | Long | ✓ |
| currentPage | Integer | number | Int | ✓ |

**Parity:** ✓ All three platforms match. Used for paginated product lists.

---

## MessageResponse

| Field | Java Type | TS Type | Kotlin Type | Notes |
|---|---|---|---|---|
| message | String | — | String | Generic success message wrapper |

**Parity:** Mobile has this; web handles inline. Backend-to-mobile matches.

---

## Discrepancy Summary

| Entity | Platform | Issue | Severity |
|---|---|---|---|
| Order | Mobile | BUG-3 — wrong field names, missing 7 fields, 3 phantom fields | Critical |
| OrderItem | Mobile | Uses Product object + `price` instead of flat `productName`/`unitPrice`/`subtotal` | High |
| RegisterRequest | Mobile | `phone` should be `phoneNumber` | Medium |
| Product | Mobile | Has `stock` (doesn't exist in backend); missing `available` | Medium |
| ProductRequest | Mobile | Same as Product — `stock` vs `available` | Medium |
| Cart | Mobile | `id`/`totalPrice` should be `cartId`/`totalAmount` | Medium |
| CartItem | Mobile | Missing `unitPrice`, `subtotal`; holds full Product instead of flat fields | Medium |
| UpdateOrderStatusRequest | Mobile | Missing `reason` field needed for cancellation | Medium |
| Notification | Mobile | Data class does not exist | High |

*Priority fix order: Order.kt (BUG-3) → Notification.kt → OrderItem.kt → then the rest.*
