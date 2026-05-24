# Mobile System Progress

Last audited: 2026-05-23 (page-by-page full scan)
Last updated: 2026-05-23 (Tasks 3–9 implementation)
Branch: `mobile/core-features`

This tracker is the authoritative planning document for the Android app. It records current feature status, backend contract alignment, bugs, to dos, and the prioritized backlog. Updated after every full scan or implementation session.

---

## Verification Status

| Area | Command | Result |
|---|---|---|
| Android build | `.\gradlew.bat :app:assembleDebug` from `mobile/` | BUILD SUCCESSFUL (2026-05-23, Tasks 3–9) |
| Backend compile | `.\mvnw.cmd compile` from `backend/` | BUILD SUCCESS — all classes up to date (2026-05-23) |
| Backend runtime | `.\mvnw.cmd spring-boot:run` from `backend/` | Startup not confirmed in latest session. Must restart to load `OrderRatingController`. |

Notes:
- Mobile has 35 layout XML files and 89 drawable resources.
- Physical device / emulator golden-path QA still required. Build success does not prove runtime flows work end to end.

---

## Page-by-Page Audit (2026-05-23)

### PAGE 1 — Splash Screen (`SplashActivity`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| UI layout | Static logo screen, no issues. |
| Role routing | `isLoggedIn()` → Login; `isAdmin()` → AdminActivity; else → MainActivity. Correct. |
| Backend dependency | None. |
| Bugs | `Handler(Looper.getMainLooper()).postDelayed()` is deprecated in API 30+. Harmless but should migrate to `lifecycleScope.launch { delay(1500) }`. |

**Priority:** Low  
**Next action:** Migrate deprecated `Handler` to coroutine delay during a cleanup pass.

---

### PAGE 2 — Login Screen (`LoginActivity` + `LoginViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Validation | Email format + non-empty password checked before submit. Field errors clear on type. |
| Loading state | `btnLogin` disabled + loading overlay shown. |
| Error state | Error banner with message from API. |
| Navigation | Correct role-based routing after login (Admin → `AdminActivity`, customer → `MainActivity`). |
| Backend | `POST auth/login` with `AuthRequest(email, password)` → `AuthResponse`. Correct. |
| Hardcoded strings | "Enter a valid email", "Password required" inline in Kotlin — should be `R.string`. |
| UI placeholders | "Password reset is not available yet." and "Google sign-in is not available yet." Toasts are placeholder messages — acceptable for Phase 1. |

**Priority:** Low  
**Next action:** Move inline validation error messages to `strings.xml`.

---

### PAGE 3 — Register Screen (`RegisterActivity` + `RegisterViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Validation | Name, email, PH phone regex, address, password length ≥ 8, confirm match. All validated. |
| Password strength bar | Computed correctly (weak/medium/strong). |
| Loading state | `btnRegister` disabled + ProgressBar shown. |
| Error state | Error banner with API message. |
| Backend | `POST auth/register` with `RegisterRequest`. Fields match backend. |
| Hardcoded strings | "Name required", "Enter a valid email", "Min 8 characters", etc. are inline Kotlin strings. |

**Priority:** Low  
**Next action:** Move inline validation error messages to `strings.xml`.

---

### PAGE 4 — Home / Menu (`HomeFragment` + `HomeViewModel` + `ProductAdapter`)

**Status: ✅ Complete — with known performance issue**

| Check | Result |
|---|---|
| Product list | Loads from `GET products?page=0&size=20&search=...&category=...`. Correct. |
| Skeleton loading | Shown during initial load, hidden after data arrives. |
| Search | Filters on text change. Works. |
| Category chips | Filters by category string value. Works. |
| Empty state | Visible when list is empty. |
| Swipe refresh | Works. |
| Add to cart | Single-item add via `cartRepository.addToCart(productId, 1)`. |
| Favorites toggle | Optimistic UI update with pending states. Works. |
| Product detail | Opens `ProductDetailBottomSheet`. |
| Error state | **Toast only** — no persistent retry UI when product load fails. |
| Hardcoded strings | `"${product.name} added to cart"` and `"${product.name} removed from favorites"` inline in `HomeViewModel`. Should be `R.string` format strings. |

