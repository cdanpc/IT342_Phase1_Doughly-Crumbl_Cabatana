# 🎨 WIREFRAMES.md — UI Layout & Design Specification

> **Agent instruction:** Before building any page or component, read this file in full.
> Every layout decision, color, spacing rule, and component detail is documented here.
> Do NOT invent layouts — match the wireframes exactly, then apply the spacing rules below.

---

## 🎨 Design Tokens — Use These Everywhere

### Colors
```css
--color-primary:        #8B0020;   /* Deep crimson — buttons, active states, accents */
--color-primary-dark:   #6B0018;   /* Hover state for primary */
--color-primary-light:  #F5E6E9;   /* Light tint for backgrounds */
--color-sidebar-bg:     #FAFAFA;   /* Left sidebar background */
--color-sidebar-active: #8B0020;   /* Active nav item background */
--color-card-bg:        #FFFFFF;
--color-panel-bg:       #FFFFFF;   /* Right order panel */
--color-body-bg:        #F4F4F4;
--color-text-primary:   #1A1A1A;
--color-text-secondary: #666666;
--color-text-muted:     #999999;
--color-border:         #E5E5E5;
--color-white:          #FFFFFF;
--color-hero-overlay:   rgba(0,0,0,0.35);
```

### Typography
```css
--font-display:  'Poppins', sans-serif;      /* Headings, logo text, hero titles */
--font-body:     'Inter', sans-serif;         /* Body text, labels, inputs */

--text-xs:    11px;
--text-sm:    13px;
--text-base:  15px;
--text-md:    16px;
--text-lg:    18px;
--text-xl:    22px;
--text-2xl:   28px;
--text-3xl:   36px;
--text-hero:  64px;    /* Landing page headline */
```

### Spacing Scale — CRITICAL: Use Generously
```
Agent rule: Never compress elements together. When in doubt, add more space.
Default gap between sections: 32px minimum
Default gap between form fields: 20px minimum
Default padding inside cards: 20px minimum
Default padding inside panels: 24px
Default padding inside page sections: 40px vertical
```

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
```

### Border Radius
```css
--radius-sm:   6px;    /* Inputs, small tags */
--radius-md:   10px;   /* Cards, panels */
--radius-lg:   14px;   /* Large cards */
--radius-full: 9999px; /* Pill buttons, badges */
--radius-circle: 50%;  /* Avatar, circle decorations */
```

### Shadows
```css
--shadow-card:   0 2px 12px rgba(0,0,0,0.08);
--shadow-panel:  0 4px 24px rgba(0,0,0,0.10);
--shadow-button: 0 4px 12px rgba(139,0,32,0.30);
--shadow-input-focus: 0 0 0 3px rgba(139,0,32,0.15);
```

---

## 📄 Page 1 — Landing Page (Unauthenticated)

**Route:** `/`
**Purpose:** Public marketing page — first screen visitors see. Drives signups.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR (full-width, transparent over crimson bg)                │
│  [DC Logo]  Doughly Crumbl    Home  Menu  Cookie Care  Cookies   │
│                                              [Sign In]  [Sign Up] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│           HERO SECTION (full viewport height, crimson bg)        │
│                                                                  │
│        "Indulge in warm, chewy, flavor-packed cookies..."        │
│                                                                  │
│           Doughly Tempted?                                       │
│             Get It Crumbl!                                       │
│                                                                  │
│         [  Order Now  ]    [  Meet Cookie  ]                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Navbar Specs
- **Background:** transparent (sits over crimson hero)
- **Height:** 72px
- **Padding:** 0 64px (horizontal)
- **Logo area:** DC icon (red square, white icon) + "Doughly Crumbl" in bold, white, 20px
- **Nav links:** Home, Menu, Cookie Care, Cookies — white, 15px, 40px gap between each, `font-weight: 500`
- **Sign In button:** text-only, white, no border, 15px, `cursor: pointer`, hover underline
- **Sign Up button:** white border `1.5px solid white`, white text, `border-radius: var(--radius-full)`, padding `10px 24px`, hover: fill white bg + crimson text
- **Gap between Sign In and Sign Up:** 16px

### Hero Section Specs
- **Background:** `#8B0020` (solid crimson — full screen)
- **Min-height:** 100vh
- **Content alignment:** centered horizontally + vertically, column flex
- **Subtitle text:** "Indulge in warm, chewy, flavor-packed cookies crafted to turn cravings into obsessions."
  - Color: `rgba(255,255,255,0.80)`
  - Font: var(--font-body), 16px, max-width 560px, centered
  - Margin-bottom: 20px
