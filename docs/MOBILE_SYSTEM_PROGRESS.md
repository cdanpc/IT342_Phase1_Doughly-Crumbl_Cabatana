# Mobile System Progress

Last audited: 2026-05-22
Branch: `mobile/core-features`

This tracker is the active planning document for the Android app. It records the current mobile feature status, backend contract alignment, to dos, backlog, and Android design/refactor findings.

## Verification Status

| Area | Command | Result |
|---|---|---|
| Android build | `.\gradlew.bat :app:assembleDebug` from `mobile/` | Passed. Debug APK build completed. |
| Backend tests | `.\mvnw.cmd test` from `backend/` | Last audited same day: passed, 45 tests, 0 failures, 0 errors. |

Notes:
- Mobile has 35 layout XML files and 89 drawable resources.
- Backend runtime startup against Supabase/local env is still not verified in this mobile audit.
- Real emulator/physical-device QA is still required. Build success does not prove API/network/UI flows work end to end.

## Done

| Feature | Mobile Status | Backend Contract Status | Evidence |
|---|---|---|---|
| Splash/session routing | Done | Backend-independent after login | `SplashActivity`, `SessionManager`, and role-based routing to customer/admin hosts exist. |
| Secure token storage | Done | Done | `SessionManager` uses `EncryptedSharedPreferences`; `AuthInterceptor` clears session and opens login on 401. |
| Login | Done | Done | `ApiService.login` calls `POST auth/login`; `LoginActivity` and `LoginViewModel` exist. |
| Register | Done | Done | `ApiService.register` calls `POST auth/register`; request model includes current backend fields. |
| Customer shell | Done | Not backend-dependent | `MainActivity` hosts Menu, Cart, Orders, Notifications, Profile bottom navigation. |
| Home/menu product list | Done | Done | `HomeViewModel` calls products API with search/category support. |
| Product detail bottom sheet | Done | Done | `ProductDetailBottomSheet` displays product detail and quantity add-to-cart. |
| Favorites on menu | Done | Done | `HomeViewModel` loads/toggles favorites through `/api/profile/favorites`. |
| Cart display | Done | Done | `CartFragment`, `CartViewModel`, and cart models match backend response shape. |
| Add/update/remove cart item | Done | Mostly done | Add/remove are aligned. Update currently sends `CartItemRequest(productId=0, quantity)` to a backend DTO that only needs `quantity`; likely accepted if unknown JSON fields are ignored, but should be cleaned up. |
| Checkout | Done | Done | `CheckoutActivity` builds `CheckoutRequest` with `deliveryAddress`, `contactNumber`, `fulfillmentMethod`, `paymentMethod`, `deliveryNotes`. |
| Customer order list | Done | Done | `ApiService.getOrders` uses `GET orders/my-orders`; model uses `orderId`, `orderDate`, current status/payment fields. |
| Customer order detail | Done | Done | `OrderDetailActivity` shows current status, timeline, delivery/payment data, items, totals, cancel, reorder, proof upload. |
| Payment proof upload | Done | Done | `OrderDetailActivity` picks image, validates image type/5 MB size, sends multipart `proof`. |
| Customer cancellation | Done | Done | `OrderDetailViewModel.cancelOrder` calls backend cancel endpoint. |
| Reorder | Done | Done | Reorder adds order item products back to cart when `productId` exists. |
| Notifications list | Done | Done | `NotificationsFragment` loads REST notifications, marks read, mark-all-read, and opens order/detail views. |
| Notifications badge | Done | Done | `MainActivity` polls unread count every 30 seconds and updates nav badge. |
| Profile dashboard | Done | Done | `ProfileViewModel` loads `/api/profile`, stats, addresses, favorites count, and update profile. |
| Profile support/info screens | Done | Mostly backend-independent | Care guide, About/FAQ, and payment instructions activities are registered. |
| Admin shell | Done | Not backend-dependent | `AdminActivity` hosts Dashboard, Products, Orders, Profile tabs. |
| Admin dashboard | Done | Done | Dashboard ViewModel loads admin order/product stats. |
| Admin products list | Done | Done | Admin products list and adapter exist. |
| Admin add/edit product | Done | Mostly done | Create/update/upload image works against backend, with type/5 MB image validation. UI still exposes availability as `1`/`0` stock field. |
| Admin delete product | Done | Done | Admin product deletion flow exists. |
| Admin orders list | Done | Done | Admin orders list calls `GET admin/orders`, supports status filtering. |
| Admin order detail | Done | Mostly done | Admin can quote delivery fee and advance normal next status. Cancellation/override parity with web is incomplete. |
| Centralized status labels | Done | Done | `OrderStatusUi.kt` centralizes labels, helper text, colors, flows, and admin next-status logic. |
| Automatic LAN backend discovery | Done | Backend-independent | `ApiHostInterceptor` and `ApiServerDiscovery` exist; `RetrofitClient` uses host interceptor. |

