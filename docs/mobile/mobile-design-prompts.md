# Doughly Crumbl — Mobile Design Prompts
> Paste each prompt individually into stitch.withgoogle.com or your AI design tool.
> Complete each screen before moving to the next. All screens share the same design system.

---

## GLOBAL DESIGN SYSTEM (Read before all prompts)

**Color Palette**
- Primary / Crimson: `#6B1A2B`
- Primary Dark: `#4A1020`
- Primary Light / Tint: `#F5E8EB`
- Background: `#FAF7F4` (warm off-white)
- Surface: `#FFFFFF`
- Text Primary: `#1A1A2E`
- Text Secondary: `#6B6B6B`
- Text Muted: `#AAAAAA`
- Success: `#1A7A4A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Border: `#E8E0D8`

**Typography**
- Font family: Poppins (primary), fallback system-ui
- Heading Large: Poppins Bold 22sp
- Heading Medium: Poppins SemiBold 18sp
- Heading Small: Poppins SemiBold 15sp
- Body: Poppins Regular 14sp
- Caption: Poppins Regular 12sp
- Label: Poppins Medium 13sp

**Component Rules**
- Border radius: 12dp (cards), 8dp (buttons, inputs), 24dp (pills/chips), 100dp (circular avatars)
- Button height: 52dp (primary), 44dp (secondary)
- Input field height: 52dp
- Card shadow: `0 2dp 8dp rgba(0,0,0,0.08)`
- Bottom navigation height: 64dp
- Top app bar height: 56dp
- Icon set: Material Icons or Lucide (consistent throughout)
- Minimum touch target: 48dp x 48dp

**Platform**
- Android native (Kotlin, XML layouts, View-based)
- Target: Material Design 3 adapted to Doughly Crumbl brand

---

## PROMPT 1 — Splash Screen

Design the Splash Screen for the Doughly Crumbl Android app.

**Layout:**
Full-screen background in deep crimson gradient from `#6B1A2B` at top to `#4A1020` at bottom. Centered vertically and horizontally:
- Doughly Crumbl logo mark (the "dC" swirl icon) at 80dp x 80dp in white
- Below it: wordmark "Doughly Crumbl" in Poppins Bold 26sp in white
- Below wordmark: tagline "Freshly Baked Happiness" in Poppins Regular 13sp in `#F5E8EB` (soft cream)
- At the very bottom (32dp from bottom): a thin circular progress indicator in white at 28dp diameter, centered

**Behavior note for developer:** This screen reads `SharedPreferences` session token on launch. After 1.5 seconds, it routes to LoginActivity if no session exists, or to MainActivity (CUSTOMER) or AdminActivity (ADMIN) based on the stored role.

**Do not add any buttons.** The screen is purely a branded loading state.

---

## PROMPT 2 — Login Screen

Design the Login Screen for the Doughly Crumbl Android app.

**Top section (top 35% of screen):**
Crimson background (`#6B1A2B`) with a subtle diagonal pattern overlay at 5% opacity.
- Logo mark centered at 56dp x 56dp in white with a 2dp white circular border at 32dp radius
- "Welcome Back" in Poppins Bold 22sp in white below the logo
- "Sign in to your account" in Poppins Regular 13sp in `#F5E8EB` below that

**Bottom section (bottom 65% — white card with 24dp top corner radius):**
Slides up over the crimson top. Contains:

- Email input field (52dp tall, 12dp border radius, border `#E8E0D8`, leading mail icon in `#6B6B6B`, placeholder "Email address"). On focus: border turns crimson `#6B1A2B`.
- Password input field (52dp tall, same style, leading lock icon, trailing eye toggle icon to show/hide password, placeholder "Password")
- "Forgot Password?" link right-aligned below password field in crimson `#6B1A2B` at 12sp
- 24dp vertical space
- Primary "Sign In" button: full width, 52dp tall, solid crimson `#6B1A2B` background, white Poppins SemiBold 15sp text, 12dp border radius. On press: slightly darkens to `#4A1020`.
- OR divider: thin gray line with "or" text centered in `#AAAAAA` at 12sp
- "Continue with Google" outlined button: full width, 52dp tall, white background, `#E8E0D8` border, 12dp radius, Google icon on left, "Continue with Google" in Poppins Medium 14sp dark text
- At bottom of card: "Don't have an account? Sign Up" — "Sign Up" in crimson bold, tappable