**Bug — Medium:** `ProductAdapter` calls `notifyDataSetChanged()` three separate times (for `pendingProductIds`, `favoriteProductIds`, `pendingFavoriteProductIds` property setters). On scroll, this causes 3 full RecyclerView rebinds simultaneously, triggering Glide to restart image loads for all visible items.

**Bug — Medium (ProductDetailBottomSheet):** When a user selects quantity > 1 in the bottom sheet, `HomeFragment` calls `repeat(qty) { viewModel.addToCart(p) }` — this fires `qty` separate `POST cart/items` requests instead of one request with quantity. A single `cartRepository.addToCart(productId, qty)` call is correct.

**Priority:** Medium  
**Next action:**
1. Fix `repeat(qty)` → single `addToCart(product, qty)` call.
2. Replace `notifyDataSetChanged()` with `DiffUtil` payload updates in `ProductAdapter`.
3. Add a persistent error state with a retry button to `fragment_home.xml`.

---

### PAGE 5 — Cart (`CartFragment` + `CartViewModel` + `CartItemAdapter`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Cart display | Items, subtotal, total rendered correctly. |
| Empty state | `emptyState` + "Browse Menu" button shown when cart is empty. |
| Loading state | ProgressBar + adapter actions disabled. |
| Error state | Snackbar with Retry action on API failure. ✅ |
| Quantity update | Uses `UpdateCartItemRequest(qty)` — correct contract (previously P1 bug, now fixed). |
| Remove item | Works. |
| Swipe refresh | Works. |
| Checkout launch | `ActivityResultContracts` — reloads cart and shows Snackbar on RESULT_OK. |
| Backend | `GET cart`, `PUT cart/items/{id}`, `DELETE cart/items/{id}`. All correct. |

**Priority:** Low  
**Next action:** None critical. Add swipe-to-delete gesture as a UX improvement later.

---

### PAGE 6 — Checkout (`CheckoutActivity` + `CheckoutViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Fulfillment toggle | Delivery/Pickup toggle switches address section visibility and cash-on-pickup availability. Correct. |
| Payment selection | GCash, Maya, Bank Transfer, Cash on Pickup (pickup only). Correct. |
| Validation | Contact number (PH regex), street + city required for delivery. Correct. |
| Loading state | `btnPlaceOrder` disabled + text changes to "Placing order...". |
| Error state | Snackbar with error message. |
| Backend | `POST orders` with `CheckoutRequest`. Correct. |
| Hardcoded strings | `"${item.productName} x${item.quantity}   ..."` inline in `buildExpandedItems()`. |
| Missing | No saved-address picker — user must type address manually (backlog). |
| Design note | Pickup sets `deliveryAddress = getString(R.string.fulfillment_pickup_body)` — backend receives a string like "Store Pickup" as the address. This is by design and matches the existing backend flow. |

**Priority:** Low  
**Next action:** Move `buildExpandedItems` item string to `strings.xml`. Add saved-address picker as a backlog enhancement.

---

### PAGE 7 — Orders List (`OrdersFragment` + `OrdersViewModel` + `OrderAdapter`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Order list | `GET orders/my-orders` → `List<Order>`. Correct. |
| Empty state | Shown when no orders exist. |
| Loading state | ProgressBar shown. |
| Error state | **Toast only** — no persistent retry state. |
| Swipe refresh | Works. |
| Navigation | Tapping order opens `OrderDetailActivity` with `orderId`. Correct. |
| onResume reload | Not implemented — list does not refresh when returning from order detail. |

**Bug — Low:** No `onResume()` reload, so if an order status changes in the detail screen, the list stays stale until the user manually swipes down.

**Priority:** Low  
**Next action:** Add `onResume { viewModel.loadOrders() }` (matching pattern from `AdminOrdersFragment`). Add persistent error state with retry button.

---