## To Do

These should be handled before the next mobile release/QA pass because they affect correctness, UX safety, or maintainability.

| Priority | Item | Why It Matters | Suggested Fix |
|---|---|---|---|
| P0 | Verify backend runtime startup against Supabase/local env | Mobile API QA depends on a real backend process reachable from emulator/device. | Start backend, confirm `Started DoughlycrumblApplication`, then test emulator/device connectivity through auto-discovery. |
| P0 | Run full mobile golden-path QA on emulator or physical device | Build passes, but runtime flows can still fail due network discovery, backend data, file picker, or UI state. | Test login/register -> menu -> favorite -> product detail -> add cart -> checkout -> orders -> proof upload -> notifications -> profile. |
| P0 | Fix admin order cancellation/override parity | Web supports cancellation with reason and override; mobile admin detail only quotes/advances normal next status. | Add cancel action with reason and optional override selector using `UpdateOrderStatusRequest(reason)`. |
| P0 | Clean admin product availability UI | `AdminAddEditProductActivity` asks for `1` or `0` in `etStock`, but backend uses boolean `available`. This is confusing and looks like stock inventory. | Replace with a switch/checkbox labeled Available and remove stock wording from layout/code. |
| P1 | Add a mobile-specific `UpdateCartItemRequest` | Updating cart sends an extra `productId = 0` field. Even if backend ignores it, the API contract is wrong. | Create `UpdateCartItemRequest(quantity)` and use it for `PUT cart/items/{itemId}`. |
| P1 | Move hardcoded Kotlin UI strings to resources | Several admin/product/order messages are literal strings in Kotlin. | Replace hardcoded Toast/button/text strings with `R.string.*`. |
| P1 | Replace hardcoded drawable colors with color resources | Many drawable XML files use literal hex values instead of `@color/*`. | Migrate non-logo/non-launcher drawable colors to `@color` tokens. |
| P1 | Replace `android.R.drawable.ic_menu_gallery` placeholders | Android platform placeholders look inconsistent with the app's design system. | Add a local product placeholder drawable and use it in admin/product image loading. |
| P1 | Add explicit empty/error/retry states across admin screens | Some screens use Toast only and do not show persistent retryable error/empty states. | Add consistent loading/empty/error blocks to admin products/orders/dashboard/detail screens. |
| P1 | Add profile edit/address UI completion pass | ViewModel supports update profile and add addresses, but the UI needs validation/flow review for production readiness. | Review `ProfileFragment` dialogs/forms, add field validation, loading states, and delete/update address actions if missing. |
| P2 | Add mobile automated tests | There are no meaningful Android unit/UI tests for ViewModels, repositories, or flows. | Start with ViewModel tests for checkout, cart, orders, profile, and admin order transitions. |

## Backlog

These are useful but can wait until release-critical mobile gaps are handled.

