# Known Pitfalls and Past Bugs — Doughly Crumbl

## Backend

### this::toResponse does not exist
- **Bug:** `ProductService.getAllAvailableProducts` used `this::toResponse` as a method reference
- **Fix:** Use `productAdapter::toDto` — the adapter is already injected
- **Commit:** `7133a1e`

### Missing @ConfigurationProperties registration
- Custom `app.*` properties added to `application.properties` without a matching class
- Causes IDE warnings and potential NPE at runtime if `@Value` binding fails
- Always add the field to the relevant class in `config/properties/` in the same commit

### Short model ID strings cause 400 from Claude API
- Use `claude-sonnet-4-6` or `claude-sonnet-4-5-20250929`, not `claude-sonnet-4-5`

### application.properties contains real credentials
- DB password, Google OAuth secret, Gmail app password, PayMongo test keys are committed
- Do not add new secrets — use environment variables for any new sensitive values

### N+1 queries on order items
- Fetching orders with items in a loop triggers N+1 unless `@OneToMany(fetch = EAGER)` or `@EntityGraph` is used
- Use `JOIN FETCH` in JPQL for order + items queries

## Frontend

### settings.local.json blocks branch switches
- Claude Code writes `.claude/settings.local.json` continuously
- Add to `.gitignore` or stash before `git checkout`

### CheckoutPage was replaced by CheckoutModal
- `CheckoutPage.tsx` was deleted; checkout now lives in `CheckoutModal.tsx` as an inline modal
- Do not recreate `CheckoutPage.tsx`

### Lucide icon mixing
- Only Lucide icons are allowed — no mixing with react-icons, heroicons, or Font Awesome
- Import pattern: `import { ShoppingCart, Bell } from 'lucide-react'`

### OpenStreetMap rate limit
- Nominatim API is limited to 1 request per second
- Never call it in a loop or on every keystroke — debounce address input (500ms minimum)