### PAGE 8 — Order Detail (`OrderDetailActivity` + `OrderDetailViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Status banner | Label, helper text, and color from `OrderStatusUi`. Correct. |
| Timeline | Flow determined by `OrderStatusUi.flowFor(order)`. Dots/lines colored by step. Correct. |
| Order items | Listed via `OrderItemAdapter`. |
| Delivery details | Address, contact, notes visible when delivery order. |
| Subtotal / delivery fee / grand total | Conditionally shown. Correct. |
| Cancel button | Shown for `PENDING`/`ORDER_PLACED` only. Cancel dialog with `reason`. Correct. |
| Reorder | Shown for `COMPLETED` only. Adds all items back to cart. Correct. |
| Payment proof upload | Image picker → mime type + 5 MB validation → multipart upload. Correct. |
| Rating card | Shown for `COMPLETED` only. Stars, comment, submit. Correct. |
| Rating already submitted | Stars locked, comment disabled, submit button hidden. Correct. |
| Rating race condition | **FIXED** — `reloadOrder()` inline suspend instead of nested coroutine. |
| Rating button during load | **FIXED** — `btnSubmitRating.isEnabled = !loading` in loading observer. |
| Backend | `GET orders/{id}`, `PUT orders/{id}/cancel`, `PUT orders/{id}/submit-payment`, `POST orders/{orderId}/rating`. All correct. |
| Backend issue | Rating endpoint returns "No static resource" until backend is **restarted** with the new `OrderRatingController`. No code change needed — just restart the server. |

**Priority:** High (backend restart needed for rating to work)  
**Next action:** Restart backend. Verify rating submission works end to end on emulator.

---

### PAGE 9 — Notifications (`NotificationsFragment` + `NotificationsViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Notification list | `GET notifications` → `List<Notification>`. Correct. |
| Mark as read | `PUT notifications/{id}/read` on tap. Correct. |
| Mark all read | `PUT notifications/read-all`. Button disabled during request. Correct. |
| Empty state | Shown when no notifications exist. |
| Loading state | ProgressBar shown. |
| Error state | Toast only — no persistent retry. |
| Tap with orderId | Opens `OrderDetailActivity`. Correct. |
| Tap without orderId | Opens `NotificationDetailActivity` with title/message/date. Correct. |
| Unread badge (MainActivity) | Polled every 30 seconds via `GET notifications/unread-count`. Correct. |

**Priority:** Low  
**Next action:** Add persistent error state with retry button.

---

### PAGE 10 — Profile (`ProfileFragment` + `ProfileViewModel`)

**Status: ✅ Complete — minor gaps**

| Check | Result |
|---|---|
| Avatar initials | Computed from name, shown in circle. |
| Stats (total, completed, rating) | Loaded from `GET profile`. Rating shows real backend average or "-". Correct. |
| Merit progress card | Tier name, completed order count, progress bar, next tier text. Matches web milestones (1, 3, 5, 10, 15). Correct. |
| Edit profile dialog | Opens with current values. Calls `PUT profile`. Works. |
| Edit profile validation | **Bug** — no client-side validation before submit. Name can be empty, email is disabled but not re-validated. |
| Delivery addresses | `GET profile/addresses` → dialog showing list with delete option. Works. |
| Addresses — update/set-default | `PUT profile/addresses/{id}` and set-default exist in `ApiService` but **not exposed in the profile UI**. Only delete is available. |
| Favorites | Count shown via `GET profile/favorites`. Toast on tap. |
| Logout | Confirmation dialog → session clear → `LoginActivity`. |
| Info screens | Care Guide, About FAQ, Payment Instructions all linked correctly. |
| Backend | All endpoints correct. |

**Bug — Medium:** Edit profile dialog has no field validation. Submitting an empty name will send a blank name to the backend.

**Missing — Low:** Set-as-default address and edit-address actions not exposed in UI.

**Priority:** Medium  
**Next action:** Add name/phone validation to edit profile dialog. Expose "Set as Default" and "Edit" address options.

---

### PAGE 11 — Admin Dashboard (`AdminDashboardFragment` + `AdminDashboardViewModel`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Stats cards | Total Products, Total Orders, Needs Attention, Payment Pending, In Progress, Revenue — all bound. |
| Recent orders | `OrderAdapter` in read-only mode (no click handler). List shown below stats. |
| Error state | Persistent error card with retry button. ✅ |
| Loading state | ProgressBar shown. |
| Swipe refresh | Works. |
| Backend | Uses `GET admin/orders` + `GET admin/products` to compute stats. Correct. |

**Priority:** Low  
**Next action:** None. Consider making recent order rows clickable to open `AdminOrderDetailActivity`.

---

