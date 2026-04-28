# /ux-audit — UX Safety Audit

Scan every `.tsx` file in `web/src/` and produce a pre-deployment safety report at `docs/UX_SAFETY_AUDIT.md`.

## What to audit in each file

For every file, evaluate ALL of the following. Only report gaps — do not list things that are already present.

### 1. Forms and inputs
- [ ] Every `<input>`, `<textarea>`, `<select>` has client-side validation (`required`, `minLength`, `maxLength`, `pattern`, or React Hook Form / zod rules)
- [ ] Validation error messages are displayed inline (below the field, not just console.log or alert)
- [ ] The submit button is `disabled` while loading / submitting
- [ ] Password fields use `type="password"`
- [ ] Email fields use `type="email"`
- [ ] Number fields use `type="number"` with appropriate `min`/`max`
- [ ] Form is reset after successful submission

### 2. API calls
- [ ] Every `fetch` / `axios` / API function call is wrapped in `try/catch`
- [ ] The `catch` block shows a user-facing error (toast or inline message) — not just `console.error`
- [ ] A loading state (`isLoading`, `isPending`, `loading`) is set before the call and cleared after
- [ ] Success path shows a success toast or navigates with feedback
- [ ] Network errors (not just HTTP errors) are handled

### 3. Toast / feedback
- [ ] Success actions (create, update, delete, submit) show a success toast
- [ ] Failure paths show an error toast with a readable message (not raw API error object)
- [ ] Destructive actions (cancel order, delete product) ask for confirmation before proceeding

### 4. Loading and empty states
- [ ] Data-fetching pages show a loading spinner or skeleton while waiting
- [ ] Lists/tables show an empty state message when there is no data (not just blank space)
- [ ] Buttons that trigger async actions are disabled and show a spinner while in-flight

### 5. Edge cases
- [ ] Inputs are trimmed before submission (no accidental leading/trailing spaces)
- [ ] If a page requires auth and the token is missing/expired, the user is redirected (not silently broken)
- [ ] File upload inputs validate file type and size before uploading

---

## How to run the audit

1. Read every `.tsx` file listed below one by one.
2. For each file, check it against every item in the checklist above.
3. Only record items that are **missing** or **incomplete**.
4. Compile the results into `docs/UX_SAFETY_AUDIT.md` using the report format below.

## Files to audit (in order)

**Auth**
- `web/src/features/auth/LoginPage.tsx`
- `web/src/features/auth/RegisterPage.tsx`

**Menu**
- `web/src/features/menu/MenuPage.tsx`

**Checkout**
- `web/src/features/checkout/CheckoutModal.tsx`

**Orders (customer)**
- `web/src/features/orders/OrdersPage.tsx`
- `web/src/features/orders/OrderDetailPage.tsx`
- `web/src/features/orders/PaymentInstructionsPage.tsx`
- `web/src/features/orders/OrderConfirmationPage.tsx`

**Admin**
- `web/src/features/admin/AdminDashboard.tsx`
- `web/src/features/admin/AdminProducts.tsx`
- `web/src/features/admin/AdminOrders.tsx`
- `web/src/features/admin/AdminOrderDetail.tsx`

**Shared components**
- `web/src/shared/components/ProofUploadForm.tsx`
- `web/src/shared/components/NotificationDropdown.tsx`
- `web/src/layout/OrderPanel.tsx`
- `web/src/layout/Header.tsx`

---

## Report format

Write the output to `docs/UX_SAFETY_AUDIT.md` using this exact structure:

```markdown
# UX Safety Audit — Doughly Crumbl
**Date:** [today]
**Audited by:** /ux-audit
**Files scanned:** [N]
**Total gaps found:** [N]

---

## Summary table

| File | Form validation | Error handling | Toasts | Loading state | Empty state | Confirmations |
|---|---|---|---|---|---|---|
| LoginPage.tsx | ✅ | ⚠️ | ❌ | ✅ | — | — |
...

Legend: ✅ Present  ⚠️ Partial  ❌ Missing  — Not applicable

---

## Gaps by file

### `features/auth/LoginPage.tsx`
- ❌ **No error toast** — the catch block calls console.error but shows no user-facing message
- ⚠️ **Submit button not disabled while loading** — button remains clickable during API call

### `features/checkout/CheckoutModal.tsx`
...

---

## Gaps by category

### Forms & validation
- [ ] `RegisterPage.tsx` — phone field has no format validation
...

### Error handling
- [ ] `AdminProducts.tsx` — delete product catch block is empty
...

### Toasts
- [ ] `OrderDetailPage.tsx` — no success toast after status update
...

### Loading states
- [ ] `AdminOrders.tsx` — no loading spinner while fetching orders
...

### Empty states
- [ ] `OrdersPage.tsx` — renders blank when order list is empty
...

### Confirmations
- [ ] `AdminOrderDetail.tsx` — cancel order has no confirmation dialog
...

---

## Priority fix list

Rank all gaps by severity: **High** (broken user experience), **Medium** (confusing but not broken), **Low** (polish).

| Priority | File | Gap | Suggested fix |
|---|---|---|---|
| High | AdminProducts.tsx | Delete with no confirmation | Add a confirm dialog before DELETE API call |
...
```

After writing the report, print a one-line summary: total files scanned, total gaps found, and the count per category.
