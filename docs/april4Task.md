# Doughly Crumbl — Task Tracker

Last updated: April 10, 2026

---

## Completed

### UI / Design
- [x] Sidebar navigation redesign — replaced logo with user profile section
- [x] Order item list component redesign
- [x] Page header redesign — logo moved beside search bar
- [x] My Orders page — 3-click rule applied
- [x] Layout restructuring — sidebar and header behavior integrated
- [x] Product filter UI — replaced pill filters with single compact dropdown aligned to "Featured Delights" heading
- [x] Order panel — item card redesign with quantity stepper and trash icon
- [x] Order panel — auto-collapse when on My Orders page
- [x] Header — "Order" button changed to stroke/outline mode on My Orders page
- [x] Header — removed "Order" button from main nav, replaced with grid/shop toggle icon
- [x] Sidebar — logo removed, user profile section added at top

### Content
- [x] Care Guide content written (`care-guide.md`)
- [x] About & FAQ content written (`about-faqs.md`) — location updated to Don Gil Garcia St., Capitol Site, Cebu City; IG: @doughlycrumbl; FB: Doughly Crumbl; Contact: 09165667589
- [x] Payment & Delivery flow documented (`payment-delivery-flow.md`) — quote-based delivery fee system, order status timeline, checkout requirements, admin requirements, FAQ additions, and future upgrade path

---

## In Progress

### Logic & Functionality

- [x] **AC-10: Add Product to Order Bag**
  - Given I am viewing products on the menu page
  - When I click the add/bag icon on a product card
  - Then the product should appear in the Order Bag sidebar
  - The sidebar should automatically expand if it was collapsed
  - Quantity should default to 1

- [x] **AC-11: Update Quantity in Order Bag**
  - Given I have products in my Order Bag sidebar
  - When I click the increment (+) or decrement (−) buttons next to a product
  - Then the quantity should update immediately
  - Subtotal and total should recalculate in real time

- [x] **AC-12: Remove Product from Order Bag**
  - Given I have products in my Order Bag sidebar
  - When I click the remove (trash) icon on a product
  - Then the product should be removed from the Order Bag
  - Total should recalculate immediately

- [x] **AC-13: Collapse / Expand Order Bag**
  - Given I am on the menu page
  - When I click the Order Bag icon in the navbar and no items are in the bag
  - Then the sidebar should remain collapsed or show an empty state message
  - When items are present, clicking the icon should toggle sidebar visibility

### Pages & Content Integration

- [x] Implement **Care Guide** page using `care-guide.md` content
  - Triggered from "Care Guide" nav item in left sidebar
  - No emojis — clean, professional layout
  - Consistent with Doughly Crumbl design system (crimson `#6B1A2B`, off-white `#FAF7F4`, Inter/Poppins)

- [x] Implement **About / FAQ** page using `about-faqs.md` content
  - Triggered from "About" nav item in left sidebar
  - Include contact details, social links, and FAQ accordion or clean section layout
  - Location: Don Gil Garcia St., Capitol Site, Cebu City
  - IG: @doughlycrumbl | FB: Doughly Crumbl | Tel: 09165667589

---

## Backlog

### Checkout & Payment
- [x] Checkout page — fulfillment toggle (Pickup / Delivery)
- [x] Checkout page — delivery address input (street, barangay, city) + optional landmark field
- [x] Checkout page — inline delivery fee note under address field: *"Delivery fee is calculated based on your location and confirmed before payment."*
- [x] Checkout page — order summary with "To be quoted" delivery fee placeholder
- [x] Checkout page — payment method selector (GCash / Maya / Bank Transfer / Cash on Pickup)
- [x] Checkout page — Place Order button advancing to Awaiting Delivery Quote status
- [x] Payment instructions screen — dynamic per payment method (QR code, bank details, cash note)
- [x] Proof of payment upload — image upload with "Submit Payment" button
- [x] Order Bag sidebar — one-line delivery fee policy note at the bottom

### Order Status Flow
- [x] Status: "Awaiting Delivery Quote" — helper text: *"We're calculating your delivery fee based on your location."*
- [x] Status: "Delivery Fee Quoted — Payment Required" — shows updated total, payment instructions, proof upload
- [x] Status: "Payment Submitted — Awaiting Confirmation" — helper text: *"We've received your proof of payment and are verifying it."*
- [x] Status: "Payment Confirmed" — advances to Preparing
- [x] My Orders — full status timeline stepper updated with all new states

### Admin Panel
- [ ] Admin — view incoming orders with customer location and order details
- [ ] Admin — input field to enter quoted delivery fee per order
- [ ] Admin — trigger status update to notify customer fee has been quoted
- [ ] Admin — view uploaded proof of payment per order
- [ ] Admin — confirm payment button advancing order to Payment Confirmed → Preparing
- [ ] Admin — manual order status override at any stage
- [ ] Admin — cancel order with optional reason field

### Content Updates
- [x] FAQ / About — add "How does delivery work?" section (see `payment-delivery-flow.md`)
- [x] FAQ / About — add "When do I pay?" and "Can I pay cash?" entries

### General
- [ ] Right sidebar toggle logic — shop/grid button opens and closes Order Bag drawer
- [ ] Order Bag empty state — illustrated empty state with "Browse Menu" CTA
- [ ] User avatar dropdown — My Profile, Settings, Sign Out
- [ ] My Orders — order detail drawer with status timeline stepper
- [ ] My Orders — Reorder button (adds all items back to cart in one click)
- [ ] Search within My Orders — collapse/expand search input
- [ ] Hero banner — real product imagery and "Explore Menu" CTA behavior
- [ ] Responsive layout — mobile/tablet breakpoints

### Future / Post-Launch
- [ ] PayMongo integration — replaces manual proof of payment upload
- [ ] Lalamove API integration — replaces manual seller delivery fee quote
- [ ] Push notifications — active alerts for status changes

---

## Design System Reference

| Token | Value |
|---|---|
| Primary | `#6B1A2B` (Crimson) |
| Background | `#FAF7F4` (Off-white) |
| Surface | `#FFFFFF` (White) |
| Font | Inter or Poppins |
| Icons | Lucide |
| Border Radius | 8–10px |
| Shadow | `0 2px 8px rgba(0,0,0,0.08)` |