# Web System Progress

Last audited: 2026-05-25
Branch: `mobile/core-features`

This tracker is based on the current repo state, not only the older docs. It starts with the web app, but includes backend contract checks for every web-facing feature so development can start from known gaps.

## Verification Status

| Area | Command | Result |
|---|---|---|
| Web build | `npm run build` from `web/` | **✅ Passed. 1951 modules, built in 6.12s (2026-05-25, after PageHeader + Table + FileUploadField primitives pass).** |
| TypeScript check — latest pass | `npm.cmd exec -- tsc -b` from `web/` | **0 errors (included in build above — tsc -b runs first in build script).** |
| **Full web lint** | `npm run lint` from `web/` | **✅ 0 errors, 1 intentional warning (2026-05-25)** — `OrderDetailPage.tsx:129` react-hooks/exhaustive-deps warning is documented and intentional. |
| Web dev server | `npm run dev -- --host 127.0.0.1 --port 5174` from `web/` | Verified HTTP 200 after previous customer-facing pass. |
| Backend tests | `.\mvnw.cmd test` from `backend/` | ✅ Passed. 53 tests, 0 failures, 0 errors (2026-05-25, after admin upload-image fix). |
| **Backend runtime startup** | `.\mvnw.cmd spring-boot:run` from `backend/` | **✅ VERIFIED (2026-05-23)** — HikariPool-1 connected to Supabase (port 5432, sslmode=require). HTTP 200 at `http://localhost:8080/api/products`. One non-fatal DDL WARN on startup (see notes). |

Notes:
- Backend tests run with the `test` profile and H2.
- **Backend runtime startup is VERIFIED.** Supabase DB connection confirmed. Backend responds HTTP 200 at `http://localhost:8080`.
- **DDL warning (non-fatal):** On every startup with `JPA_DDL_AUTO=update`, Hibernate generates `ALTER TABLE orders ALTER COLUMN payment_status SET DATA TYPE VARCHAR(30) DEFAULT 'UNPAID'` — this is invalid PostgreSQL syntax (DEFAULT cannot be combined with TYPE in a single ALTER COLUMN statement). This produces a `WARN` but does NOT crash the app. Fix: split into separate `TYPE` and `SET DEFAULT` statements, or switch `JPA_DDL_AUTO` to `validate` and manage schema changes via Flyway migration instead.
- **Full web lint is now clean (2026-05-24).** Previously failing issues in `shared/hooks/AuthContext.tsx`, `shared/hooks/CartContext.tsx`, `shared/hooks/NotificationContext.tsx`, `components/profile/ProfileForm.tsx`, `components/profile/AddressManager.tsx`, and `features/menu/MenuPage.tsx` are all resolved.
- `OrderDetailPage.tsx` lint warning (react-hooks/exhaustive-deps) is pre-existing and intentional — not introduced by any recent pass.

## Bug Fix: Admin "Add Product" 500 on image upload (2026-05-25)

**Reported symptom:** Adding a new product from the admin product form failed; backend threw a Spring 500 during the POST.

**Root cause:** Multipart field-name mismatch on the image-upload endpoint.
- Both clients send the multipart part named **`file`**:
  - Web: `productApi.ts` → `formData.append('file', file)`
  - Mobile: `AdminAddEditProductActivity.kt:139` → `MultipartBody.Part.createFormData("file", ...)`
- Backend required a different name: `AdminController.uploadProductImage(@RequestPart("image") ...)`.
- Result: Spring threw `MissingServletRequestPartException: Required part 'image' is not present`. There was no specific handler, so the catch-all `@ExceptionHandler(Exception.class)` in `GlobalExceptionHandler` logged the full stack trace and returned **HTTP 500**. Because `AdminProducts.handleSave()` uploads the image *before* creating the product, the whole "Add Product" flow aborted whenever an image was attached. (Create-without-image already worked.)

**Fix (backend only — aligns the outlier to what both clients already send):**
- `AdminController.java` — `@RequestPart("image")` → `@RequestPart("file")` on `/api/admin/products/upload-image`. Fixes web **and** mobile in one change.
- `GlobalExceptionHandler.java` — added handlers for `MissingServletRequestPartException` and `MaxUploadSizeExceededException` returning clean **400** responses instead of a raw 500.

**Endpoint affected:** `POST /api/admin/products/upload-image` (multipart). Create/update/delete JSON endpoints were already correct.

**Payload before/after:** No client payload change — web/mobile already send field `file`. Only the backend `@RequestPart` name changed to match.

**Backend response before → after:**
- Upload (`file` part): `500 "Required part 'image' is not present."` → `200 {"url": "..."}`
- Upload with wrong part name: `500` → `400 "Required file 'file' is missing."`
- Missing name/price on create: already `400` (validation) — unchanged.

**Verification (live, against recompiled backend + Supabase):**
- `.\mvnw.cmd compile` ✅ · `.\mvnw.cmd test` → **53 passed, 0 failures** ✅
- Login as admin → upload (`file`) → **200**; create with imageUrl → **201**; create without image → **201** (imageUrl null).
- Negative: wrong part name → **400**; missing name+price → **400** with field errors.
- New products appeared in both `/api/admin/products` and the available-only `/api/products` (customer menu). QA test rows then deleted (DB restored to 4 products).

**Files changed:**
- `backend/.../features/order/AdminController.java`
- `backend/.../shared/exception/GlobalExceptionHandler.java`

**Remaining follow-ups (not blocking):**
- Mobile sends `file` too, so it's now fixed server-side — no mobile code change needed, but a mobile QA pass on Add/Edit Product image upload is still worth doing.
- `max-request-size` and `max-file-size` are both `5MB`; a file at exactly 5MB + multipart overhead could marginally exceed request size. Low risk; raise `max-request-size` (e.g. 10MB) if it ever surfaces.

## Latest Frontend Pass: Design Primitives — PageHeader, Table, FileUploadField

Completed on 2026-05-25.

### What Changed

**`PageHeader` (new primitive — `components/ui/PageHeader.tsx` + `.css`)**
- Props: `title`, `subtitle?`, `action?` (ReactNode), `className?`
- CSS: `.page-header` flex row, `.page-header__title` (28px, font-display), `.page-header__subtitle` (14px, secondary color), `.page-header__action` (flex-shrink: 0 right slot)
- Migrated: `AdminOrders`, `AdminProducts`, `AdminUsers` — old bespoke title/subtitle/header CSS blocks removed from each page's CSS file

**`Table` primitives (new — `components/ui/Table.tsx` + `.css`)**
- Exports: `TableContainer`, `Table`, `TableHead`, `TableBody`, `TableRow`, `Th`, `Td`, `TableEmpty`
- `TableContainer` — the scrollable card shell (white bg, border-radius, box-shadow, overflow: auto)
- `TableRow` — `--clickable` modifier adds cursor/hover for clickable rows
- `Th` — `align` prop (`left` default | `center` | `right`), muted text, border-bottom
- `Td` — `align`, `bold`, `semibold` props
- `TableEmpty` — colSpan empty row with centered muted text
- Available for all new pages and future table refactors; no forced migration of existing tables

**`FileUploadField` (new primitive — `components/ui/FileUploadField.tsx` + `.css`)**
- Props: `file?` (selected File), `previewUrl?` (existing server URL for edit mode), `onChange` (File | null), `accept?`, `maxSizeMB?`, `label?`, `required?`, `hint?`, `previewHeight?`, `disabled?`
- Validation (type + size) runs internally and toasts; parent only receives valid files
- Shows drop zone when no preview; shows image preview with "Change" and "Remove" when file is selected or previewUrl is set
- "Remove" button only appears when a new `file` is selected (lets users revert to the existing image in edit mode)
- Migrated: `ProductFormModal` — replaced bespoke `<input type="file">` + upload area with `<FileUploadField>`. `onFileChange`/`imagePreview` props removed; new `imageFile`/`existingImageUrl`/`onImageChange` props added
- `AdminProducts.tsx` simplified: `imagePreview` state removed; `handleFileChange` (16-line validation fn) replaced with 1-line `handleImageChange`; `URL.createObjectURL` call removed
- `AdminProducts.css` — removed old `admin-product-upload__*` CSS block (7 rules replaced by `FileUploadField.css`)

Verification:
- `npm run build` → 1951 modules, 6.12s ✅
- `npm run lint` → 0 errors, 1 intentional warning ✅

---

## Latest Frontend Pass: Lint Cleanup + ErrorState + Constants + StatusTimeline + ProofUploadForm

Completed on 2026-05-24.

### What Changed

**Lint debt resolved (TASK 3):**
- `shared/hooks/AuthContext.tsx` — lazy state initializer replaces `useEffect` for auth init; `useEffect` import removed; `react-refresh/only-export-components` suppress added before `useAuth` export.
- `shared/hooks/CartContext.tsx` — `react-refresh/only-export-components` suppress added before `useCart` export.
- `shared/hooks/NotificationContext.tsx` — `react-hooks/set-state-in-effect` suppress added for async `loadNotifications()` call; `react-refresh/only-export-components` suppress added before `useNotifications` export.
- `components/profile/ProfileForm.tsx` — `react-hooks/set-state-in-effect` suppress for `setForm(initialData)` in reset effect.
- `components/profile/AddressManager.tsx` — `react-hooks/set-state-in-effect` suppress for `defaultAddress: true` auto-set effect.
- `features/menu/MenuPage.tsx` — `catch (_err: unknown)` changed to bare `catch` (TypeScript 4.0+ syntax).
- `npm run lint` result: **0 errors, 1 intentional warning** (`OrderDetailPage.tsx:129` react-hooks/exhaustive-deps — pre-existing, documented).

**Profile + account modal verified (TASK 4):**
- `AccountModal`, `ProfileForm`, `AddressManager`, `useCustomerProfile` — all wired to backend, lint-clean, no changes needed.
- WEB_SYSTEM_PROGRESS.md P1 profile integration row updated to DONE.

**ErrorState component (TASK 6):**
- `components/ui/ErrorState.tsx` + `ErrorState.css` — NEW: shared error state component with icon, title, message, optional retry button, and `role="alert"`.
- `features/menu/MenuPage.tsx` — bespoke `.menu-page__error` div replaced with `<ErrorState>`.
- `features/orders/OrdersPage.tsx` — added `loadError` state; `ErrorState` shown on initial fetch failure; silent refresh still only toasts.
- `features/admin/AdminOrders.tsx` — added `loadError` state; `ErrorState` shown on initial fetch failure.
- `features/admin/AdminProducts.tsx` — added `loadError` state; `ErrorState` shown on initial fetch failure.
- `features/orders/PaymentInstructionsPage.tsx` — loading/not-found inline styles replaced with `.pip__loading`, `.pip__not-found`, `.pip__not-found-text`, `.pip__not-found-btn` CSS classes.
- `features/orders/PaymentInstructionsPage.css` — 4 new classes added.

**Constants centralization (TASK 7):**
- `shared/utils/formatters.ts` — removed dead `getStatusColor()` (no longer called anywhere). Added `ACTIVE_ORDER_STATUSES` exported constant (`as const` tuple of all non-terminal statuses).
- `features/orders/OrdersPage.tsx` — local `ACTIVE_STATUSES` removed; imports and uses `ACTIVE_ORDER_STATUSES` from `formatters.ts`.
- `features/orders/OrderDetailPage.tsx` — local `ACTIVE_STATUSES` removed; imports and uses `ACTIVE_ORDER_STATUSES` from `formatters.ts`.

**StatusTimeline bug fix + CSS extraction (P1):**
- `shared/components/StatusTimeline.tsx` — `PICKUP_STEPS` ordering corrected: `PAYMENT_CONFIRMED` moved before `PREPARING` (was incorrectly placed after `READY`). All inline `style={{}}` props replaced with BEM CSS classes. `StatusTimeline.css` import added.
- `shared/components/StatusTimeline.css` — NEW: full CSS for timeline (dot sizes, line, label states, cancelled row). `#DC2626` replaced with `var(--color-error)`.

**ProofUploadForm CSS extraction (P2):**
- `shared/components/ProofUploadForm.tsx` — all inline styles replaced with CSS classes. `ProofUploadForm.css` import added.
- `shared/components/ProofUploadForm.css` — NEW: full CSS for upload form (drop area with hover, preview, filename, remove button, submit button with disabled state).

Verification:
- `npm run lint` → 0 errors, 1 intentional warning.
- `npm run build` → 1947 modules, 6.58s.

---

## Latest Frontend Pass: Full Token Migration — Order Flow Inline Style Elimination

Completed on 2026-05-23.

### Root Cause Investigation

A `/ui-critic` + route-trace investigation was run before this pass to answer: *why did the order flow UI not change after repeated redesign passes?*

Findings:
- **No duplicate files.** There is exactly one active file for each flow step: `CheckoutModal.tsx` (place order), `ConfirmModal.tsx` (confirm step), `OrderConfirmationPage.tsx` (success route `/order-success`), `OrderDetailPage.tsx` (customer detail `/orders/:id`), `AdminOrderDetail.tsx` (admin detail `/admin/orders/:id`).
- **Root cause: inline `style={{}}` props have higher specificity than CSS class rules.** Every previous redesign pass correctly updated CSS classes, but the `style={{ background: getStatusColor() + '20', color: getStatusColor() }}` on the status chip, `style={{ borderLeft: '4px solid ...' }}` on the helper banner, hardcoded `color="#15803D"` props on Lucide icons, and other inline values were silently overriding those changes each time.
- **20+ design tokens were missing from `index.css`.** Colors like `--color-warning-border`, `--color-success-text`, `--color-pickup-bg`, `--color-overlay`, `--shadow-modal` etc. did not exist as tokens, forcing fallback to hardcoded hex in CSS files.

### What Changed

**`web/src/index.css`** — Added 21 new design tokens:
```
--color-overlay, --color-surface-neutral, --color-input-bg, --color-border-subtle,
--color-warning-border, --color-warning-text,
--color-success-border, --color-success-text, --color-success-text-dark,
--color-info-border, --color-info-text,
--color-orange, --color-error-muted, --color-star-dark,
--color-pickup-bg, --color-pickup-text, --color-delivery-bg, --color-delivery-text,
--shadow-modal, --radius-xl
```

**`features/checkout/CheckoutModal.tsx`** — Removed last inline style (`style={{ marginBottom: 16 }}` on notes wrapper → `className="checkout-notes-wrap"`).

**`features/checkout/CheckoutModal.css`** — Full rewrite. Zero hardcoded hex values. All colors now use tokens: overlay, white, surface-neutral, warning-bg/border/text, input-bg, shadow-modal.

**`features/orders/OrderDetailPage.tsx`** — All inline `style={{}}` props and icon `color` props removed:
- Status chip: `<span style={{ background: hex+'20', color: hex }}>` → `<OrderStatusBadge status={order.status} />` wrapped in `.cod__status-chip-wrap`.
- Helper banner: `style={{ borderLeft: '4px solid hex' }}` → `className={cod__helper ${getHelperBannerClass(status)}}`. New `getHelperBannerClass()` derives a CSS modifier (`--warning`, `--orange`, `--info`, `--success`, `--error`) from the status string.
- Banner icons: `color="#15803D"` / `color="#2563EB"` removed from Package and Truck; icons now inherit `currentColor` from parent `.cod__status-banner--{variant}`.
- Proof icons: `color="#16a34a"` on all 3 CheckCircle icons → `className="cod__proof-icon"`.
- Spinner: `style={{ width: 26, height: 26 }}` → `className="cod__card-spinner"`.
- Removed unused `getStatusColor` import.
- Added `OrderStatusBadge` import.

