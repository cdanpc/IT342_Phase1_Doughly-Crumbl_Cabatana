# UX Safety Audit — Doughly Crumbl
**Date:** 2026-04-28
**Audited by:** /ux-audit
**Files scanned:** 16
**Total gaps found:** 18

---

## Summary table

| File | Form validation | Error handling | Toasts | Loading state | Empty state | Confirmations |
|---|---|---|---|---|---|---|
| `LoginPage.tsx` | ✅ | ✅ | ✅ | ✅ | — | — |
| `RegisterPage.tsx` | ⚠️ | ✅ | ✅ | ✅ | — | — |
| `MenuPage.tsx` | — | ❌ | ❌ | ⚠️ | ✅ | — |
| `CheckoutModal.tsx` | ⚠️ | ✅ | ✅ | ✅ | — | ✅ |
| `OrdersPage.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `OrderDetailPage.tsx` | — | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| `PaymentInstructionsPage.tsx` | — | ⚠️ | ✅ | ✅ | ✅ | — |
| `OrderConfirmationPage.tsx` | — | — | — | — | ✅ | — |
| `AdminDashboard.tsx` | — | ❌ | ❌ | ✅ | — | — |
| `AdminProducts.tsx` | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `AdminOrders.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `AdminOrderDetail.tsx` | — | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| `ProofUploadForm.tsx` | ⚠️ | — | — | ✅ | — | — |
| `NotificationDropdown.tsx` | — | ⚠️ | — | — | ✅ | — |
| `OrderPanel.tsx` | — | ❌ | ❌ | ❌ | ✅ | — |
| `Header.tsx` | ✅ | — | — | — | — | — |

Legend: ✅ Present  ⚠️ Partial  ❌ Missing  — Not applicable

---

## Gaps by file

### `features/auth/RegisterPage.tsx`
- ⚠️ **Phone number has no format validation** — `validate()` only checks `!phoneNumber.trim()`, but accepts any string (e.g. `"abc"`). No `pattern` regex or format hint is enforced client-side.

### `features/menu/MenuPage.tsx`
- ❌ **`handleAddToCart` has no `try/catch`** — if `addToCart` throws (network error, 401, etc.), the error is silently swallowed and the user gets no feedback.
- ❌ **No error toast if `addToCart` fails** — because the catch path doesn't exist; the user never learns the item wasn't added.
- ⚠️ **No loading/disabled state on the cart button while in-flight** — the `+` cart icon can be clicked repeatedly while the async call is pending, potentially adding duplicate items.

### `features/checkout/CheckoutModal.tsx`
- ⚠️ **No inline error messages below fields** — phone, street, barangay, and city validation errors are shown only as toasts (e.g. `toast.error('Please fill in your contact number.')`), not below the specific input that failed. The user cannot tell which field is wrong if toasts auto-dismiss.
- ⚠️ **Phone field has no format validation** — only `!phone.trim()` is checked; `"abc"` passes validation.
- ⚠️ **Form fields not reset after successful submission** — because the modal uses `if (!isOpen) return null`, the `useState` values persist in memory. If the user places a new order later (checkout reopens), they will see the previous delivery address and phone number pre-filled.

### `features/orders/OrderDetailPage.tsx`
- ⚠️ **Initial fetch error has no toast** — the `catch` block on the first (non-silent) fetch only calls `setOrder(null)`, rendering "Order not found." The user cannot distinguish a real 404 from a network failure or expired session.

### `features/orders/PaymentInstructionsPage.tsx`
- ⚠️ **Initial fetch error has no toast** — same pattern as `OrderDetailPage`: the `catch` calls `setOrder(null)` silently; the user sees "Order not found." with no error explanation.

### `features/admin/AdminDashboard.tsx`
- ❌ **`fetchData` catch block is `// ignore`** — both `getAdminOrders()` and `getAdminProducts()` errors are completely suppressed. The admin sees the dashboard with all stats showing `0` and has no indication the backend is unreachable or the token expired.
- ❌ **No error toast when dashboard data fails to load** — direct consequence of the `// ignore` catch.

### `features/admin/AdminProducts.tsx`
- ⚠️ **Form validation errors shown as toast, not inline** — when name is empty or price is ≤ 0, `toast.error('Please fill in all required fields')` fires but no field-level error message appears next to the input. In a modal, the toast may overlap or auto-dismiss before the user reads it.
- ⚠️ **No client-side file size validation before upload** — the UI says "max 5 MB" but there is no JS check in `handleFileChange`. A 50 MB file will be accepted by the picker, then fail at the API call, producing only a generic "Failed to save product" toast.

### `features/admin/AdminOrderDetail.tsx`
- ⚠️ **Initial fetch error has no toast** — same pattern: `catch` sets `setOrder(null)`, admin sees "Order not found." with no indication of a network or auth error.

### `shared/components/ProofUploadForm.tsx`
- ❌ **No client-side file size validation** — `accept="image/*"` restricts type via the browser picker, but any image size is accepted. The UI hint says "PNG, JPG up to 10MB", but nothing enforces this. A large file will fail at the server with a generic error and no actionable message.

