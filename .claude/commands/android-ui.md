# /android-ui — Android UI Design Audit & Polish

Audit every XML layout and Kotlin UI file in `mobile/app/src/main/` against the Doughly Crumbl brand system, Material Design 3 guidelines, and Android UX best practices. Produce a prioritized fix report at `docs/ANDROID_UI_AUDIT.md` and apply all High-severity fixes automatically.

---

## Project design system (Doughly Crumbl)

### Brand palette (`res/values/colors.xml`)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#C8874E` | Buttons, FAB, toolbar background, price text, active nav icon |
| `primary_dark` | `#A0693A` | Pressed states, status bar |
| `primary_light` | `#F5E6D3` | Chip backgrounds (selected), highlights |
| `accent` | `#8B4513` | Secondary accents |
| `background` | `#FAFAFA` | Root screen background |
| `surface` | `#FFFFFF` | Card backgrounds, bottom nav |
| `on_primary` | `#FFFFFF` | Text/icons on primary-colored surfaces |
| `text_primary` | `#1A1A1A` | Body text, titles |
| `text_secondary` | `#757575` | Subtitles, captions, hints |
| `error` | `#D32F2F` | Error messages, delete tint |
| `success` | `#388E3C` | Success toasts |
| `warning` | `#FFA726` | Warning states |
| `info` | `#42A5F5` | Info, edit button tint |
| `divider` | `#E0E0E0` | `<View>` separators, card borders |
| `status_pending` | `#FFA726` | PENDING chip/badge |
| `status_active` | `#42A5F5` | CONFIRMED / PREPARING chip |
| `status_done` | `#66BB6A` | READY / DELIVERED chip |
| `status_cancelled` | `#EF5350` | CANCELLED chip |

### Typography scale
| Role | Size | Style |
|---|---|---|
| Screen title (Toolbar) | system default | bold |
| Card heading | 15–16sp | bold |
| Body / label | 13–15sp | normal |
| Caption / metadata | 12–13sp | normal, `text_secondary` |
| Price | 13–16sp | bold, `primary` |
| Grand total | 16sp | bold, `primary` |

### Touch target minimum
Every interactive element must be **at least 48dp × 48dp**. `ImageButton` sizing below 36dp is a violation. Prefer `android:minWidth`/`android:minHeight` or padding to reach 48dp.

### Spacing
- Screen padding: `16dp`
- Card internal padding: `12–16dp`
- Item spacing (margins): `4–12dp`
- Section gap: `12–16dp`

---

## Audit checklist

Run every check below on every applicable file. Only report **gaps** — not things that are already correct.

### 1. Brand compliance
- [ ] All toolbar backgrounds use `@color/primary`; all toolbar title text uses `@color/on_primary`
- [ ] All `MaterialButton` (filled) backgrounds default to `@color/primary` unless intentionally overridden
- [ ] Price `TextView` uses `@color/primary` and bold style
- [ ] Grand Total `TextView` uses `@color/primary`, bold, ≥16sp
- [ ] Subtotal / secondary totals use `@color/text_primary` or `@color/text_secondary`
- [ ] Status chips use the correct semantic color: PENDING→`status_pending`, CONFIRMED/PREPARING→`status_active`, READY/DELIVERED→`status_done`, CANCELLED→`status_cancelled`
- [ ] `@color/error` used for delete/destructive icon tint; `@color/info` for edit icon tint
- [ ] No hardcoded hex colors in XML (must reference `@color/` tokens)
- [ ] No hardcoded dimension values that deviate from the spacing scale without reason

### 2. Material Design 3 compliance
- [ ] All text inputs use `TextInputLayout` with `OutlinedBox` style (not bare `EditText`)
- [ ] Destructive buttons use `OutlinedButton` or a danger-styled button, never plain filled primary
- [ ] Cards use `MaterialCardView` with `cardCornerRadius ≥ 8dp` and `cardElevation ≥ 1dp`
- [ ] FAB uses `FloatingActionButton` with `backgroundTint="@color/primary"` and `tint="@color/on_primary"`
- [ ] `BottomNavigationView` uses `itemIconTint` and `itemTextColor` referencing `@color/primary`
- [ ] Status chips are `com.google.android.material.chip.Chip`, not bare `TextView` with custom background
- [ ] `Toolbar` or `MaterialToolbar` used instead of plain `View` for top bars
- [ ] `SwipeRefreshLayout` present on any list screen that fetches remote data

### 3. Accessibility
- [ ] Every `ImageView` that displays meaningful content has `android:contentDescription` (not `tools:ignore`)
- [ ] Every `ImageButton` has `android:contentDescription`
- [ ] Interactive elements are ≥48dp in their touch target (width + height or padding)
- [ ] Text contrast: `text_primary (#1A1A1A)` on white surface passes 7:1; `text_secondary (#757575)` on white passes 4.6:1 — verify no lighter color is used for body text
- [ ] `android:importantForAccessibility="no"` set on purely decorative `ImageView`s (dividers, icons that duplicate adjacent label text)
- [ ] `android:labelFor` set on `TextInputLayout` containing a custom label `TextView` (if any)

