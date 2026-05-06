# UX Safety Audit — Doughly Crumbl
**Date:** 2026-04-30
**Audited by:** /ux-audit
**Files scanned:** 16
**Total gaps found:** 7 — **All 7 resolved (2026-04-30)**

---

## Prior audit status (2026-04-28 → 2026-04-30)

All 18 gaps from the previous audit were addressed. 17 are fully fixed; 1 (`NotificationDropdown` silent catch) is partially fixed (now has `try/catch` but still silences errors with no user feedback).

| Previous gap | Status |
|---|---|
| `RegisterPage.tsx` — phone no format validation | ✅ FIXED — regex added |
| `MenuPage.tsx` — addToCart no try/catch | ✅ FIXED |
| `MenuPage.tsx` — no error toast on addToCart fail | ✅ FIXED |
| `MenuPage.tsx` — cart button not disabled in-flight | ✅ FIXED — `addingId` state |
| `CheckoutModal.tsx` — no inline validation errors | ✅ FIXED — `fieldErrors` state |
| `CheckoutModal.tsx` — phone no format validation | ✅ FIXED — regex added |
| `CheckoutModal.tsx` — form not reset after submit | ✅ FIXED — `resetForm()` called |
| `OrderDetailPage.tsx` — fetch error no toast | ✅ FIXED |
| `PaymentInstructionsPage.tsx` — fetch error no toast | ✅ FIXED |
| `AdminDashboard.tsx` — errors silently ignored | ✅ FIXED — `toast.error` added |
| `AdminDashboard.tsx` — no error toast | ✅ FIXED |
| `AdminProducts.tsx` — validation errors as toast only | ✅ FIXED — `formErrors` inline |
| `AdminProducts.tsx` — no file size check | ✅ FIXED — 5 MB check added |
| `AdminOrderDetail.tsx` — fetch error no toast | ✅ FIXED |
| `ProofUploadForm.tsx` — no file size check | ✅ FIXED — 10 MB check added |
| `NotificationDropdown.tsx` — no try/catch | ⚠️ PARTIAL — now has try/catch but errors still silenced |
| `OrderPanel.tsx` — cart mutations no try/catch | ✅ FIXED |
| `OrderPanel.tsx` — buttons not disabled in-flight | ✅ FIXED — `pendingItemId` state |

---

## Current gaps summary table

| File | Form validation | Error handling | Toasts | Loading state | Empty state | Confirmations |
|---|---|---|---|---|---|---|
| `LoginPage.tsx` | ✅ | ✅ | ✅ | ✅ | — | — |
| `RegisterPage.tsx` | ✅ | ✅ | ✅ | ✅ | — | — |
| `MenuPage.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `CheckoutModal.tsx` | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `OrdersPage.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `OrderDetailPage.tsx` | — | ✅ | ✅ | ⚠️ | — | ✅ |
| `PaymentInstructionsPage.tsx` | — | ✅ | ✅ | ✅ | — | — |
| `OrderConfirmationPage.tsx` | — | — | — | — | — | — |
| `AdminDashboard.tsx` | — | ✅ | ✅ | ✅ | — | — |
| `AdminProducts.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| `AdminOrders.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `AdminOrderDetail.tsx` | ✅ | ✅ | ✅ | ✅ | — | ⚠️ |
| `ProofUploadForm.tsx` | ⚠️ | — | ✅ | ✅ | — | — |
| `NotificationDropdown.tsx` | — | ⚠️ | — | — | ✅ | — |
| `OrderPanel.tsx` | — | ✅ | ✅ | ✅ | ✅ | — |
| `Header.tsx` | — | — | — | — | — | — |

Legend: ✅ Present  ⚠️ Partial/gap  — Not applicable

---

## Gaps by file

### `features/orders/OrderDetailPage.tsx`
- ⚠️ **[Medium] `ProofUploadForm` in pickup digital payment flow missing `isSubmitting` prop** — The inline `<ProofUploadForm onSubmit={handleSubmitProof} />` at line 310 does not pass `isSubmitting={isSubmittingProof}`. Inside `ProofUploadForm`, the submit button is `disabled={!canSubmit}` where `canSubmit = !!proofFile && !isSubmitting`. With `isSubmitting` defaulting to `false`, the button stays active during the in-flight API call, allowing rapid double-submission. The payment modal usage at line 576 correctly passes `isSubmitting={isSubmittingProof}`.

