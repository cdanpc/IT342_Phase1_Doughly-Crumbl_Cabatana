# Doughly Crumbl Mobile — UI Design Audit
> Conducted: 2026-05-16 | Auditor: Claude Code (ui-critic)
> Scope: All 30 layout files across GROUP 1–9

---

## 👁️ First Impression

The app has a coherent brand identity — crimson + Poppins + card-heavy layout reads as a premium artisan bakery. The auth screens (Login, Register) are the strongest, with the split crimson header / white card pattern working well. Once past auth, quality drops noticeably: admin screens feel rushed (inconsistent roots, raw stock Android drawables), the orders list is a shell, and cross-screen consistency breaks down in several places that would be immediately visible to a grader or user.

---

## 🔍 Detailed Audit

---

### Screen 1 — Splash (`activity_splash.xml`)

#### Visual Hierarchy & Layout
✅ Logo → App Name → Tagline chain is clean and logical.
⚠️ `android:layout_marginBottom="32dp"` on the ProgressBar is hardcoded — violates the no-hardcoded-dp rule.

#### Typography
⚠️ Tagline `android:textSize="16sp"` is set inline but `@style/TextAppearance.DoughlyCrumbl.BodyLarge` is *also* applied — the inline override wins and creates ambiguity. Remove the inline `textSize` and let the style own it.

#### Content
⚠️ `android:text="Doughly Tempted? Get It Crumbl!"` is hardcoded in XML. Must be in `strings.xml`.

---

### Screen 2 — Login (`activity_login.xml`)

#### Buttons — CRITICAL
❌ `btnLogin` uses `android:background="@drawable/bg_card_login"` — **this is the wrong drawable**. `bg_card_login` is a card container background, not a button selector. It has no pressed/disabled states. Must use `@drawable/bg_button_primary_selector`.