- **Headline:** "Doughly Tempted? Get It Crumbl!"
  - Font: var(--font-display), **700 weight**, 64px, white
  - Line-height: 1.15
  - Margin-bottom: 40px
  - Center-aligned
- **CTA Buttons row:** flex row, gap 16px, centered
  - "Order Now": white background, `#8B0020` text, `font-weight: 700`, `border-radius: var(--radius-full)`, padding `14px 36px`, `font-size: 16px`
  - "Meet Cookie": transparent bg, white border `2px solid white`, white text, same sizing as Order Now

### Navigation Links Behavior
| Link        | Action                                    |
|-------------|-------------------------------------------|
| Home        | Scrolls to hero                           |
| Menu        | Scrolls to / navigates to product listing |
| Cookie Care | Navigates to care guide info section      |
| Cookies     | Same as Menu                              |
| Sign In     | Navigates to `/login`                     |
| Sign Up     | Navigates to `/register`                  |
| Order Now   | Navigates to `/login` if not auth, else `/menu` |
| Meet Cookie | Scrolls to Featured section or menu       |

---

## 📄 Page 2 — Register Page

**Route:** `/register`
**Purpose:** New user account creation.

### Layout — Split Screen (50 / 50)
```
┌─────────────────────────────────┬────────────────────────────────┐
│  LEFT PANEL (white, ~50%)       │  RIGHT PANEL (crimson, ~50%)   │
│                                 │                                │
│  [DC Logo top-left]             │   ●  (cookie image, top-right) │
│                                 │                                │
│                                 │                                │
│   Get started                   │                                │
│   Create new account            │        ●  (cookie img, mid)    │
│                                 │                                │
│   [First Name]  [Last Name]     │                                │
│   [Email                    ]   │                                │
│   [Address                  ]   │  ●  (cookie img, bottom-left)  │
│   [Phone number             ]   │                                │
│   [Password                 ]   │                                │
│   [Confirm Password         ]   │                                │
│                                 │                                │
│   [    Create Account       ]   │                                │
│                                 │                                │
│   Already have an account?      │                                │
│   Sign In here                  │                                │
└─────────────────────────────────┴────────────────────────────────┘
```

### Left Panel Specs
- **Background:** `#FFFFFF`
- **Width:** 50vw
- **Padding:** 48px 64px (vertical horizontal) — do NOT compress
- **Logo:** top-left — red square `56px × 56px`, `border-radius: 10px`, white DC icon inside + "Doughly Crumbl" text in `#8B0020`, `font-weight: 700`, 18px, flex row, gap 12px
- **Logo margin-bottom:** 56px (generous gap before form)

### Form Specs
- **"Get started" heading:** `font-weight: 700`, 32px, `#1A1A1A`, `font-family: var(--font-display)`
- **"Create new account" subheading:** 14px, `#666666`, margin-top 6px, margin-bottom 36px
- **Field layout:**
  - First Name + Last Name: `display: grid; grid-template-columns: 1fr 1fr; gap: 16px`
  - All other fields: full width, one per row
- **Gap between fields:** `20px` (never compress)
- **Field label:** `font-size: 13px`, `font-weight: 600`, `#1A1A1A`, `margin-bottom: 6px`, display block
- **Input style:**
  - `width: 100%`, `padding: 12px 16px`
  - `border: 1.5px solid #E5E5E5`
  - `border-radius: var(--radius-sm)`
  - `font-size: 15px`, `color: #1A1A1A`
  - `background: #FAFAFA`
  - Placeholder: `#AAAAAA`
  - Focus: `border-color: #8B0020`, `box-shadow: var(--shadow-input-focus)`, `background: #FFFFFF`
  - Error state: `border-color: #DC2626`, `background: #FFF8F8`
- **Field error message:** `font-size: 12px`, `color: #DC2626`, `margin-top: 4px`, display below input
- **Create Account button:**
  - Full width, `padding: 14px`
  - `background: #8B0020`, white text, `font-weight: 700`, `font-size: 16px`
  - `border-radius: var(--radius-sm)`
  - `margin-top: 8px`
  - Hover: `background: #6B0018`, `box-shadow: var(--shadow-button)`
  - Disabled (loading): `opacity: 0.6`, `cursor: not-allowed`, show spinner inside