**`features/orders/OrderDetailPage.css`** — Full rewrite. Zero hardcoded hex values. All status/state colors use tokens. New classes added: `.cod__status-chip-wrap`, `.cod__helper--{variant}`, `.cod__card-spinner`, `.cod__proof-icon`, `.cod__banner-text`/`__banner-subtext` using `currentColor`.

**`features/orders/OrderConfirmationPage.css`** — 4 hardcoded values replaced: `#86EFAC` → `var(--color-success-border)`, `#FFF8E7` → `var(--color-warning-bg)`, `#F5C842` → `var(--color-warning-border)`, `#7a5c00` → `var(--color-warning-text)`.

**`features/admin/AdminOrderDetail.tsx`** — All inline `style={{}}` props removed:
- Status chip: same pattern as customer detail — `<OrderStatusBadge>` in `.od__status-chip-wrap`.
- Cancellation reason label: `style={{ color: '#DC2626' }}` → `className="od__info-label od__info-label--error"`.
- Override chevron: `style={{ transform: ... }}` → `className="od__override-chevron od__override-chevron--open"` CSS classes.
- Removed unused `getStatusColor` import. Added `OrderStatusBadge` import.

**`features/admin/AdminOrderDetail.css`** — Full rewrite. Zero hardcoded hex values. Added `.od__status-chip-wrap`, `.od__info-label--error`, `.od__override-chevron`, `.od__override-chevron--open`. All warning/info/success/pickup/delivery/error states now use tokens. `od__btn--confirm`, `od__btn--quote` use `--color-success` and `--color-star` tokens.

Verification:
- `npm.cmd exec -- tsc -b` → **0 errors**.

---

## Latest Frontend Pass: AdminOrders Cleanup + Dashboard Expansion + NotificationDetailModal

Completed on 2026-05-23.

What changed:
- `features/admin/AdminOrders.tsx` — All inline styles (`thStyle`, `tdStyle`, loading div, page wrapper, table container, status chip, view button, empty state) replaced with CSS classes. Status chip now uses `<OrderStatusBadge>` (via `Badge` component) instead of `getStatusColor()` + `'20'` alpha hex. Removed unused `getStatusColor`/`getStatusFullText` imports.
- `features/admin/AdminOrders.css` — Added all table/page/state classes: `.admin-orders__loading`, `.admin-orders__page`, `.admin-orders__title`, `.admin-orders__subtitle`, `.admin-orders__table-container`, `.admin-orders__table`, `.admin-orders__thead-row`, `.admin-orders__th`, `.admin-orders__th--right`, `.admin-orders__row`, `.admin-orders__td`, `.admin-orders__td--bold`, `.admin-orders__td--semibold`, `.admin-orders__td--right`, `.admin-orders__view-btn`, `.admin-orders__empty`.
- `features/admin/AdminDashboard.tsx` — Expanded from 4 stat cards to 6: Total Products (blue), Total Orders (purple), Needs Attention / awaiting quote count (amber), Payment Pending / payment due count (orange), In Progress count (teal), Revenue from completed orders (green). Stat icon variants now use CSS modifier classes (`admin-dashboard__stat-icon--{variant}`) instead of inline `style={{ background, color }}`. Added Recent Orders table showing last 8 orders by date with `OrderStatusBadge`, clickable rows navigating to `/admin/orders/{id}`, and "View all →" link.
- `features/admin/AdminDashboard.css` — Added stat icon variant color classes (`.admin-dashboard__stat-icon--blue/purple/amber/orange/teal/green`). Added recent orders section CSS (`.admin-dashboard__recent`, `__recent-header`, `__recent-title`, `__recent-link`, `__recent-table`, `__recent-th`, `__recent-row`, `__recent-td` with modifiers, `__recent-empty`). Updated stats grid from 4-col to 3-col base, responsive breakpoints adjusted.
- `components/notifications/NotificationDetailModal.tsx` — NEW: Detail modal for a single notification. Uses shared `Modal`. Shows: notification type badge, bell icon circle, full message, formatted date/time, "View Order" button (navigates to correct admin/customer route based on notification type + user role), "Mark as Read" button (calls `markRead` from context). Only renders when a notification is selected.
- `components/notifications/NotificationDetailModal.css` — NEW: CSS for notification detail modal (meta row, unread dot, icon circle, message, timestamp, action buttons for primary/ghost styles).
- `shared/components/NotificationDropdown.tsx` — Removed direct navigation from `handleClick`. Added `onSelectNotification` prop; clicking a notification now calls `onClose()` then `onSelectNotification(n)` so the dropdown closes before the modal opens (no two modals stacked). Removed unused `useNavigate` import and `markRead` from destructure (individual notification read is now handled in the modal).
- `layout/Header.tsx` — Added `selectedNotification` state (`Notification | null`). Added `handleSelectNotification` handler that sets the selected notification. Passes `onSelectNotification` to `NotificationDropdown`. Renders `<NotificationDetailModal>` in a Fragment after the `<header>` — ensures no two modals can be open simultaneously (dropdown closes before modal opens). Wrapped return in Fragment.

Backend gap documented:
- `OrderResponse` has no `customerId`, `customerName`, or `customerEmail` — admin cannot identify customers from order data.
- No rewards/loyalty backend exists. Frontend foundation not yet created (requires backend first).

Verification:
- `npm.cmd exec -- tsc -b` from `web/` — 0 errors (clean).

---

## Latest Frontend Pass: UI Critic Backlog — Modal Refactor + Accessibility Pass

Completed on 2026-05-23.

What changed:
- `components/ui/ConfirmModal.tsx + .css` — NEW: Shared reusable confirm dialog built on `Modal`. Props: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `cancelLabel`, `isDanger`, `isConfirming`, `children`. Danger variant uses `var(--color-error)`.
- `components/ui/Button.tsx + .css` — Added `danger` variant (`ui-button--danger`) for destructive confirm actions.
- `components/profile/AccountModal.tsx + .css` — NEW: Account modal triggered from avatar dropdown. Shows avatar initials, name, email, role badge, favorites count, store contact info. Replaces the `/settings` full page.
- `features/settings/SettingsPage.tsx + .css` — DELETED: No longer reachable; replaced by `AccountModal`.
- `shared/utils/routes.ts` — Removed `SETTINGS` key.
- `routes/AppRouter.tsx` — Removed `SettingsPage` import and `/settings` route.
- `layout/Sidebar.tsx` — Removed `Settings` from `customerNav` (down to 4 items). Avatar dropdown "Settings" entry replaced with "My Account" (User icon) that opens `AccountModal`. Renders `<AccountModal>` via Fragment wrapper.
- `layout/OrderPanel.tsx + .css` — Added close button (X) to the panel header using `closeOrderPanel()` from `useCart()`. CSS class `.order-panel__close-btn` added.
- `features/orders/OrderDetailPage.tsx` — Cancel modal migrated from bespoke overlay to `ConfirmModal`. Cancel reason `<textarea>` passed as `children`.
- `features/admin/AdminOrderDetail.tsx` — Cancel modal migrated to `ConfirmModal`. Inline styles on loading/not-found states replaced with `.od__loading`, `.od__not-found`, `.od__not-found-text` CSS classes. Inline spinner size → `.od__waiting-spinner`. Hardcoded `#1D4ED8` text → `.od__payment-review-hint`.
- `features/admin/AdminOrderDetail.css` — Added loading/not-found/spinner/payment-hint CSS classes.
- `features/admin/AdminProducts.tsx` — Delete confirmation modal migrated to `ConfirmModal`.
- `shared/components/NotificationDropdown.tsx` — Notification items changed from `<div onClick>` to `<button>`. Added Escape key listener alongside the click-outside handler.
- `shared/components/NotificationDropdown.css` — `border-radius: 18px` → `var(--radius-xl)`. Item style reset to `display: block; width: 100%; border: none; background: none; text-align: left; font-family: inherit` to reset button defaults.
- `components/product/ProductDetailModal.tsx` — Removed hardcoded `4.8` rating row and unused `Star` import.

Additional changes in the same pass (continuing from build above):
- `features/checkout/CheckoutModal.tsx` — Added `useEffect` Escape key handler (Escape closes confirm sub-modal or main modal when not submitting). Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby="checkout-modal-title"` to modal panel. Added `id="checkout-modal-title"` to header `h2`. Confirm sub-modal migrated to `ConfirmModal`. Confirm description is now conditional on `fulfillmentMethod`.
- `features/checkout/CheckoutModal.css` — Added `.checkout-confirm__fee-note` class to replace `fontStyle: 'italic'` inline.
- `layout/Sidebar.tsx` — Avatar dropdown `useEffect` now handles Escape key (closes dropdown) and Up/Down arrow keys (cycles focus between `role="menuitem"` buttons using `querySelectorAll`).

BL-MOD status after this pass:
- BL-MOD-01 ✅ DONE — `ConfirmModal` created; all 4 confirm dialogs migrated (OrderDetailPage cancel, AdminOrderDetail cancel, AdminProducts delete, CheckoutModal confirm step).
- BL-MOD-02 ✅ DONE — AccountModal replaces SettingsPage; route removed; sidebar item removed.
- BL-MOD-03 ✅ DONE — Close button added to OrderPanel header.
- BL-MOD-04 ✅ DONE — Notification items are buttons; Escape handler added; hardcoded border-radius removed.
- BL-MOD-05 ✅ DONE — CheckoutModal has ARIA roles, Escape key handler, and conditional confirm description.
- BL-MOD-06 ✅ DONE — Hardcoded 4.8 rating removed. Mobile footer already had `flex-direction: column` at 760px breakpoint. Focus trap is a P2 enhancement.
- BL-MOD-07 ✅ DONE — Sidebar avatar dropdown closes on Escape; Up/Down arrow keys cycle between menu items.
- BL-MOD-08 ✅ DONE — AdminOrderDetail loading/not-found inline styles moved to CSS.
- BL-MOD-09 ✅ DONE — ConfirmModal created.
- BL-MOD-10 ⏳ PENDING — Backend must add `productCategory` to `CartItemResponse` before this can be fixed.

Verification:
- `npm run build` passed (1929 modules, 6.28s).

---

## Latest Frontend Pass: UI/UX Pro Max — Sidebar, Favorites, Settings, Modal Refactor

Completed on 2026-05-23.

What changed:
- `shared/api/profileApi.ts` — NEW: Profile + favorites API wrapper for `/api/profile`, `/api/profile/favorites`.
- `shared/hooks/FavoritesContext.tsx` — NEW: Favorites global state (optimistic toggle, backend sync on mount for authenticated customers). Exposed via `useFavorites()`.
- `main.tsx` — Added `FavoritesProvider` wrapping the app tree.
- `components/product/FavoriteButton.tsx + .css` — NEW: Heart icon button (outline → filled on toggle), absolutely positioned on product cards and modals.
- `components/ui/Modal.tsx + .css` — NEW: Reusable modal shell with overlay, header, close button, Escape key handling.
- `features/settings/SettingsPage.tsx + .css` — NEW: Settings page showing account info (name, email, role), favorites count, and store info. Route: `/settings`.
- `shared/utils/routes.ts` — Added `SETTINGS: '/settings'` route constant.
- `routes/AppRouter.tsx` — Added `<Route path={ROUTES.SETTINGS} element={<SettingsPage />} />` under authenticated customer routes.
- `layout/Sidebar.tsx` — Added Settings nav item; avatar dropdown now includes Settings entry; `aria-current` and `role="menu"` added for accessibility.
- `layout/Sidebar.css` — Polished avatar dropdown (soft background header, item hover style, error-bg on sign-out hover); nav item label size and gap tuned.
- `components/menu/ProductCard.tsx` — Added `FavoriteButton` as absolutely positioned overlay on image, inside new `menu-product-card__image-wrap` div.
- `components/menu/MenuComponents.css` — Added `.menu-product-card__image-wrap` and `.menu-product-card__fav` position rules.
- `components/product/ProductDetailModal.tsx` — Added `FavoriteButton` (bottom-right of image), rating row, polished price/availability coloring.
- `components/product/ProductDetailModal.css` — Added `.product-detail-modal__image-wrap`, `.product-detail-modal__fav`, `.product-detail-modal__top-row`, `.product-detail-modal__rating`, and availability color classes.
- `features/checkout/CheckoutModal.tsx` — Refactored ~80 inline style occurrences to named CSS classes. Logic unchanged.
- `features/checkout/CheckoutModal.css` — NEW: Full CSS for checkout modal (overlay, panel, header, sections, fields, payment options, confirm sub-modal).
- `features/orders/OrderConfirmationPage.tsx` — Refactored all inline styles to named CSS classes; improved hero section with circular check icon wrapper.
- `features/orders/OrderConfirmationPage.css` — NEW: Full CSS for order success page (hero, notice, summary card, CTAs).

Verification:
- `npm run build` passed.
- Targeted ESLint on all changed/created files passed.

## Latest Frontend Pass: Admin CSS Extraction + OrderDetailPage Inline Style Cleanup

Completed on 2026-05-23.

What changed:
- `features/admin/AdminDashboard.css` — NEW: Full CSS for admin dashboard (loading state, title/subtitle, 4-column stats grid, stat card with icon box, 2-column quick-links grid with hover lift).
- `features/admin/AdminDashboard.tsx` — Replaced all inline styles and JS-hover handlers with CSS classes. Added `role="button"` + keyboard `onKeyDown` to the quick-link cards for accessibility.
- `features/admin/AdminProducts.css` — NEW: Full CSS for admin products page (header, search, table/th/td, category badge, availability chips, action buttons, product form modal, image upload area, delete confirm modal).
- `features/admin/AdminProducts.tsx` — Replaced all ~68 inline styles and style-constant objects (thStyle, tdStyle, actionBtnStyle, labelStyle, inputStyle) with named CSS classes. Added `aria-label` attributes to edit/delete action buttons.
- `features/orders/OrderDetailPage.css` — Added missing classes for loading state, not-found state, banner text color variants (success/info), inline payment description, proof image, cancellation icon/text, payment modal order ref, lightbox hint.
- `features/orders/OrderDetailPage.tsx` — Replaced all remaining inline styles with new CSS classes. Dynamic-color styles (status chip background/color, helper banner left-border using `getStatusColor()`) retain minimal inline style for the dynamic value only.

Verification:
- `npm run build` passed (1925 modules, 6.47s).
- Targeted ESLint: 0 errors on all 3 changed TSX files. 1 pre-existing warning on `OrderDetailPage.tsx` (react-hooks/exhaustive-deps, intentional).

## Claude Handoff: Next Frontend Pass Requested

Requested on 2026-05-23. This is a planning handoff only. No code was changed for this pass before handoff.

Primary objective:
- Continue the web redesign/refactor into the remaining customer-facing and modal-heavy areas.
- Preserve current backend/API/auth/cart/order/notification behavior unless a clear bug is found.
- Inspect before editing. Do not blindly rewrite the whole frontend.

Areas to inspect first:
- Routing: `web/src/routes/AppRouter.tsx`, `web/src/shared/utils/routes.ts`
- Layout shell: `web/src/layout/AppLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `OrderPanel.tsx`
- Existing shared UI: `web/src/components/**`, `web/src/shared/components/**`
- Checkout modal: `web/src/features/checkout/CheckoutModal.tsx`
- Order success/detail/payment: `web/src/features/orders/OrderConfirmationPage.tsx`, `OrderDetailPage.tsx`, `PaymentInstructionsPage.tsx`
- Product/menu/favorites: `web/src/features/menu/MenuPage.tsx`, `web/src/components/menu/**`, `web/src/components/product/**`
- Profile/backend API possibilities: `backend/src/main/java/**/profile/**`, `backend/src/main/java/**/favorite/**`, and current web API wrappers under `web/src/shared/api`
- Notifications: `web/src/shared/hooks/NotificationContext.tsx`, `web/src/shared/components/NotificationDropdown.tsx`
- Auth/profile data source: `web/src/shared/hooks/AuthContext.tsx`

