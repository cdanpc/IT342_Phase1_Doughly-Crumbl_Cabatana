# Doughly Crumbl — Final Presentation Flow & Live Demo Guide

> Recording-ready guide. Follow it top to bottom while recording your final project video.
> Target length: **5–10 minutes**. Everything here is the presentation flow + the actual demo flow — nothing else.

---

## 0. Pre-Recording Setup (do this BEFORE you hit record)

Get all three pieces running and pre-loaded so the recording is smooth.

| Step | Command / Action | Notes |
|---|---|---|
| 1. Start backend | Open `cmd.exe` → `cd backend` → `mvnw.cmd spring-boot:run` | Runs on port **8080**. Wait for "Started BackendApplication". Needs `backend/.env` with Supabase creds. |
| 2. Start web | New terminal → `cd web` → `npm run dev` | Runs on **http://localhost:5173** |
| 3. (Optional) Mobile | Open Android Studio → run app on emulator | Emulator reaches backend via `10.0.2.2:8080` |
| 4. Open two browser windows | Window A = **Customer**, Window B = **Admin** | Needed for the live real-time notification moment |
| 5. Pre-create accounts | One customer account + the seeded admin account | Have credentials written down |
| 6. Seed data check | Confirm products show on the menu | Backend seeds products on startup |
| 7. Prepare a payment-proof image | Any small JPG/PNG screenshot on your desktop | Used in the payment upload step |
| 8. Zoom / font | Increase browser zoom to ~110–125% | Makes UI readable on video |

**Accounts to have ready:**
- Customer: `[your test customer email]` / `[password]`
- Admin: `[admin email]` / `[password]`

**Golden-path order you will demo:** a **DELIVERY + GCash** order (this exercises the full flow: quote fee → upload proof → confirm payment → status updates).

---

## 1. Presentation Timeline (overview)

| Time | Segment | Goal |
|---|---|---|
| 0:00 – 0:30 | Self-introduction | Who you are + what the project is |
| 0:30 – 1:30 | System overview | Problem, users, goal |
| 1:30 – 3:00 | Architecture (brief) | 3 platforms, layers, real-time, DB |
| 3:00 – 7:30 | **Live demo** (main part) | Customer golden path + admin flow + real-time |
| 7:30 – 9:00 | Proof of implementation | Quick code / API / DB evidence |
| 9:00 – 10:00 | Closing | Recap + thank you |

---

## 2. Segment Scripts

### 2.1 Self-Introduction (0:00 – 0:30)
> "Good day, I'm **[Your Name]** from **[Course and Section]**. For our Systems Integration and Architecture final project, my group built **Doughly Crumbl** — a multi-platform ordering system for an artisan bakery here in Cebu City. It runs on three integrated platforms sharing one backend: a Spring Boot REST API, a React web app, and a native Android app."

### 2.2 System Overview (0:30 – 1:30)
> "Small bakeries usually take orders through Facebook messages — there's no structured order tracking, and payment confirmation is manual and error-prone. Doughly Crumbl fixes this. Customers can browse the menu, place delivery or pickup orders, upload GCash or Maya payment proof, and track their order status in real time. Admins manage products, orders, payments, and user accounts. There are three user roles: **Customer**, **Admin**, and **Guest**, who can view the menu."

### 2.3 Architecture — keep it brief (1:30 – 3:00)
> "The system uses a **client–server REST architecture**. The backend is **Spring Boot with Java 17**, organized in a **layered design** — controllers, services, repositories, and JPA entities — grouped into vertical slices per feature. It connects to a **PostgreSQL database hosted on Supabase** through Spring Data JPA. Security is **JWT-based with role-based access control**, so admin endpoints reject non-admin tokens. The Android app follows the **MVVM pattern** with Retrofit and a repository layer. We also applied classic design patterns in the order flow — **Factory** for order creation, **Adapter** for entity-to-DTO mapping, **Strategy** for order status transitions, and **Observer** for notifications. Notifications are pushed live to the web client over a **WebSocket** connection."