**Error state:** If login fails, show a red error banner just above the Sign In button with a warning icon and the error message (e.g. "Invalid email or password"). Banner background `#FDECEA`, text `#DC2626`, border-left 3dp solid `#DC2626`.

---

## PROMPT 3 — Register Screen

Design the Register / Sign Up Screen for the Doughly Crumbl Android app.

**Top section (same style as Login — top 28% crimson):**
- Logo mark 48dp in white
- "Create Account" in Poppins Bold 22sp white
- "Join Doughly Crumbl today" in Poppins Regular 13sp `#F5E8EB`

**Scrollable white card (24dp top radius, fills rest of screen):**
All input fields follow the same style: 52dp tall, 12dp radius, `#E8E0D8` border, leading icon, focus state crimson border.

Fields in order:
1. Full Name — person icon, placeholder "Full name"
2. Email — mail icon, placeholder "Email address"
3. Phone Number — phone icon, placeholder "Phone number", input type phone
4. Delivery Address — map-pin icon, placeholder "Full delivery address" (multiline, 80dp tall, top-aligned icon)
5. Password — lock icon, eye toggle, placeholder "Password (min 8 characters)"
6. Confirm Password — lock-check icon, eye toggle, placeholder "Confirm password"

Below fields:
- Password strength indicator: a thin horizontal bar that fills from left based on password strength. Empty = gray, weak = red, medium = orange, strong = green. Label "Password strength" in 11sp muted.
- "By creating an account, you agree to our Terms of Service and Privacy Policy" in 11sp muted gray, with "Terms of Service" and "Privacy Policy" tappable in crimson.
- Primary "Create Account" button — full width, 52dp, solid crimson, white text Poppins SemiBold 15sp
- "Already have an account? Sign In" link centered below button

**Validation states:** Each field shows a green checkmark trailing icon when valid, red X icon and red helper text below when invalid. Show helper text: "Passwords do not match" under confirm password field when mismatched.

---

## PROMPT 4 — Customer Bottom Navigation + App Shell

Design the persistent bottom navigation bar and app shell for the CUSTOMER role in the Doughly Crumbl Android app. This shell wraps all customer-facing screens.

**Bottom Navigation Bar (64dp tall, white background, top border `#E8E0D8` 1dp):**
Five navigation items evenly spaced:

1. Home (house icon) — label "Menu"
2. Cart (shopping-bag icon) — label "Cart" — shows a crimson badge with item count (e.g. "3") at top-right of icon when cart has items
3. Orders (receipt icon) — label "Orders"
4. Notifications (bell icon) — label "Alerts" — shows a crimson dot badge when unread notifications exist
5. Profile (user-circle icon) — label "Profile"

**Active state:** Icon fills crimson `#6B1A2B`, label in crimson SemiBold 11sp, small 4dp wide crimson pill indicator above the icon.
**Inactive state:** Icon outline gray `#AAAAAA`, label gray Regular 11sp.

**Top App Bar (56dp, white, bottom shadow `0 2dp 4dp rgba(0,0,0,0.06)`):**
- Left: Doughly Crumbl logo mark 32dp + wordmark "Doughly Crumbl" in Poppins SemiBold 16sp crimson
- Right: notification bell icon button (outlined, 24dp, badge dot if unread) and search icon button

The content area between the top bar and bottom nav is where each fragment renders.

---

## PROMPT 5 — Home / Menu Screen (Customer)

Design the Home / Menu screen for the CUSTOMER role in the Doughly Crumbl Android app. This is the first screen after login.

**Hero Banner (height 180dp, full width):**
A warm food photography banner image with a dark gradient overlay (bottom 60% fades to `rgba(0,0,0,0.55)`). Over the gradient:
- "Welcome to Doughly Crumbl" in Poppins Regular 12sp white
- "Freshly Baked Happiness" in Poppins Bold 22sp white
- A small crimson pill button "Explore Menu" in white 12sp at bottom-left of banner

**Search Bar (16dp horizontal margin, 12dp below banner):**
Full width, 48dp tall, white background, 12dp radius, subtle shadow, leading search icon in `#AAAAAA`, placeholder "Search pastries, cookies, breads..." in muted gray. Tapping expands to a full search experience.

**Category Filter Row (horizontal scroll, 16dp margin, 12dp below search):**
Single-line horizontally scrollable chip row. Each chip: 36dp tall, 24dp radius, 16dp horizontal padding.
- Active chip: solid crimson `#6B1A2B` background, white Poppins Medium 13sp text
- Inactive chip: white background, `#E8E0D8` border, `#4A4A4A` text
Categories: All · Cookies · Croissants · Donuts · Sourdough · Cakes · Pastries · Beverages