### PAGE 12 — Admin Orders List (`AdminOrdersFragment` + `AdminOrdersViewModel` + `AdminOrderAdapter`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Order list | `GET admin/orders?status=...`. Correct. |
| Status filter chips | Programmatically created for all statuses in `OrderStatusUi.adminStatuses`. |
| Chip style | Chips created without `@style/Style.DoughlyCrumbl.Chip` — minor visual inconsistency. |
| Empty state | `tvEmpty` shown when list is empty. |
| Error state | Persistent error card with retry button. ✅ |
| Loading state | ProgressBar shown. |
| Swipe refresh | Works. |
| onResume reload | ✅ Implemented — refreshes list on return from detail. |
| Navigation | Tap opens `AdminOrderDetailActivity`. |

**Priority:** Low  
**Next action:** Apply `@style/Style.DoughlyCrumbl.Chip` to dynamically created chips.

---

### PAGE 13 — Admin Order Detail (`AdminOrderDetailActivity` + `AdminOrderDetailViewModel`)

**Status: ✅ Complete — P0 cancellation/override parity resolved**

| Check | Result |
|---|---|
| Order display | Status chip, date, contact, items, subtotal. |
| Delivery fee quote | Input + "Quote Fee" button shown for `AWAITING_DELIVERY_QUOTE` only. Correct. |
| Advance next status | "Move to [Status]" button dynamically shown. Correct. |
| Override status | Spinner of all statuses + required reason input. Correct. ✅ Previously broken — now fixed. |
| Cancel with reason | Required reason input in dialog. Correct. ✅ Previously missing — now fixed. |
| Loading state | ProgressBar shown + buttons disabled. |
| Error state | Toast only — no persistent error state. |
| Customer name | `tvCustomerName` shows "Order #21" (the order ID format string) instead of actual customer name. Backend `Order` model does not include `customerName` — this is a data contract limitation. |
| Backend | `GET admin/orders/{id}`, `PUT admin/orders/{id}/status`, `PUT admin/orders/{id}/delivery-fee`. Correct. |

**Bug — Medium (data contract limitation):** Customer name/email not available in `Order` response. Backend would need to add `customerName`/`customerEmail` fields to `OrderResponse` for admin screens to display them.

**Priority:** Medium (customer name) / None (cancellation now complete)  
**Next action:** Request backend to add `customerName` to `OrderResponse`. Add persistent error state.

---

### PAGE 14 — Admin Products List (`AdminProductsFragment` + `AdminProductsViewModel` + `AdminProductAdapter`)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Product list | `GET admin/products?page=0&size=50`. Correct. |
| Empty state | `tvEmpty` shown. |
| Error state | Persistent error card with retry button. ✅ |
| Loading state | ProgressBar + FAB and actions disabled. |
| Swipe refresh | Works. |
| FAB (add product) | Opens `AdminAddEditProductActivity` with no product. Correct. |
| Edit | Passes product JSON to `AdminAddEditProductActivity`. Correct. |
| Delete | Confirmation dialog → `DELETE admin/products/{id}`. Correct. |
| onResume reload | ✅ Implemented. |

**Priority:** Low  
**Next action:** None critical.

---

### PAGE 15 — Admin Add / Edit Product (`AdminAddEditProductActivity` + `AdminAddEditProductViewModel`)

**Status: ✅ Complete — P0 availability bug resolved**

| Check | Result |
|---|---|
| Create mode | All fields empty. Submit calls `POST admin/products`. Correct. |
| Edit mode | Pre-fills from product JSON. Submit calls `PUT admin/products/{id}`. Correct. |
| Availability | `SwitchMaterial` (`switchAvailable`). ✅ Previously was broken stock-style field — now fixed. |
| Image upload | Picks image → validates type + 5 MB → multipart `POST admin/products/upload-image` → URL auto-filled. Correct. |
| Image URL manual | Free-text `etImageUrl` fallback. Works. |
| Validation | Name, description, price > 0, category all validated. |
| Category field | **Free-text** `EditText` — no dropdown or autocomplete enforcing valid backend category strings. Admin can enter any string. |
| Loading state | ProgressBar + save button disabled. |
| Error state | Toast only. |
| Backend | All endpoints correct. |

**Bug — Low:** `etCategory` is a free-text field. Admin can enter a category not recognized by the backend or web frontend (e.g. "cookies" instead of "Cookies"). Should be an `AutoCompleteTextView` or spinner.

**Priority:** Low  
**Next action:** Convert `etCategory` to an `AutoCompleteTextView` with the valid category list, or a spinner.