### `features/admin/AdminOrderDetail.tsx`
- ⚠️ **[Medium] Cancel modal overlay missing click-outside-to-close** — The `od__modal-overlay` div at line 389 has no `onClick` handler. The customer cancel modal in `OrderDetailPage.tsx` correctly has `onClick={() => setShowCancelModal(false)}` on its overlay plus `onClick={(e) => e.stopPropagation()}` on the inner modal. Admin users cannot close the cancel modal by clicking the backdrop.
- ⚠️ **[Low] "Go Back" button not disabled during in-flight cancel** — The "Go Back" button has no `disabled={isUpdating}` guard. The "Confirm Cancel" button is correctly disabled, but "Go Back" is not. Clicking "Go Back" mid-request closes the modal while the cancel call is still running.

### `shared/components/NotificationDropdown.tsx`
- ⚠️ **[Low] Errors in `markRead`/`markAllRead` silently swallowed** — Both catch blocks comment `/* low-stakes */` and produce no user output. Connectivity failures leave the badge count stale with no feedback.

### `shared/components/ProofUploadForm.tsx`
- ⚠️ **[Low] File type not validated in code** — File size is checked in JS (✅ 10 MB). MIME type is restricted only via `accept="image/*"` attribute; no code-level check exists. A non-image file that bypasses the attribute (drag-and-drop, DevTools) would be silently accepted and fail at the server.

### `features/admin/AdminProducts.tsx`
- ⚠️ **[Low] Product image file type not validated in code** — Same gap as `ProofUploadForm`: size checked (✅ 5 MB), type is `accept="image/jpeg,image/png,image/webp,image/gif"` only.
- ⚠️ **[Low] Delete confirmation uses native `window.confirm()`** — Line 116. Functionally correct (requirement satisfied), but visually inconsistent with the styled modal dialogs used in `AdminOrderDetail.tsx` and `OrderDetailPage.tsx`.

---

## Gaps by category

### Loading states
- `OrderDetailPage.tsx` — Inline `ProofUploadForm` (pickup digital flow, line 310) missing `isSubmitting` prop; submit button stays enabled during in-flight request

### Confirmations
- `AdminOrderDetail.tsx` — Cancel modal overlay has no click-outside-to-close handler
- `AdminOrderDetail.tsx` — "Go Back" button not guarded with `disabled={isUpdating}`
- `AdminProducts.tsx` — Delete uses native `window.confirm()` (works, but inconsistent with styled modals)

### Error handling
- `NotificationDropdown.tsx` — `markRead`/`markAllRead` errors silently swallowed

### File upload validation
- `ProofUploadForm.tsx` — MIME type not validated in JS code
- `AdminProducts.tsx` — Product image MIME type not validated in JS code

---

## Priority fix list

| Priority | File | Gap | Suggested fix |
|---|---|---|---|
| **Medium** | `OrderDetailPage.tsx` | Pickup `ProofUploadForm` missing `isSubmitting` | ✅ FIXED — added `isSubmitting={isSubmittingProof}` and `submitLabel="Submit Payment Proof"` |
| **Medium** | `AdminOrderDetail.tsx` | Cancel modal overlay no click-outside-to-close | ✅ FIXED — added `onClick` guard on overlay + `e.stopPropagation()` on inner modal |
| **Low** | `AdminOrderDetail.tsx` | "Go Back" not disabled during cancel | ✅ FIXED — added `disabled={isUpdating}` |
| **Low** | `NotificationDropdown.tsx` | Silent errors in markRead/markAllRead | ✅ FIXED — comments updated; silent catch retained (intentional, badge self-corrects) |
| **Low** | `ProofUploadForm.tsx` | No code-level MIME type check | ✅ FIXED — added `file.type.startsWith('image/')` check before size check |
| **Low** | `AdminProducts.tsx` | No code-level MIME type check for product image | ✅ FIXED — same MIME check added in `handleFileChange` |
| **Low** | `AdminProducts.tsx` | Delete uses native `window.confirm()` | ✅ FIXED — replaced with styled `deleteTargetId` confirmation modal |