**Section Header ("Featured Delights" — 16dp margins):**
"Featured Delights" in Poppins SemiBold 16sp dark. Right-aligned: "See all" in crimson 13sp.

**Product Grid (2 columns, 16dp outer margin, 12dp gap between cards):**
Each product card (white, 12dp radius, shadow `0 2dp 8dp rgba(0,0,0,0.08)`):
- Product image: full width, 130dp tall, 12dp top radius, `object-fit: cover`
- Card body (12dp padding):
  - Product name: Poppins SemiBold 13sp dark, max 2 lines
  - Price: Poppins Bold 14sp crimson `#6B1A2B` (e.g. "₱80.00")
  - Bottom row: star icon gold `#F59E0B` + rating "4.8" in 11sp gray | right-aligned: circular crimson "+" add button (32dp diameter, white plus icon)

**Loading state:** Show skeleton shimmer placeholders for the product grid while data loads. Skeleton cards same dimensions as product cards, gray shimmer animation.

**Empty state:** If no products match the search/filter, show a centered donut illustration, "No products found" in Poppins SemiBold 15sp dark, "Try a different search or category" in 13sp muted, and a "Clear filters" outlined crimson button.

---

## PROMPT 6 — Cart Screen (Customer)

Design the Cart / Order Bag screen for the CUSTOMER role in the Doughly Crumbl Android app. This is accessed via the Cart tab in bottom navigation.

**Top App Bar:**
"My Cart" in Poppins Bold 18sp centered. Right: "Clear all" text button in crimson 13sp (only visible when cart has items).

**Cart Item List (scrollable, 16dp horizontal margin, 12dp gap between items):**
Each cart item card (white, 12dp radius, shadow, 12dp padding):
- Left: product thumbnail (56dp x 56dp, 8dp radius)
- Center: product name Poppins SemiBold 13sp dark (max 2 lines) | variant/category in 11sp muted gray below
- Right: price in Poppins Bold 14sp crimson right-aligned
- Bottom row of card: quantity stepper on left + trash icon on right
  - Quantity stepper: minus button (28dp circle, `#F5F5F5` bg, crimson icon) | quantity number Poppins Bold 14sp dark centered 32dp wide | plus button (28dp circle, crimson bg, white icon)
  - Trash icon: 20dp, muted gray, turns crimson on tap

**Order Summary Card (pinned above checkout button, 16dp margin, white, 12dp radius, shadow):**
- Row: "Subtotal" left | "₱XXX.XX" right — Poppins Regular 13sp
- Row: "Delivery Fee" left | "To be quoted" right — 13sp muted italic
- Thin divider
- Row: "Total" left | "₱XXX.XX" right — Poppins Bold 15sp dark
- Small info note below: map-pin icon + "Delivery fee will be calculated based on your location" in 11sp muted, light cream background `#FAF7F4`, 8dp radius

**Checkout Button (fixed at bottom, 16dp margin all sides, above bottom nav):**
Full width, 52dp, solid crimson, "Proceed to Checkout" in Poppins SemiBold 15sp white, 12dp radius, shopping-bag icon on left.

**Empty Cart State (centered in content area):**
- Large outlined shopping bag illustration in `#E8E0D8` (120dp)
- "Your cart is empty" Poppins SemiBold 16sp dark
- "Add some delicious items from our menu" 13sp muted
- "Browse Menu" outlined crimson button (48dp tall, 12dp radius, crimson border and text)

---

## PROMPT 7 — Checkout Screen (Customer)

Design the Checkout screen for the CUSTOMER role in the Doughly Crumbl Android app. This is a full-screen Activity opened from the Cart screen.

**Top App Bar:**
Back arrow left. "Checkout" Poppins Bold 18sp centered. No right actions.

**Scrollable content (16dp horizontal margin throughout):**

**Section 1 — Order Summary (collapsible):**
Card (white, 12dp radius) with header row: "Order Summary" SemiBold 14sp dark | right: item count chip "3 items" crimson pill | chevron-down icon to expand/collapse.
Collapsed: shows only subtotal.
Expanded: shows each item (thumbnail 40dp + name + qty + price per row), then subtotal.