- **"Already have an account?" text:** centered, `font-size: 14px`, `color: #666`, `margin-top: 24px`
  - "Sign In here" link: `color: #8B0020`, `font-weight: 600`, no underline, hover underline

### Right Panel Specs
- **Background:** `#8B0020`
- **Width:** 50vw
- **Min-height:** 100vh
- **Decorative circles:** 3 circles representing cookies/pastries
  - Replace the white placeholder circles with **actual cookie/pastry images** in `border-radius: 50%`
  - Or use white circles with `opacity: 0.12` as abstract decorative shapes if no images yet
  - Sizes: top-right `280px`, middle-right `320px`, bottom-left `360px`
  - Positioned absolutely with overflow hidden at panel edges
  - `object-fit: cover` if images

### Fields Required for Registration
| Field          | Type     | Placeholder               | Validation                          |
|----------------|----------|---------------------------|-------------------------------------|
| First Name     | text     | John                      | Required, 2–50 chars                |
| Last Name      | text     | Doe                       | Required, 2–50 chars                |
| Email          | email    | johndoe@gmail.com         | Required, valid email, unique       |
| Address        | text     | Busogon st., San Remigio  | Required, min 10 chars              |
| Phone Number   | tel      | +63 ### ### ####          | Required, Philippine format         |
| Password       | password | ••••••••••••              | Required, min 8 chars               |
| Confirm Passwd | password | ••••••••••••              | Required, must match password       |

> **Note:** The backend `User` entity stores `name` as a single field. Combine First + Last name on submit: `name = firstName + ' ' + lastName`. The address and phone are stored separately — update the User entity and RegisterRequest DTO to include `address` (VARCHAR 255) and `phoneNumber` (VARCHAR 20).

---

## 📄 Page 3 — Login Page

**Route:** `/login`
**Purpose:** Returning user authentication.

### Layout — Same Split Pattern as Register
```
┌─────────────────────────────────┬────────────────────────────────┐
│  LEFT PANEL (white, ~50%)       │  RIGHT PANEL (crimson, ~50%)   │
│                                 │                                │
│  [DC Logo top-left]             │   ●  (cookie/pastry image)     │
│                                 │                                │
│                                 │                                │
│   Sign In                       │        ●  (cookie img)         │
│   Access your Doughly Crumbl    │                                │
│                                 │                                │
│   Email                         │                                │
│   [                         ]   │                                │
│                                 │  ●  (cookie img, bottom)       │
│   Password                      │                                │
│   [                         ]   │                                │
│                                 │                                │
│   [        Sign In          ]   │                                │
│                                 │                                │
│   Don't have an account?        │                                │
│   Sign up here                  │                                │
└─────────────────────────────────┴────────────────────────────────┘
```

### Left Panel Specs
- Same layout rules as Register (48px 64px padding, logo top-left with 56px gap before form)
- **"Sign In" heading:** `font-weight: 700`, 36px, `#1A1A1A`, `font-family: var(--font-display)`
- **"Access your Doughly Crumbl" subheading:** 14px, `#666`, margin-top 6px, margin-bottom 40px
- **Email field:** full width, same input style as Register
- **Password field:** full width, same input style — add a show/hide password toggle icon inside the field (eye icon, right side, `color: #999`)
- **Gap between Email and Password:** 20px
- **Sign In button:** same as Create Account button — full width crimson, `margin-top: 28px`
- **Loading state:** show spinner inside button, disable it
- **"Don't have an account?" text:** centered, `margin-top: 28px`
  - "Sign up here" link: `color: #8B0020`, `font-weight: 600`

### Right Panel
- Identical decoration pattern to Register page (3 circular cookie/pastry images)

### Login Error States
- Wrong credentials → red error banner above form:
  ```
  ┌─────────────────────────────────────────┐
  │ ⚠ Invalid email or password.            │
  └─────────────────────────────────────────┘
  ```
  Style: `background: #FFF0F0`, `border: 1px solid #DC2626`, `border-radius: var(--radius-sm)`, `padding: 12px 16px`, `font-size: 14px`, `color: #DC2626`, margin-bottom 20px
- Also fire a `toast.error(...)` simultaneously

---

## 📄 Page 4 — Main App Dashboard (Authenticated)

**Route:** `/menu` or `/dashboard`
**Purpose:** Core ordering screen. Shows product grid + live order panel.