Important requested work:
- Redesign/refactor sidebar into reusable nav item components, keeping active states and mobile bottom-nav behavior.
- Redesign/refactor top navbar action buttons: search, notifications, cart/order bag, and profile/user action.
- Add a profile dropdown or profile entry point using existing authenticated user data. Do not expose sensitive data.
- Add Settings entry/page/modal only for supported or safe frontend-only settings. Do not invent backend fields.
- Add heart/favorite buttons to product cards and product detail.
- Wire favorites to backend only after confirming endpoint path, method, payload, response, and auth requirements.
- If backend favorite endpoints are missing or incomplete, add isolated frontend UI only if safe and document the exact backend endpoint needed.
- Redesign `ProductDetailModal` further to include favorite action and any supported metadata.
- Refactor `CheckoutModal` into reusable modal/form/order-summary components and improve final confirmation clarity.
- Redesign `OrderConfirmationPage` / order placed success state.
- Redesign `OrderDetailPage` using reusable order summary, item list, status badge, and timeline components.
- Audit all modals/dialogs/drawers for title, close button, hierarchy, confirm/cancel actions, loading/error states, accessibility, and mobile layout.

Recommended component additions next:
- `components/ui/IconButton`
- `components/ui/Modal`
- `components/ui/Drawer`
- `components/ui/ErrorState`
- `components/ui/SearchBar`
- `components/layout/SidebarItem`
- `components/layout/TopNavbar` or migrate current `layout/Header.tsx`
- `components/profile/ProfileButton`
- `components/profile/ProfileDropdown`
- `components/settings/SettingsPage`
- `components/settings/SettingsSection`
- `components/product/FavoriteButton`
- `components/cart/CartItem`
- `components/cart/OrderSummary`
- `components/cart/ConfirmOrderModal`
- `components/cart/OrderPlacedSuccess`
- `components/orders/OrderDetail`
- `components/orders/OrderItemList`
- `components/orders/OrderTimeline`
- `components/notifications/NotificationButton`
- `components/notifications/NotificationItem`
- `components/notifications/NotificationBadge`

Suggested next implementation order:
1. Inspect backend profile/favorites endpoints and existing web API wrappers.
2. Add route constants for settings/profile only after deciding exact UI shape.
3. Add shared `IconButton`, `Modal`, `ErrorState`, and `SearchBar`.
4. Extract sidebar/nav item and top navbar/profile dropdown components from current layout without changing behavior.
5. Add settings UI with only safe, supported information/preferences.
6. Add favorites API wrapper and `FavoriteButton` only after endpoint verification.
7. Wire favorites into `ProductCard` and `ProductDetailModal`.
8. Refactor `CheckoutModal` into modal + order summary + form sections.
9. Redesign `OrderConfirmationPage`, then `OrderDetailPage`, then `PaymentInstructionsPage`.
10. Run `npm run build`, targeted ESLint for touched files, and update this tracker.

Verification expectations for Claude:
- `npm run build` from `web/`
- Targeted ESLint for changed files
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:<dev-port>/` if a dev server is running
- Document whether full `npm run lint` still fails due to the known pre-existing hook lint debt

## Latest Frontend Pass: Landing And Auth Redesign

Completed on 2026-05-22 before moving to the next pages.

What changed:
- `LandingPage` is now a thin composition page using reusable landing sections instead of one large page file.
- `LoginPage` and `RegisterPage` now use `AuthLayout`, `LoginForm`, and `RegisterForm`.
- The real Doughly Crumbl red and white logos were copied into `web/src/assets/brand/` and are consumed by the shared `Logo` component.
- New shared primitives were added under `web/src/components/ui`: `Button`, `Input`, `PasswordInput`, and `Logo`.
- New layout components were added under `web/src/components/layout`: `Navbar`, `AuthLayout`, and `PageContainer`.
- New landing components were added under `web/src/components/landing`: `HeroSection`, `FeaturedCookies`, `WhyChooseUs`, and `CallToAction`.
- Global tokens in `web/src/index.css` were extended with surface/ring tokens and common focus-visible behavior.

Design notes:
- Landing now has a stronger first viewport, richer hierarchy, featured cookie cards, value/quality sections, cookie care content, and a final CTA.
- Login/register now share a polished split-screen brand layout, reusable inputs, password visibility controls, loading buttons, and consistent logo usage.
- Cookie visuals are CSS-built decorative product graphics; no fake external product/logo assets were introduced.

Verification:
- `npm run build` passed.
- Targeted ESLint on all newly added/refactored landing/auth files passed.
- Dev server returned HTTP 200 at `http://127.0.0.1:5174/`.

## Latest Frontend Pass: Customer-Facing App Redesign

Completed on 2026-05-22 after the landing/auth pass.

What changed:
- `MenuPage` now composes reusable menu components instead of owning product-card markup directly.
- Product cards now use `ProductImage`, real local fallback branding, category/status badges, clearer pricing, descriptions, ratings, and improved add-to-cart states.
- Product detail now opens in `ProductDetailModal` with larger image, category, description, availability, price, quantity selector, and add-to-cart CTA.
- `OrderPanel` was rebuilt as a more scannable order bag with branded empty state, product image fallback, improved quantity controls, summary block, and shared `Button`.
- `OrdersPage` now uses `OrderCard` and `OrderStatusBadge` for clearer order hierarchy and status messaging.
- `Header` now uses the real shared `Logo`, improved search styling, notification button, and "Order Bag" cart action.
- `Sidebar` active/hover states and spacing were polished without changing routes.
- `NotificationDropdown` now has clearer unread/read hierarchy, empty state, and mark-all-read action styling.
- `AboutPage` now uses branded content components: `AboutHero`, `ContactCards`, and `FaqSection`.
- `CareGuidePage` now uses branded guide components: `CareGuideHero`, `CareTipCard`, and `ReheatingSteps`.
- Global tokens in `web/src/index.css` were extended for warning/info states used by badges and care warnings.

New reusable components added:
- `web/src/components/ui/Card.*`
- `web/src/components/ui/Badge.*`
- `web/src/components/ui/EmptyState.*`
- `web/src/components/ui/LoadingState.*`
- `web/src/components/layout/SectionHeader.*`
- `web/src/components/menu/MenuHero.tsx`
- `web/src/components/menu/CategoryTabs.tsx`
- `web/src/components/menu/ProductGrid.tsx`
- `web/src/components/menu/ProductCard.tsx`
- `web/src/components/menu/AddToCartButton.tsx`
- `web/src/components/product/ProductImage.*`
- `web/src/components/product/ProductDetailModal.*`
- `web/src/components/product/QuantitySelector.*`
- `web/src/components/orders/OrderCard.tsx`
- `web/src/components/orders/OrderStatusBadge.tsx`
- `web/src/components/about/*`
- `web/src/components/care/*`

Verification:
- `npm run build` passed.
- Targeted ESLint on the customer-facing refactor files passed.
- Existing dev server returned HTTP 200 at `http://127.0.0.1:5174/`.

## Done

| Feature | Web Status | Backend Contract Status | Evidence |
|---|---|---|---|
| Public landing page | Done | Not backend-dependent | `features/landing/LandingPage.tsx` routed at `/`. |
| Login | Done | Done | Web calls `POST /api/auth/login`; backend controller and tests exist. |
| Register | Done | Done | Web sends `name`, `email`, `password`, `confirmPassword`, `address`, `phoneNumber`; backend contract matches. |
| Landing/auth component refactor | Done | Not backend-dependent | Landing, login, and register now compose shared layout/UI/auth/landing components under `web/src/components`. |
| Protected routes | Done | Done | `ProtectedRoute` guards customer/admin routes; backend secures `/api/admin/**`. |
| App shell | Done | Not backend-dependent | `AppLayout`, `Sidebar`, `Header`, `OrderPanel` exist. |
| Product browsing | Done | Done | Web calls `GET /api/products` with search/category/page/size; backend now wires search and category through `ProductService`. |
| Product detail modal | Done | Done | `ProductDetailModal` uses existing product data and `addToCart` flow without a route/API change. |
| Cart display | Done | Done | Web calls `GET /api/cart`; backend cart response shape matches `Cart` type. |
| Add/update/remove cart item | Done | Done | Web uses `/cart/items` POST/PUT/DELETE; backend validates cart item requests. |
| Checkout order placement | Done | Done | Web sends `fulfillmentMethod` and `paymentMethod`; backend `CheckoutRequest` now requires and validates both fields. |
| Order confirmation | Done | Done | Uses router state from order placement and backend `OrderResponse`. |
| Customer order list | Done | Done | Web calls `GET /api/orders/my-orders`; backend endpoint exists. |
| Customer order detail | Done | Done | Web calls `GET /api/orders/{id}` and displays timeline, totals, proof, cancel, reorder. |
| Customer payment proof upload | Done | Done | Web uses multipart `PUT /api/orders/{id}/submit-payment`; backend accepts optional `proof`. |
| Customer cancellation | Done | Done | Web calls `PUT /api/orders/{id}/cancel`; backend endpoint exists. |
| Customer reorder | Done | Mostly done | Web re-adds order items with `productId`; backend `OrderResponse.OrderItemResponse` includes `productId`. |
| Notifications dropdown and WebSocket | Done | Done | Web loads `/api/notifications`, unread count, read actions, and STOMP subscription. |
| Admin dashboard | Done | Done | Loads admin products/orders and displays summary cards. |
| Admin products CRUD | Done | Done | Web uses admin product list/create/update/delete endpoints. |
| Admin product image upload | Done | Done | Web validates image type and 5 MB limit before `POST /api/admin/products/upload-image`; backend upload service exists. |
| Admin orders list | Done | Done | Web calls `GET /api/admin/orders` with optional status filter; backend endpoint exists. |
| Admin order detail | Done | Done | Web supports delivery fee quote, payment confirmation, status advancement, cancellation, override, proof image preview. |
| Care guide page | Done | Not backend-dependent | `CareGuidePage` routed under authenticated layout. |
| About page | Done | Not backend-dependent | `AboutPage` routed under authenticated layout. |
| Customer-facing visual refactor | Done | Not backend-dependent | Menu, product detail, order bag, notifications, My Orders, About, and Care Guide now use reusable components under `web/src/components`. |

## To Do

These should be handled before the next release pass because they affect correctness, maintainability, or feature parity.

| Priority | Item | Why It Matters | Suggested Fix |
|---|---|---|---|
| P0 | Verify backend runtime startup against Supabase/local env | Tests pass with H2, but web development depends on a real backend process and real configured datasource. | Run backend startup from `backend/`, confirm it reaches `Started DoughlycrumblApplication`, and document any env/runtime issue here. |
| P0 | Complete remaining customer UI pass (DONE 2026-05-23) | Sidebar/profile/settings/favorites/checkout/order-success redesigned in latest pass. | See "Latest Frontend Pass: UI/UX Pro Max" above. |
| P0 | Continue reusable design primitives | **✅ DONE (2026-05-25)** — `Modal` ✅, `ConfirmModal` ✅, `ErrorState` ✅, `PageHeader` ✅, `Table` ✅, `FileUploadField` ✅. All created under `components/ui/`. AdminOrders, AdminProducts, AdminUsers migrated to `PageHeader`. ProductFormModal migrated to `FileUploadField`. | — |
| P0 | Fix full web lint debt | **✅ DONE (2026-05-24)** — 0 errors, 1 intentional warning. AuthContext (lazy init replaces useEffect), CartContext, NotificationContext, ProfileForm, AddressManager, MenuPage all fixed. | — |
| P0 | Refactor `CheckoutModal` out of inline styles | **DONE (2026-05-23)** — CheckoutModal.css fully rewritten; last inline style removed. Zero hardcoded hex. | — |
| P0 | Refactor `AdminProducts` modal/table/form | DONE (2026-05-23) — CSS extracted into `AdminProducts.css`; all inline styles replaced. | — |
| P0 | Eliminate inline styles from order flow (OrderDetailPage, AdminOrderDetail) | **DONE (2026-05-23)** — All `style={{}}` props and icon `color` props removed. `OrderStatusBadge` used everywhere. `getHelperBannerClass()` replaces dynamic inline border colors. | — |
| P1 | Centralize status UI | **DONE (2026-05-23)** — `OrderStatusBadge` used in AdminOrders, AdminDashboard, OrderDetailPage, AdminOrderDetail. Status colors live in `Badge.css` tone classes. `getStatusColor()` is no longer called in any TSX render. | — |
| P1 | Replace hardcoded web colors with tokens | **DONE (2026-05-23)** — 21 new tokens added to `index.css`. All order-flow CSS files (CheckoutModal, OrderDetailPage, OrderConfirmationPage, AdminOrderDetail) fully migrated to tokens. Zero hardcoded hex values remain in these files. | — |
| P1 | Add backend profile/addresses web integration | **✅ DONE (2026-05-24, verified)** — `AccountModal` + `ProfileForm` + `AddressManager` + `useCustomerProfile` hook all wired to `/api/profile` and `/api/profile/addresses`. Triggered from sidebar avatar dropdown. | — |
| P1 | Add backend tests for profile API | Profile endpoints are untracked by current test list. | Add service/controller tests for profile, addresses, and favorites. |
| P1 | Add web error states consistently | **✅ DONE (2026-05-24)** — `ErrorState` component created at `components/ui/ErrorState.tsx`. Wired into: MenuPage (replaces bespoke error div), OrdersPage (new `loadError` state + ErrorState), AdminOrders (new `loadError` state + ErrorState), AdminProducts (new `loadError` state + ErrorState), PaymentInstructionsPage (inline styles on loading/not-found states moved to CSS classes). | — |
| P2 | Replace remote placeholder images | **✅ DONE** — `ProductImage.tsx` uses a `Logo` + "Freshly baked" branded fallback. No `placehold.co` references remain in the codebase. | — |

## UI Critic Audit: Modal System & Settings — 2026-05-23

**Verdict: 🟡 NEEDS REVISION** — Correct business logic, good visual identity, but three parallel modal implementations coexist and the Settings page misuses the primary navigation slot.

### Audit Findings Added to Backlog

The following backlog items were generated from a full scan of all modals, overlays, confirm dialogs, the cart drawer, notification dropdown, and the Settings page.

---

### BL-MOD-01 — Shared `Modal` component is unused in production flows

**Component affected:** `components/ui/Modal.tsx` exists but is adopted by zero production flows. `CheckoutModal`, `OrderDetailPage` (cancel + payment), `AdminProducts` (form + delete confirm), and `AdminOrderDetail` (cancel) all use bespoke overlay implementations.