### `shared/components/NotificationDropdown.tsx`
- ⚠️ **`markRead` and `markAllRead` calls have no `try/catch`** — errors are silently swallowed. While low-stakes, failed read-marking leaves the badge count stale indefinitely with no user feedback.

### `layout/OrderPanel.tsx`
- ❌ **`updateQuantity` and `removeItem` calls have no `try/catch`** — cart mutation errors are swallowed; the UI optimistically updates (or not) with no error message.
- ❌ **No error toast if cart operations fail** — no feedback when quantity update or item removal fails.
- ❌ **No loading/disabled state on quantity `+`/`−` and remove buttons while async calls are in-flight** — rapid clicking can queue conflicting mutations.

---

## Gaps by category

### Forms & validation
- [ ] `RegisterPage.tsx` — phone number field accepts any string; no format regex enforced
- [ ] `CheckoutModal.tsx` — phone field accepts any string; no format validation
- [ ] `CheckoutModal.tsx` — validation errors displayed only as toasts, not inline below failing fields
- [ ] `AdminProducts.tsx` — name/price validation errors displayed only as toasts, not inline in the modal form

### Error handling
- [ ] `MenuPage.tsx` — `handleAddToCart` has no `try/catch`
- [ ] `AdminDashboard.tsx` — `fetchData` catch block is `// ignore`; errors fully suppressed
- [ ] `OrderDetailPage.tsx` — initial `fetchOrder` catch has no error toast
- [ ] `PaymentInstructionsPage.tsx` — `fetchOrder` catch has no error toast
- [ ] `AdminOrderDetail.tsx` — initial `fetchOrder` catch has no error toast
- [ ] `NotificationDropdown.tsx` — `markRead` / `markAllRead` have no `try/catch`
- [ ] `OrderPanel.tsx` — `updateQuantity` / `removeItem` have no `try/catch`

### Toasts
- [ ] `MenuPage.tsx` — no error toast when `addToCart` fails (no catch exists)
- [ ] `AdminDashboard.tsx` — no error toast when dashboard data fails to load
- [ ] `OrderPanel.tsx` — no error toast when cart mutations fail

### Loading states
- [ ] `MenuPage.tsx` — add-to-cart button not disabled / no spinner while `addToCart` is in-flight
- [ ] `OrderPanel.tsx` — quantity and remove buttons not disabled while async mutations are in-flight

### Empty states
- *(No gaps — all applicable pages show empty-state messages)*

### File upload validation
- [ ] `AdminProducts.tsx` — no JS file size check before upload (only a UI hint)
- [ ] `ProofUploadForm.tsx` — no JS file size check before submission (only a UI hint)

### Form reset / session hygiene
- [ ] `CheckoutModal.tsx` — form fields not cleared after a successful order; stale address/phone reappears on next checkout

---

## Priority fix list

| Priority | File | Gap | Suggested fix |
|---|---|---|---|
| **High** | `AdminDashboard.tsx` | Errors silently ignored — admin sees blank stats with no explanation | Replace `// ignore` with `toast.error('Failed to load dashboard data')` |
| **High** | `OrderPanel.tsx` | Cart mutations have no error handling or loading state | Wrap `updateQuantity`/`removeItem` in `try/catch`; disable buttons while in-flight |
| **High** | `MenuPage.tsx` | `addToCart` has no error handling and button is not disabled while in-flight | Add `try/catch` with `toast.error`; add `isAdding` state to disable the cart button |
| **High** | `ProofUploadForm.tsx` | No file size check — large uploads fail silently at the server | In `handleFileChange`, reject files over 10 MB with an inline error message |
| **High** | `AdminProducts.tsx` | No file size check on product image upload | In `handleFileChange`, reject files over 5 MB before proceeding |
| **Medium** | `CheckoutModal.tsx` | Validation errors only shown as toasts, not inline | Add per-field error state (similar to LoginPage pattern) and show errors below each input |
| **Medium** | `AdminProducts.tsx` | Form validation errors only shown as toasts | Add inline error display below the Name and Price inputs in the modal |
| **Medium** | `OrderDetailPage.tsx` | Network error on initial load indistinguishable from 404 | Add `toast.error('Failed to load order. Please try again.')` in the non-silent catch |
| **Medium** | `PaymentInstructionsPage.tsx` | Same as above | Same fix: `toast.error` in the `fetchOrder` catch |
| **Medium** | `AdminOrderDetail.tsx` | Same as above | Same fix: `toast.error` in the `fetchOrder` catch |
| **Medium** | `CheckoutModal.tsx` | Form fields not reset after successful submission | Call a `resetForm()` helper before `onClose()` in `confirmPlaceOrder` success path |
| **Low** | `RegisterPage.tsx` | Phone field accepts any string | Add a regex check (e.g. Philippine format `^(09|\+639)\d{9}$`) in `validate()` |
| **Low** | `CheckoutModal.tsx` | Phone field accepts any string | Add phone format check in `handlePlaceOrder` validation block |
| **Low** | `NotificationDropdown.tsx` | `markRead`/`markAllRead` not wrapped in try/catch | Wrap in try/catch; silently ignore or show a low-priority toast |