### 4. Layout performance
- [ ] No unnecessary nested `LinearLayout` where a `ConstraintLayout` would eliminate nesting ≥3 levels deep
- [ ] `android:layout_weight` not used inside a `RelativeLayout` or `ConstraintLayout` (only valid inside `LinearLayout`)
- [ ] `android:layout_weight="1"` with `android:layout_height="0dp"` (or width) correctly pairs — no weight with `wrap_content`
- [ ] `RecyclerView` inside `ScrollView` has `android:nestedScrollingEnabled="false"` to prevent double-scroll jank
- [ ] `ImageView` inside `RecyclerView` item uses fixed dimensions (not `wrap_content` in both axes) to prevent layout thrashing
- [ ] No `ScrollView` containing another `ScrollView` in the same orientation

### 5. Loading and empty states
- [ ] Every list screen (`RecyclerView`) has a `tvEmpty` `TextView` that shows when the list is empty
- [ ] Every screen that fetches data has a `ProgressBar` (or shimmer) visible during load
- [ ] `ProgressBar` is `android:visibility="gone"` by default (not `invisible`) so it doesn't take up space
- [ ] `SwipeRefreshLayout` present on all list screens to allow manual refresh
- [ ] Order detail screens show a loading state while the order is being fetched

### 6. Form inputs and validation feedback
- [ ] All `TextInputLayout` fields have an `android:hint` that clearly describes the field
- [ ] Numeric-only fields use `android:inputType="numberDecimal"` or `"number"` (not `text`)
- [ ] Email fields use `android:inputType="textEmailAddress"`
- [ ] Password fields use `android:inputType="textPassword"`
- [ ] `TextInputLayout` `app:errorEnabled="true"` set on fields that show inline validation errors (login, register, add-product price)
- [ ] Submit / Save buttons are wide (`layout_width="match_parent"`) and have enough height (≥48dp implicitly via Material style)

### 7. Scrollability
- [ ] Any screen whose content can overflow the viewport is wrapped in `ScrollView` or `NestedScrollView`
- [ ] `ScrollView` uses `android:layout_height="0dp"` + `android:layout_weight="1"` (inside a weighted `LinearLayout`) to fill remaining space without clipping the bottom nav/toolbar
- [ ] Order detail activities (customer + admin) are scrollable end-to-end, including status action area

### 8. Item layout consistency
- [ ] All list item cards (`item_*.xml`) use consistent internal padding (10–14dp)
- [ ] All list item `ImageView`s use `android:scaleType="centerCrop"` with fixed dimensions
- [ ] Price in item cards: bold, `@color/primary`
- [ ] Item name: bold, `@color/text_primary`, `ellipsize="end"` with `maxLines` set

### 9. Admin-specific checks
- [ ] `activity_admin_add_edit_product.xml`: image preview `ImageView` has a fixed height (e.g. `180dp`) and `@color/divider` background as placeholder
- [ ] `activity_admin_order_detail.xml`: delivery fee input section is visually separated from the read-only financials by a `<View>` divider
- [ ] `fragment_admin_dashboard.xml`: stat cards use distinct background colors per status category to quickly distinguish metrics at a glance
- [ ] Status update buttons in `AdminOrderDetailActivity` have a `layout_margin` of at least 4dp between them and are large enough to tap

### 10. Kotlin UI code checks (Fragments + Activities)
- [ ] Every `RecyclerView.adapter` assignment is preceded by a `RecyclerView.layoutManager` assignment
- [ ] `ListAdapter.submitList()` is always called (never direct `notifyDataSetChanged()`)
- [ ] `Glide.with(context).load(url).placeholder(...).into(imageView)` — all Glide loads use `.placeholder()` to prevent blank flicker
- [ ] `Toast` messages use `getString(R.string.xxx)` (not hardcoded strings) where a string resource exists
- [ ] `binding.swipeRefresh.isRefreshing = false` called in both success and error observers (not just success)
- [ ] `_binding = null` in `onDestroyView()` present in every Fragment (prevents memory leak)

---

## Files to audit

**Layouts**
- `mobile/app/src/main/res/layout/activity_login.xml`
- `mobile/app/src/main/res/layout/activity_register.xml`
- `mobile/app/src/main/res/layout/activity_main.xml`
- `mobile/app/src/main/res/layout/fragment_home.xml`
- `mobile/app/src/main/res/layout/item_product.xml`
- `mobile/app/src/main/res/layout/fragment_cart.xml`
- `mobile/app/src/main/res/layout/item_cart.xml`
- `mobile/app/src/main/res/layout/fragment_orders.xml`
- `mobile/app/src/main/res/layout/item_order.xml`
- `mobile/app/src/main/res/layout/activity_order_detail.xml`
- `mobile/app/src/main/res/layout/item_order_item.xml`
- `mobile/app/src/main/res/layout/fragment_profile.xml`
- `mobile/app/src/main/res/layout/activity_admin.xml`
- `mobile/app/src/main/res/layout/fragment_admin_dashboard.xml`
- `mobile/app/src/main/res/layout/fragment_admin_products.xml`
- `mobile/app/src/main/res/layout/item_admin_product.xml`
- `mobile/app/src/main/res/layout/activity_admin_add_edit_product.xml`
- `mobile/app/src/main/res/layout/fragment_admin_orders.xml`
- `mobile/app/src/main/res/layout/activity_admin_order_detail.xml`