**Section 2 — Fulfillment Method:**
Label "How would you like to receive your order?" Poppins SemiBold 13sp dark.
Two large selectable cards side by side (each 50% width minus gap):
- Delivery card: truck icon 28dp crimson | "Delivery" SemiBold 13sp | "We'll bring it to you" 11sp muted
- Pickup card: store icon 28dp | "Pickup" SemiBold 13sp | "Collect at our store" 11sp muted
Selected card: crimson border 2dp, `#F5E8EB` background, crimson icon. Unselected: gray border, white bg.

**Section 3 — Delivery Details (only visible when Delivery selected):**
Label "Delivery Address" SemiBold 13sp.
- Street / Barangay input (52dp, 12dp radius, map-pin icon)
- City input (52dp)
- Landmark input (52dp, optional — labeled "Landmark (optional)")
- Phone number input (52dp, phone icon)
Delivery fee display row: "Estimated Delivery Fee" label | fee value in crimson bold or "Calculating..." loading state

**Section 4 — Order Notes (optional):**
Multiline text input (80dp, 12dp radius, pencil icon top-left), placeholder "Any special requests or notes?"

**Section 5 — Payment Method:**
Label "Payment Method" SemiBold 13sp.
Vertical list of selectable payment options, each a card row (52dp tall, 12dp radius, white bg, `#E8E0D8` border):
- GCash: GCash logo 24dp | "GCash" SemiBold 13sp | radio button right
- Maya: Maya logo 24dp | "Maya" SemiBold 13sp | radio button right
- Bank Transfer: bank icon | "Bank Transfer" | radio button right
- Cash on Pickup: cash icon | "Cash on Pickup" | radio button right (only enabled when Pickup fulfillment is selected; grayed and disabled for Delivery)
Selected: crimson radio, `#F5E8EB` card background, crimson left border 3dp.

**Sticky bottom (white, shadow above):**
Two rows:
- "Total: ₱XXX.XX" Poppins Bold 16sp crimson right-aligned
- Full-width "Place Order" button 52dp crimson solid, white SemiBold 15sp

---

## PROMPT 8 — Payment Instructions Screen (Customer)

Design the Payment Instructions screen for the CUSTOMER role. This screen appears after placing an order, showing the customer how to complete payment.

**Top App Bar:**
Back arrow. "Complete Payment" Poppins Bold 18sp. No right actions.

**Order Confirmed Banner (crimson bg, 16dp margin, 12dp radius):**
- Checkmark circle icon 40dp white centered
- "Order Placed!" Poppins Bold 18sp white centered
- "Order #ORD-XXXX" 13sp `#F5E8EB` centered
- "Complete payment below to confirm your order" 12sp `#F5E8EB`

**Payment Details Card (white, 12dp radius, shadow, 16dp margin):**
Header: payment method name + icon (e.g. "GCash" with GCash logo).
Content varies by method:
- GCash/Maya: QR code image centered (160dp x 160dp placeholder), account number in Poppins Bold 16sp crimson centered, account name in 13sp muted, "Amount to pay: ₱XXX.XX" in Bold 15sp dark
- Bank Transfer: bank name, account number (Bold 16sp crimson), account name, amount row
- Cash on Pickup: store icon, "Pay at store during pickup" message, store address

**Copy button** below account number: outlined crimson small button "Copy account number" with copy icon.

**Upload Proof of Payment Section (card, 12dp radius, dashed border `#6B1A2B` 1.5dp, `#FAF7F4` bg):**
- Upload icon 40dp crimson centered
- "Upload Proof of Payment" SemiBold 14sp dark centered
- "Take a photo or upload your GCash screenshot" 12sp muted centered
- "Choose Photo" crimson outlined button below

After upload: show thumbnail of selected image (120dp x 80dp, 8dp radius) with a remove X button at top-right corner of thumbnail.

**Submit Button (fixed bottom, 16dp margin):**
Full width, 52dp, solid crimson, "Submit Proof of Payment" SemiBold 15sp white with upload icon left.
Disabled state: gray `#CCCCCC` when no image selected.

**Timer note:** "Order will be auto-cancelled after 24 hours if payment is not submitted" in 11sp muted centered below button.

---

## PROMPT 9 — My Orders Screen (Customer)

Design the My Orders screen for the CUSTOMER role. Accessed via the Orders tab in bottom navigation.

**Top App Bar:**
"My Orders" Poppins Bold 18sp centered. Right: search icon button.