### Overall Layout — 3-Column
```
┌──────────┬─────────────────────────────────────┬──────────────┐
│ SIDEBAR  │  MAIN CONTENT AREA                  │  ORDER PANEL │
│  120px   │  flex-1 (fluid)                     │  320px       │
│          │                                     │              │
│ fixed    │  scrollable                         │  fixed       │
│ left     │                                     │  right       │
└──────────┴─────────────────────────────────────┴──────────────┘
```

---

### Column 1 — Left Sidebar (120px wide, fixed)

```
┌──────────┐
│  [Avatar]│  ← 48px circle, user profile photo or initials
│  Cdanpc  │  ← 11px, #666, truncated username, centered
│          │
│  [Icon]  │
│  Menu    │  ← Active: crimson bg pill, white icon+text
│          │
│  [Icon]  │
│  My      │
│  Orders  │
│          │
│  [Icon]  │
│  About   │
│          │
│  [Icon]  │
│  Care    │
│  Guide   │
│          │
│          │
│  [Icon]  │
│  Logout  │  ← bottom of sidebar (margin-top: auto)
└──────────┘
```

#### Sidebar Specs
- **Background:** `#FFFFFF`
- **Width:** 120px, fixed, full viewport height
- **Border-right:** `1px solid #EEEEEE`
- **Padding:** `24px 0` (vertical), `0` (horizontal — items center themselves)
- **Top section:** user avatar + username, `margin-bottom: 32px`
  - Avatar: `48px × 48px`, `border-radius: 50%`, centered, `margin-bottom: 8px`
  - Username: `font-size: 11px`, `color: #666`, centered, max 1 line truncated

#### Sidebar Nav Items
- Each nav item: `flex-direction: column`, `align-items: center`, `gap: 6px`
- Width: `88px`, `padding: 12px 8px`, `border-radius: 10px`, centered via `margin: 0 auto`
- Icon: `24px × 24px`
- Label: `font-size: 11px`, `font-weight: 500`, `text-align: center`
- **Gap between nav items:** `8px`
- **Default state:** `color: #666`, `background: transparent`
- **Active state:** `background: #8B0020`, `color: #FFFFFF`, icon fills white
- **Hover state:** `background: #F5E6E9`, `color: #8B0020`
- **Logout:** sits at bottom — use `margin-top: auto` on the nav container's last item

| Item       | Icon          | Route / Action     |
|------------|---------------|--------------------|
| Menu       | utensils/fork | `/menu` (default active) |
| My Orders  | shopping bag  | `/orders`          |
| About      | info circle   | `/about`           |
| Care Guide | bookmark      | `/care-guide`      |
| Logout     | door/exit     | clears auth + goes to `/` |

---

### Column 2 — Top Header Bar

Sits above the main content, full width of the center column.

```
┌──────────────────────────────────────────────────────┐
│  [DC Logo + "Doughly Crumbl"]   [🔍 Search menu...]  [🛒] │
└──────────────────────────────────────────────────────┘
```

#### Header Specs
- **Background:** `#FFFFFF`
- **Height:** 68px
- **Padding:** `0 32px`
- **Border-bottom:** `1px solid #EEEEEE`
- **Position:** sticky top
- **Logo:** DC icon `36px` + "Doughly Crumbl" in `#8B0020`, `font-weight: 700`, 18px
- **Search bar:**
  - `flex: 1`, `max-width: 460px`, centered between logo and cart
  - `margin: 0 32px`
  - `padding: 10px 16px 10px 40px` (space for search icon)
  - `border: 1.5px solid #E5E5E5`, `border-radius: var(--radius-full)`
  - `font-size: 14px`, placeholder "Search menu here..."
  - Search icon inside on left, `#999`
  - Focus: `border-color: #8B0020`, `box-shadow: var(--shadow-input-focus)`
- **Cart icon:** `28px`, `color: #1A1A1A`, shows badge with item count (crimson circle, white number)
  - `margin-left: auto`

---

### Column 2 — Main Content Area (scrollable)

#### Hero Banner
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Welcome to Doughly Crumbl                         │
│   Freshly Baked Happiness          [Order Now]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Height:** 220px
- **Border-radius:** `var(--radius-lg)`
- **Background:** full-bleed pastry/cookie photography — dark overlay `rgba(0,0,0,0.35)`
- **Margin:** `24px 24px 0 24px`
- **Content padding:** `40px 48px`
- **"Welcome to Doughly Crumbl":** 14px, white, `opacity: 0.85`, margin-bottom 8px
- **"Freshly Baked Happiness":** 32px, white, `font-weight: 800`, `font-family: var(--font-display)`
- **"Order Now" button:** `background: #8B0020`, white text, `border-radius: var(--radius-full)`, `padding: 12px 28px`, `font-size: 15px`, `font-weight: 700`