*(Show your architecture diagram slide here if you have one.)*

---

## 3. LIVE DEMO FLOW (3:00 – 7:30) — the core of the video

> Do these in order. Each row = one beat: **say it → click it**. The "Behind the scenes" column is optional one-liners to sound technical.

### STEP 1 — Customer Login
- **Say:** "I'll log in as a customer. The backend verifies the password and issues a JWT token that's used on every request."
- **Show / Click:** In Window A, go to `localhost:5173` → Login → enter customer credentials → land on the Menu.
- **Behind the scenes:** `POST /api/auth/login` → `AuthService` → JWT issued.

### STEP 2 — Browse the Menu (search + category)
- **Say:** "The menu loads from a public products endpoint. I can search and filter by category."
- **Show / Click:** Scroll products → type a search term → click a category filter → open one product's detail.
- **Behind the scenes:** `GET /api/products?search=&category=` with server-side pagination.

### STEP 3 — Add to Cart
- **Say:** "I'll add a couple of items to my cart. The cart is stored on the server, tied to my account."
- **Show / Click:** Add 2 products → open the cart → change a quantity.
- **Behind the scenes:** `POST /api/cart/items`, `PUT /api/cart/items/{id}`.

### STEP 4 — Checkout (DELIVERY + GCash)
- **Say:** "At checkout I choose **delivery** and **GCash**, enter my address and contact, and place the order. On the backend, an **OrderFactory** converts my cart into an order and clears the cart."
- **Show / Click:** Proceed to checkout → select **Delivery** → select **GCash** → fill address/contact → **Place Order** → see confirmation.
- **Behind the scenes:** `POST /api/orders` → `OrderFactory.createOrderFromCart` → initial status **AWAITING_DELIVERY_QUOTE**.

### STEP 5 — Customer Sees Order Tracking
- **Say:** "My order now appears under My Orders with the status **Awaiting Delivery Quote**."
- **Show / Click:** Go to Orders → open the new order → show the status timeline.
- **Behind the scenes:** `GET /api/orders/my-orders`, `GET /api/orders/{id}`.

### STEP 6 — Switch to Admin (RBAC)
- **Say:** "Now I switch to the admin account in a second window. Admin routes are protected — a customer token can't reach them."
- **Show / Click:** In Window B, log in as admin → admin dashboard / orders list appears.
- **Behind the scenes:** `/api/admin/**` requires `ROLE_ADMIN` (Spring Security).

### STEP 7 — Admin Quotes the Delivery Fee
- **Say:** "Since this is a delivery order, the admin sets a delivery fee. That gets added to the total and moves the order to **Payment Required**."
- **Show / Click:** Open the order → enter a delivery fee → submit → show updated total + new status.
- **Behind the scenes:** `PUT /api/admin/orders/{id}/delivery-fee?fee=` → status **DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED**.

### STEP 8 — Real-Time Notification (the wow moment)
- **Say:** "Watch the customer window — the status update arrives instantly through a WebSocket notification, no refresh needed."
- **Show / Click:** Keep both windows visible → point to the customer's notification badge / updated status updating live.
- **Behind the scenes:** **Observer pattern** → `WebSocketNotificationObserver` → STOMP push to `/topic/notifications/{userId}`.

### STEP 9 — Customer Uploads Payment Proof
- **Say:** "Back as the customer, I follow the payment instructions and upload my GCash screenshot as proof of payment."
- **Show / Click:** In Window A, open the order → payment instructions → upload the prepared proof image → submit.
- **Behind the scenes:** `PUT /api/orders/{id}/submit-payment` (multipart) → status **PAYMENT_SUBMITTED_AWAITING_CONFIRMATION**, file stored by `FileUploadService`.