**Status Filter Tab Row (horizontal scroll, no bottom indicator, 16dp side margin):**
Horizontally scrollable tab chips below the app bar (12dp below):
All · Active · Preparing · Out for Delivery · Ready for Pickup · Completed · Cancelled
Each chip: 36dp tall, 24dp radius.
Active chip: crimson solid, white text SemiBold 12sp.
Inactive chip: white bg, `#E8E0D8` border, gray text.
Show count badge on each chip where applicable (e.g. "Active (2)").

**Order Card List (16dp margin, 12dp gap, scrollable):**
Each order card (white, 12dp radius, shadow, 12dp padding):

Left section: stacked image collage of first 2 order item thumbnails (each 44dp x 44dp, 8dp radius, second image offset 8dp right and 8dp down, creating a layered effect). If more items: "+X" gray pill over the stack.

Center section (12dp left of images):
- Order ID: "#ORD-XXXX" Poppins Bold 13sp crimson
- Items summary: "Almond Croissant, Glazed Donut +2" 12sp muted, max 1 line ellipsis
- Date: "Nov 12, 2023 · 2:30 PM" 11sp muted

Right section:
- Total: "₱360.00" Poppins Bold 14sp dark right-aligned
- Status pill below total: 24dp radius pill, color-coded:
  - ORDER_PLACED: amber bg `#FFF8E1` + amber text
  - PREPARING: blue bg `#E3F2FD` + blue text
  - OUT_FOR_DELIVERY: orange bg `#FFF3E0` + orange text
  - READY_FOR_PICKUP: teal bg `#E0F2F1` + teal text
  - COMPLETED: green bg `#E8F5EE` + green text
  - CANCELLED: red bg `#FDECEA` + red text
- Chevron-right icon 16dp gray at far right middle

**Empty state (per tab):**
Centered: receipt outline illustration 100dp gray, "No [Status] orders" SemiBold 15sp, "Start ordering from our menu!" 13sp muted, "Browse Menu" crimson outlined button.

---

## PROMPT 10 — Order Detail Screen (Customer)

Design the Order Detail screen for the CUSTOMER role. Full-screen Activity opened by tapping an order card.

**Top App Bar:**
Back arrow. "Order #ORD-XXXX" Poppins Bold 16sp. Right: share icon (optional).

**Scrollable content (16dp margins):**

**Status Banner (12dp radius, color matches status):**
Large status banner at top:
- Status icon (e.g. clock for pending, chef hat for preparing, truck for delivery) 36dp white centered
- Status label "Preparing" Poppins Bold 18sp white centered
- Status description "Your order is being prepared" 12sp white/80% centered

**Order Timeline Card (white, 12dp radius, shadow):**
Vertical stepper showing order progress. Each step:
- Left: circle indicator (24dp) — filled crimson for completed steps, outlined gray for pending, pulsing crimson for current active step
- Connecting line between circles: solid crimson for completed, dashed gray for pending
- Right: step name Poppins SemiBold 13sp | timestamp or "Pending" in 11sp muted

Steps in order:
1. Order Placed
2. Payment Confirmed
3. Preparing
4. Out for Delivery / Ready for Pickup
5. Completed

**Order Items Card (white, 12dp radius, shadow):**
Header: "Order Items" SemiBold 14sp dark | item count right.
Each item row: thumbnail 48dp x 48dp (8dp radius) | name SemiBold 13sp | qty "x2" muted | price right Bold 13sp crimson.
Divider between items.
Footer row: "Subtotal" | "₱XXX" right, "Delivery Fee" | "₱XX" right, thick divider, "Total" Bold | "₱XXX" Bold crimson right.

**Delivery Details Card (white, 12dp radius, shadow) — only for delivery orders:**
"Delivery Address" SemiBold 13sp dark header.
map-pin icon + address text body 13sp.
"Estimated Delivery" row with truck icon + time.

**Payment Card (white, 12dp radius, shadow):**
"Payment" SemiBold 13sp dark header.
Payment method icon + name row.
If proof submitted: "Proof of payment submitted" with a small thumbnail (tappable to view full size) + green checkmark.
If pending: "Payment Required" with "Upload Proof" crimson outlined button.

**Action area at bottom:**
- If order is in ORDER_PLACED state: "Cancel Order" outlined red button (48dp, full width, `#DC2626` border and text)
- If order is COMPLETED: "Reorder" solid crimson button (52dp, full width) with refresh icon

---

## PROMPT 11 — Notifications Screen (Customer)