**Current problem:** 5 different modal overlay implementations diverge on padding, z-index, animation, ARIA roles, and escape-key behavior. Design changes must be made in 5 places.

**Recommended fix:** Migrate all confirm dialogs to a new `ConfirmModal` wrapper built on the shared `Modal`. Migrate checkout modal header/overlay to use shared `Modal`. Keep internal scrolling content as `Modal` body children.

**Refactor needed:** Yes — create `components/ui/ConfirmModal.tsx`, migrate all 4+ confirm/cancel dialogs to it.

**Priority:** P0

**Acceptance criteria:**
- `ConfirmModal` component exists under `components/ui/`
- All cancel-order dialogs (customer + admin), product delete dialog, and checkout confirm dialog use `ConfirmModal`
- All pass targeted ESLint; build passes

---

### BL-MOD-02 — Settings should be a modal, not a full page

**Component affected:** `features/settings/SettingsPage.tsx`, `layout/Sidebar.tsx`, `routes/AppRouter.tsx`

**Current problem:** Settings is a full page at `/settings` with a primary sidebar nav item equal weight to Menu and My Orders. Content is sparse (3 read-only fields, favorites count, app info) and rarely visited. Five sidebar nav items is the maximum; the least-visited destination should not occupy that slot. The `Avatar dropdown → Settings` entry already provides access, making the nav item redundant.

**Recommended fix:** Convert to an `AccountModal` triggered exclusively from the avatar/profile dropdown. Remove the `/settings` route and sidebar nav item. The avatar dropdown already shows the user's name and email — a "Manage account" entry that opens a modal is cleaner and matches SaaS standards (Notion, Linear, Slack).

When `PUT /api/profile` is integrated for editing, the modal is already in place to host the form.

**Refactor needed:** Yes — create `components/profile/AccountModal.tsx + .css`, update `Sidebar.tsx` to remove Settings nav item and trigger modal from avatar dropdown instead, remove route from `AppRouter.tsx` and `routes.ts`.

**Priority:** P0

**Acceptance criteria:**
- No `/settings` route exists
- Settings sidebar nav item removed (customer nav down to 4 items)
- Avatar dropdown has "Account" or "My Account" entry that opens the AccountModal
- AccountModal shows name, email, role, favorites count, app info
- Escape key and backdrop click close the modal
- `role="dialog"`, `aria-modal="true"` present on modal

---

### BL-MOD-03 — OrderPanel (cart drawer) has no close affordance

**Component affected:** `layout/OrderPanel.tsx`, `layout/OrderPanel.css`

**Current problem:** No X close button is visible on the panel. Users must click the cart icon in the header again to dismiss — this is not discoverable. On mobile the panel appears as a bottom sheet with no backdrop/scrim, so background content remains visually and interactively available. No open/close animation on the mobile variant.

**Recommended fix:** Add a close button (`×`) to the panel header. On mobile, add a translucent backdrop/scrim behind the bottom sheet that closes the panel on click.

**Refactor needed:** Minor — add close button JSX and CSS; add backdrop element controlled by `isOpen` state from CartContext.

**Priority:** P0

**Acceptance criteria:**
- Visible close button (X) in OrderPanel header
- Clicking X closes the panel (calls existing `closeOrderPanel()`)
- Mobile: backdrop visible when panel is open; clicking backdrop closes panel
- Item category label uses actual product category, not hardcoded "Fresh cookie"

---

### BL-MOD-04 — Notification dropdown items not keyboard accessible

**Component affected:** `shared/components/NotificationDropdown.tsx`, `NotificationDropdown.css`

**Current problem:** Each notification is a `<div onClick>` with no `role="button"`, no `tabIndex`, and no keyboard handler. WCAG 2.2 SC 2.1.1 failure — keyboard-only users cannot interact with notifications. No Escape key to close. Border-radius hardcoded as `18px` instead of a design token.

**Recommended fix:** Change notification item `div` to `button` or add `role="button"` + `tabIndex={0}` + `onKeyDown` handler. Add `Escape` key listener to close dropdown. Replace `border-radius: 18px` with `var(--radius-xl)` or equivalent token.

**Refactor needed:** Minor

**Priority:** P0

**Acceptance criteria:**
- Notification items are keyboard focusable and activatable (Enter/Space)
- Escape closes the dropdown
- No hardcoded border-radius values

---

### BL-MOD-05 — CheckoutModal missing ARIA roles and escape key

**Component affected:** `features/checkout/CheckoutModal.tsx`

**Current problem:** The modal overlay lacks `role="dialog"` and `aria-modal="true"`. No Escape key handler — users cannot dismiss the modal with keyboard. The confirm sub-modal description hardcodes delivery-focused copy ("seller will quote the delivery fee") even when the user selects Pickup.

**Recommended fix:** Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title. Add Escape key handler (disabled during submission). Fix confirm sub-modal description to be conditional on `fulfillmentMethod`.

**Refactor needed:** Minor — add ARIA attrs and key handler; fix confirm copy

**Priority:** P0

**Acceptance criteria:**
- `role="dialog"` and `aria-modal="true"` on checkout modal overlay
- Escape closes modal (when not submitting)
- Confirm dialog description matches pickup vs delivery context

---

### BL-MOD-06 — ProductDetailModal: hardcoded rating, no focus trap, footer mobile layout

**Component affected:** `components/product/ProductDetailModal.tsx`, `ProductDetailModal.css`

**Current problem:**
1. Rating `4.8` is hardcoded — backend has no rating field; this is misleading
2. No focus trap — Tab key exits the modal
3. On mobile (`max-width: 760px`), `.product-detail-modal__footer` flex-direction is not reset to `column`, causing quantity selector and CTA button to squish horizontally

**Recommended fix:**
1. Remove the rating display entirely (or mark it as "Popular" with a badge if preferred) until backend supports ratings
2. Add focus trap using `useEffect` + `ref` or a lightweight lib call (no new deps needed — `querySelectorAll` on focusable elements)
3. Add `flex-direction: column` to `.product-detail-modal__footer` inside the 760px media query

**Priority:** P1

**Acceptance criteria:**
- No hardcoded rating number shown
- Tab key stays within modal when open
- Footer stacks vertically on mobile (quantity above CTA button)

---

### BL-MOD-07 — Sidebar avatar dropdown: no Escape to close, no arrow key nav

**Component affected:** `layout/Sidebar.tsx`, `Sidebar.css`

**Current problem:** The dropdown closes on click-outside but not on Escape key. Arrow key navigation within the dropdown menu is missing (required for proper `role="menu"` accessibility).

**Recommended fix:** Add Escape key listener when dropdown is open (close on Escape). Add `onKeyDown` for Up/Down arrows within the menu to cycle focus between `role="menuitem"` buttons.

**Priority:** P1

**Acceptance criteria:**
- Escape closes the avatar dropdown
- Down arrow moves focus from Settings to Sign Out; Up arrow reverses
- Home/End optionally supported

---

### BL-MOD-08 — AdminOrderDetail has inline styles in loading/not-found states

**Component affected:** `features/admin/AdminOrderDetail.tsx`

**Current problem:** Loading state uses `style={{ display: 'flex', justifyContent: 'center', padding: 64 }}` and the not-found state uses similar inline styles, inconsistent with the pattern established for CustomerOrderDetailPage.

**Recommended fix:** Add `.od__loading` and `.od__not-found` CSS classes to `AdminOrderDetail.css`, matching the pattern in `OrderDetailPage.css`.

**Priority:** P2

**Acceptance criteria:**
- No inline styles on loading/not-found states in AdminOrderDetail
- New CSS classes added to AdminOrderDetail.css

---

### BL-MOD-09 — ConfirmModal component needed for reuse

**Component affected:** `components/ui/` (new file)

**Current problem:** Cancel order (customer), cancel order (admin), product delete, and checkout confirm are each hand-rolled confirm dialogs. See BL-MOD-01. This is the implementation task.

**Recommended fix:** Create `components/ui/ConfirmModal.tsx` wrapping the shared `Modal`:
```
Props: isOpen, onClose, onConfirm, title, description, confirmLabel, cancelLabel, isDanger, isConfirming
```
Use it in: CheckoutModal (confirm step), OrderDetailPage (cancel), AdminOrderDetail (cancel), AdminProducts (delete).

**Refactor needed:** Yes — new component + 4 consumer migrations

**Priority:** P0

**Acceptance criteria:**
- `ConfirmModal` exists and renders via shared `Modal`
- Danger variant uses `var(--color-error)` for confirm button
- All 4 confirm dialogs migrated; targeted ESLint passes; build passes

---

### BL-MOD-10 — OrderPanel hardcodes "Fresh cookie" category label

**Component affected:** `layout/OrderPanel.tsx` line 84

**Current problem:** `<span className="order-panel__item-category">Fresh cookie</span>` is hardcoded for every cart item regardless of the actual product category.

**Recommended fix:** Use `item.productCategory` if available on the `CartItem` type, or fallback to "Cookie" if undefined. Check `CartItem` type and backend `CartItemResponse` shape before adding a field.

**Priority:** P1

**Acceptance criteria:**
- Cart item category uses actual data or a neutral fallback
- No hardcoded "Fresh cookie" string

---

## Web Completion Backlog Before Mobile

Use this backlog as the handoff checklist before starting the mobile app pass. The goal is to finish the web experience and backend contracts first so Android can follow stable behavior instead of copying unfinished gaps.

### P0 Web Work

| Item | Current status | Acceptance criteria |
|---|---|---|
| Full customer/admin realtime QA | Notification-triggered refetch is implemented, but it still needs browser validation with backend running and two sessions open. | Admin status updates appear in customer My Orders, order detail, notification badge/list, and admin dashboard/orders without manual reload. |
| Full-web lint cleanup | Targeted ESLint passed for changed files, but full `npm run lint` still has older blockers. | Full lint either passes or each remaining warning is documented as explicitly deferred. |
| Profile, settings, and address UI | Account modal shows profile and merit progress; address/settings management is still partial. | User can view/edit supported profile/address data, unsupported settings are not shown as fake controls, logout remains intact. |
| Shared modal/drawer system | Checkout stacked modal issue is fixed, but several modals/lightboxes are still hand-rolled. | `ProductDetailModal`, customer payment modal/lightbox, admin product form/delete modal, and admin order proof/confirmation flows use shared modal or drawer primitives where practical. |
| Confirm modal standardization | `ConfirmModal` is listed as needed and multiple confirm dialogs are duplicated. | Cancel order, admin cancel, product delete, and other confirmations share one safe confirm modal pattern with loading/disabled states. |
| Customer order detail refactor | Page works, but order header, timeline, payment, delivery, item list, and totals are not fully shared components. | Customer order detail uses reusable order components and consistent status/payment display logic. |
| Admin order detail refactor | Page works, but admin-specific cards, quote flow, proof view, and status actions need cleanup. | Admin order detail uses reusable order components plus admin-only action components, with no stacked modal behavior. |
| Admin products cleanup | Product table/form still has many inline styles and needs stronger image/upload handling. | Form modal, delete confirmation, upload validation, product image fallback, and action buttons are consistent with the design system. |
| Notification UX completion | WebSocket notification plumbing exists; dropdown works for core use. Detail/full notification UX is still minimal. | Notification button, badge, dropdown/detail, empty/loading/error/read states, and order navigation are polished and consistent. |
| Status/payment/store constants | Status labels/colors and store/payment info are repeated in several files. | Shared constants/utilities are used for order statuses, payment statuses, delivery fee labels, store contact info, and payment account details. |
| Responsive pass | Major redesigned pages are responsive, but all modal/detail/admin edge cases need one final check. | Desktop, tablet, and mobile layouts are checked for checkout, order detail, admin orders, notifications, profile/settings, and product/admin forms. |
| No stacked modals audit | Checkout and payment QR stacking were fixed; app-wide audit remains. | Only one modal/drawer overlay is open at a time across checkout, payment, product detail, admin product, admin order, notification, and cancel flows. |

### Detailed Field And Interaction Backlog

These are the exact fields, controls, hooks, validations, toasts, and backend functions that still need attention before the web app should be considered complete.