---

### PAGE 16 — Informational Screens (Care Guide, About FAQ, Payment Instructions)

**Status: ✅ Complete**

| Check | Result |
|---|---|
| Care Guide | Static content activity. Back navigation works. |
| About FAQ | Static content activity. Back navigation works. |
| Payment Instructions | GCash/Maya/BPI QR codes and instructions. Static. Works. |
| Registration | All 3 registered in `AndroidManifest`. Linked from `ProfileFragment`. Correct. |
| Backend dependency | None. |

**Priority:** Low  
**Next action:** None.

---

## Resolved Issues (since 2026-05-22 audit)

| Issue | Resolution | Date |
|---|---|---|
| P0: Admin order cancellation/override parity missing | `showCancelOrderDialog` (required reason) and `showOverrideStatusDialog` (spinner + required reason) fully implemented in `AdminOrderDetailActivity`. | 2026-05-23 |
| P0: Admin product availability exposed as stock 1/0 | `etStock` replaced with `SwitchMaterial` (`switchAvailable`) in layout and Kotlin. | 2026-05-23 |
| P1: Cart update request sends extra `productId=0` | `UpdateCartItemRequest(qty)` now used for `PUT cart/items/{id}`. | 2026-05-23 |
| Rating submission race condition (nested coroutine loading state) | `submitRating()` now calls `reloadOrder()` inline (same coroutine) instead of `loadOrder()` which spawned a separate one. | 2026-05-23 |
| Rating `btnSubmitRating` not disabled during loading | Added `binding.btnSubmitRating.isEnabled = !loading` to `isLoading` observer. | 2026-05-23 |
| Emulator "System UI isn't responding" ANR on cold launch | `ApiServerDiscovery` now tries fixed candidates (default + last-known) serially before the 254-host subnet scan. Subnet scan threads reduced 32 → 8. | 2026-05-23 |
| Hardcoded mock rating ("4.8") on profile | `tvRating` now shows backend average or "-" for 0.0. Removed `profile_default_rating` and `review_summary` string resources. | 2026-05-22 |
| Hardcoded mock rating on product detail bottom sheet | Rating row removed from `bottom_sheet_product_detail.xml`. | 2026-05-22 |
| Hardcoded mock rating on web ProductCard | Star + "4.8" span removed from `ProductCard.tsx`. | 2026-05-22 |
| `repeat(qty)` multi-call bug in `HomeFragment` | Changed `repeat(qty) { viewModel.addToCart(p) }` to `viewModel.addToCart(p, qty)`. Updated `HomeViewModel.addToCart()` to accept `quantity: Int = 1` and pass it to `CartRepository`. | 2026-05-23 |
| Edit profile dialog has no input validation | `showEditProfileDialog()` now validates: name non-blank, phone matches PH format regex `^(09|\+639)\d{9}$`. Dialog stays open on failure (positive button uses null listener + override). | 2026-05-23 |
| `OrdersFragment` no `onResume` reload | Added `override fun onResume()` calling `viewModel.loadOrders()`. | 2026-05-23 |
| Inline validation/feedback strings in Kotlin | Login: "Enter a valid email", "Password required", "Forgot password" Toast, "Google sign-in" Toast. Register: all 6 validation messages + strength labels. HomeViewModel: cart/favorite feedback. CheckoutActivity: item line format. All migrated to `strings.xml`. | 2026-05-23 |
| `customerName`/`customerEmail` missing in admin order detail | Added fields to `OrderResponse.java` + `OrderAdapter.toDto()` (backend). Added `customerName`/`customerEmail` fields to mobile `Order.kt`. Fixed `AdminOrderDetailActivity.bindOrder()` — was showing orderId instead of customer name, and contactNumber instead of email. | 2026-05-23 |
| `OrdersFragment` and `NotificationsFragment` error state — Toast only | Added `errorState` LinearLayout + `tvOrdersError`/`tvNotificationsError` + `btnOrdersRetry`/`btnNotificationsRetry` to both layout XMLs. Fragments now show persistent error card and hide it on successful reload. | 2026-05-23 |
| `etCategory` free-text in admin add/edit product | Changed `tilCategory` to `Widget.Material3.TextInputLayout.OutlinedBox.ExposedDropdownMenu` style. Replaced `TextInputEditText` with `AutoCompleteTextView`. `AdminAddEditProductActivity` sets up an `ArrayAdapter` with the 7 valid category values. `prefill()` uses `setText(value, false)` to prevent filter triggering. | 2026-05-23 |