Design the Notifications screen for the CUSTOMER role. Accessed via the Alerts tab in bottom navigation.

**Top App Bar:**
"Notifications" Poppins Bold 18sp. Right: "Mark all read" text button crimson 13sp.

**Notification List (16dp margin, 8dp gap between items):**
Each notification item (white card, 12dp radius, shadow 0 1dp 4dp):

Left: notification type icon in a colored circle (40dp):
- Order update: truck icon, crimson bg
- Payment confirmed: checkmark, green bg
- New product: tag icon, amber bg
- System: bell icon, gray bg

Center:
- Title: Poppins SemiBold 13sp dark (e.g. "Order #ORD-4567 Update")
- Message: 12sp muted 2-line ellipsis (e.g. "Your order is now being prepared")
- Time: 11sp muted (e.g. "2 hours ago")

Right: unread indicator — 8dp filled crimson circle for unread. Tapping marks as read.

Unread notifications have a very subtle `#FAF7F4` background tint vs white for read.

**Empty state:** Bell outline illustration 100dp gray, "You're all caught up!" SemiBold 15sp, "No new notifications" 13sp muted.

---

## PROMPT 12 — Profile Screen (Customer)

Design the Profile screen for the CUSTOMER role. Accessed via the Profile tab in bottom navigation.

**Profile Header (crimson bg `#6B1A2B`, padding 24dp, bottom 40dp for card overlap):**
- Avatar: circular 72dp, white border 3dp, initials if no image (e.g. "CD" for Chris Daniel) — crimson bg, white text Bold 24sp
- User name: Poppins Bold 18sp white below avatar
- Email: 13sp `#F5E8EB` below name
- "Edit Profile" small outlined white button (36dp tall, 12dp radius, white border, white text 12sp)

**Stats Row (white card, 12dp radius, 16dp margin, -20dp top margin to overlap header, shadow):**
Three stats side by side, dividers between:
- "Orders" count centered | "Orders" label 11sp muted
- "Completed" count centered | "Completed" label 11sp muted
- "Cancelled" count centered | "Cancelled" label 11sp muted
Counts in Poppins Bold 18sp dark. Dividers 1dp `#E8E0D8`.

**Menu List (white card, 12dp radius, 16dp margin, 12dp below stats):**
Each menu item row (52dp tall, horizontal padding 16dp):
- Left: icon 24dp in `#F5E8EB` circle 36dp | label Poppins Medium 14sp dark
- Right: chevron-right 16dp gray
Items:
- My Orders (receipt icon)
- Delivery Addresses (map-pin icon)
- Payment Methods (credit-card icon)
- Notifications (bell icon)
- Help & Support (help-circle icon)
- About Doughly Crumbl (info icon)
- Care Guide (book-open icon)
Thin dividers between items.

**Sign Out Button (16dp margin, full width, 48dp, outlined crimson border, crimson text "Sign Out", logout icon left, 12dp radius).**

---

## PROMPT 13 — Admin App Shell + Dashboard

Design the Admin app shell and Dashboard screen for the ADMIN role in the Doughly Crumbl Android app.

**Admin Navigation (Bottom Navigation, 64dp, white, top border):**
Three tabs only — simpler than customer nav:
1. Dashboard (grid icon) — label "Dashboard"
2. Orders (clipboard-list icon) — label "Orders" — badge with pending count
3. Products (package icon) — label "Products"

**Top App Bar:**
Left: hamburger menu icon (for a slide-out drawer with profile + logout).
Center: Doughly Crumbl wordmark in crimson SemiBold 16sp.
Right: notification bell icon with badge.

**Dashboard Fragment:**
Greeting row: "Good morning, Admin 👋" Poppins SemiBold 16sp dark. Below: today's date in 12sp muted.

**Stats Grid (2x2, 16dp margin, 12dp gap):**
Each stat card (white, 12dp radius, shadow, 16dp padding):
- Top: icon in colored circle 40dp
- Middle: large number Poppins Bold 28sp dark
- Bottom: label 12sp muted
Cards:
1. Total Orders today — crimson bg circle, receipt icon
2. Pending Payments — amber bg circle, clock icon
3. Preparing — blue bg circle, chef-hat icon
4. Revenue Today — green bg circle, peso-sign icon