**Kotlin UI files**
- `mobile/app/src/main/java/com/example/mobile/auth/ui/LoginActivity.kt`
- `mobile/app/src/main/java/com/example/mobile/auth/ui/RegisterActivity.kt`
- `mobile/app/src/main/java/com/example/mobile/home/ui/HomeFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/home/ui/ProductAdapter.kt`
- `mobile/app/src/main/java/com/example/mobile/cart/ui/CartFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/cart/ui/CartItemAdapter.kt`
- `mobile/app/src/main/java/com/example/mobile/orders/ui/OrdersFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/orders/ui/OrderAdapter.kt`
- `mobile/app/src/main/java/com/example/mobile/orders/ui/OrderDetailActivity.kt`
- `mobile/app/src/main/java/com/example/mobile/orders/ui/OrderItemAdapter.kt`
- `mobile/app/src/main/java/com/example/mobile/profile/ui/ProfileFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminDashboardFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminProductsFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminProductAdapter.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminAddEditProductActivity.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminOrdersFragment.kt`
- `mobile/app/src/main/java/com/example/mobile/admin/ui/AdminOrderDetailActivity.kt`

---

## How to run the audit

1. Read every file listed above one by one using the Read tool.
2. For each file, check it against every applicable item in the checklist.
3. Only record items that are **missing** or **incomplete**.
4. Compile findings into `docs/ANDROID_UI_AUDIT.md` using the report format below.
5. Automatically apply all **High** severity fixes using the Edit tool. Make one edit per finding — do not batch unrelated changes.
6. After applying fixes, write a brief "Fixed" note next to each resolved finding in the report.

---

## Report format

Write to `docs/ANDROID_UI_AUDIT.md`:

```markdown
# Android UI Audit — Doughly Crumbl
**Date:** [today]
**Audited by:** /android-ui
**Files scanned:** [N layouts + N Kotlin files]
**Total gaps found:** [N]
**Auto-fixed:** [N High-severity items]

---

## Summary table

| File | Brand | MD3 | Accessibility | Performance | States | Forms |
|---|---|---|---|---|---|---|
| activity_login.xml | ✅ | ⚠️ | ❌ | ✅ | ✅ | ⚠️ |
...

Legend: ✅ Pass  ⚠️ Partial  ❌ Fail  — Not applicable

---

## Gaps by file

### `activity_login.xml`
- ❌ **[High] No errorEnabled on TextInputLayout** — inline validation errors won't show. Fix: add `app:errorEnabled="true"` to `tilEmail` and `tilPassword`.
  - Status: **FIXED** (Edit applied)

### `item_product.xml`
- ⚠️ **[Medium] ImageView missing contentDescription** — screen readers can't describe product images.
...

---

## Gaps by category

### Brand compliance
- [ ] `item_cart.xml` — product name uses hardcoded `#000000` instead of `@color/text_primary`
...

### Accessibility
...

### Layout performance
...

### Loading / empty states
...

### Forms
...

---

## Priority fix list

| Priority | File | Gap | Fix |
|---|---|---|---|
| High | activity_login.xml | No errorEnabled on TIL | `app:errorEnabled="true"` on tilEmail + tilPassword |
| High | item_product.xml | ImageView no contentDescription | `android:contentDescription="@string/product_image"` |
| Medium | fragment_cart.xml | No pull-to-refresh | Wrap RecyclerView in SwipeRefreshLayout |
| Low | item_order.xml | Status text not using color token | Use `@color/status_pending` via statusColor helper |
...
```

After writing the report, print a one-line summary: total files scanned, total gaps found, count by severity, and count auto-fixed.

---

## Auto-fix rules

Apply fixes automatically (no confirmation needed) for:
- Missing `android:contentDescription` on `ImageView`/`ImageButton` (add a reasonable string)
- `android:visibility="invisible"` on `ProgressBar` → change to `gone`
- Missing `android:nestedScrollingEnabled="false"` on `RecyclerView` inside `ScrollView`
- Hardcoded color values that match a known `@color/` token exactly (e.g. `#C8874E` → `@color/primary`)
- Missing `app:errorEnabled="true"` on `TextInputLayout` for login/register/add-product fields
- Missing `_binding = null` in `onDestroyView()` of a Fragment (add after `super.onDestroyView()`)
- Missing `.placeholder(R.drawable.ic_menu_gallery)` on a Glide load call
- Missing `isRefreshing = false` in an error observer when the success observer already resets it

Ask before changing anything that involves design judgment (layout restructuring, spacing changes, color choices beyond token substitution).