#### Hardcoded values
⚠️ `android:layout_marginStart="14dp"` and `android:layout_marginEnd="14dp"` on the OR text are not in `@dimen/`. Use `@dimen/spacing_12` or add a token.
⚠️ `android:layout_constraintGuide_begin="317dp"` on `guidelineHeader` — hardcoded pixel offset that will break on short devices (e.g. Pixel 3a at 5.6"). Use `app:layout_constraintGuide_percent` instead.

#### Typography
⚠️ `tvSubtitle` `android:textSize="13sp"` — below the 14sp minimum for readable body text.

#### Components
⚠️ Google sign-in is a `MaterialCardView` (not a `MaterialButton` or `Button`) with no `android:contentDescription`. TalkBack will announce "unlabelled" for this. Add `android:contentDescription="Continue with Google"` and `android:role` or wrap in a proper `MaterialButton`.
⚠️ The "or continue with" `tvOr` text is not a `@string` resource.

#### Dead code
⚠️ Inside `logoContainer` FrameLayout there is a `View` (lines 51–55) with no background set — completely invisible and does nothing. Remove it.

---

### Screen 3 — Register (`activity_register.xml`)

#### Icons — CRITICAL
❌ `tilPhone` (phone number field) has `app:startIconDrawable="@drawable/ic_email"` — wrong icon. Replace with a phone icon (`ic_phone` or similar).
❌ `tilAddress` (delivery address field) has `app:startIconDrawable="@drawable/ic_email"` — wrong icon. Replace with a location/map icon.

#### Buttons — CRITICAL
❌ `btnRegister` uses `android:background="@drawable/bg_card_login"` — same wrong drawable as the login button. Must use `@drawable/bg_button_primary_selector`.

#### Hardcoded values
⚠️ Inner `LinearLayout` padding is set as `android:paddingStart="24dp"` / `android:paddingEnd="24dp"` — should be `@dimen/marginPage`.
⚠️ `app:layout_constraintHeight_percent="0.78"` on the scroll card — percentage height will crop content on compact devices (Pixel 4a ~5.8" in landscape or split screen).

#### TextInputLayout heights
⚠️ `TextInputLayout` parent elements have `android:layout_height="56dp"` fixed while `app:errorEnabled="true"` is set. Error message text needs space *below* the 56dp field to render. This causes error text to be clipped on the parent boundary. The `56dp` should be on the inner `TextInputEditText` only; the outer `TextInputLayout` must be `wrap_content`.

#### Password strength bar
⚠️ `strengthBar.progressTint="@color/colorBorder"` — the progress fill is the same beige/grey as the track. The bar will appear to never change. The tint should change dynamically to `colorWarning` → `colorSuccess` based on strength, not be set statically in XML.

---

### Screen 4 — Home (`fragment_home.xml`)

#### Search widget
⚠️ Uses `androidx.appcompat.widget.SearchView` — this renders with the stock Android search widget styling (grey background, system font, no custom icon). It won't match the `bg_input` style used on all other form fields. Replace with a `TextInputLayout` + search icon, or override the SearchView's background.

#### Hardcoded strings
⚠️ `android:text="Welcome to Doughly Crumbl"`, `android:text="Freshly Baked Happiness"`, and `android:text="Featured Delights"` are all hardcoded. Must be `@string/` references.

#### Empty state
⚠️ Empty state has no illustration — just two `TextView`s and a button. Add an illustration (even a simple `ImageView` with a placeholder icon) before shipping. Text-only empty states feel broken to users.

#### Spacing
⚠️ `android:layout_marginTop="10dp"` on the chip scroll and `android:layout_marginTop="12dp"` on the section header are off-grid (should be 8dp or 16dp).

---

### Screen 5 — Cart (`fragment_cart.xml`)

#### Hardcoded dimensions
⚠️ `android:layout_marginStart="16dp"` and `android:layout_marginEnd="16dp"` on `orderSummaryCard` — must be `@dimen/marginPage`.
⚠️ `android:layout_marginBottom="12dp"` on `orderSummaryCard` — not a dimen token. Use `@dimen/spacing_12`.

#### Content
⚠️ "Delivery fee will be calculated based on your location" note uses `@android:drawable/ic_menu_mylocation` — stock Android drawable. Use a custom pin icon.
⚠️ "To be quoted" for delivery fee renders as italic caption text inline with the label — visually weak. Consider a badge/pill component for this so it reads clearly as a pending state.

#### Empty state
⚠️ Cart empty state uses `android:text="🛍"` as the visual — an emoji as UI art. Replace with a vector drawable `ImageView` for proper scaling across densities.

---

### Screen 6 — Checkout (`activity_checkout.xml`)

#### Payment method — CRITICAL
❌ Payment options use raw emoji as icons: `💙 GCash`, `💚 Maya`, `🏦 Bank Transfer`, `💵 Cash on Pickup`. Emoji don't scale with system font size, can't be tinted, are invisible to TalkBack as icons, and look unprofessional in a native UI. The project already has `@drawable/bg_logo_gcash` and `@drawable/bg_logo_maya`. Use proper `ImageView` + brand drawables.

#### Fulfillment cards — icons
⚠️ Fulfillment cards use `🚚` and `🏪` emoji as icons — same problem as above. Replace with vector drawables.

#### Expand/collapse toggle
⚠️ `btnToggleSummary` is a `TextView` with `android:text="▼"` — a Unicode character as a toggle icon. Use a proper `ImageView` with `@drawable/ic_chevron_down` and rotate on toggle for animation.

#### System drawables
⚠️ `tilContactPhone` uses `@android:drawable/ic_menu_call` — stock Android icon. Add a custom `ic_phone` to the project.
⚠️ `tilStreet` uses `@android:drawable/ic_menu_mylocation` — stock Android icon.

#### Spacing
⚠️ `android:layout_marginEnd="6dp"` on the Delivery card — off-grid (should be 8dp).

---

### Screen 7 — Orders List (`fragment_orders.xml`)

#### Root layout — CRITICAL
❌ Root is `FrameLayout`. Project rule: **ConstraintLayout root on all layouts**. Change to `ConstraintLayout`.

#### Empty state — CRITICAL
❌ `tvEmpty` is a bare `TextView` with only "No orders yet." — no illustration, no action ("Browse Menu" button), no icon. This is a dead-end state. Users who see this have no guidance on what to do. Must add an illustration + action button matching the style of the Cart empty state.

#### Error state
❌ No error state defined at all. If the API fails, there is nothing shown. Add an error state with a retry button.

#### Loading state
⚠️ Only a `ProgressBar` (spinner) — no skeleton loader. For a list screen, a skeleton RecyclerView is strongly preferred (the Home screen already uses this pattern — replicate it here).

---

### Screen 8 — Order Detail (`activity_order_detail.xml`)

#### Toolbar color — inconsistency
⚠️ Toolbar background is `@color/colorPrimary` (crimson). Compare: Checkout toolbar is `@color/colorSurface` (white), Care Guide toolbar is `@color/colorSurface`. Pick one and apply it consistently across all non-auth detail screens.

#### Typography — hardcoded
⚠️ `tvStatusLabel` uses `android:textSize="18sp"` and `android:textStyle="bold"` inline — not a text appearance style. Use `@style/TextAppearance.DoughlyCrumbl.HeadlineMedium` or similar token.
⚠️ `tvStatusDesc` uses `android:textSize="12sp"` inline — not a style token.
⚠️ `tvTime1`–`tvTime7` all use `android:textSize="11sp"` inline — extract to a style token.

#### Timeline — visual glitch
⚠️ The last visible timeline step still renders `line5` (a 36dp vertical connector below the dot) — but there's nothing below it to connect to. The last step's connector line should be hidden (`android:visibility="gone"` on the last `lineN` View).

#### Financial rows — no labels
⚠️ In the Order Items card, `tvSubtotal`, `tvDeliveryFee`, and `tvGrandTotal` are right-aligned but have no left-side label. "₱350.00" alone is ambiguous. Add labels: "Subtotal:", "Delivery Fee:", "Grand Total:".

---

### Screen 9 — Profile (`fragment_profile.xml`)

#### Root layout — CRITICAL
❌ Root is `ScrollView` not `ConstraintLayout`. Project rule violation.

#### Chevron icons
⚠️ Menu rows use `android:text="›"` (Unicode right angle quotation mark) as the row arrow. Replace with `@drawable/ic_chevron_right` in an `ImageView`. The Unicode character's touch target, size, and color are uncontrolled and vary by system font.

#### Missing icons
⚠️ The three menu items (Care Guide, About & FAQ, Payment Instructions) have no leading icon — just a text label and a chevron. On iOS this is acceptable; on Material Design, list rows benefit from leading icons for visual scanning. At minimum, add icons to differentiate the rows.

#### Header padding
⚠️ `android:paddingBottom="40dp"` on the header LinearLayout is hardcoded. Use `@dimen/spacing_24` + the card overlap margin instead.

#### Avatar
⚠️ `72dp` avatar size is hardcoded in XML — add a `@dimen/sizeAvatar` token.

---

### Screen 10 — Notifications (`fragment_notifications.xml`)

#### Mark all read — accessibility
⚠️ "Mark all read" is a `TextView` with `android:clickable="true"`. For TalkBack, this element has no semantic role — it announces as text, not a button. Change to a `MaterialButton` with `style="@style/Widget.Material3.Button.TextButton"`.

#### Empty state
⚠️ Empty state "You're all caught up!" has no illustration — text-only. Add a bell icon or similar.

---

### Screen 11 — Admin Dashboard (`fragment_admin_dashboard.xml`)

#### Root layout
⚠️ Root is `LinearLayout` — inconsistent with project standards (ConstraintLayout preferred).

#### Toolbar
⚠️ Uses `androidx.appcompat.widget.Toolbar`, not `com.google.android.material.appbar.MaterialToolbar`. All other detail screens that correctly implement the toolbar use MaterialToolbar. Use MaterialToolbar everywhere.

#### Color logic bug — CRITICAL
❌ The "Confirmed" stat card and the "Preparing" stat card in Row 2 both use `app:cardBackgroundColor="@color/statusPreparingBg"`. This is either a copy-paste error or an intentional color choice — but if intentional, two different statuses sharing the same colour is confusing and loses the scanning benefit of the color coding.

#### Hardcoded dimensions
⚠️ `android:padding="16dp"` inside stat cards — should be `@dimen/spacing_16`.
⚠️ `android:textSize="28sp"` and `android:textSize="12sp"` for stat numbers/labels — not style tokens.
⚠️ `android:layout_marginBottom="8dp"` — should be `@dimen/spacing_8`.
⚠️ `android:layout_marginBottom="20dp"` — should be `@dimen/spacing_20` or `@dimen/gapCard`.

---

### Screen 12 — Admin Add/Edit Product (`activity_admin_add_edit_product.xml`)

#### Root layout
⚠️ Root is `LinearLayout` — inconsistent.

#### Style inconsistency — CRITICAL
❌ Uses `style="@style/Style.DoughlyCrumbl.Input"` on TextInputLayouts. The rest of the app uses `style="@style/Widget.DoughlyCrumbl.TextInputLayout"`. One of these is incorrect. Standardize to one style name everywhere.

#### Image picker placeholder
⚠️ `ivPreview` uses `android:src="@android:drawable/ic_menu_gallery"` — stock Android icon, visually inconsistent. The design system has `@drawable/bg_dashed_circle` specifically for image upload placeholders. Use it.

#### Layout structure
⚠️ Root is `LinearLayout` + inner `ScrollView` + inner `LinearLayout` — triple nesting. Use `ConstraintLayout` root + `NestedScrollView`.

---

### Screen 13 — Admin Order Detail (`activity_admin_order_detail.xml`)

#### Root layout
⚠️ Root is `LinearLayout` — inconsistent.

#### Hardcoded dimensions
⚠️ `android:padding="14dp"` on cards — not a standard dimen token (project uses 12, 16, 24). Use `@dimen/spacing_12` or `@dimen/spacing_16`.
⚠️ `android:layout_marginBottom="12dp"` on cards — not a dimen token.
⚠️ `android:textSize="13sp"` on quote fee label — below 14sp minimum.

#### Style inconsistency
⚠️ The delivery fee input uses `style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"` — the generic Material Components style, not the project's custom `Widget.DoughlyCrumbl.TextInputLayout`. Inconsistent.
⚠️ The "Set" fee button has no custom style applied — it will render with default Material button styling, not matching the project's button system.

#### Typography — inline
⚠️ `android:textSize="14sp"` and `android:textStyle="bold"` on the "Items" label — should be a text appearance style.
⚠️ `android:text="Update status to:"` and `android:textSize="14sp"` / `android:textStyle="bold"` — inline rather than a style token.

---

### Item: Product Card (`item_product.xml`)

#### Hardcoded data — CRITICAL
❌ `android:text="⭐ 4.8"` is static, hardcoded fake data. This will show "4.8" on every product card regardless of actual rating. If the backend doesn't provide ratings, remove this row entirely rather than showing a permanent lie.

#### Button style
⚠️ Add-to-cart `"+"` button uses `style="@style/Widget.Material3.Button.Icon"` with `app:backgroundTint="@color/colorPrimary"` and `app:cornerRadius="16dp"` (hardcoded). Should reference `@dimen/radiusPill` and use the project's button system consistently.

---

### Item: Cart Row (`item_cart.xml`)

#### Hardcoded color — CRITICAL
❌ Minus button `app:backgroundTint="#F5F5F5"` — raw hex value. This is a direct violation of the "no hardcoded hex" rule. Replace with `@color/colorBackground` or `@color/colorSurface`.

#### Stock drawable
⚠️ Trash/remove button uses `android:src="@android:drawable/ic_menu_delete"` — stock Android icon. Add a custom `ic_trash` or `ic_delete` vector drawable.

---

## 🚨 Verdict

🟡 **NEEDS REVISION** — The foundation (tokens, design system, ConstraintLayout rule, Poppins, color palette) is solid. But there are 6 critical-level issues that would make the app look unfinished to a grader, and roughly 40 needs-work findings across the screens. Auth screens and the Care Guide are close to shippable. The Admin screens, Orders list, and item cards need the most attention.

---

## 🛠️ Top Priority Fixes (Ranked by Impact)

| # | Issue | Files | Fix |
|---|---|---|---|
| 1 | Wrong button background (bg_card_login) | `activity_login.xml`, `activity_register.xml` | Change to `@drawable/bg_button_primary_selector` |
| 2 | Emoji as payment/fulfillment icons in Checkout | `activity_checkout.xml` | Replace with `ImageView` + proper brand drawables |
| 3 | Wrong email icon on Phone and Address fields | `activity_register.xml` | Replace `ic_email` with `ic_phone` and `ic_location` |
| 4 | Orders list empty state is dead-end text only | `fragment_orders.xml` | Add illustration + action button; change root to ConstraintLayout |
| 5 | Hardcoded hex `#F5F5F5` in cart item | `item_cart.xml` | Replace with `@color/colorBackground` |
| 6 | Dashboard: "Confirmed" + "Preparing" share same color | `fragment_admin_dashboard.xml` | Fix card background color on the "Confirmed" stat card |
| 7 | Style name mismatch (`Style.DoughlyCrumbl.Input` vs `Widget.DoughlyCrumbl.TextInputLayout`) | `activity_admin_add_edit_product.xml` | Standardize to one style name across all screens |
| 8 | Hardcoded fake star rating on every product card | `item_product.xml` | Remove or populate from backend data |

---

## 💡 What's Working

- **Color system**: Crimson palette is applied consistently through `@color/` tokens. No rogue hex values (except the one in `item_cart.xml`).
- **Auth screens**: Login's split crimson-header / white-card layout is visually strong and professional-looking. The error banner implementation is correct.
- **Care Guide screen**: Best-structured screen in the app — MaterialToolbar, ConstraintLayout root, consistent token usage, proper line spacing on body text.
- **Cart item row**: Touch targets are correctly sized (48dp with insets), and the stepper (`−` / qty / `+`) interaction pattern is well-structured.
- **Skeleton loading on Home**: Using a skeleton RecyclerView instead of a spinner is the correct pattern for a content-heavy grid — replicate this in Orders and Notifications.

---

## 📋 Full Issue Checklist (for tracking)

### Critical (must fix)
- [ ] Login button uses wrong drawable (`bg_card_login`)
- [ ] Register button uses wrong drawable (`bg_card_login`)
- [ ] Phone field has email icon (`activity_register.xml`)
- [ ] Address field has email icon (`activity_register.xml`)
- [ ] Emoji payment icons in Checkout
- [ ] `fragment_orders.xml` root is FrameLayout (not ConstraintLayout)
- [ ] Orders empty state is bare text with no action
- [ ] Dashboard "Confirmed" stat card uses `statusPreparingBg` color (likely copy-paste bug)
- [ ] `item_cart.xml` hardcoded hex `#F5F5F5` on minus button
- [ ] Hardcoded static `⭐ 4.8` rating in product card
- [ ] Admin Add/Edit Product: `Style.DoughlyCrumbl.Input` vs `Widget.DoughlyCrumbl.TextInputLayout` mismatch

### Needs Work (should fix before final demo)
- [ ] Splash: hardcoded `32dp` margin on ProgressBar
- [ ] Splash: tagline not in `strings.xml`
- [ ] Login: `tvSubtitle` textSize is 13sp (below 14sp minimum)
- [ ] Login: Google button is `MaterialCardView` with no TalkBack role
- [ ] Login: "or continue with" not a `@string` resource
- [ ] Login: dead empty `View` in logo container
- [ ] Login: `guidelineHeader` hardcoded at 317dp
- [ ] Login: OR divider margins 14dp not in `@dimen/`
- [ ] Register: TextInputLayout outer height fixed at 56dp while errorEnabled=true (clips error)
- [ ] Register: `strengthBar` progressTint is same as track (invisible feedback)
- [ ] Register: card height `constraintHeight_percent="0.78"` breaks on compact screens
- [ ] Register: hardcoded 24dp padding inside card
- [ ] Home: `SearchView` doesn't match design system input style
- [ ] Home: hardcoded strings in hero banner
- [ ] Home: empty state has no illustration
- [ ] Home: 10dp and 12dp margins are off the 8dp grid
- [ ] Cart: hardcoded 16dp/12dp card margins
- [ ] Cart: stock `ic_menu_mylocation` drawable
- [ ] Cart: emoji used as empty state illustration
- [ ] Checkout: expand/collapse uses `▼` text character
- [ ] Checkout: `@android:drawable/ic_menu_call` on phone field
- [ ] Checkout: `@android:drawable/ic_menu_mylocation` on address field
- [ ] Checkout: emoji fulfillment card icons
- [ ] Checkout: 6dp margin is off-grid
- [ ] Orders: no error state at all
- [ ] Orders: only spinner (no skeleton loader)
- [ ] Order Detail: Toolbar color inconsistent with other screens
- [ ] Order Detail: inline textSize/textStyle on status banner
- [ ] Order Detail: last timeline step shows dangling connector line
- [ ] Order Detail: financial rows have no left-side labels
- [ ] Profile: root is `ScrollView` (not ConstraintLayout)
- [ ] Profile: `›` Unicode chevron instead of icon drawable
- [ ] Profile: menu rows have no leading icons
- [ ] Profile: hardcoded `40dp` header padding
- [ ] Profile: hardcoded `72dp` avatar size
- [ ] Notifications: "Mark all read" is `TextView` (no TalkBack button role)
- [ ] Notifications: empty state has no illustration
- [ ] Admin Dashboard: root is `LinearLayout`
- [ ] Admin Dashboard: uses `Toolbar` not `MaterialToolbar`
- [ ] Admin Dashboard: hardcoded textSizes and dimensions
- [ ] Admin Add/Edit: root is `LinearLayout`
- [ ] Admin Add/Edit: stock `ic_menu_gallery` placeholder
- [ ] Admin Add/Edit: triple-nested LinearLayout → ScrollView → LinearLayout
- [ ] Admin Order Detail: root is `LinearLayout`
- [ ] Admin Order Detail: hardcoded 14dp card padding (not a token)
- [ ] Admin Order Detail: delivery fee input uses generic MaterialComponents style
- [ ] Admin Order Detail: "Set" button has no project style
- [ ] Admin Order Detail: inline bold 14sp on card labels
- [ ] item_cart.xml: stock `ic_menu_delete` drawable
- [ ] item_product.xml: `+` button style inconsistency and hardcoded `16dp` cornerRadius

---

*Next step: wait for inspiration image review before implementing fixes.*