**Recent Orders Section:**
"Recent Orders" SemiBold 16sp | "View all" crimson 13sp right.
List of last 5 orders, each row card (white, 12dp radius, 12dp padding, 8dp gap):
- Left: "#ORD-XXXX" Bold 13sp crimson | customer name 12sp muted below
- Center: item count "3 items" muted | order date 11sp muted
- Right: status pill (color-coded) | total Bold 13sp dark below
Tappable — navigates to Admin Order Detail.

**Quick Actions Row:**
"Quick Actions" SemiBold 14sp label.
Two outlined action cards side by side:
- "Add Product" (plus icon, crimson)
- "View Pending" (clock icon, amber)

---

## PROMPT 14 — Admin Orders Screen

Design the Admin Orders screen for the ADMIN role.

**Top App Bar:**
"Orders" Poppins Bold 18sp. Right: filter icon button + search icon button.

**Filter Tab Row (horizontally scrollable):**
All · Pending Payment · Preparing · Out for Delivery · Ready for Pickup · Completed · Cancelled
Same chip style as customer orders — active chip crimson solid.

**Order Card List (16dp margin, 10dp gap):**
Each admin order card (white, 12dp radius, shadow, 14dp padding) — more information dense than customer view:

Row 1: "#ORD-XXXX" Bold 13sp crimson | status pill right | timestamp 11sp muted far right
Row 2: Customer name + phone 12sp muted | order type pill (DELIVERY or PICKUP) 11sp
Row 3: Item summary "Almond Croissant x2, Glazed Donut x1" 12sp muted, 1 line ellipsis
Row 4 (if delivery fee pending): amber info row — "⚠ Delivery fee not yet quoted" 11sp amber text, amber bg `#FFF8E1`, 6dp radius
Row 5: Total "₱360.00" Bold 14sp dark | "Update Status →" crimson text button right

Swipe actions on each card:
- Swipe right: green "Confirm" action
- Swipe left: red "Cancel" action

---

## PROMPT 15 — Admin Order Detail Screen

Design the Admin Order Detail screen for the ADMIN role. Full-screen Activity.

**Top App Bar:**
Back arrow. "#ORD-XXXX" Poppins Bold 16sp. Right: more-vertical (overflow) icon.

**Scrollable content (16dp margins):**

**Customer Info Card (white, 12dp radius, shadow):**
"Customer" SemiBold 13sp dark header.
Avatar initials 40dp | Name Bold 14sp | Email + Phone 12sp muted | Fulfillment type pill (DELIVERY/PICKUP) crimson.

**Order Items Card (same as customer order detail).**

**Delivery Fee Card (white, 12dp radius, shadow) — visible for DELIVERY orders:**
"Delivery Fee" SemiBold 13sp dark.
If not quoted: input field (52dp, 12dp radius, peso-sign leading icon, numeric input) + "Quote Fee" crimson solid button.
If quoted: fee amount in Bold 16sp crimson | "Edit" small text link.

**Proof of Payment Card:**
"Proof of Payment" SemiBold 13sp dark.
If uploaded: full-width image (180dp tall, 12dp radius, tap to view full screen). "Verify Payment" green solid button (52dp, full width) + "Reject" outlined red button.
If not uploaded: "No proof submitted yet" muted centered text in dashed-border card.

**Update Order Status Section:**
"Update Status" SemiBold 13sp dark.
Current status displayed as a large colored pill centered.
Below: available next-status buttons generated from the state machine. Each button as an outlined card (52dp, 12dp radius) with the target status label and a right arrow. Only valid transitions shown:
- ORDER_PLACED → CONFIRMED, CANCELLED
- CONFIRMED → PREPARING, CANCELLED
- PREPARING → OUT_FOR_DELIVERY, READY_FOR_PICKUP, CANCELLED
- OUT_FOR_DELIVERY → COMPLETED
- READY_FOR_PICKUP → COMPLETED
Primary next status is a solid crimson button. Cancel is always outlined red if available.

**Order Timeline (same as customer view but read-only).**

---

## PROMPT 16 — Admin Products Screen

Design the Admin Products screen for the ADMIN role.

**Top App Bar:**
"Products" Poppins Bold 18sp. Right: search icon.

**FAB (Floating Action Button, bottom-right, 56dp, crimson bg, white plus icon):**
Tapping opens Add Product screen.

**Product List (16dp margin, 10dp gap, scrollable):**
Each admin product card (white, 12dp radius, shadow, 12dp padding):
Horizontal layout:
- Left: product image 72dp x 72dp, 10dp radius
- Center: name Poppins SemiBold 14sp dark | category chip 11sp crimson pill | price Bold 14sp crimson | stock status (available/unavailable) 11sp
- Right: vertical more-options icon (⋮) opening a popup menu with "Edit" and "Delete"