| Item | Reason |
|---|---|
| Real-time mobile notifications | Current app uses REST polling for unread count and list. WebSocket/SSE is optional unless real-time mobile UX is required. |
| Admin orders pagination UI | Backend supports page/size, but mobile currently loads a large default list. Add if order volume grows. |
| Product list pagination/infinite scroll | Home currently fetches the first page with a fixed size. Useful later for a larger catalog. |
| Full favorites page | Favorites count and menu favorite toggle exist. A dedicated favorites list can wait until core flows are verified. |
| Saved-address picker in checkout | Profile addresses exist, but checkout still manually enters address. Add once profile/address UX is stable. |
| Payment instruction QR enlargement polish | QR resources and payment screens exist; visual/interaction polish can wait for QA feedback. |
| Replace Compose boilerplate package | `ui/theme` Compose files are leftover boilerplate. Leave alone unless doing a cleanup-only pass. |
| Rebuild archived docs later if needed | Old docs were archived. Recreate active mobile/API docs only after implementation stabilizes, using code and this tracker as source. |

## Android Design And Maintainability Audit

Current state:
- The app is View-based XML with ViewBinding, Retrofit, MVVM, LiveData, and feature packages.
- Core design tokens exist in `colors.xml`, `dimens.xml`, `strings.xml`, `styles.xml`, and `type.xml`.
- Layout/drawable coverage is broad: 35 layouts and 89 drawables.
- The codebase is no longer just scaffolding; most customer/admin flows are implemented and API-backed.

High-refactor areas:

| File / Area | Finding |
|---|---|
| `AdminAddEditProductActivity.kt` and `activity_admin_add_edit_product.xml` | Availability is exposed as stock `1`/`0`; should be a boolean Available control. Contains multiple hardcoded Toast/error strings. |
| `AdminOrderDetailActivity.kt` | Uses hardcoded labels/toasts and lacks full cancel/override parity with web. |
| `AdminOrderAdapter.kt` and `AdminProductAdapter.kt` | Several formatted strings are hardcoded instead of resources. |
| `RetrofitClient.kt` | Has a hardcoded fallback URL comment/value. Acceptable for debug fallback, but should be documented and ideally BuildConfig-driven later. |
| `CartRepository.kt` | Uses `CartItemRequest(0, qty)` for update quantity instead of a dedicated update request. |
| Drawables | Several non-logo drawable colors are hardcoded hex values. Most should reference `@color` tokens. |
| Admin screens generally | Need consistent persistent empty/error/retry states, not only Toast. |

Recommended shared Android helpers/components:
- `UiState<T>` sealed class for loading/success/empty/error.
- `ApiResult` or repository result wrapper for consistent API error handling.
- `SingleLiveEvent`/event wrapper for one-time Snackbar/Toast/navigation events.
- Shared dialog helpers for confirm/cancel actions.
- Shared image picker/upload validator for product images and payment proof.
- Shared status chip/timeline binding helpers around `OrderStatusUi`.
- Shared form validation helpers for phone, required text, price, and image size/type.

## Backend Contract Notes For Mobile

| Backend Area | Status | Mobile Impact |
|---|---|---|
| Auth | Ready | Login/register contracts are wired; secure token storage and 401 handling exist. |
| Products | Ready | Product list/search/category and admin product CRUD are wired. |
| Cart | Mostly ready | Response shape matches. Update request should be cleaned to send only `quantity`. |
| Checkout/orders | Ready | Mobile sends current `CheckoutRequest`; order model matches current `OrderResponse`. |
| Payment proof upload | Ready | Mobile and backend agree on multipart `proof`; 5 MB image validation exists. |
| Notifications | Ready | REST endpoints are wired; unread badge polling exists. |
| Profile/addresses/favorites | Ready | API methods, models, repository, and ViewModel are present. UI needs a completion/QA pass. |
| Admin products/orders | Mostly ready | Products work but availability UI is confusing; orders need cancel/override parity. |

## Next Development Order

1. Verify backend runtime startup and emulator/physical-device connectivity.
2. Run customer golden-path QA and record failures here.
3. Fix admin order cancellation/override parity.
4. Replace admin product stock-style availability with a proper Available switch.
5. Clean cart update request contract.
6. Move hardcoded Kotlin strings and drawable colors into resources/tokens.
7. Add persistent empty/error/retry states to admin screens.
8. Re-run `.\gradlew.bat :app:assembleDebug` after each implementation group.