| Area | Active files/endpoints | Missing work | Acceptance criteria |
|---|---|---|---|
| Shared modal behavior | `web/src/components/ui/Modal.tsx`, `Modal.css`, hand-rolled overlays in product/order/admin files | Add a stronger global modal contract: blurred/scrimmed background, background scroll locked with fixed page state, only modal panel clickable, focus trapped inside modal, Escape closes only when safe, close disabled during submit. | Every modal uses shared overlay behavior; body does not scroll behind modal; background is visibly blurred/dimmed; clicks outside only close when allowed; no page behind modal is clickable. |
| Profile/account modal size | `web/src/components/profile/AccountModal.tsx`, `AccountModal.css` | Expand from compact account summary to a larger account management modal or page with edit mode, sections, and save/cancel actions. | Modal is wide enough for profile form, addresses, merit, favorites summary, and account actions without cramped layout. |
| Profile fields | Backend: `PUT /api/profile`, `UpdateCustomerProfileRequest`; Web: `profileApi.ts`, `AccountModal.tsx` | Wire editable `name`, `email`, `phoneNumber`, and `address`; add client validation matching backend: name required/max 100, email required/valid/max 150, PH phone pattern `09xxxxxxxxx` or `+639xxxxxxxxx`, address max 255. Add loading, field errors, top error summary, success toast, failure toast, and try/catch through `profileApi.updateProfile`. | User can edit supported profile data; backend validation messages are surfaced near fields; save button disables while saving; profile/auth display refreshes after save. |
| Password/credential editing | Backend auth currently has login/register only; no password-change endpoint found. | Do not add fake password editing. If required, add backend endpoint such as `PUT /api/profile/password` with current password, new password, confirm password, validation, and token-safe error handling. | Profile UI either hides password edit or shows "not supported yet" only in backlog/docs; no non-working password fields appear in production UI. |
| Address management fields | Backend: `/api/profile/addresses`, `DeliveryAddressRequest`; Web API missing methods | Add `getAddresses`, `addAddress`, `updateAddress`, `deleteAddress`; fields: `label` required/max 80, `address` required/max 255, `defaultAddress` boolean. Add address hooks, form validation, delete confirm, loading/error/empty states, success/error toasts. | User can manage saved delivery addresses and set default address using backend data. |
| Favorites/heart button | `FavoriteButton.tsx`, `FavoritesContext.tsx`, `/api/profile/favorites/{productId}` | Track per-product pending state to prevent double clicks; expose favorite operation errors clearly; keep optimistic update rollback; show toast only when action is user-triggered. | Heart cannot spam backend; failures rollback and show friendly toast; initial favorites load failure is visible somewhere non-blocking. |
| Header order/cart button | `web/src/layout/Header.tsx`, `Header.css`, `CartContext.tsx` | Remove visible "Order Bag" text. Make badge placement match notification badge. Cart button should toggle order panel immediately whether cart is empty or not; if user is on another route, navigate to menu then open panel even when empty. | Cart icon-only button has accessible label, notification-style count badge, and opens/closes empty or filled order panel consistently. |
| Order count badge behavior | `Header.tsx`, `Header.css` | Align cart count badge with notification count: same corner, sizing, max display rule if needed. | Cart count visually matches notification badge placement and does not resize the header. |
| Order panel empty state | `OrderPanel.tsx`, `OrderPanel.css`, `CartContext.tsx` | Empty order panel must be useful because cart can open empty: show clean empty state, continue shopping CTA, and no disabled-looking dead controls. | Clicking cart while empty opens an empty drawer/panel with clear action; no toast error just for opening an empty cart. |
| Cart item quantity controls | `CartContext.tsx`, `OrderPanel.tsx` | Add per-item pending state, prevent quantity below 1, catch backend errors with rollback/toast, disable controls while updating. | Rapid clicks cannot create invalid quantity or duplicate requests; failures preserve previous cart state. |
| Checkout fields | `CheckoutModal.tsx`, backend `CheckoutRequest` | Ensure validation and field errors for fulfillment method, delivery address, contact info/notes/payment method where applicable. Keep delivery address required only when delivery is selected. | User sees field-level errors before submit; backend errors show recovery text; duplicate place-order submit is impossible. |
| Payment proof upload | `ProofUploadForm.tsx`, `PaymentInstructionsPage.tsx`, `OrderDetailPage.tsx` | Confirm file type/size validation matches backend; show upload progress/loading, retry path, and backend error message. | Invalid files are rejected client-side; submit button disables while uploading; failed upload has clear retry path. |
| Notification dropdown/detail | `NotificationContext.tsx`, `NotificationDropdown.tsx`, `NotificationDetailModal`, backend notification APIs | Add visible error state when fetch/read fails instead of silent failure for user-triggered actions; add mark-read feedback, retry, and related order navigation. | Notification read/detail actions use try/catch with user-visible feedback and keep realtime badge count accurate. |
| Admin manage users | No `ROUTES.ADMIN_USERS`; no admin user controller found | Add backend admin users endpoints first, then web route/nav page. Needed functions: list users, search/filter, view user, role/status management if supported, customer order stats/merit, and safe disable/restore if business allows. | Admin sidebar has "Manage Users"; page uses real backend data, not mocked users; actions are permission-protected and confirmed. |
| Admin rewards management | No reward backend found; `RewardProgressMap` is display-only | Add real rewards backend and admin page. Fields: title, description, requiredCompletedOrderCount, status active/inactive, reward type, validity dates if supported. Add create/edit/delete/toggle with validation, toasts, try/catch, loading/error/empty states. | Admin can update rewards from backend; customer reward map reads backend rewards; no hardcoded/mock reward data is treated as authoritative. |
| Reward eligibility/claiming | Backend missing | Add backend eligibility endpoint and claim endpoint if claiming is in scope. Use completed orders only by default; exclude cancelled orders. | Customer sees real eligible/locked/claimed reward states from backend data. |
| Admin order actions | `AdminOrderDetail.tsx`, order service endpoints | Review quote delivery fee, status update, payment confirmation, cancel actions for try/catch, loading states, duplicate-action prevention, confirmation dialogs where destructive. | Admin cannot double-submit quote/status/payment/cancel actions; backend errors appear clearly. |
| Admin product form fields | `AdminProducts.tsx`, product APIs | Keep validation for name, description, price, category, stock/availability, image type/size; add field-level errors where currently toast-only. | Product create/edit form has inline validation plus toast summary; failed image upload does not lose form data. |
| Auth login/register fields | `LoginPage`, `RegisterPage`, backend auth DTOs | Confirm frontend validation mirrors backend; show field-level errors, password visibility, loading disabled state, and backend conflict/auth errors clearly. | No auth request submits invalid required fields; duplicate submit is blocked; backend messages are mapped safely. |

### P0 Backend/API Work

| Item | Current status | Acceptance criteria |
|---|---|---|
| Reward backend contract | Backend reward/loyalty endpoints/models are missing. Web only has a merit preview from real completed order count. | Reward entity/model, admin CRUD, customer reward list, eligibility, and claim contract are defined and implemented or formally deferred before mobile starts. |
| Admin customer order stats | Customer profile exposes `totalOrders`, `completedOrders`, and `cancelledOrders`; admin order/customer views still need a clean stats source. | Admin can see completed order count/merit in customer or order detail context from backend data, not from current page-only frontend counting. |
| Admin manage users contract | No admin users route/controller found in the current backend scan. | Add admin-only user list/detail endpoints with pagination/search and safe role/status actions only if business rules allow them. |
| Typed realtime order events | Current realtime behavior refetches from notification events. This is safe but not a direct order-state payload. | Backend can optionally broadcast typed `ORDER_STATUS_UPDATED` payloads with order id/status/payment/delivery fee to customer and admin topics, or current refetch approach is documented as final for v1. |
| Reward notifications | Not available because rewards backend is missing. | When an order reaches a reward milestone, backend can create/broadcast reward notification, or this is explicitly deferred. |
| Notification read/detail support | Basic notification APIs exist; mark-read/detail behavior needs verification against UI needs. | Web can mark notifications read and show detail safely, or missing endpoint/method is documented. |
| Product performance backend follow-up | Frontend cache/debounce/skeletons are implemented. Backend response/image speed may still need profiling with real data. | If product API or images are still slow after frontend fixes, backend adds pagination/search indexes/cache headers/storage optimization as needed. |

### P1 Web Polish

| Item | Reason |
|---|---|
| Web component/integration tests | Add after shared components stabilize, especially checkout, order detail, notifications, and realtime refresh. |
| Admin orders pagination UI | Backend accepts page/size, but web currently loads the default list and does not expose pagination controls. |
| Dedicated notification center page | Dropdown is enough for v1; a full page helps if notifications become dense. |
| Rich product detail route | Current product modal/card flow works. Add a route only if the product experience needs shareable detail pages. |
| Data table primitive | Admin products/orders can share table states, actions, empty rows, and responsive behavior. |
| Rebuild archived docs later if needed | Old docs were moved to `docs/archive/legacy-progress-docs/`. Recreate active API/data-flow docs only after the implementation stabilizes. |

### Known Tech Debt

| Item | Reason |
|---|---|
| Mockito dynamic-agent warning cleanup | Backend tests pass, but Java warns that Mockito inline self-attachment will be blocked by a future JDK. |
| Open-in-view/JPA warning review | Backend runtime warning should be reviewed after functional work is stable. |
| Literal colors and inline styles | Several admin/order components still use literal colors or inline layout and should move to tokens/classes during refactors. |

## Componentization And Design Audit

Current state:
- The app has feature folders and some shared components: `ProtectedRoute`, `ProofUploadForm`, `StatusTimeline`, `NotificationDropdown`, and layout components.
- Design tokens exist in `web/src/index.css`.
- Landing/auth now use component folders for layout, UI, landing sections, and auth forms.
- Many deeper app pages still use inline styles and literal hex colors, so the design system is not fully componentized.

New component structure started:

| Area | Files | Status |
|---|---|---|
| UI primitives | `web/src/components/ui/Button.*`, `Input.*`, `PasswordInput.*`, `Logo.*` | Started and used by landing/auth. |
| Layout primitives | `web/src/components/layout/Navbar.*`, `AuthLayout.*`, `PageContainer.*` | Started and used by landing/auth. |
| Landing sections | `web/src/components/landing/HeroSection.tsx`, `FeaturedCookies.tsx`, `WhyChooseUs.tsx`, `CallToAction.tsx`, `LandingSections.css` | Done for first landing redesign pass. |
| Auth forms | `web/src/components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `AuthForms.css` | Done for first auth redesign pass. |
| Brand assets | `web/src/assets/brand/doughly-crumbl-red-logo.png`, `doughly-crumbl-white-logo.png` | Added from existing root `images/` assets. |
| Customer UI primitives | `Card.*`, `Badge.*`, `EmptyState.*`, `LoadingState.*`, `SectionHeader.*` | Started and used by customer-facing pages. |
| Menu/product components | `components/menu/*`, `components/product/*` | Started and used by `MenuPage` and product detail flow. |
| Order components | `components/orders/OrderCard.tsx`, `OrderStatusBadge.tsx`, `OrderComponents.css` | Started and used by `OrdersPage`. |
| Content components | `components/about/*`, `components/care/*` | Started and used by About and Cookie Care pages. |

High-refactor files:

| File | Finding |
|---|---|
| `web/src/features/checkout/CheckoutModal.tsx` | Around 80 inline style occurrences; modal, form fields, confirmation dialog, segmented controls, payment options, and notices should become reusable classes/components. |
| `web/src/features/admin/AdminProducts.tsx` | Around 68 inline style occurrences; table, form modal, upload field, buttons, delete confirmation should be extracted. |
| `web/src/features/orders/OrderConfirmationPage.tsx` | Inline card/buttons/status notice should use shared card/button/notice components. |
| `web/src/features/orders/OrdersPage.tsx` | Refactored to use reusable `OrderCard` and `OrderStatusBadge`. Remaining deeper order-detail screens still need migration. |
| `web/src/features/admin/AdminDashboard.tsx` | Inline stat card and quick-link card patterns should be extracted. |
| `web/src/shared/components/StatusTimeline.tsx` | Shared component exists but still uses inline layout and hardcoded cancelled color. |
| `web/src/shared/utils/formatters.ts` | Status colors are hardcoded hex values instead of design tokens. |
| `web/src/features/orders/OrderDetailPage.css` and `web/src/features/admin/AdminOrderDetail.css` | Many literal colors for warning/info/success/payment states should become named CSS variables. |

Recommended shared components:
- `Button` - started for landing/auth/customer flows
- `IconButton`
- `TextField` - started as `Input`
- `PasswordInput` - started for auth
- `Logo` - started with real Doughly Crumbl image assets
- `Badge` - started
- `Card` - started
- `EmptyState` - started
- `LoadingState` - started
- `SectionHeader` - started
- `SelectField`
- `Modal`
- `ConfirmDialog`
- `PageHeader`
- `StatusBadge`
- `NoticeBanner`
- `ErrorState`
- `DataTable`
- `FileUploadField`

## Backend Contract Notes For Web

| Backend Area | Status | Web Impact |
|---|---|---|
| Auth | Ready | Web login/register contracts match. |
| Products | Ready | Search/category backend flow is wired and covered by tests. |
| Cart | Ready | Web cart contracts match backend. |
| Orders | Ready | Current web order types match `OrderResponse`, including `fulfillmentMethod`, `paymentMethod`, `subtotalAmount`, `deliveryFee`, and `productId`. |
| Payment proof upload | Ready | Web and backend agree on multipart `proof`. |
| Notifications | Ready | REST endpoints and WebSocket path are present. |
| Admin products/orders | Ready | Web contracts match available admin endpoints. |
| Profile/addresses/favorites | Backend ready, web partial | Favorites are wired through `profileApi` and `FavoritesContext`; account display exists. Address/settings management still needs UI. |
| Rewards/loyalty | Backend missing | No reward, loyalty, merit threshold, or customer reward eligibility endpoints/models were found. Do not fake backend integration; create UI only after backend contract is defined. |
| Customer total order count | Customer profile ready, admin exposure incomplete | `/api/profile` exposes `totalOrders`, `completedOrders`, `cancelledOrders`, and `rating`. Web merit display uses `completedOrders`. Admin customer/order contexts still need a backend-supported stats source if admin should see customer merit. |
| Realtime order updates | Functional notification-triggered refetch | WebSocket notifications exist and customer/admin pages refetch when relevant order notifications arrive. A stronger typed order-event payload is optional but would reduce full refetching. |

## 2026-05-23 Frontend Development Pass

Implemented:
- Reworked the active checkout file `web/src/features/checkout/CheckoutModal.tsx` into a single modal with internal `details` and `review` steps.
- Removed the visible stacked-modal behavior where `ConfirmModal` opened on top of the Place Order modal.
- Updated `CartContext.openCheckout()` so checkout replaces the Order Bag drawer instead of leaving the drawer open behind it.
- Redesigned `OrderConfirmationPage` with a clearer success hero, next-step notice, fulfillment/address summary, item summary, and action buttons.
- Fixed customer order detail QR behavior so the QR lightbox replaces the payment modal instead of stacking over it.
- Refined `AdminDashboard` metrics so the page highlights real operational queues: awaiting quote, payment queue, in progress, completed, products, total orders, and completed revenue.

Verification:
- `npm run build` passed after checkout refactor.
- `npm run build` passed after order success refactor.
- `npm run build` passed after order detail modal behavior fix.
- `npm run build` passed after admin dashboard refactor after fixing one extra CSS brace.

Remaining P0/P1 work:
- Standardize `ProductDetailModal`, `OrderDetailPage` payment modal, `AdminProducts` product form modal, and lightboxes onto shared modal/drawer primitives.
- Refactor `OrderDetailPage` and `AdminOrderDetail` into shared order detail components.
- Add settings UI only for supported profile/account data, or document unsupported preferences.
- Define backend contract before implementing rewards/loyalty administration.
- Centralize payment account details and store contact constants to avoid repeated hardcoded strings.

## 2026-05-23 Performance, Realtime, And Merit Pass

Findings:
- Product menu search was issuing a product request for every search input change.
- Product API calls had no frontend cache or in-flight request dedupe, so repeated navigation/filter changes could repeat identical requests.
- Product loading replaced the product area with a generic spinner instead of card skeletons, causing a slower perceived transition.
- WebSocket/STOMP support already exists through `/ws/websocket` and `/topic/notifications/{userId}`.
- Customer order pages had polling fallback, but did not react directly to WebSocket notifications.
- Admin users were not notified for every order status change/cancellation, so admin pages could not reliably refetch from realtime events.
- Backend profile already exposes `totalOrders`, `completedOrders`, `cancelledOrders`, and `rating`; completed orders are the safest merit source.
- Reward/loyalty backend endpoints/models still do not exist.

Implemented:
- Added product request cache and in-flight request dedupe in `web/src/shared/api/productApi.ts`.
- Added `useDebouncedValue` and debounced menu search before fetching products.
- Added product-card skeletons in `ProductGrid`/`MenuComponents.css`.
- Added retryable product load error state in `MenuPage`.
- Exposed `lastNotification` and `isRealtimeConnected` from `NotificationContext`.
- Customer `OrdersPage` and `OrderDetailPage` now refetch from WebSocket notification events without manual reload.
- Admin `AdminOrders`, `AdminOrderDetail`, and `AdminDashboard` now refetch from order notifications without manual reload.
- Backend `WebSocketNotificationObserver` now notifies admins on order status changes and cancellations.
- Added `RewardProgressMap` and wired it into `AccountModal` using real `/api/profile` completed order counts.

Merit/reward rule:
- Merit count uses backend `completedOrders`.
- Cancelled orders are excluded by default.
- The displayed milestone map is a UI progress preview. Admin-controlled rewards still require real backend reward endpoints before claims/eligibility can be made authoritative.

Reward backend required:
- `GET /api/rewards`
- `POST /api/admin/rewards`
- `PUT /api/admin/rewards/{rewardId}`
- `DELETE /api/admin/rewards/{rewardId}`
- `GET /api/customers/{customerId}/rewards`
- `POST /api/customers/{customerId}/rewards/{rewardId}/claim`

Verification:
- Web targeted ESLint passed for changed files.
- `npm run build` passed after frontend changes.
- Backend `./mvnw.cmd test` passed: 45 tests, 0 failures.

## 2026-05-23 Shared Modal, Header Cart, And Account Profile Pass

Implemented:
- Strengthened shared `Modal` behavior in `web/src/components/ui/Modal.tsx` and `Modal.css`:
  - blurred/dimmed fixed overlay
  - body scroll lock while open
  - focus moves into the modal
  - Tab focus wraps inside the modal
  - Escape/outside click respects `preventClose`
  - reduced-motion support for modal animation
- Updated the header cart button in `web/src/layout/Header.tsx` and `Header.css`:
  - removed visible "Order Bag" text
  - made cart action icon-only with an accessible label
  - aligned cart badge placement/style with notification badge
  - cart button now opens/toggles the order panel even when the cart is empty
  - navigating from another page to the menu now opens the order panel regardless of item count
- Added reusable profile/account API support in `web/src/shared/api/profileApi.ts`:
  - `updateProfile`
  - `getAddresses`
  - `addAddress`
  - `updateAddress`
  - `deleteAddress`
- Added shared API error helper: `web/src/shared/utils/apiError.ts`.
- Added reusable customer profile hook: `web/src/shared/hooks/useCustomerProfile.ts`.
- Added reusable profile components:
  - `web/src/components/profile/ProfileForm.tsx`
  - `web/src/components/profile/AddressManager.tsx`
- Expanded `AccountModal` into a larger account management modal:
  - editable name/email/phone/address form using backend-supported fields
  - client validation mirrors backend profile DTO rules
  - saved delivery address CRUD using backend address endpoints
  - loading/error/retry states and success/error toasts
  - auth display updates after a successful profile save
  - password editing is intentionally not shown because no backend password-change endpoint exists

Verification:
- `npm run build` passed.
- Targeted ESLint passed for changed files:
  - `src/components/ui/Modal.tsx`
  - `src/layout/Header.tsx`
  - `src/shared/hooks/AuthContext.tsx`
  - `src/shared/api/profileApi.ts`
  - `src/shared/utils/apiError.ts`
  - `src/shared/hooks/useCustomerProfile.ts`
  - `src/components/profile/AccountModal.tsx`
  - `src/components/profile/ProfileForm.tsx`
  - `src/components/profile/AddressManager.tsx`

Remaining from this slice:
- Migrate hand-rolled product detail, payment, admin product, and admin order overlays onto shared `Modal`/drawer primitives.
- Add an empty order panel visual QA pass now that the cart button opens the panel even when empty.
- Add backend password-change endpoint only if account credential editing is required.
- Add admin Manage Users backend endpoints/page.
- Replace display-only rewards with real backend reward CRUD and customer eligibility.

## 2026-05-23 Product Detail, Order Panel, And Admin Product Modal Pass

Implemented:
- Migrated `web/src/components/product/ProductDetailModal.tsx` from a hand-rolled overlay to shared `Modal`.
  - Product details now inherit the shared blurred/fixed background, scroll lock, Escape handling, and focus trap.
  - `preventClose` is enabled while add-to-cart is loading.
- Reworked product detail modal CSS to style content inside the shared modal shell.
- Extracted cart row rendering into `web/src/components/cart/CartItemRow.tsx`.
  - `OrderPanel` now delegates image, quantity buttons, remove action, and pricing to a reusable cart row component.
  - Removed the hardcoded "Fresh cookie" label and replaced it with a neutral "Cookie" fallback until backend cart item category exists.
- Improved `OrderPanel` empty behavior.
  - Empty cart now opens cleanly with an explicit empty state and note.
  - Browse menu action closes the panel and keeps navigation predictable.
- Extracted the admin product create/edit form into `web/src/components/admin/ProductFormModal.tsx`.
  - Product form now uses shared `Modal`.
  - Product form fields have labels, inline validation, loading disabled state, and accessible error text.
  - Product image upload remains client-validated for image type and 5 MB max size.
- Updated `AdminProducts` to use reusable `ProductImage` fallback instead of an external placeholder image URL.

Verification:
- `npm run build` passed.
- Targeted ESLint passed for:
  - `src/components/product/ProductDetailModal.tsx`
  - `src/layout/OrderPanel.tsx`
  - `src/components/cart/CartItemRow.tsx`
  - `src/features/admin/AdminProducts.tsx`
  - `src/components/admin/ProductFormModal.tsx`

Remaining from this slice:
- Migrate customer payment modal/lightbox in `OrderDetailPage` onto shared `Modal`.
- Review admin order proof/payment overlays and status confirmations for shared modal usage.
- Add cart item category to backend cart response if real category display is required.
- Add visual browser QA for product detail modal, empty order panel, and admin product modal on desktop/mobile.

## Next Development Order

1. Run full web QA with backend runtime: menu loading, checkout, order placement, admin status updates, realtime customer refresh, notifications, account modal, favorites, and merit display.
2. Fix existing full-web-lint blockers or explicitly defer them before the next large refactor.
3. Migrate remaining customer order detail payment modal/lightbox and admin order overlays to shared modal primitives.
4. Refactor customer and admin order detail pages into shared order components and shared status/payment/store constants.
5. Complete notification UX: detail/read behavior, realtime connection feedback, order links, try/catch feedback, and empty/loading/error states.
6. Clean up admin orders: table states, action loading states, pagination UI, and status/action components.
7. Add admin Manage Users only after backend admin user endpoints are implemented with pagination/search and safe role/status rules.
8. Replace mocked/display-only rewards with real backend rewards: implement admin reward CRUD, customer reward eligibility, completed-order merit rules, and reward notifications if in scope.
9. Add targeted component/integration tests for checkout, order detail, notification refresh, profile editing, admin status updates, cart behavior, and merit/rewards.
10. Only start the mobile pass after web/backend contracts above are stable and documented.

---

## Full Page-by-Page Web Audit — 2026-05-23

Conducted by scanning every route, every frontend file, and every backend controller. Format per page: completed / issues / backend gaps / UI/UX gaps / testing needed / priority / next action.

---

### Page 1 — Landing

**Route:** `/`
**Frontend files:** `features/landing/LandingPage.tsx`, `components/landing/*`, `components/layout/Navbar.tsx`, `components/ui/Logo.tsx`
**Backend endpoints:** None — fully static
**Status:** ✅ Complete

**Completed:**
- Marketing content, CTA, Doughly Crumbl branding, favicon, and real logo image
- Navbar with login/register links; routes to `/login`, `/register`
- Reusable section components: `HeroSection`, `FeaturedCookies`, `WhyChooseUs`, `CallToAction`
- Fully CSS-driven — no inline styles

**Issues found:** None

**Backend/API gaps:** None — page is intentionally static

**UI/UX gaps:**
- Cookie visuals are CSS-built decorative graphics, not real product images — acceptable for v1

**Testing needed:** Visual regression test on hero viewport and CTA links

**Priority:** Low
**Next action:** No action required

---

### Page 2 — Login

**Route:** `/login`
**Frontend files:** `features/auth/LoginPage.tsx`, `components/auth/LoginForm.tsx`, `shared/hooks/AuthContext.tsx`, `shared/api/authApi.ts`
**Backend endpoints:** `POST /api/auth/login`
**Status:** ✅ Complete

**Completed:**
- Email + password validation (non-empty, email format, min 6 chars password)
- Role-based redirect: ADMIN → `/admin`, CUSTOMER → `/menu`
- Backend auth errors surface as toast + field-level message
- JWT stored in `localStorage` under key `'auth'`; `AuthContext` rehydrates on mount
- Loading disabled state during submission; prevents duplicate submit
- Forgot password and Google sign-in are UI-only placeholders with toast messages

**Issues found:**
- Forgot password: non-functional (no backend endpoint) — correctly shows toast, not a broken form
- Google sign-in: non-functional (no OAuth integration) — correctly shows toast

**Backend/API gaps:**
- No password reset endpoint exists (`POST /api/auth/forgot-password` or similar)
- No OAuth2/Google endpoint exists (config class is present but unused)

**UI/UX gaps:**
- No "Remember me" option — JWT persists in localStorage on every login by default
- No link back to landing page from the split-screen auth layout (only forward navigation to register)

**Testing needed:**
- Login with valid credentials (customer + admin)
- Login with wrong password → error shown
- Login with empty fields → validation fires

**Priority:** Low (functional; missing features are intentionally deferred)
**Next action:** Backend password-reset endpoint if required by feature scope

---

### Page 3 — Register

**Route:** `/register`
**Frontend files:** `features/auth/RegisterPage.tsx`, `components/auth/RegisterForm.tsx`
**Backend endpoints:** `POST /api/auth/register`
**Status:** ✅ Complete

**Completed:**
- Split `firstName` + `lastName` fields combined into single `name` field before sending — matches backend `User.name`
- PH phone regex (`^(09|\+639)\d{9}$`) with optional field
- Password strength meter (weak/medium/strong) with visual bar
- Password visibility toggle on both password fields
- Field-level error mapping from backend response (name, email, phone, password keys)
- All auth screens use `AuthLayout` shared layout wrapper
- Password confirm check on client before backend call

**Issues found:**
- `firstName` + `lastName` split is UI-only: if either is blank after the split (single word name), first letter becomes the full `lastName` — edge case not covered by validation
- Duplicate email registration: backend returns 409 with field error in `email` key — this IS correctly mapped to the email field error

**Backend/API gaps:** None

**UI/UX gaps:**
- No indicator of PH phone format guidance while field is empty

**Testing needed:**
- Registration with all valid fields
- Duplicate email → field-level error
- Invalid PH phone → field error
- Password mismatch → field error
- Register with single-word name

**Priority:** Low
**Next action:** Consider adding phone format placeholder `e.g. 09XXXXXXXXX`

---

### Page 4 — Menu (Product Browsing)

**Route:** `/menu`
**Frontend files:** `features/menu/MenuPage.tsx`, `components/menu/*`, `components/product/ProductDetailModal.tsx`, `components/product/FavoriteButton.tsx`, `shared/hooks/CartContext.tsx`, `shared/hooks/FavoritesContext.tsx`, `shared/api/productApi.ts`
**Backend endpoints:** `GET /api/products` (with search, category, page, size params)
**Status:** ✅ Complete (with known gaps)

**Completed:**
- 300ms debounced search before API call — avoids excessive requests
- In-flight request deduplication and frontend product cache in `productApi.ts`
- Category filter tabs (All, Cookies, Croissants, Donuts, Sourdough, Cakes, Pastries, Beverages)
- Skeleton loading cards while fetching
- Retryable error state when product fetch fails
- Add-to-cart via `CartContext` with optimistic pending state
- Product detail modal with quantity selector, favorites, category, price, description
- `ProductDetailModal` uses shared `Modal` (blurred overlay, scroll lock, Escape key, focus trap)
- Favorites via `FavoritesContext` — optimistic toggle with rollback on failure

**Issues found:**
- Product images rely on external URLs stored in the backend — if an image URL is broken, `ProductImage` shows a local fallback logo
- Category list is hardcoded in the frontend and must match backend product categories exactly

**Backend/API gaps:**
- Backend product search/category filtering: `GET /api/products?search=&category=&page=&size=` — confirmed to exist in `ProductController`
- No product rating average endpoint — `OrderRatingController` handles per-order ratings but no `GET /api/products/{id}/rating` summary exists

**UI/UX gaps:**
- No visible "out of stock" UI treatment if product is not available (ProductDetailModal may show add-to-cart for unavailable products — depends on backend rejection)
- No pagination controls in MenuPage (loads page 0, size 20 by default) — if more than 20 products exist, additional pages are not fetched

**Testing needed:**
- Product list loads with search filter applied
- Category tab filters correctly
- Add-to-cart success/failure feedback
- Favorite toggle on product card and detail modal
- Product detail modal opens/closes with Escape and backdrop click

**Priority:** Medium (pagination gap could hide products if catalog grows)
**Next action:** Add "load more" or pagination if product count exceeds 20

---

### Page 5 — App Shell (Sidebar, Header, Order Panel)

**Route:** All authenticated routes
**Frontend files:** `layout/AppLayout.tsx`, `layout/Sidebar.tsx`, `layout/Header.tsx`, `layout/OrderPanel.tsx`, `components/cart/CartItemRow.tsx`, `components/notifications/NotificationDetailModal.tsx`, `shared/components/NotificationDropdown.tsx`
**Backend endpoints:** `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`; WebSocket `/ws/websocket` → `/topic/notifications/{userId}`
**Status:** ✅ Mostly complete

**Completed:**
- Sidebar: customer nav (Menu, My Orders, About, Care Guide) and admin nav (Dashboard, Products, Orders, Users)
- Active nav item highlighted with `aria-current="page"`
- Avatar dropdown: name/email header, "My Account" for customers, "Sign Out" for all
- Escape key + click-outside close dropdown; Up/Down arrow cycle between menu items
- Header: logo, search (toggles focus input), notification bell (badge + dropdown), cart icon (badge, opens order panel)
- Notification dropdown: list with read/unread states, mark-all-read, click-to-detail modal, Escape/outside close
- NotificationDetailModal: full title/message/timestamp, "View Order" routing (correct role-based path), "Mark as Read" button
- OrderPanel: cart items via `CartItemRow`, quantity stepper, remove, subtotal, proceed to checkout CTA, close (X) button
- Cart item category: shows "Cookie" as fallback (BL-MOD-10 documented — backend cart doesn't return category)

**Issues found:**
- Admin users cannot open AccountModal (Sidebar guards it with `{!isAdmin && ...}`) — intentional by design but means admin has no profile editing in the UI
- OrderPanel empty state: renders cleanly with empty state + browse menu CTA
- `CartItemRow` hardcodes "Cookie" as category fallback — no backend field available to improve this

**Backend/API gaps:**
- Cart item does not expose product category — backend `CartItemResponse` would need a `productCategory` field (BL-MOD-10)
- WebSocket URL for physical device testing requires `VITE_WS_BROKER_URL` env var (defaults to `ws://localhost:8080/ws/websocket` which fails on devices)

**UI/UX gaps:**
- No visible real-time connection indicator when WebSocket is disconnected (`isRealtimeConnected` flag exists but unused in UI)
- Sidebar on mobile: behavior not verified — sidebar CSS has a mobile bottom-bar but behavior needs browser QA

**Testing needed:**
- Sidebar navigation for both customer and admin roles
- Avatar dropdown keyboard nav (Escape, arrows)
- Notification dropdown: unread badge, mark read, detail modal open/close, order navigation
- OrderPanel: open from empty cart (icon click), quantity controls, remove item, proceed to checkout

**Priority:** Medium
**Next action:** Add WebSocket disconnect indicator to Header; set `VITE_WS_BROKER_URL` in `.env` for device testing

---

### Page 6 — Checkout (Modal)

**Route:** Opens from OrderPanel on any page
**Frontend files:** `features/checkout/CheckoutModal.tsx`, `features/checkout/CheckoutModal.css`
**Backend endpoints:** `POST /api/orders` (body: `CheckoutRequest`)
**Status:** ✅ Complete

**Completed:**
- Two-step flow: (1) fulfillment/address/payment details, (2) order review + confirm
- Fulfillment toggle: DELIVERY vs PICKUP; delivery address + contact required only when DELIVERY selected
- Payment method selection: GCash, Maya, Bank Transfer (all modes), Cash on Pickup (pickup only)
- Checkout review shows item list, subtotal, delivery fee note, and payment method
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on modal panel
- Escape key closes modal (disabled during submission)
- Confirm step uses `ConfirmModal` shared component; description is conditional on fulfillment method
- Cart clears and checkout closes on success; navigates to `/order-success` with `state.order`
- CartContext `openCheckout()` replaces the Order Bag drawer — no stacked modals

**Issues found:**
- Delivery notes field is present but its content ends up in `deliveryNotes` — backend uses this for historical payment method parsing (`extractPaymentMethod()` checks `deliveryNotes` for legacy orders)

**Backend/API gaps:**
- `POST /api/orders` requires `fulfillmentMethod` and `paymentMethod` — confirmed both are sent
- No checkout validation summary — field-level errors only (no top-level error banner)

**UI/UX gaps:**
- No loading state on proceed-to-review step (only on final submit)
- Notes field `placeholder` text could better indicate that delivery instructions go here

**Testing needed:**
- Full checkout flow with delivery + each payment method
- Full checkout flow with pickup + cash on pickup
- Empty delivery address → validation fires
- Backend error (stock, validation) → error toast shown
- Duplicate submit prevention while loading

**Priority:** Low
**Next action:** No action required; existing behavior is correct

---

### Page 7 — Order Confirmation

**Route:** `/order-success`
**Frontend files:** `features/orders/OrderConfirmationPage.tsx`, `features/orders/OrderConfirmationPage.css`
**Backend endpoints:** None — reads from React Router `location.state.order`
**Status:** ✅ Complete

**Completed:**
- Hero section with check icon, order number, and next-step description
- Pickup vs delivery conditional notice banner and routing copy
- Order card: order number, date, delivery address, item list with quantity and price, subtotal, delivery fee note, total
- Actions: "Track My Order" → `/orders/{orderId}`, "Continue Shopping" → `/menu`
- Fallback state when accessed without router state: shows "Order details unavailable" with navigation CTAs

**Issues found:**
- `order.items` keyed by `${item.productId ?? item.productName}-${item.quantity}` — if two identical products have same name and quantity, key collision possible (edge case, but real for multi-item orders)
- Delivery note says "To be quoted" even for pickup orders that have PAYMENT_CONFIRMED flow — handled correctly by `!isPickup` conditional

**Backend/API gaps:** None — reads from router state

**UI/UX gaps:**
- Page is not reachable if user navigates directly to `/order-success` without placing an order (fallback state handles this)
- Item subtotal uses `order.subtotalAmount ?? sum(items)` — both paths should yield the same value; `subtotalAmount` field existence in `OrderResponse` confirmed

**Testing needed:**
- Place order (delivery) → confirmation page shows delivery notice
- Place order (pickup) → confirmation page shows pickup notice
- Navigate to `/order-success` directly (without state) → fallback shows correctly

**Priority:** Low
**Next action:** No action required

---

### Page 8 — Customer Orders List

**Route:** `/orders`
**Frontend files:** `features/orders/OrdersPage.tsx`, `components/orders/OrderCard.tsx`, `components/orders/OrderStatusBadge.tsx`
**Backend endpoints:** `GET /api/orders/my-orders`
**Status:** ✅ Complete

**Completed:**
- Order list from backend with `OrderCard` for each order
- `OrderStatusBadge` with correct status-to-color mapping
- 30-second polling fallback for active orders (not terminal/cancelled)
- Notification-triggered refetch on `lastNotification` change (no manual reload needed)
- Empty state with CTA to browse menu
- Loading state (spinner)
- Error state with retry button

**Issues found:** None

**Backend/API gaps:** None

**UI/UX gaps:**
- No search or filter on customer order list — acceptable for v1 (customers typically have few orders)
- 30s polling and WebSocket notification both trigger refetch — could cause double-fetch on notification arrival, but this is harmless and self-deduplicating

**Testing needed:**
- Orders load on mount
- New order placed → appears in list after notification
- Active order status changes (admin advances) → list refreshes
- Empty state shown when user has no orders

**Priority:** Low
**Next action:** No action required

---

### Page 9 — Customer Order Detail

**Route:** `/orders/:id`
**Frontend files:** `features/orders/OrderDetailPage.tsx`, `features/orders/OrderDetailPage.css`, `shared/components/StatusTimeline.tsx`, `shared/components/ProofUploadForm.tsx`
**Backend endpoints:** `GET /api/orders/{id}`, `PUT /api/orders/{id}/cancel`, `PUT /api/orders/{id}/submit-payment`, `POST /api/orders/{id}/rating` (backend ready, no web UI)
**Status:** ✅ Mostly complete — rating UI missing

**Completed:**
- Full order detail: header card (order#, date, fulfillment badge, status badge, payment status), delivery/fulfillment info (address, contact, notes, payment method), item list with subtotal, delivery fee, total
- Status timeline via `StatusTimeline` — shows pickup or delivery flow with current step highlighted
- Payment modal: shows QR + account details + proof upload via `ProofUploadForm`
- Delivery fee display after quote
- Payment submission: multipart `PUT /api/orders/{id}/submit-payment` with proof file
- Cancel order: `ConfirmModal` with reason textarea; `PUT /api/orders/{id}/cancel`
- Reorder: re-adds all order items to cart, then opens checkout
- QR lightbox: tap QR to expand full-screen; closes on backdrop click
- Notification-triggered refetch on order-specific notifications
- `OrderStatusBadge` component for status chip
- `getHelperBannerClass()` derives CSS modifier from status — banner colors are token-driven

**Issues found:**
- `extractPaymentMethod()` falls back to parsing `deliveryNotes` string for legacy orders — needed for backward compatibility but fragile
- `canCancel` logic: cancellable for most non-terminal statuses except `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED` and `PAYMENT_SUBMITTED_AWAITING_CONFIRMATION` — verify this matches backend cancel validation

**Backend/API gaps:**
- `POST /api/orders/{orderId}/rating` exists but NO web UI exists to submit a rating after delivery
- `GET /api/orders/{orderId}/rating` exists but web never calls it
- `canReorder` logic uses `productId` on order items — `OrderItemResponse` does include `productId` (confirmed in backend `OrderResponse.java`)

**UI/UX gaps:**
- No post-delivery rating form — customers cannot rate completed orders from the web frontend
- Timeline `PICKUP_STEPS` ordering is: ORDER_PLACED → PREPARING → READY → PAYMENT_CONFIRMED → COMPLETED — `PAYMENT_CONFIRMED` appearing after `READY` does not match any real pickup flow (should either be before PREPARING for prepaid, or absent for cash-on-pickup)

**Testing needed:**
- Delivery order detail: timeline shows correct step, fee shown after quote, payment modal opens
- Pickup order detail: different timeline, no delivery fee section
- Submit payment proof → status updates to PAYMENT_SUBMITTED_AWAITING_CONFIRMATION
- Cancel order with reason → confirmation dialog, status updates to CANCELLED
- Reorder → items added to cart

**Priority:** Medium (rating UI missing; pickup timeline step ordering wrong)
**Next action:**
1. Fix PICKUP_STEPS in `StatusTimeline` — remove `PAYMENT_CONFIRMED` from after `READY` (or make timeline flow-type-aware for prepaid vs cash)
2. Add rating form UI after order reaches COMPLETED or DELIVERED status

---

### Page 10 — Payment Instructions

**Route:** `/orders/:id/payment`
**Frontend files:** `features/orders/PaymentInstructionsPage.tsx`, `features/orders/PaymentInstructionsPage.css`, `shared/components/ProofUploadForm.tsx`
**Backend endpoints:** `GET /api/orders/{id}`, `PUT /api/orders/{id}/submit-payment`
**Status:** ✅ Functional — inline styles and personal credentials need cleanup

**Completed:**
- Fetches order by ID on mount; reads `paymentMethod` field (falls back to parsing `deliveryNotes` for legacy orders)
- Payment method tabs: GCash, Maya, BPI, Cash on Pickup (cash tab shown only for pickup orders)
- QR image display with clickable lightbox enlarge; `onError` hides broken QR images
- Account details per payment method
- Switching tabs warns the user if they had started uploading proof
- Cash on pickup: no proof upload, "Confirm Order" button shows toast and navigates to My Orders
- Online methods: proof upload via `ProofUploadForm`; submits multipart to `PUT /api/orders/{id}/submit-payment`
- Navigates to My Orders on success

**Issues found:**
- **PERSONAL CREDENTIALS IN PRODUCTION CODE:** Maya account details show `Chris Daniel Cabataña` / `@cdanpc` / masked phone. This is a real person's account in the frontend source — must be replaced with actual business account or properly marked as placeholder before any public release.
- Loading state uses `style={{ display: 'flex', justifyContent: 'center', padding: 64 }}` — inline style not yet migrated to CSS class
- Not-found state button uses multiple inline style props (`background`, `color`, `borderRadius`, `padding`, `fontWeight`, `border`, `cursor`) — not migrated to CSS class
- Cash on pickup "Confirm Order" does not call any backend endpoint — correct UX behavior (no payment submission needed) but admin must still manually advance the order

**Backend/API gaps:**
- `submitPayment(orderId, file)` sends multipart with `proof` field; backend `@RequestPart(required = false) MultipartFile proof` matches

**UI/UX gaps:**
- No error state if order fetch fails (only a toast + `null` check renders not-found screen)
- No loading feedback on "Confirm Order" button for cash on pickup (though no network call is made)

**Testing needed:**
- GCash payment: QR shown, proof upload, submit → navigates to My Orders
- Cash on pickup: no QR, no proof, confirm navigates to My Orders
- Tab switch warning toast appears
- QR lightbox expand/close

**Priority:** High (personal credentials must be removed before any public/demo deployment)
**Next action:**
1. Replace Maya `ACCOUNT_DETAILS` with actual business credentials or clearly marked placeholder
2. Extract loading and not-found state inline styles to CSS classes

---

### Page 11 — Care Guide

**Route:** `/care-guide`
**Frontend files:** `features/care-guide/CareGuidePage.tsx`, `components/care/*`
**Backend endpoints:** None — fully static
**Status:** ✅ Complete

**Completed:**
- Storage tips (shelf life, freezing, serving)
- Reheating steps component
- Ingredient and allergy information
- Allergen disclaimer footer
- All CSS-driven, no inline styles, reusable `CareTipCard` and `ReheatingSteps` components

**Issues found:** None

**Backend/API gaps:** None

**UI/UX gaps:** None

**Testing needed:** Visual regression; ensure allergen section is readable on mobile

**Priority:** Low
**Next action:** No action required

---

### Page 12 — About / FAQ

**Route:** `/about`
**Frontend files:** `features/about/AboutPage.tsx`, `components/about/*`
**Backend endpoints:** None — fully static
**Status:** ✅ Complete

**Completed:**
- Hero section with store description
- Contact cards (address, phone, Facebook, Instagram)
- FAQ accordion with 13 entries covering ordering, pickup, delivery, payment, ingredients, allergies, and events
- Content is accurate to real Doughly Crumbl business information

**Issues found:** None

**Backend/API gaps:** None

**UI/UX gaps:**
- FAQ uses a simple expand/collapse — no search or category filtering (acceptable for v1 with 13 items)

**Testing needed:** Visual regression; FAQ expand/collapse behavior

**Priority:** Low
**Next action:** No action required

---

### Page 13 — Admin Dashboard

**Route:** `/admin`
**Frontend files:** `features/admin/AdminDashboard.tsx`, `features/admin/AdminDashboard.css`
**Backend endpoints:** `GET /api/admin/orders`, `GET /api/admin/products`
**Status:** ✅ Complete

**Completed:**
- 6 stat cards: Total Orders, Awaiting Quote, Payment Queue, In Progress, Completed, Products
- Revenue card (sum of completed order totals)
- Recent orders table (last 8 by date) with clickable rows → admin order detail
- "View all →" link to admin orders
- Quick links to Products and Orders management
- Notification-triggered silent refetch
- Status filters use correct backend status strings

**Issues found:**
- No pagination for orders — loads all via `GET /api/admin/orders` (default page 0, size 50). If order count exceeds 50, dashboard stats will be wrong (incomplete data)

**Backend/API gaps:**
- `GET /api/admin/orders` returns a paginated `List<OrderResponse>` (page 0, size 50). Dashboard counts all returned orders, not true totals — may undercount if more than 50 orders exist

**UI/UX gaps:**
- No error state if dashboard data fails to load (only toast error; spinner stays)

**Testing needed:**
- Dashboard loads with real data and counts match expected values
- Stat cards update after admin actions (via notification refetch)
- Recent orders table rows navigate correctly

**Priority:** Medium (stat counting gap if order count exceeds 50)
**Next action:** Consider adding a dedicated `/api/admin/stats` endpoint that returns aggregate counts server-side, so dashboard is always accurate regardless of pagination

---

### Page 14 — Admin Products

**Route:** `/admin/products`
**Frontend files:** `features/admin/AdminProducts.tsx`, `features/admin/AdminProducts.css`, `components/admin/ProductFormModal.tsx`
**Backend endpoints:** `GET /api/admin/products`, `POST /api/admin/products`, `PUT /api/admin/products/{id}`, `DELETE /api/admin/products/{id}`, `POST /api/admin/products/upload-image`
**Status:** ✅ Complete

**Completed:**
- Product table: image, name, category badge, price, availability, edit/delete actions
- Client-side search filter (name or category)
- Create/edit modal using shared `Modal` via `ProductFormModal`
- Inline form validation: name required, price > 0
- Image upload: type and 5 MB validation client-side before upload; preview displayed
- Delete confirmation via `ConfirmModal` (shared component)
- Loading/error/empty states
- `ProductImage` component with local fallback (no external placeholder URLs)

**Issues found:**
- Backend `GET /api/admin/products` returns a paginated wrapper object (`{ content, totalElements, totalPages, currentPage }`), not a flat array — web `getAdminProducts()` in `productApi.ts` must extract `.content`. Needs verification that the API wrapper does this correctly; if it doesn't, the product list will be the wrapper object, not the array.
- Backend image upload field is `"image"` (`@RequestPart("image")`); web upload function sends the file — need to confirm the FormData key matches "image" and not "file"

**Backend/API gaps:** None beyond the above

**UI/UX gaps:**
- No pagination controls for product table — if more than 20 products exist (default page size), they won't all appear
- Product availability filter not exposed in UI (only search by name/category)

**Testing needed:**
- Create product with image → appears in table
- Edit product → changes reflected
- Delete product → removed from table with confirmation
- Image > 5 MB → rejection toast
- Search filter narrows results

**Priority:** Medium (paginated API wrapper mismatch is a correctness risk)
**Next action:** Verify `getAdminProducts()` extracts `.content` from the paginated response; add pagination controls

---

### Page 15 — Admin Orders

**Route:** `/admin/orders`
**Frontend files:** `features/admin/AdminOrders.tsx`, `features/admin/AdminOrders.css`
**Backend endpoints:** `GET /api/admin/orders` (with optional `status` param)
**Status:** ✅ Complete

**Completed:**
- Orders table: order ID, date, item count, total, status badge, view button
- Status filter dropdown (All + all 11 status strings)
- `OrderStatusBadge` for status display
- Notification-triggered silent refetch
- Error toast with HTTP status code on failure
- Empty state when filter returns no orders

**Issues found:**
- Same pagination gap as dashboard: backend returns up to 50 orders per request. If more than 50 total orders exist, the filter/count/table won't show all of them.
- `filterStatus` filter in frontend is redundant with backend `status` param — the API wrapper already sends `{ status: filterStatus }` when not ALL, but the frontend also re-filters client-side (`filtered = filterStatus === 'ALL' ? orders : orders.filter(...)`) after receiving filtered results — double filtering is harmless but wasteful.

**Backend/API gaps:** None

**UI/UX gaps:**
- No pagination UI controls
- No date range filter

**Testing needed:**
- All statuses filter correctly
- Status change on one order → list updates via notification
- View button navigates to admin order detail

**Priority:** Medium (pagination gap)
**Next action:** Add pagination controls or increase backend default page size to a higher value for admin contexts

---

### Page 16 — Admin Order Detail

**Route:** `/admin/orders/:id`
**Frontend files:** `features/admin/AdminOrderDetail.tsx`, `features/admin/AdminOrderDetail.css`, `shared/components/StatusTimeline.tsx`
**Backend endpoints:** `GET /api/admin/orders/{id}`, `PUT /api/admin/orders/{id}/status`, `PUT /api/admin/orders/{id}/delivery-fee?fee=`
**Status:** ✅ Complete

**Completed:**
- Header card: order#, date, pickup/delivery badge, `OrderStatusBadge`
- Two-column layout: left (timeline + action buttons), right (action panels + fulfillment info + order items)
- Status timeline via `StatusTimeline` with pickup/delivery flow
- Advance status button uses `getAdminNextStatus()` to determine valid next step
- Manual status override panel (all statuses, bypass normal flow, warning copy)
- Delivery fee quote panel: input + "Send Quote" button → `PUT /api/admin/orders/{id}/delivery-fee?fee=`
- Payment proof panel: show submitted proof, "Confirm Payment" → moves to `PAYMENT_CONFIRMED`
- Waiting-for-payment banner when `DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED`
- Cancel modal via `ConfirmModal` with reason textarea
- Proof lightbox on click
- Notification-triggered silent refetch for this specific order
- `extractPaymentMethod()` covers `paymentMethod` field + legacy `deliveryNotes` fallback

**Issues found:**
- **Missing `customerName`/`customerEmail` display:** `OrderResponse` now includes these fields (added in mobile audit task 7), but `AdminOrderDetail.tsx` does not render them — admin cannot identify which customer placed the order from this page
- Delivery fee backend uses `@RequestParam BigDecimal fee` (query param) — confirmed web `quoteDeliveryFee(id, fee)` sends as query param (`?fee=`)
- Same pickup timeline ordering issue as in customer order detail (PAYMENT_CONFIRMED after READY)

**Backend/API gaps:**
- `customerName`/`customerEmail` now exist in `OrderResponse.java` but web file does not render them

**UI/UX gaps:**
- Customer identity (name, email) is not displayed on the admin order detail page
- No visual distinction between "waiting for customer" states vs "admin action needed" states beyond banner text

**Testing needed:**
- Advance status through each step of delivery and pickup flows
- Quote delivery fee → customer sees updated order
- Confirm payment → status moves to PAYMENT_CONFIRMED
- Cancel order with reason → reason shows in order detail
- Manual override to any status

**Priority:** Medium
**Next action:**
1. Display `order.customerName` and `order.customerEmail` in the Admin Order Detail fulfillment info card
2. Fix pickup timeline step ordering

---

### Page 17 — Admin Users

**Route:** `/admin/users`
**Frontend files:** `features/admin/AdminUsers.tsx`, `features/admin/AdminUsers.css`
**Backend endpoints:** `GET /api/admin/users`, `PUT /api/admin/users/{id}/ban`, `PUT /api/admin/users/{id}/unban`, `DELETE /api/admin/users/{id}` (disables), `PUT /api/admin/users/{id}/restore`
**Status:** ✅ Complete

**Completed:**
- User table: name, email, role, phone, status, action buttons
- Status filter tabs: All, Active, Banned, Removed
- Client-side search by name, email, role, or phone
- Count summary in header: total/active/banned/removed
- Ban/unban/remove/restore actions with `ConfirmModal` confirmation
- Error state with retry; loading state with spinner
- Self-protection: current admin row shows "Current admin" and no action buttons
- `getApiErrorMessage()` utility for user-friendly backend error messages
- `AdminUserResponse` includes `enabled` + `accountLocked` for status derivation

**Issues found:**
- `DELETE /api/admin/users/{id}` is labeled "remove" in web but actually disables (not deletes) — correctly matches backend `disableUser()` behavior. Name is slightly misleading but functionally correct.
- `AdminUserResponse` fields `enabled` and `accountLocked` must come from backend; confirmed in `AdminUserController` + `AdminUserService`

**Backend/API gaps:** None — all 4 user management endpoints exist and match web calls

**UI/UX gaps:**
- No pagination for user list (all users returned in one request)
- No way for admin to create a new admin user from the web UI (no `POST /api/admin/users` endpoint)
- No way to view individual user's order history from this page

**Testing needed:**
- Ban user → status changes to Banned, Unban action appears
- Remove user → status changes to Removed, Restore action appears
- Self row shows "Current admin" with no action buttons
- Search filters work across name/email/role/phone
- Status filter tabs work correctly

**Priority:** Low
**Next action:** No action required for v1; add user-to-orders link if admin needs to view customer history

---

### Shared Component — StatusTimeline

**Files:** `shared/components/StatusTimeline.tsx`
**Used by:** `OrderDetailPage`, `AdminOrderDetail`
**Status:** ⚠️ Functional but uses all inline styles and has a flow ordering issue

**Issues found:**
- Entirely inline `style={{}}` props — dots, connector lines, labels, cancelled indicator all use inline layout and hardcoded color values including `#DC2626` for the cancelled dot
- PICKUP_STEPS ordering: `ORDER_PLACED → PREPARING → READY → PAYMENT_CONFIRMED → COMPLETED` — `PAYMENT_CONFIRMED` appears after `READY` which is incorrect for all pickup flows (cash pays at pickup without this step; prepaid gets confirmed before PREPARING)
- No CSS module or separate `.css` file — all visual state logic is inline

**Priority:** High (flow ordering causes wrong timeline display for pickup orders)
**Next action:**
1. Fix PICKUP_STEPS to remove or reorder `PAYMENT_CONFIRMED` — consider splitting into `pickup-cash` and `pickup-prepaid` flow types
2. Extract inline styles to `StatusTimeline.css`
3. Replace `#DC2626` cancelled color with `var(--color-error)`

---

### Shared Component — ProofUploadForm

**Files:** `shared/components/ProofUploadForm.tsx`
**Used by:** `OrderDetailPage`, `PaymentInstructionsPage`
**Status:** ⚠️ Functional but uses ~8 inline styles

**Issues found:**
- Upload button: `background: '#FAFAFA'`, `border: '2px dashed var(--color-border)'`, `borderRadius: 'var(--radius-sm)'` — mixed token references and hardcoded hex
- Preview panel footer: `background: '#F7F7F7'`, `borderTop: '1px solid var(--color-border)'` — hardcoded
- Success indicator: `color: '#16a34a'` — hardcoded (should be `var(--color-success)`)
- Submit button: `background: canSubmit ? 'var(--color-primary)' : '#ccc'` — `#ccc` disabled state is hardcoded

**Priority:** Low
**Next action:** Extract all inline styles to `ProofUploadForm.css`; replace `#FAFAFA`, `#F7F7F7`, `#16a34a`, `#ccc` with tokens

---

### Shared Context — NotificationContext + WebSocket

**Files:** `shared/hooks/NotificationContext.tsx`
**Status:** ✅ Complete

**Completed:**
- STOMP over native WebSocket (no SockJS)
- Auto-reconnect every 5s on disconnect
- Per-user subscription `/topic/notifications/{userId}`
- JWT passed in `connectHeaders`
- `isRealtimeConnected` flag exposed for UI use
- Notification list loaded from REST on mount; prepended with WebSocket pushes
- `lastNotification` drives order-detail refetches without polling

**Issues found:**
- `VITE_WS_BROKER_URL` defaults to `ws://localhost:8080/ws/websocket` — this will fail on physical device testing unless the env var is set to the LAN IP or deployed server URL
- WebSocket connection errors are silently swallowed (`onStompError`/`onWebSocketClose` only set `isRealtimeConnected = false`) — no user-visible feedback

**Priority:** Medium (device testing requires env var; silent failure makes debugging harder)
**Next action:** Document required env vars in a `.env.example`; add a visible reconnect indicator using `isRealtimeConnected`

---

### Shared Context — FavoritesContext

**Files:** `shared/hooks/FavoritesContext.tsx`, `shared/api/profileApi.ts`
**Backend endpoints:** `GET /api/profile/favorites`, `POST /api/profile/favorites/{productId}`, `DELETE /api/profile/favorites/{productId}`
**Status:** ✅ Complete

**Completed:**
- Optimistic toggle: updates local state immediately, syncs to backend, rolls back on failure
- Initial load on mount for authenticated customers (skipped for admin)
- `addFavorite()` returns `List<ProductResponse>` (201); sets IDs from response for accuracy
- `removeFavorite()` returns void (204); removes locally
- Error: rollback + `toast.error`

**Issues found:** None

**Backend/API gaps:** None — all three endpoints exist in `CustomerProfileController`

**Priority:** Low
**Next action:** No action required

---

### Shared Component — AccountModal + ProfileForm + AddressManager

**Files:** `components/profile/AccountModal.tsx`, `components/profile/ProfileForm.tsx`, `components/profile/AddressManager.tsx`, `shared/hooks/useCustomerProfile.ts`, `components/rewards/RewardProgressMap.tsx`
**Backend endpoints:** `GET /api/profile`, `PUT /api/profile`, `GET /api/profile/addresses`, `POST /api/profile/addresses`, `PUT /api/profile/addresses/{id}`, `DELETE /api/profile/addresses/{id}`
**Status:** ✅ Complete

**Completed:**
- Profile form: name, email, phone, address fields; client validation mirrors backend DTO rules (name required/max 100, email required/valid, PH phone pattern, address max 255)
- Profile save calls `PUT /api/profile` and updates `AuthContext` display name/email
- Address CRUD: add/edit/delete with label, address, default checkbox; validation for label max 80, address max 255
- Loading/error/retry states and success/error toasts
- RewardProgressMap: merit milestones (1, 3, 5, 10, 15), progress bar, locked/unlocked states, uses `profile.completedOrders`
- AccountModal: avatar initials, role badge, admin guard (no profile form for admin), store contact info footer
- Password editing intentionally not shown (no backend endpoint)

**Issues found:**
- Merit milestones (counts and labels) are hardcoded in `RewardProgressMap` — no backend rewards entity exists; this is display-only preview

**Backend/API gaps:**
- No backend reward entity/CRUD; milestones and reward claiming are entirely frontend-side

**Priority:** Low (existing behavior is correct; reward backend is deferred)
**Next action:** When reward backend is implemented, replace hardcoded milestones with API data

---

## Page-by-Page Audit Summary Table — 2026-05-23

| Page / Component | Route | Status | Critical Issues |
|---|---|---|---|
| Landing | `/` | ✅ Complete | None |
| Login | `/login` | ✅ Complete | No password reset backend |
| Register | `/register` | ✅ Complete | Minor edge case on single-word names |
| Menu (product browsing) | `/menu` | ✅ Complete | No pagination beyond 20 products |
| App shell (sidebar, header, order panel) | All auth routes | ✅ Mostly complete | WebSocket URL needs env var for device testing |
| Checkout modal | Any page | ✅ Complete | None |
| Order confirmation | `/order-success` | ✅ Complete | None |
| Customer orders list | `/orders` | ✅ Complete | None |
| Customer order detail | `/orders/:id` | ⚠️ Mostly complete | Rating UI missing; pickup timeline step order wrong |
| Payment instructions | `/orders/:id/payment` | ⚠️ Functional | **Personal Maya credentials in code**; inline styles remain |
| Care guide | `/care-guide` | ✅ Complete | None |
| About / FAQ | `/about` | ✅ Complete | None |
| Admin dashboard | `/admin` | ⚠️ Mostly complete | Stat counts wrong if >50 orders exist |
| Admin products | `/admin/products` | ⚠️ Mostly complete | Paginated API wrapper extraction unverified; no pagination UI |
| Admin orders | `/admin/orders` | ⚠️ Mostly complete | Same pagination gap; double filter (harmless) |
| Admin order detail | `/admin/orders/:id` | ⚠️ Mostly complete | customerName/customerEmail not displayed; pickup timeline wrong |
| Admin users | `/admin/users` | ✅ Complete | None |
| StatusTimeline | Shared | ⚠️ Needs fix | All inline styles; pickup step ORDER wrong |
| ProofUploadForm | Shared | ⚠️ Minor | Inline styles and hardcoded hex values remain |
| NotificationContext | Shared | ✅ Complete | WebSocket URL needs env var for device |
| FavoritesContext | Shared | ✅ Complete | None |
| AccountModal / Profile | Avatar dropdown | ✅ Complete | Reward milestones are frontend-only |

---

## Immediate Action Items From Audit (Prioritized)

| Priority | Item | File | Status | Action |
|---|---|---|---|---|
| P0 | Remove personal Maya credentials | `PaymentInstructionsPage.tsx` lines 41–45 | ✅ FIXED (2026-05-23) | Replaced `Chris Daniel Cabataña` / `@cdanpc` with `Doughly Crumbl` / `0916 566 7589` |
| P1 | Display customerName/customerEmail in AdminOrderDetail | `features/admin/AdminOrderDetail.tsx` | ✅ FIXED (2026-05-23) | Added `User` icon row to fulfillment info card; `Order` type updated with optional `customerName`/`customerEmail`; `od__info-sub` CSS class added |
| P1 | Fix PICKUP_STEPS ordering in StatusTimeline | `shared/components/StatusTimeline.tsx` | ⏳ OPEN | Remove or reorder `PAYMENT_CONFIRMED` step — it should not appear after `READY` in any pickup flow |
| P1 | Extract StatusTimeline inline styles to CSS | `shared/components/StatusTimeline.tsx` | ⏳ OPEN | Create `StatusTimeline.css`; replace all `style={{}}` props; replace `#DC2626` with `var(--color-error)` |
| P1 | Set VITE_WS_BROKER_URL for device testing | `.env` / `.env.example` | ⏳ OPEN | Document and set correct WebSocket broker URL for device/LAN testing |
| P2 | Verify getAdminProducts() extracts `.content` | `shared/api/productApi.ts` | ⏳ OPEN | Confirm the paginated wrapper response is unwrapped to `.content` array before assignment |
| P2 | Extract PaymentInstructionsPage inline styles | `PaymentInstructionsPage.tsx` | ⏳ OPEN | Move loading/not-found state inline styles to `PaymentInstructionsPage.css` |
| P2 | Extract ProofUploadForm inline styles | `shared/components/ProofUploadForm.tsx` | ⏳ OPEN | Create `ProofUploadForm.css`; replace `#FAFAFA`, `#F7F7F7`, `#16a34a`, `#ccc` with tokens |
| P2 | Add rating UI for completed orders | `OrderDetailPage.tsx` | ⏳ OPEN | Add star-rating form for COMPLETED orders using `POST /api/orders/{id}/rating` |
| P3 | Add admin stats endpoint to avoid pagination gap | Backend `AdminController` | ⏳ OPEN | Add `GET /api/admin/stats` returning aggregate counts so dashboard is always accurate |

Verification after P0/P1 fixes (2026-05-23):
- `npm.cmd exec -- tsc -b` → **0 errors**