Swipe left on card reveals red "Delete" action button.

**Toggle switch** on each card (top-right area): "Available" toggle. When off: card gets 40% opacity overlay and "Unavailable" gray pill replaces category pill.

---

## PROMPT 17 — Admin Add / Edit Product Screen

Design the Add and Edit Product screen for the ADMIN role.

**Top App Bar:**
Back arrow. "Add Product" or "Edit Product" Poppins Bold 18sp. Right: "Save" text button crimson SemiBold 14sp.

**Scrollable content (16dp margins):**

**Image Upload Section:**
Large image preview area (full width, 200dp tall, 12dp radius, dashed border `#6B1A2B` 1.5dp, `#FAF7F4` bg):
- Camera icon 40dp crimson centered + "Tap to add product photo" 13sp muted centered
- After image selected: shows image preview with a small edit pencil icon overlay at bottom-right

**Form Fields (same input style as register screen):**
1. Product Name — tag icon, placeholder "Product name"
2. Description — paragraph icon, multiline 100dp, placeholder "Describe your product..."
3. Price — peso-sign icon, numeric input, placeholder "0.00"
4. Category — dropdown selector (chevron-down icon right), options: Cookies · Croissants · Donuts · Sourdough · Cakes · Pastries · Beverages
5. Stock / Availability toggle: row with "Available for ordering" label SemiBold 13sp | switch right (crimson when on)

**Delete Button (only on Edit mode):**
"Delete Product" at very bottom, full width, 48dp, outlined red `#DC2626` border and text, trash icon left. Tapping shows a confirmation bottom sheet.

**Confirmation Bottom Sheet (for Delete):**
Slides up from bottom, 24dp top radius, white bg, 24dp padding.
- Warning icon 40dp red centered
- "Delete Product?" Bold 17sp centered
- "This will permanently remove this product from the menu." 13sp muted centered
- Two buttons: "Cancel" outlined gray (48dp) | "Delete" solid red (48dp) — side by side with 12dp gap

---

## PROMPT 18 — Care Guide & About / FAQ Screens

Design the Care Guide page and the About / FAQ page for the Doughly Crumbl Android app (accessible from Profile menu).

### Care Guide Screen

**Top App Bar:**
Back arrow. "Cookie Care Guide" Poppins Bold 18sp.

**Content (scrollable, 16dp margin):**

**Header card (crimson bg, 12dp radius, 16dp padding):**
Cookie icon 40dp white centered. "How to Care for Your Cookies" Bold 17sp white centered. "Keep them fresh and delicious" 12sp `#F5E8EB` centered.

**Section Cards (white, 12dp radius, shadow, 16dp padding, 12dp gap between):**
Each section has a header row: colored icon circle 36dp + section title SemiBold 14sp dark.
Content: body text 13sp dark, line height 1.6.

Sections:
1. Shelf Life — calendar icon, amber circle
2. Reheating Instructions — flame icon, red circle
3. Freezing & Storage — snowflake icon, blue circle
4. Allergy Information — alert-triangle icon, amber circle
5. Ingredients — list icon, green circle

### About / FAQ Screen

**Top App Bar:**
Back arrow. "About & FAQ" Poppins Bold 18sp.

**Brand Header Card (crimson bg, 12dp radius):**
Logo 48dp white | "Doughly Crumbl" Bold 20sp white | tagline italic 13sp cream | location row (map-pin icon + "Don Gil Garcia St., Capitol Site, Cebu City") 12sp cream.

**Contact Row (3 action chips side by side):**
Phone chip (phone icon + "Call us") | Facebook chip (fb icon + "Facebook") | Instagram chip (camera icon + "Instagram") — each crimson outlined, 36dp tall, 12dp radius. Tapping opens phone dialer / browser.

**FAQ Section:**
"Frequently Asked Questions" SemiBold 16sp dark + divider.
Each FAQ as an expandable accordion card (white, 12dp radius, shadow, 16dp padding):
- Collapsed: question text SemiBold 13sp dark + chevron-down right
- Expanded: question + chevron-up + answer body 13sp muted below with 8dp top padding
Tap toggles expand/collapse with smooth animation.

---

*End of mobile design prompt set. 18 screens total covering the complete customer and admin flows.*