### STEP 10 — Admin Confirms Payment & Advances Status
- **Say:** "The admin gets a 'payment submitted' notification, opens the order, views the uploaded proof, confirms payment, then marks it as preparing."
- **Show / Click:** In Window B, open the order → view the proof image → set status to **Payment Confirmed** → then **Preparing**.
- **Behind the scenes:** `PUT /api/admin/orders/{id}/status` → **Strategy pattern** validates each transition; `paymentStatus` set to PAID.

### STEP 11 — Customer Sees Final Status + Rates Order *(optional if time)*
- **Say:** "The customer sees the updated status live. Once an order is completed, the customer can rate it, and that rating feeds into their profile."
- **Show / Click:** Show updated status on customer side → (if you have a completed order) submit a star rating + comment.
- **Behind the scenes:** `POST /api/orders/{orderId}/rating`.

### STEP 12 — Profile / Favorites / Merit Tier *(optional if time)*
- **Say:** "The profile aggregates the customer's order stats, average rating, saved addresses, favorites, and a loyalty **merit tier** based on completed orders."
- **Show / Click:** Open Profile → show stats + merit tier → show a favorited product.
- **Behind the scenes:** `GET /api/profile`, `GET /api/profile/favorites`.

### STEP 13 — Admin User Management *(optional if time)*
- **Say:** "Finally, admins can manage users — ban, unban, or restore accounts — with a safeguard that prevents removing the last active admin."
- **Show / Click:** Admin → Users → ban a test customer → unban.
- **Behind the scenes:** `PUT /api/admin/users/{id}/ban` and `/unban`.

---

## 4. Proof of Implementation (7:30 – 9:00)

Quickly show real evidence. Have these tabs/files open in advance.

| What to say | What to show |
|---|---|
| "Here's the layered backend — controller, service, repository, entity for orders." | `backend/.../features/order/OrderController.java`, `OrderService.java`, `OrderRepository.java`, `Order.java` |
| "Security and JWT role-based access." | `backend/.../shared/config/SecurityConfig.java` |
| "The Observer that pushes real-time notifications." | `backend/.../features/notification/WebSocketNotificationObserver.java` |
| "The mobile app's Retrofit API service — same backend." | `mobile/.../network/ApiService.kt` |
| "Live data in the Supabase database." | Supabase tables: `orders`, `order_items`, `notifications`, `users` |
| "And the API responding, including RBAC rejecting a customer token." | Postman / browser devtools: `GET /api/products` (200) and `GET /api/admin/orders` with customer token (401/403) |

---

## 5. Closing (9:00 – 10:00)

> "To summarize: Doughly Crumbl is a working three-platform ordering system that demonstrates REST integration, a layered backend, MVVM on mobile, real-time WebSocket notifications, and classic design patterns — applied to a real bakery business. A few items, like Google OAuth, automated PayMongo payments, and email notifications, are configured as future enhancements. Thank you for watching our presentation."

---

## 6. Quick Demo Checklist (glance before recording)

- [ ] Backend running on 8080 (Supabase connected)
- [ ] Web running on 5173
- [ ] Two browser windows: Customer (A) + Admin (B)
- [ ] Customer + admin credentials ready
- [ ] Products visible on menu
- [ ] Payment-proof image ready on desktop
- [ ] Browser zoomed for readability
- [ ] Code files + Supabase + Postman tabs pre-opened for the proof segment
- [ ] Screen recorder + mic tested
- [ ] Run timed once before the real take

---

## 7. If Something Fails During Recording (recovery lines)

- **Products won't load:** "Let me confirm the backend connection" → check the backend terminal; restart if needed.
- **Real-time doesn't fire:** Refresh the customer window — "The notification is also persisted, so it shows on refresh." (Status still updates via REST.)
- **Upload rejected:** Use a smaller JPG/PNG under 5 MB (allowed: JPEG, PNG, WebP, GIF).
- **Login fails:** Re-check credentials; the system shows specific messages ("No account found" / "Incorrect password").

> Tip: record in short segments if needed and stitch them — the timeline in §1 maps cleanly to separate clips.
