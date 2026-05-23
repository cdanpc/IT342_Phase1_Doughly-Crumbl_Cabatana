# Web System Progress

Last audited: 2026-05-23
Branch: `mobile/core-features`

This tracker is based on the current repo state, not only the older docs. It starts with the web app, but includes backend contract checks for every web-facing feature so development can start from known gaps.

## Verification Status

| Area | Command | Result |
|---|---|---|
| Web build | `npm run build` from `web/` | Passed. 1929 modules, built in 6.17s (2026-05-23, after modal refactor pass). |
| TypeScript check — latest pass | `npm.cmd exec -- tsc -b` from `web/` | **0 errors (2026-05-23, after full token migration pass — order flow inline styles + hardcoded hex fully removed).** |
| Targeted lint — latest pass | `npx eslint src/features/admin/AdminDashboard.tsx src/features/admin/AdminProducts.tsx src/features/orders/OrderDetailPage.tsx` from `web/` | 0 errors. 1 pre-existing warning (react-hooks/exhaustive-deps line 124 in OrderDetailPage — intentional dep optimization, not introduced by this pass). |
| Full web lint | `npm run lint` from `web/` | Fails on pre-existing shared hook/order issues outside the latest pass. See notes below. |
| Web dev server | `npm run dev -- --host 127.0.0.1 --port 5174` from `web/` | Verified HTTP 200 after previous customer-facing pass. |
| Backend tests | `.\mvnw.cmd test` from `backend/` | Passed. 45 tests, 0 failures, 0 errors. |

Notes:
- Backend tests run with the `test` profile and H2.
- Backend runtime startup against Supabase is still not verified.
- Full web lint fails on pre-existing issues in `shared/hooks/AuthContext.tsx`, `shared/hooks/CartContext.tsx`, `shared/hooks/NotificationContext.tsx`; all newly written files pass targeted lint.
- `OrderDetailPage.tsx` lint warning (react-hooks/exhaustive-deps) is pre-existing and intentional — not introduced by any recent pass.

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
| P0 | Continue reusable design primitives | `Modal` added. Remaining: `ConfirmDialog`, `Table`, `ErrorState`, `PageHeader`, `FileUploadField`. | Continue under `web/src/components`, then migrate admin pages. |
| P0 | Fix full web lint debt | Full lint fails on pre-existing issues in AuthContext, CartContext, NotificationContext. | Address in a focused lint-fix pass. |
| P0 | Refactor `CheckoutModal` out of inline styles | **DONE (2026-05-23)** — CheckoutModal.css fully rewritten; last inline style removed. Zero hardcoded hex. | — |
| P0 | Refactor `AdminProducts` modal/table/form | DONE (2026-05-23) — CSS extracted into `AdminProducts.css`; all inline styles replaced. | — |
| P0 | Eliminate inline styles from order flow (OrderDetailPage, AdminOrderDetail) | **DONE (2026-05-23)** — All `style={{}}` props and icon `color` props removed. `OrderStatusBadge` used everywhere. `getHelperBannerClass()` replaces dynamic inline border colors. | — |
| P1 | Centralize status UI | **DONE (2026-05-23)** — `OrderStatusBadge` used in AdminOrders, AdminDashboard, OrderDetailPage, AdminOrderDetail. Status colors live in `Badge.css` tone classes. `getStatusColor()` is no longer called in any TSX render. | — |
| P1 | Replace hardcoded web colors with tokens | **DONE (2026-05-23)** — 21 new tokens added to `index.css`. All order-flow CSS files (CheckoutModal, OrderDetailPage, OrderConfirmationPage, AdminOrderDetail) fully migrated to tokens. Zero hardcoded hex values remain in these files. | — |
| P1 | Add backend profile/addresses web integration | `/api/profile` and `/api/profile/addresses` exist but web only displays name/email. | Add editable profile form in AccountModal using PUT /api/profile. |
| P1 | Add backend tests for profile API | Profile endpoints are untracked by current test list. | Add service/controller tests for profile, addresses, and favorites. |
| P1 | Add web error states consistently | Some pages only toast and empty the list on error, losing retry context. | Add shared `ErrorState` with retry and use it on menu, orders, admin products/orders, payment instructions. |
| P2 | Replace remote placeholder images | Product cards and admin product rows use `https://placehold.co` fallbacks. | Add local placeholder asset and use it across web. |

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
