# SDD Status Update — 2026-05-10

**Project:** Doughly Crumbl — IT342 Phase 1
**Author:** Chris Daniel Cabataña
**Branch:** mobile/core-features

---

## Overall Progress

| Module        | Progress |
|---------------|----------|
| Backend       | 95%      |
| Web Frontend  | 97%      |
| Android       | 90%      |
| Integrations  | 80%      |
| Deployment    | 5%       |

---

## Completed Since Last SDD Revision

**Backend**
- All AC-10 through AC-18 endpoints implemented and tested (42 unit + integration tests passing)
- JWT authentication — register, login, role-based access control (CUSTOMER / ADMIN)
- Product catalog — search, category filter, pagination, image upload
- Shopping cart — add, update quantity, remove, clear; persisted per user in database
- Order placement — delivery and pickup fulfillment types, built from active cart
- Order status machine — full state progression with cancellation and reason
- Delivery fee quoting — admin sets fee, customer notified via notification system
- Payment proof upload — customer uploads image (multipart), admin confirms
- Notification system — persisted per-user notifications on all key order events
- Reorder endpoint — re-adds completed order items to active cart

**Web Frontend**
- All pages implemented: Landing, Auth, Menu, Cart/Order Panel, Checkout, Orders, Order Detail, Payment Instructions, Admin Dashboard, Admin Products, Admin Orders, Admin Order Detail, About, Care Guide
- Category rail on menu page (pill navigation, active state, grid filtering)
- Icon-only cart button with live count badge (label text removed)
- Brand logo in navbar (actual Doughly Crumbl logo, not placeholder)
- Status labels shortened at source (`formatOrderStatus`) with desktop hover tooltips for full text
- Admin status override (manual progression from any state)
- Sidebar avatar dropdown with sign-out

**Android Mobile**
- Auth screens: Splash, Login, Register with EncryptedSharedPreferences JWT storage
- Customer shell: 5-tab bottom nav, Home/Menu with category chips and product grid
- Cart + Checkout: quantity controls, fulfillment toggle, address fields, payment selector, order placement
- Orders + Order Detail: status timeline, cancel, reorder, pull-to-refresh
- Notifications: per-user list, unread badge on nav tab, tap-to-order navigation
- Profile: account info, order stats, sign out with session clear
- Admin shell: separate AdminActivity with bottom nav
- Admin Dashboard, Products (CRUD), Orders list, Admin Order Detail with status controls
- Payment instructions screen: GCash, Maya, BPI with correct account names and QR codes
- App launcher icon, brand logo on all auth screens and toolbar
- AuthInterceptor: auto-clears session on 401, redirects to LoginActivity
- SessionManager: hardened against EncryptedSharedPreferences keystore corruption

---

## In Progress

- **Mobile GROUP 9 — Informational screens:** Payment instructions screen is complete. `activity_care_guide.xml` and `activity_about_faq.xml` not yet built. Estimated completion: 1–2 hours.
- **Physical device end-to-end QA:** In progress. Backend BASE_URL currently hardcoded to local WiFi IP (`192.168.1.52:8080`); requires device and laptop to be on the same network.

---

## Not Yet Started

- `activity_care_guide.xml` + `CareGuideActivity.kt` (mobile)
- `activity_about_faq.xml` + `AboutFaqActivity.kt` (mobile)
- Backend cloud deployment (Railway / Render / any PaaS)
- Permanent public backend URL (currently local-only)
- PayMongo payment gateway integration (dropped from Phase 1 scope)
- Lalamove delivery API integration (dropped from Phase 1 scope)
- Push notifications via FCM (dropped from Phase 1 scope)
- DeliveryFeeCalculator wiring — class exists in backend but is not called; AC-15 uses manual admin quote instead

---

## Deviations from SDD Spec

| # | SDD Spec | Actual Implementation | Reason |
|---|----------|-----------------------|--------|
| 1 | Jetpack Compose for mobile UI | View-based XML layouts (ViewBinding) | Decision made early in development; Compose boilerplate files remain but are unused |
| 2 | PayMongo payment gateway | Manual proof-of-payment upload — customer uploads image, admin confirms | PayMongo integration not started; manual flow sufficient for Phase 1 |
| 3 | Fixed ₱80 delivery fee | Admin-quoted variable fee — admin inputs fee after order placement, customer is notified | More flexible; matches real bakery workflow |
| 4 | Verbose status strings in UI | Shortened badge labels (e.g. "Getting Quote", "Payment Due", "Confirming", "On the Way") with full text in tooltip / sub-text | Improved readability on small screens; full text preserved for accessibility |
| 5 | Ticker strip / announcements feature | Built (backend entity, admin CRUD, web marquee) then removed entirely | Feature evaluated and removed from final deliverable; no traces remain |
| 6 | Deployed backend | Backend is local-only (port 8080); mobile requires same WiFi as laptop | Cloud deployment not completed for Phase 1 |

---

## Revision History Entry

| Version | Date | Author | Changes Made | Status |
|---------|------|--------|--------------|--------|
| 0.7 | 2026-05-10 | Cabataña | Updated implementation status across all chapters; documented deviations (Compose→XML, PayMongo→manual, fixed fee→admin quote, status label shortening); reflected completion of all Phase 1 backend, web, and mobile features except GROUP 9 informational screens and cloud deployment | Revised |

---

## SDD Sections That Need Updating

| Section | What Needs to Change |
|---------|----------------------|
| Technology Stack / Mobile | Change "Jetpack Compose" to "View-based XML layouts (ViewBinding)" wherever Compose is mentioned as the mobile UI framework |
| Payment Module | Replace PayMongo integration description with the manual proof-of-payment flow: customer uploads image → admin reviews → admin confirms or rejects |
| Delivery Fee | Replace fixed-fee description (₱80) with the admin-quote workflow: admin inputs fee after ORDER_PLACED → customer notified → customer reviews and pays |
| Order Status Machine | Verify all status strings match implementation. Valid strings: `ORDER_PLACED`, `AWAITING_DELIVERY_QUOTE`, `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED`, `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION`, `PAYMENT_CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `READY`, `COMPLETED`, `CANCELLED`. Remove references to `PENDING`, `CONFIRMED`, `DELIVERED` as primary emitted values |
| Deployment Architecture | Update to reflect current state — backend on local machine (port 8080), web via Vite dev server (port 5173), no cloud hosting. Flag as pre-deployment |
| Out-of-Scope Features | Add section/appendix noting features deferred out of Phase 1 scope: PayMongo, Lalamove, FCM push notifications, automated delivery fee calculation |
| Mobile Screens List | Mark `CareGuideActivity` and `AboutFaqActivity` as "Not yet implemented" until GROUP 9 is complete |
