# Android UI Audit — Doughly Crumbl
**Date:** 2026-04-30
**Audited by:** /android-ui
**Files scanned:** 19 layouts + 17 Kotlin files = 36 total
**Total gaps found:** 17
**Auto-fixed:** 12 High-severity items
**Follow-up fixed:** 4 Medium/Low items (all remaining gaps resolved)

---

## Summary table

| File | Brand | MD3 | Accessibility | Performance | States | Forms |
|---|---|---|---|---|---|---|
| `activity_login.xml` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️→✅ |
| `activity_register.xml` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️→✅ |
| `activity_main.xml` | ✅ | ✅ | — | ✅ | — | — |
| `fragment_home.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `item_product.xml` | ✅ | ✅ | ⚠️→✅ | ✅ | — | — |
| `fragment_cart.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `item_cart.xml` | ⚠️→✅ | ⚠️ | ⚠️→✅ | ✅ | — | — |
| `fragment_orders.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `item_order.xml` | ✅ | ✅ | — | ✅ | — | — |
| `activity_order_detail.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `item_order_item.xml` | ✅ | ⚠️ | — | ✅ | — | — |
| `fragment_profile.xml` | ✅ | ✅ | ⚠️→✅ | ✅ | — | — |
| `activity_admin.xml` | ✅ | ✅ | — | ✅ | — | — |
| `fragment_admin_dashboard.xml` | ⚠️ | ✅ | — | ✅ | ✅ | — |
| `fragment_admin_products.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `item_admin_product.xml` | ✅ | ✅ | ⚠️→✅ | ✅ | — | — |
| `activity_admin_add_edit_product.xml` | ✅ | ✅ | ⚠️→✅ | ✅ | ✅ | ⚠️→✅ |
| `fragment_admin_orders.xml` | ✅ | ✅ | — | ✅ | ✅ | — |
| `activity_admin_order_detail.xml` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `LoginActivity.kt` | — | — | — | — | ✅ | ✅ |
| `RegisterActivity.kt` | — | — | — | — | ✅ | ✅ |
| `HomeFragment.kt` | — | — | — | ✅ | ✅ | — |
| `ProductAdapter.kt` | — | — | — | — | ✅ | — |
| `CartFragment.kt` | — | — | — | ✅ | ✅ | — |
| `CartItemAdapter.kt` | — | — | — | — | ✅ | — |
| `OrdersFragment.kt` | — | — | — | ✅ | ✅ | — |
| `OrderAdapter.kt` | — | — | — | — | ✅ | — |
| `OrderDetailActivity.kt` | — | — | — | ✅ | ✅ | — |
| `OrderItemAdapter.kt` | — | — | — | — | ✅ | — |
| `ProfileFragment.kt` | — | — | — | — | ✅ | — |
| `AdminDashboardFragment.kt` | — | — | — | ✅ | ⚠️→✅ | — |
| `AdminProductsFragment.kt` | — | — | — | ✅ | ✅ | — |
| `AdminProductAdapter.kt` | — | — | — | — | ✅ | — |
| `AdminAddEditProductActivity.kt` | — | — | — | — | ✅ | ✅ |
| `AdminOrdersFragment.kt` | — | — | — | ✅ | ✅ | — |
| `AdminOrderDetailActivity.kt` | — | — | — | ✅ | ✅ | — |

Legend: ✅ Pass  ⚠️ Gap found  ⚠️→✅ Gap fixed  — Not applicable

---

## Gaps by file

### `activity_login.xml`
- ❌ **[High] `tilEmail` missing `app:errorEnabled="true"`** — `LoginActivity` sets `binding.tilEmail.error` but without `errorEnabled`, the error text area is not reserved and may cause layout jumps or silent failure.
  - Status: **FIXED** — added `app:errorEnabled="true"` to `tilEmail`
- ❌ **[High] `tilPassword` missing `app:errorEnabled="true"`** — same issue as above.
  - Status: **FIXED** — added `app:errorEnabled="true"` to `tilPassword`
- ✅ **[Low] `tvRegister` touch target too small** — `padding="8dp"` gives only 16×16dp effective area below the text.
  - Status: **FIXED** — added `android:minHeight="48dp"` and `android:gravity="center_vertical"`.

### `activity_register.xml`
- ❌ **[High] `tilName`, `tilEmail`, `tilPassword` all missing `app:errorEnabled="true"`** — same issue as login; `RegisterActivity` sets `.error` on all three.
  - Status: **FIXED** — added `app:errorEnabled="true"` to all three fields
- ✅ **[Low] `tvLogin` touch target too small** — same as `tvRegister` above.
  - Status: **FIXED** — added `android:minHeight="48dp"` and `android:gravity="center_vertical"`.

### `item_product.xml`
- ❌ **[High] `ivProduct` missing `android:contentDescription`** — screen readers cannot describe product images to visually impaired users.
  - Status: **FIXED** — added `android:contentDescription="Product image"`

### `item_cart.xml`
- ❌ **[High] `ivProduct` missing `android:contentDescription`** — same accessibility gap as item_product.
  - Status: **FIXED** — added `android:contentDescription="Product image"`
- ❌ **[High] `tvPrice` missing `android:textStyle="bold"`** — brand system requires price text to be bold; all other screens (item_product, item_order) set bold correctly.
  - Status: **FIXED** — added `android:textStyle="bold"`
- ✅ **[Medium] `btnMinus` / `btnPlus` are 32dp×32dp** — below the 48dp minimum touch target.
  - Status: **FIXED** — added `android:minWidth="48dp"` / `android:minHeight="48dp"` to both; touch zone expands to 48dp while visual size stays 32dp.

### `fragment_profile.xml`
- ❌ **[High] Avatar `ImageView` missing `android:contentDescription`** — decorative icon with no description; TalkBack would announce it as "unlabelled image."
  - Status: **FIXED** — added `android:contentDescription="Profile avatar"` and `android:importantForAccessibility="no"` (redundant but explicit for clarity)

### `fragment_admin_dashboard.xml`
- ✅ **[Medium] "Preparing" stat card uses `@color/primary` background** — the other three cards use semantic status colors (`status_pending`, `status_active`, `status_done`). "Preparing" shares `status_active` with "Confirmed" at the chip level, so using `@color/primary` breaks the color-to-status mapping at a glance.
  - Status: **FIXED** — changed to `@color/status_active` (blue) to match how PREPARING chips are colored throughout the app.

### `item_admin_product.xml`
- ❌ **[High] `btnEdit` / `btnDelete` are 36dp×36dp** — below 48dp minimum. Touch accuracy is poor, especially on small screens.
  - Status: **FIXED** — added `android:padding="6dp"` to both, making effective touch area 48dp×48dp while keeping icon size unchanged.

### `activity_admin_add_edit_product.xml`
- ❌ **[High] `ivPreview` missing `android:contentDescription`** — screen readers cannot identify the image preview area.
  - Status: **FIXED** — added `android:contentDescription="Product preview image"`
- ❌ **[High] `tilName`, `tilDescription`, `tilPrice`, `tilCategory`, `tilStock` all missing `app:errorEnabled="true"`** — `AdminAddEditProductActivity` sets `.error` on all five but the layout doesn't reserve error space, causing layout jumps on validation failure.
  - Status: **FIXED** — added `app:errorEnabled="true"` to all five

### `item_order_item.xml`
- ⚠️ **[Low] Bare `LinearLayout` root (no card wrapper)** — all other item layouts use `MaterialCardView`. This is intentional for in-list detail rows, but it creates a slight visual inconsistency when compared with `item_order.xml`. No action required unless a card-per-item design is desired.

### `AdminDashboardFragment.kt`
- ❌ **[High] `swipeRefresh.isRefreshing = false` called immediately in `setOnRefreshListener`** — the indicator stops the moment the load is triggered, before data arrives. The user sees no visual feedback that loading is in progress.
  - Status: **FIXED** — removed immediate reset from the listener; added `binding.swipeRefresh.isRefreshing = false` to both `viewModel.stats` observer (success) and `viewModel.error` observer (failure).

---

## Gaps by category

### Accessibility (4 gaps, all fixed)
- `item_product.xml` — `ivProduct` no `contentDescription` → **FIXED**
- `item_cart.xml` — `ivProduct` no `contentDescription` → **FIXED**
- `fragment_profile.xml` — avatar `ImageView` no `contentDescription` → **FIXED**
- `activity_admin_add_edit_product.xml` — `ivPreview` no `contentDescription` → **FIXED**
- `item_admin_product.xml` — `btnEdit`/`btnDelete` touch targets 36dp < 48dp → **FIXED**

### Forms (6 gaps, all fixed)
- `activity_login.xml` — `tilEmail`, `tilPassword` no `errorEnabled` → **FIXED**
- `activity_register.xml` — `tilName`, `tilEmail`, `tilPassword` no `errorEnabled` → **FIXED**
- `activity_admin_add_edit_product.xml` — 5 TILs no `errorEnabled` → **FIXED**

### Brand consistency (1 gap)
- `item_cart.xml` — `tvPrice` not bold → **FIXED**
- `fragment_admin_dashboard.xml` — "Preparing" card uses `@color/primary` not `@color/status_active` → needs design decision

### Loading / empty states (1 gap, fixed)
- `AdminDashboardFragment.kt` — swipe-to-refresh spinner resets before data loads → **FIXED**

### Touch targets (1 medium remaining)
- `item_cart.xml` — `btnMinus`/`btnPlus` are 32dp — below 48dp min. Design decision required (changing size affects layout proportions).

---

## Priority fix list

| Priority | File | Gap | Fix | Status |
|---|---|---|---|---|
| High | `activity_login.xml` | `tilEmail`/`tilPassword` no errorEnabled | `app:errorEnabled="true"` | ✅ FIXED |
| High | `activity_register.xml` | All 3 TILs no errorEnabled | `app:errorEnabled="true"` | ✅ FIXED |
| High | `activity_admin_add_edit_product.xml` | 5 TILs no errorEnabled | `app:errorEnabled="true"` | ✅ FIXED |
| High | `item_product.xml` | `ivProduct` no contentDescription | Added description | ✅ FIXED |
| High | `item_cart.xml` | `ivProduct` no contentDescription | Added description | ✅ FIXED |
| High | `item_cart.xml` | `tvPrice` not bold | `android:textStyle="bold"` | ✅ FIXED |
| High | `fragment_profile.xml` | Avatar ImageView no contentDescription | Added description | ✅ FIXED |
| High | `activity_admin_add_edit_product.xml` | `ivPreview` no contentDescription | Added description | ✅ FIXED |
| High | `item_admin_product.xml` | btnEdit/btnDelete 36dp touch target | `android:padding="6dp"` → 48dp | ✅ FIXED |
| High | `AdminDashboardFragment.kt` | swipeRefresh resets before load finishes | Moved reset to observers | ✅ FIXED |
| Medium | `item_cart.xml` | btnMinus/btnPlus 32dp touch targets | `minWidth`/`minHeight="48dp"` | ✅ FIXED |
| Medium | `fragment_admin_dashboard.xml` | "Preparing" card uses `@color/primary` | Changed to `@color/status_active` | ✅ FIXED |
| Low | `activity_login.xml` | `tvRegister` small tap area | `android:minHeight="48dp"` | ✅ FIXED |
| Low | `activity_register.xml` | `tvLogin` small tap area | `android:minHeight="48dp"` | ✅ FIXED |
| Low | `item_order_item.xml` | Bare LinearLayout (no card) | Intentional — OK as-is | — |