---

## Active To Do

Ordered by priority. Fix in this order before the next release/QA pass.

| Priority | Item | Why It Matters | Suggested Fix |
|---|---|---|---|
| P0 | Restart backend to load `OrderRatingController` | Rating submission returns "No static resource" until server is restarted with the new controller class. | Run `.\mvnw.cmd spring-boot:run` from `/backend`. Verify `POST /api/orders/{id}/rating` returns 201. |
| P0 | Run full mobile golden-path QA on emulator or physical device | Build passes; runtime flows (network discovery, backend data, file picker, UI state) still unverified end to end. | Test login → menu → favorite → product detail → add to cart → checkout → orders → payment proof → rating → notifications → profile. |
| P2 | Fix admin status filter chip styling | Dynamically created chips don't apply `@style/Style.DoughlyCrumbl.Chip`. | Pass the style attr when constructing `Chip(context, null, R.attr.chipStyle)` or use the style from `attrs.xml`. |
| P2 | Expose "Edit" and "Set as Default" address actions in `ProfileFragment` | `ApiService` has `PUT profile/addresses/{id}` with `defaultAddress=true`, but only delete is shown in the dialog. | Add two options to `showAddressOptions()`: Edit and Set as Default. |
| P3 | Migrate `SplashActivity` `Handler` to coroutine delay | `Handler(Looper.getMainLooper()).postDelayed()` is deprecated in API 30+. | Replace with `lifecycleScope.launch { delay(1500); … }`. |
| P3 | Add mobile automated tests | No ViewModel, repository, or integration tests exist. | Start with ViewModel tests for checkout, cart, orders, and rating flows. |

---

## Backlog

Low-urgency enhancements for after all P0–P2 items are resolved.

| Item | Reason |
|---|---|
| ProductAdapter `notifyDataSetChanged()` → DiffUtil payloads | Three property setters each call `notifyDataSetChanged()`. Replace with targeted `notifyItemRangeChanged()` or payload-based `DiffUtil` to avoid 3× full rebind + Glide reload on each state change. |
| Saved-address picker in checkout | `GET profile/addresses` endpoint exists. Surface saved addresses in `CheckoutActivity` as a quick-fill option. |
| Product list pagination / infinite scroll | Home currently fetches `page=0, size=20`. Add a `loadMore()` trigger when scrolled to bottom. |
| Admin user management UI | `ApiService` already defines `GET admin/users`, `PUT admin/users/{id}/ban`, `/unban`, `/restore`, `DELETE`. No UI screen exists. |
| Real-time notifications (WebSocket/SSE) | Currently REST-polled every 30 s. Upgrade to WebSocket when real-time UX becomes a requirement. |
| Admin orders pagination | Backend supports `page`/`size`. Currently loads up to 100 at once. |
| Full favorites list screen | Count is shown; a dedicated favorites browse screen would improve discoverability. |
| Payment instruction QR enlargement | Tap-to-zoom on QR codes for easier scanning. |
| QA: order flow with delivery + prepaid | Full delivery flow (AWAITING_DELIVERY_QUOTE → quote → payment → confirm → PREPARING → OUT_FOR_DELIVERY → COMPLETED) has not been tested end to end. |
| QA: cash-on-pickup flow | PICKUP + CASH_ON_PICKUP → ORDER_PLACED → PREPARING → READY → COMPLETED flow unverified. |

---

## Backend Contract Notes For Mobile