#### Featured Delights Section
- **Section padding:** `32px 24px`
- **Section header row:** flex, space-between, `align-items: center`, `margin-bottom: 20px`
  - "Featured Delights": `font-weight: 700`, 22px, `#1A1A1A`, `font-family: var(--font-display)`
  - "All Categories" button: `background: #8B0020`, white text, `border-radius: var(--radius-sm)`, `padding: 8px 16px`, 14px, icon on left (filter/lines icon), `gap: 8px`

#### Product Grid
```
[ Card ]  [ Card ]  [ Card ]  [ Card ]
[ Card ]  [ Card ]  [ Card ]  [ Card ]
```
- **Grid:** `display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px`
- Responsive: 4 cols → 3 cols at tablet → 2 cols at mobile

#### Product Card Specs
```
┌──────────────────────┐
│                      │
│    [Cookie Image]    │  ← square image, border-radius top
│                      │
├──────────────────────┤
│ Almond Croissant  🛒 │  ← name + cart icon
│ ₱80.00 PHP    ★ 4.8 │  ← price (crimson) + star rating
└──────────────────────┘
```
- **Background:** `#FFFFFF`
- **Border-radius:** `var(--radius-md)`
- **Box-shadow:** `var(--shadow-card)`
- **Image area:** `aspect-ratio: 1/1` (square), `border-radius: var(--radius-md) var(--radius-md) 0 0`, `object-fit: cover`, full width
- **Card body padding:** `14px 16px 16px 16px`
- **Product name:** `font-weight: 600`, `font-size: 14px`, `color: #1A1A1A`, truncated 1 line
- **Cart icon button:** small, top-right of name row, `color: #666`, hover: `color: #8B0020`
- **Price:** `font-size: 13px`, `color: #8B0020`, `font-weight: 600`
- **Star rating:** `font-size: 12px`, `color: #F59E0B`, `★ 4.8` format — right-aligned
- **Name + cart row:** flex, space-between, `margin-bottom: 8px`
- **Price + rating row:** flex, space-between
- **Hover on card:** `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.12)`, transition 200ms

---

### Column 3 — Right Order Panel (320px, fixed)

```
┌────────────────────────────────┐
│  🛍  Order                      │
├────────────────────────────────┤
│  [img] Almond Croissant    🗑   │
│        Cookies                 │
│        [−] 7 [+]    ₱80.00 PHP │
├────────────────────────────────┤
│  [img] Almond Croissant    🗑   │
│        Cookies                 │
│        [−] 7 [+]    ₱80.00 PHP │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ┤
│  (more items...)               │
├────────────────────────────────┤
│  Subtotal          ₱360.00 PHP │
│  Delivery fee       ₱80.00 PHP │
│──────────────────────────────  │
│  Total             ₱440.00 PHP │
├────────────────────────────────┤
│   [    Confirm Order    ]      │
└────────────────────────────────┘
```

#### Order Panel Specs
- **Width:** 320px, fixed right, full viewport height
- **Background:** `#FFFFFF`
- **Border-left:** `1px solid #EEEEEE`
- **Padding:** `24px 20px`
- **Panel header:** "🛍 Order" — `font-weight: 700`, 20px, `#1A1A1A`, flex row, gap 8px, `margin-bottom: 20px`

#### Cart Item Row Specs
- **Layout:** flex row, `gap: 12px`, `padding: 14px 0`, `border-bottom: 1px solid #F0F0F0`
- **Product thumbnail:** `56px × 56px`, `border-radius: var(--radius-sm)`, `object-fit: cover`, `flex-shrink: 0`
- **Info column:** flex-column, flex-1
  - Product name: `font-size: 14px`, `font-weight: 600`, `#1A1A1A`
  - Category: `font-size: 12px`, `color: #999`, `margin-bottom: 8px`
  - Quantity row: flex, `align-items: center`, `gap: 8px`
    - `[−]` button: `24px × 24px`, `border: 1px solid #E5E5E5`, `border-radius: var(--radius-sm)`, centered icon
    - Quantity: `font-size: 14px`, `font-weight: 600`, `min-width: 20px`, `text-align: center`
    - `[+]` button: same as minus
    - Price: `font-size: 13px`, `color: #8B0020`, `font-weight: 600`, `margin-left: auto`
