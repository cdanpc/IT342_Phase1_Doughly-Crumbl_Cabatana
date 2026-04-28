# ADR-002: Quote-Based Delivery and Manual Payment Confirmation

**Date:** April 2026
**Status:** Accepted
**Supersedes:** Fixed ₱80 delivery fee + direct PayMongo integration (original plan)

---

## Context

The original design used:
1. A fixed ₱80 delivery fee applied automatically at checkout
2. Direct PayMongo integration (GCash / card) for payment processing

Two decisions caused a change:

1. **Delivery fee:** Fixed ₱80 was inaccurate for orders across varying distances
   within the 10 km radius. A tiered fee (₱50 / ₱80 / ₱120 based on distance)
   was identified, but Lalamove/Borzo API integration was out of scope for MVP.

2. **Payment:** PayMongo integration required sandbox key management, webhook
   handling, and PCI compliance considerations that exceeded the current sprint scope.

---

## Decision

### Delivery
Adopt a **quote-based delivery fee flow**:
- Customer places order → status: `AWAITING_DELIVERY_QUOTE`
- Admin calculates fee manually (using store context and distance) and inputs it
- System notifies customer → status: `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED`
- Customer sees updated total with quoted fee

**Future path:** Replace manual quoting with automated Haversine + Nominatim
geocoding once the delivery slice is implemented (ADR-001 slice: `delivery/`).

### Payment
Adopt a **manual proof-of-payment flow**:
- Customer selects payment method: GCash, Maya, BPI Bank Transfer, or Cash on Pickup
- System displays payment instructions + QR code per method
- Customer uploads proof of payment image
- Admin reviews proof → confirms payment → status: `PAYMENT_CONFIRMED`

**Future path:** Replace proof-upload with PayMongo webhook integration
(PayMongo sandbox keys already present in `application.properties`).

---

## Order Status Flow (current)
```
ORDER_PLACED
  → AWAITING_DELIVERY_QUOTE
  → DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED
  → PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
  → PAYMENT_CONFIRMED
  → PREPARING
  → OUT_FOR_DELIVERY (delivery) / READY_FOR_PICKUP (pickup)
  → COMPLETED
Any state before PREPARING → CANCELLED
```

---

## Consequences

**Positive:**
- Fully functional end-to-end order flow without external API dependencies
- Admin has full visibility and control over each order
- QR code images for GCash, Maya, BPI are already in `web/public/`

**Negative:**
- Manual steps add latency (customer waits for admin to quote fee and confirm payment)
- Does not scale beyond a small order volume without PayMongo / Lalamove integration

---

## Files implementing this decision
- `backend/features/order/OrderService.java` — status transition logic
- `backend/features/payment/` — proof upload, confirmation
- `web/src/pages/PaymentInstructionsPage.tsx` — per-method payment UI
- `web/src/pages/OrderDetailPage.tsx` — status timeline + proof upload form
- `web/src/pages/admin/AdminOrderDetail.tsx` — fee input + payment confirmation
