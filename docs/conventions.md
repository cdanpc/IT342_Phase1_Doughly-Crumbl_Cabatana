# 📐 CONVENTIONS.md — Code Style & Naming Conventions

> Rules for naming, structure, formatting, and patterns across all three codebases.
> AI assistants and developers must follow these when writing or editing code.

---

## 1. General Principles (All Stacks)

- **Consistency over cleverness.** Match existing code style in the file you're editing.
- **No magic numbers.** Use named constants.
- **Fail fast.** Validate inputs as early as possible.
- **Don't repeat yourself.** Extract shared logic into utilities/helpers/services.
- **Comments explain WHY, not WHAT.** Code should be self-documenting.

---

## 2. Backend (Java / Spring Boot)

### Naming
| Element              | Convention        | Example                            |
|----------------------|-------------------|------------------------------------|
| Classes              | PascalCase        | `OrderService`, `ProductController`|
| Methods              | camelCase         | `findOrderById()`, `addToCart()`   |
| Variables            | camelCase         | `totalAmount`, `userId`            |
| Constants            | UPPER_SNAKE_CASE  | `MAX_CART_ITEMS`, `JWT_SECRET`     |
| Packages             | lowercase         | `com.doughlycrumbl.service`        |
| DB columns (entity)  | camelCase → snake | `deliveryAddress` → `delivery_address` |
| Endpoints            | kebab-case        | `/api/cart-items`, `/api/my-orders`|

### Entity Rules
- Annotate all entities with `@Entity`, `@Table(name = "...")`
- Always include `@Id` and `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- Use `@Column(nullable = false)` for required fields
- Use Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` where appropriate
- Timestamps: use `LocalDateTime`, annotated with `@CreationTimestamp` / `@UpdateTimestamp`

### DTO Rules
- Separate DTOs for **requests** and **responses** (never expose entity directly)
- Use `@Valid` in controller method params
- Use Bean Validation annotations: `@NotBlank`, `@Email`, `@Min`, `@Size`
- DTOs live in `dto/request/` and `dto/response/`

### Service Rules
- Services handle **all business logic** — controllers should be thin
- Use `@Transactional` on methods that write to DB
- Throw specific exceptions (`ResourceNotFoundException`, etc.) — never return null
- Always verify ownership before allowing modifications (e.g., customer can only edit their own cart)

### Controller Rules
- Controllers only: validate input, call service, return response
- Always return `ResponseEntity<T>` with appropriate HTTP status
- Use `@RestController` + `@RequestMapping("/api/...")`
- Secure admin routes via `@PreAuthorize("hasRole('ADMIN')")`

### Security Rules
- Never store plain text passwords — always use `BCryptPasswordEncoder`
- JWT secret must be in `application.properties`, not hardcoded
- Validate JWT on every protected request via `JwtAuthFilter`

---

## 3. Web Frontend (React / TypeScript)

### Naming
| Element           | Convention   | Example                              |
|-------------------|--------------|--------------------------------------|
| Components        | PascalCase   | `ProductCard`, `CartPage`            |
| Files (component) | PascalCase   | `ProductCard.tsx`, `CartPage.tsx`    |
| Hooks             | camelCase    | `useCart()`, `useAuth()`             |
| Functions/vars    | camelCase    | `handleAddToCart`, `totalPrice`      |
| Types/Interfaces  | PascalCase   | `Product`, `CartItem`, `OrderStatus` |
| Constants         | UPPER_SNAKE  | `API_BASE_URL`, `MAX_QUANTITY`       |
| CSS classes       | kebab-case   | `.product-card`, `.cart-summary`     |

### Component Rules
- Every component is a **functional component** with typed props
- Props interface named `[ComponentName]Props` (e.g., `ProductCardProps`)
- Default export for pages; named exports for shared components
- No inline styles — use CSS modules or Tailwind classes
- Break components into smaller pieces when JSX exceeds ~80 lines

### TypeScript Rules
- **No `any` type.** Define proper types for everything.
- All API response shapes must have a corresponding type in `types/index.ts`
- Use `interface` for object shapes, `type` for unions/aliases

### State Management
- Local UI state → `useState`
- Cross-component state (auth, cart count) → Context API or Zustand store
- Never store sensitive data (JWT payload) in localStorage — use memory or httpOnly cookies
- Keep stores minimal; business logic belongs in hooks, not stores

### API Calls
- All API calls go through `api/` folder functions — never call `fetch`/`axios` directly in components
- Handle loading and error states in every component that fetches data
- Show user-friendly error messages — never expose raw error objects in UI

### File Organization
- One component per file
- Co-locate test files next to the component: `ProductCard.test.tsx`
- Shared types in `types/index.ts`
- Route paths as constants in `utils/routes.ts`

---

## 4. Mobile (Android / Kotlin / Jetpack Compose)

### Naming
| Element        | Convention   | Example                          |
|----------------|--------------|----------------------------------|
| Classes        | PascalCase   | `ProductViewModel`, `OrderScreen`|
| Functions      | camelCase    | `addToCart()`, `fetchOrders()`   |
| Variables      | camelCase    | `cartItems`, `isLoading`         |
| Constants      | UPPER_SNAKE  | `BASE_URL`, `TOKEN_KEY`          |
| Composables    | PascalCase   | `ProductCard()`, `CartScreen()`  |
| Screen routes  | UPPER_SNAKE  | `"PRODUCT_DETAIL/{id}"`          |

### Compose Rules
- Each screen is a `@Composable` function ending in `Screen` (e.g., `CartScreen`)
- Reusable UI pieces end in the UI component type (e.g., `ProductCard`, `PriceTag`)
- Use `remember` and `mutableStateOf` for local Compose state
- ViewModels hold screen state — screen composables observe via `collectAsState()`

### ViewModel Rules
- One ViewModel per screen (e.g., `CartViewModel` for `CartScreen`)
- Expose UI state as a single `StateFlow<UiState>` data class
- Side effects (navigation, snackbar) via `SharedFlow`
- Never hold Context in a ViewModel

### Network Rules
- Use Retrofit for API calls
- All API base URLs stored in `BuildConfig` or a `Constants.kt` file
- JWT stored in `SharedPreferences` (encrypted with `EncryptedSharedPreferences`)
- Add Authorization header via an OkHttp Interceptor

### Repository Rules
- Repository is the single source of truth for each domain
- Returns `Result<T>` to wrap success/error from network calls
- ViewModel calls repository and maps result to UI state

---

## 5. Git Conventions

### Branch Naming
```
feature/add-cart-api
bugfix/fix-order-status-update
hotfix/null-pointer-cart
chore/update-dependencies
```

### Commit Message Format
```
<type>: <short description>

Types: feat, fix, chore, refactor, docs, style, test
```

**Examples:**
```
feat: add product search endpoint
fix: resolve cart item duplication bug
docs: update API contract for orders
refactor: extract order total calculation to service
```

### Pull Request Rules
- PR title matches commit format
- Link to the task/issue it closes
- Must have at least 1 reviewer before merge
- No merge if there are unresolved comments

---

## 6. Environment & Config

### Backend (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/doughlycrumbl
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

# JWT
app.jwt.secret=YOUR_SECRET_KEY_MIN_32_CHARS
app.jwt.expiration-ms=86400000

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

- **Never commit real secrets.** Use `.env` or environment variables in production.
- Keep a `application.properties.example` with placeholder values in the repo.

### Web Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Mobile (`local.properties` or `BuildConfig`)
```
BASE_URL=http://10.0.2.2:8080/api
```
(Use `10.0.2.2` to reach `localhost` from Android emulator)