- **Delete icon:** `16px`, `color: #CC0000` or `#DC2626`, top-right of the item row, hover: scale 1.1

#### Order Summary Specs
- **Margin-top:** 20px (generous gap after items list)
- **Subtotal row:** flex, space-between, `font-size: 14px`, `color: #666`, `padding: 6px 0`
- **Delivery fee row:** same as subtotal
- **Divider:** `1px solid #E5E5E5`, `margin: 10px 0`
- **Total row:** flex, space-between, `font-size: 15px`, `font-weight: 700`, `color: #1A1A1A`
- **Confirm Order button:**
  - Full width, `padding: 14px`
  - `background: #8B0020`, white text, `font-weight: 700`, 16px
  - `border-radius: var(--radius-sm)`
  - `margin-top: 20px`
  - Hover: `background: #6B0018`, `box-shadow: var(--shadow-button)`
  - Disabled if cart is empty: `opacity: 0.5`, `cursor: not-allowed`

#### Empty Cart State (when no items)
```
┌────────────────────────────────┐
│  🛍  Order                      │
│                                │
│         🍪                     │
│    Your cart is empty          │
│    Browse our menu and         │
│    add something delicious!    │
│                                │
│   [ Browse Products ]         │
└────────────────────────────────┘
```
- Centered vertically in panel, icon 40px, text 14px `#999`

---

## 🔲 Component: Category Filter

Triggered by "All Categories" button — show as a **dropdown** below the button.

```
┌─────────────────────┐
│ ✓ All Categories    │
│   Classic           │
│   Specialty         │
│   Seasonal          │
│   Best Sellers      │
└─────────────────────┘
```
- `background: #FFFFFF`, `border: 1px solid #E5E5E5`, `border-radius: var(--radius-md)`
- `box-shadow: var(--shadow-panel)`
- `padding: 8px 0`
- Each option: `padding: 10px 16px`, `font-size: 14px`, `color: #1A1A1A`, hover: `background: #F5F5F5`
- Active option: `color: #8B0020`, `font-weight: 600`

---

## 📐 Responsive Breakpoints

| Breakpoint | Width    | Changes                                               |
|------------|----------|-------------------------------------------------------|
| Desktop    | ≥ 1280px | Full 3-column layout as wireframe                     |
| Tablet     | ≥ 768px  | Sidebar collapses to icons only (no labels), product grid 3 cols, order panel becomes slide-in drawer |
| Mobile     | ≥ 375px  | Sidebar hidden (bottom nav), product grid 2 cols, order panel is a bottom sheet accessed via cart icon |

---

## 🚫 Layout Anti-Patterns — Never Do These

1. **Do NOT** stack all form fields with no breathing room — always `gap: 20px` minimum between fields
2. **Do NOT** use thin `1px` text for prices or labels — minimum `font-weight: 500` on prices
3. **Do NOT** make the sidebar wider than 120px — it will eat the content area
4. **Do NOT** place the right order panel inside the scroll — it must be `position: fixed` or `sticky`
5. **Do NOT** make product cards shorter than `240px` tall — the image needs visual weight
6. **Do NOT** use `padding: 8px` on cards — minimum `14px` inside cards
7. **Do NOT** center the landing page text with a very small `max-width` — hero headline fills 700px+
8. **Do NOT** show a blank white screen while loading — always use skeleton loaders for product grids
9. **Do NOT** put the form on the right side of the split layout — form is always LEFT, decoration RIGHT
10. **Do NOT** show both the Landing page and the App dashboard to the same user — auth guards redirect properly

---

## 🗒️ Pages Still Needed (No Wireframe Yet — Follow Design System)

These pages don't have wireframes yet. When building them, follow ALL design tokens and spacing rules above and match the visual language of the existing screens.

| Page              | Route              | Key Elements                                        |
|-------------------|--------------------|-----------------------------------------------------|
| Order Confirmation| `/order-success`   | Order ID, summary, status badge, "Back to Menu" CTA |
| My Orders         | `/orders`          | List of orders, status badges, click to expand      |
| Order Detail      | `/orders/:id`      | Full order breakdown, items, delivery info, status  |
| Admin Dashboard   | `/admin`           | Stats cards, quick links to products and orders     |
| Admin Products    | `/admin/products`  | Table with image, add/edit/delete, search           |
| Admin Orders      | `/admin/orders`    | Table with status filter, update status dropdown    |

For these pages, use the sidebar navigation from the main dashboard as the shell layout.