| Backend Area | Status | Mobile Impact |
|---|---|---|
| Auth | ✅ Ready | Login/register wired; `EncryptedSharedPreferences` + `AuthInterceptor` 401 redirect. |
| Products | ✅ Ready | Customer list/search/category and admin CRUD all wired. |
| Cart | ✅ Ready | `UpdateCartItemRequest(qty)` contract is now correct. |
| Checkout / Orders | ✅ Ready | Mobile `CheckoutRequest` and `Order` model match backend response. |
| Payment proof upload | ✅ Ready | Multipart `proof`; 5 MB + image-type validation on mobile. |
| Notifications | ✅ Ready | REST list, unread count, mark read, mark-all-read all wired. |
| Profile / addresses / favorites | ✅ Ready | All endpoints wired. Profile UI needs validation pass. |
| Rating | ⚠️ Ready (needs restart) | `OrderRatingController` compiled but backend must be restarted. Mobile side fully wired. |
| Admin products / orders | ✅ Ready | Availability fix and cancel/override parity now complete. |
| Admin users | ⚠️ Endpoints exist, no UI | `admin/users` CRUD defined in `ApiService` but no UI screen exists. |
| Order `customerName` | ✅ Added | `customerName` and `customerEmail` added to `OrderResponse.java` + `OrderAdapter.toDto()`. Mobile `Order.kt` updated. `AdminOrderDetailActivity` now binds both fields correctly. |

---

## Android Design and Maintainability Audit

Current state:
- View-based XML with ViewBinding, Retrofit, MVVM, LiveData.
- Core design tokens in `colors.xml`, `dimens.xml`, `strings.xml`.
- 35 layouts, 89 drawables. All public-facing hardcoded hex values removed.

Remaining high-friction areas:

| File / Area | Finding | Priority |
|---|---|---|
| `HomeViewModel.kt` | `"${product.name} added to cart"` / `"${product.name} removed from favorites"` are inline strings. | Low |
| `LoginActivity.kt` / `RegisterActivity.kt` | Validation error messages inline in Kotlin. | Low |
| `CheckoutActivity.buildExpandedItems()` | Item format string inline in Kotlin. | Low |
| `AdminOrdersFragment.kt` | Status filter chips created without design-system chip style. | Low |
| `AdminAddEditProductActivity.kt` | `etCategory` is free-text with no value constraint. | Low |
| `AdminOrderDetailActivity.kt` | `tvCustomerName` and `tvCustomerEmail` now correctly bound from `order.customerName` / `order.customerEmail`. ✅ Fixed 2026-05-23. | — |
| `ProfileFragment.kt` | Edit profile dialog now validates name non-blank + PH phone format. ✅ Fixed 2026-05-23. | — |
| `ProductAdapter.kt` | 3× `notifyDataSetChanged()` on property set — should use DiffUtil payloads. | Low |
| `HomeFragment.kt` | `repeat(qty)` bug fixed — single `viewModel.addToCart(p, qty)` call. ✅ Fixed 2026-05-23. | — |
| `OrdersFragment.kt` / `NotificationsFragment.kt` | Persistent error state + retry button added. ✅ Fixed 2026-05-23. | — |

Recommended shared Android helpers not yet built:
- `SingleLiveEvent` or event wrapper for one-time Snackbar/Toast/navigation triggers.
- Shared form validation helpers (phone, required, price, image size/type).
- Shared empty/error state view component to avoid copy-paste across fragments.

---

## Next Development Order

1. **Restart backend** and confirm `POST /api/orders/{id}/rating` returns 201. *(user action — requires terminal)*
2. **Run golden-path QA** — full customer flow on emulator/device; record failures. *(user action)*
3. ✅ Fix bottom sheet `repeat(qty)` bug — single API call with quantity. *(done 2026-05-23)*
4. ✅ Add edit-profile validation — name + phone check before submit. *(done 2026-05-23)*
5. ✅ Add `onResume` reload to `OrdersFragment`. *(done 2026-05-23)*
6. ✅ Move inline strings to `strings.xml` — validation messages in Login/Register/HomeViewModel + CheckoutActivity format string. *(done 2026-05-23)*
7. ✅ Add `customerName`/`customerEmail` to backend `OrderResponse` and bind in admin order detail. *(done 2026-05-23)*
8. ✅ Add persistent error/retry states to `OrdersFragment` and `NotificationsFragment`. *(done 2026-05-23)*
9. ✅ Convert `etCategory` to `AutoCompleteTextView` in admin add/edit product. *(done 2026-05-23)*
10. **Fix admin status filter chip styling** — pass `R.attr.chipStyle` when constructing chips programmatically.
11. **Expose address Edit + Set Default actions** in `ProfileFragment.showAddressOptions()`.
12. **Migrate `SplashActivity` `Handler`** to `lifecycleScope.launch { delay(1500) }`.
13. **Write ViewModel unit tests** — checkout, cart, orders, rating.
