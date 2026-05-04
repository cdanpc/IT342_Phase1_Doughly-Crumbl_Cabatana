# Doughly Crumbl — Android Mobile Development Plan

**Target:** Full feature parity with the web frontend for both customer and admin flows  
**Stack:** Android (Kotlin), XML layouts, ViewBinding, Retrofit, OkHttp, Glide  
**Package:** `com.example.mobile`  
**Backend:** Spring Boot REST API — base URL `http://10.0.2.2:8080/api/` (emulator) or your deployed URL  
**No Jetpack Compose** — XML + ViewBinding only  

---

## App flow overview

```
SplashActivity
    ├── not logged in  → LoginActivity / RegisterActivity
    ├── role = CUSTOMER → MainActivity  (Home · Cart · Orders · Profile)
    └── role = ADMIN    → AdminActivity (Dashboard · Products · Orders)
```

There are two separate host activities — one per role. Both share the same
`SessionManager`, `RetrofitClient`, and `ApiService`.

---

## Before you start — reading list

| File | Why |
|------|-----|
| `backend/.../auth/AuthController.java` | Auth endpoints + response shape |
| `backend/.../order/AdminController.java` | All admin endpoints — products, orders, delivery fee |
| `backend/.../cart/CartController.java` | Cart endpoints |
| `backend/.../order/OrderController.java` | Customer order endpoints |
| `web/src/shared/api/` | Axios calls — mirrors what Retrofit must replicate |
| `mobile/app/build.gradle.kts` | Current deps — update in Part 0 |

---

## Skill cheat sheet

| When | Run | Why |
|------|-----|-----|
| Starting a new screen | `/scaffold <Name> [activity\|fragment]` | ViewModel + Repository + Activity/Fragment + XML stub |
| After every Part | `/diagnose` | Catches compile errors before moving on |
| Before a PR | `/review` | Structural + logic review |
| End of project | Manual UX checklist (Part 7) | Loading states, empty states, error toasts |
| Bug you can't explain | `/investigate` | Root-cause analysis |
| Auth/token security | `/security-review` | JWT storage + interceptor audit |

---

## Part 0 — Foundation (do this once, before any screens)

> **No `/scaffold` yet** — this is the base that `/scaffold` depends on.

### 0-A. Update `build.gradle.kts` and `libs.versions.toml`

Remove all Jetpack Compose dependencies. Add:

| Library | Purpose |
|---------|---------|
| `appcompat:1.6.1` | Base AppCompatActivity |
| `material:1.11.0` | MaterialComponents theme, BottomNavigationView |
| `constraintlayout:2.1.4` | XML layout engine |
| `recyclerview:1.3.2` | Lists |
| `cardview:1.0.0` | Card UI elements |
| `swiperefreshlayout:1.1.0` | Pull-to-refresh |
| `activity-ktx:1.8.2` | `ComponentActivity`, `by viewModels()` |
| `fragment-ktx:1.6.2` | Fragment support, `by viewModels()` |
| `lifecycle-viewmodel-ktx:2.7.0` | ViewModel + viewModelScope |
| `retrofit2:2.9.0` | HTTP client |
| `converter-gson:2.9.0` | JSON → Kotlin data classes |
| `okhttp3:4.12.0` | HTTP engine |
| `logging-interceptor:4.12.0` | Log HTTP traffic in Logcat |
| `glide:4.16.0` | Image loading (product photos) |

Enable `buildFeatures { viewBinding = true }`. Remove `compose = true`.

### 0-B. Delete Compose theme files

Replace with empty package declarations (they fail to compile without Compose deps):
- `ui/theme/Color.kt`
- `ui/theme/Theme.kt`
- `ui/theme/Type.kt`

### 0-C. Update `res/values/`

**`colors.xml`** — brand palette:

```xml
<color name="primary">#C8874E</color>
<color name="primary_dark">#A0693A</color>
<color name="primary_light">#F5E6D3</color>
<color name="accent">#8B4513</color>
<color name="background">#FAFAFA</color>
<color name="surface">#FFFFFF</color>
<color name="on_primary">#FFFFFF</color>
<color name="text_primary">#1A1A1A</color>
<color name="text_secondary">#757575</color>
<color name="error">#D32F2F</color>
<color name="success">#388E3C</color>
<color name="warning">#FFA726</color>
<color name="info">#42A5F5</color>
<color name="divider">#E0E0E0</color>
<!-- Order status badge colors -->
<color name="status_pending">#FFA726</color>
<color name="status_active">#42A5F5</color>
<color name="status_done">#66BB6A</color>
<color name="status_cancelled">#EF5350</color>
```

**`themes.xml`:**

```xml
<style name="Theme.DoughlyCrumbl" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorPrimaryDark">@color/primary_dark</item>
    <item name="colorAccent">@color/accent</item>
    <item name="android:windowBackground">@color/background</item>
</style>
```

**`strings.xml`** — add:

```xml
<string name="app_name">Doughly Crumbl</string>
<string name="loading">Loading…</string>
<string name="error_network">Network error. Check your connection.</string>
<string name="empty_list">Nothing here yet.</string>
<string name="confirm_delete">Are you sure you want to delete this?</string>
<string name="confirm_delete_yes">Delete</string>
<string name="cancel">Cancel</string>
```

### 0-D. Create `util/SessionManager.kt`

```kotlin
package com.example.mobile.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("doughly_session", Context.MODE_PRIVATE)

    fun saveToken(token: String) = prefs.edit().putString(KEY_TOKEN, token).apply()
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveUser(userId: Long, name: String, email: String, role: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_NAME, name)
            .putString(KEY_EMAIL, email)
            .putString(KEY_ROLE, role)
            .apply()
    }

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)
    fun getName(): String? = prefs.getString(KEY_NAME, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)
    fun isAdmin(): Boolean = getRole() == "ADMIN"
    fun isLoggedIn(): Boolean = getToken() != null

    fun clearSession() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_TOKEN   = "token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_NAME    = "name"
        private const val KEY_EMAIL   = "email"
        private const val KEY_ROLE    = "role"
    }
}
```

### 0-E. Create network layer

**`network/AuthInterceptor.kt`:**

```kotlin
package com.example.mobile.network

import com.example.mobile.util.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val sessionManager: SessionManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sessionManager.getToken()
        val request = if (token != null)
            chain.request().newBuilder().addHeader("Authorization", "Bearer $token").build()
        else chain.request()
        return chain.proceed(request)
    }
}
```

**`network/RetrofitClient.kt`:**

```kotlin
package com.example.mobile.network

import com.example.mobile.util.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/api/"

    fun getInstance(sessionManager: SessionManager): Retrofit {
        val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sessionManager))
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
```

**`network/ApiService.kt`** — empty shell, endpoints added per Part:

```kotlin
package com.example.mobile.network

import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // endpoints added in Parts 1–9
}
```

### 0-F. Create model classes

**Shared / Customer models** (`model/`):

| File | Fields |
|------|--------|
| `AuthRequest.kt` | `email: String, password: String` |
| `RegisterRequest.kt` | `name: String, email: String, password: String` |
| `AuthResponse.kt` | `token: String, userId: Long, name: String, email: String, role: String` |
| `Product.kt` | `id: Long, name: String, description: String, price: Double, imageUrl: String?, category: String, stock: Int` |
| `PagedResponse.kt` | `content: List<T>, totalPages: Int, totalElements: Long, currentPage: Int` |
| `CartItemRequest.kt` | `productId: Long, quantity: Int` |
| `CartItem.kt` | `id: Long, product: Product, quantity: Int` |
| `Cart.kt` | `id: Long, items: List<CartItem>, totalPrice: Double` |
| `Order.kt` | `id: Long, status: String, totalAmount: Double, deliveryFee: Double?, createdAt: String, items: List<OrderItem>` |
| `OrderItem.kt` | `id: Long, product: Product, quantity: Int, price: Double` |
| `MessageResponse.kt` | `message: String` |

**Admin-only models** (`model/`):

| File | Fields |
|------|--------|
| `ProductRequest.kt` | `name: String, description: String, price: Double, category: String, stock: Int, imageUrl: String?` |
| `UpdateOrderStatusRequest.kt` | `status: String` |

> **Verify all field names** against actual backend JSON before finalising.

### 0-G. Update `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />

<!-- SplashActivity is the launcher -->
<activity android:name=".auth.ui.SplashActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<activity android:name=".auth.ui.LoginActivity" />
<activity android:name=".auth.ui.RegisterActivity" />

<!-- Customer host -->
<activity android:name=".MainActivity" />

<!-- Customer sub-screens -->
<activity android:name=".orders.ui.OrderDetailActivity" />

<!-- Admin host -->
<activity android:name=".admin.ui.AdminActivity" />

<!-- Admin sub-screens -->
<activity android:name=".admin.ui.AdminAddEditProductActivity" />
<activity android:name=".admin.ui.AdminOrderDetailActivity" />
```

### 0-H. Checkpoint

> Run `/diagnose` — must compile clean before proceeding.

---

## Part 1 — Auth screens

**Screens:** `SplashActivity`, `LoginActivity`, `RegisterActivity`

### 1-A. Scaffold

```
/scaffold Splash activity
/scaffold Login activity
/scaffold Register activity
```

### 1-B. Implement `AuthRepository`

Add to `ApiService.kt`:

```kotlin
@POST("auth/login")
suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

@POST("auth/register")
suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
```

### 1-C. Implement `SplashActivity` — role-based routing

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val session = SessionManager(this)
    val intent = when {
        !session.isLoggedIn() -> Intent(this, LoginActivity::class.java)
        session.isAdmin()     -> Intent(this, AdminActivity::class.java)
        else                  -> Intent(this, MainActivity::class.java)
    }
    startActivity(intent)
    finish()
}
```

### 1-D. Design `activity_login.xml`

```
[App logo / title]
[Email TextInputLayout]
[Password TextInputLayout]
[LOGIN button — full width, primary]
["Don't have an account? Register →" — clickable TextView]
```

**LoginActivity logic:**
- Validate: non-empty email (format check) + non-empty password
- Disable button + show ProgressBar while in-flight
- On success: `sessionManager.saveToken()` + `saveUser()`, then:
  - `isAdmin()` → `Intent(AdminActivity)` + `finishAffinity()`
  - else → `Intent(MainActivity)` + `finishAffinity()`
- On error: Snackbar with `response.message()` or `e.localizedMessage`

### 1-E. Design `activity_register.xml`

```
[Back arrow / title "Create Account"]
[Name TextInputLayout]
[Email TextInputLayout]
[Password TextInputLayout]
[REGISTER button — full width]
["Already have an account? Login →"]
```

Same routing logic as Login on success (customers only, no admin self-registration).

### 1-F. Checkpoint

> Run `/diagnose`.  
> Test: register → login as CUSTOMER → lands on MainActivity.  
> Test: login as ADMIN → lands on AdminActivity.

---

## Part 2 — Customer navigation shell (MainActivity)

> **No `/scaffold`** — this is the host, not a feature slice.

### 2-A. Design `activity_main.xml`

```xml
<LinearLayout vertical>
  <FrameLayout android:id="@+id/fragmentContainer" layout_weight="1" />
  <BottomNavigationView android:id="@+id/bottomNav" app:menu="@menu/customer_nav_menu" />
</LinearLayout>
```

### 2-B. Create `res/menu/customer_nav_menu.xml`

```xml
<menu>
  <item android:id="@+id/nav_home"    android:icon="@drawable/ic_home"    android:title="Menu" />
  <item android:id="@+id/nav_cart"    android:icon="@drawable/ic_cart"    android:title="Cart" />
  <item android:id="@+id/nav_orders"  android:icon="@drawable/ic_orders"  android:title="Orders" />
  <item android:id="@+id/nav_profile" android:icon="@drawable/ic_person"  android:title="Profile" />
</menu>
```

Add icons via **File → New → Vector Asset** in Android Studio.

### 2-C. Implement `MainActivity.kt`

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        if (savedInstanceState == null) loadFragment(HomeFragment())
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home    -> loadFragment(HomeFragment())
                R.id.nav_cart    -> loadFragment(CartFragment())
                R.id.nav_orders  -> loadFragment(OrdersFragment())
                R.id.nav_profile -> loadFragment(ProfileFragment())
            }
            true
        }
    }

    private fun loadFragment(f: Fragment) =
        supportFragmentManager.beginTransaction().replace(R.id.fragmentContainer, f).commit()
}
```

### 2-D. Checkpoint

> Run `/diagnose`.  
> Verify BottomNav switches fragments without crashing.

---

## Part 3 — Home / Product catalog (Customer)

### 3-A. Scaffold

```
/scaffold ProductList fragment
```

Treat `ProductListFragment` as `HomeFragment` — load it in `MainActivity` for `nav_home`.

### 3-B. Add to `ApiService.kt`

```kotlin
@GET("products")
suspend fun getProducts(
    @Query("page")     page: Int = 0,
    @Query("size")     size: Int = 20,
    @Query("search")   search: String? = null,
    @Query("category") category: String? = null
): Response<PagedResponse<Product>>
```

### 3-C. Implement `HomeViewModel`

LiveData: `products: List<Product>`, `isLoading`, `error`  
Functions: `loadProducts(search: String? = null)`

### 3-D. Design `fragment_product_list.xml`

```
[SearchView — top]
[RecyclerView — 2-column grid]
[ProgressBar — centered, gone by default]
[TextView "No products found." — visible when empty]
```

### 3-E. Create `ProductAdapter.kt`

`RecyclerView.Adapter` with `DiffUtil.ItemCallback<Product>`.

**`item_product.xml`:**

```
[CardView]
  [ImageView — Glide, aspect ratio 4:3]
  [TextView — name, bold]
  [TextView — ₱X.XX]
  [Button "Add to Cart" — primary color]
```

### 3-F. Checkpoint

> Run `/diagnose`.  
> Test: product list loads, search filters results, Glide loads images.

---

## Part 4 — Cart (Customer)

### 4-A. Scaffold

```
/scaffold Cart fragment
```

### 4-B. Add to `ApiService.kt`

```kotlin
@GET("cart")
suspend fun getCart(): Response<Cart>

@POST("cart/items")
suspend fun addToCart(@Body req: CartItemRequest): Response<Cart>

@PUT("cart/items/{itemId}")
suspend fun updateCartItem(@Path("itemId") id: Long, @Body req: CartItemRequest): Response<Cart>

@DELETE("cart/items/{itemId}")
suspend fun removeCartItem(@Path("itemId") id: Long): Response<Cart>

@DELETE("cart")
suspend fun clearCart(): Response<MessageResponse>

@POST("orders")
suspend fun placeOrder(): Response<Order>
```

### 4-C. Implement `CartViewModel`

LiveData: `cart: Cart?`, `isLoading`, `error`, `orderPlaced: Boolean`  
Functions: `loadCart()`, `addItem(productId, qty)`, `updateItem(itemId, qty)`, `removeItem(itemId)`, `placeOrder()`

### 4-D. Design `fragment_cart.xml`

```
[RecyclerView — cart items]
[Divider]
[TextView "Total: ₱X.XX" — right-aligned]
[Button "Place Order" — full width, primary]
[TextView "Your cart is empty." — centered, visible when list is empty]
```

### 4-E. Create `CartItemAdapter.kt`

**`item_cart.xml`:**

```
[CardView]
  [ImageView — product thumbnail (Glide)]
  [TextView — product name]
  [TextView — unit price]
  [Row: Button "−" | TextView qty | Button "+"]
  [ImageButton "×" — top-right, removes item]
```

### 4-F. Checkpoint

> Run `/diagnose`.  
> Test: add from Home → view in Cart → change quantity → place order → navigates to Orders.

---

## Part 5 — Orders (Customer)

### 5-A. Scaffold

```
/scaffold Orders fragment
/scaffold OrderDetail activity
```

### 5-B. Add to `ApiService.kt`

```kotlin
@GET("orders")
suspend fun getOrders(): Response<List<Order>>

@GET("orders/{id}")
suspend fun getOrderDetail(@Path("id") id: Long): Response<Order>
```

### 5-C. Implement `OrdersViewModel`

LiveData: `orders: List<Order>`, `isLoading`, `error`  
Function: `loadOrders()`

### 5-D. Design `fragment_orders.xml`

```
[SwipeRefreshLayout wrapping:]
  [RecyclerView — order list]
  [TextView "No orders yet." — visible when empty]
[ProgressBar — while loading]
```

### 5-E. Create `OrderAdapter.kt`

**`item_order.xml`:**

```
[CardView — full width, clickable]
  [TextView — "Order #<id>"]
  [TextView — formatted date]
  [Chip — status badge (color coded)]
  [TextView — "Total: ₱X.XX"]
```

Status badge colors (reuse `@color/status_*` from `colors.xml`):

| Status | Color |
|--------|-------|
| PENDING | `status_pending` (#FFA726) |
| CONFIRMED / PREPARING | `status_active` (#42A5F5) |
| READY / DELIVERED | `status_done` (#66BB6A) |
| CANCELLED | `status_cancelled` (#EF5350) |

### 5-F. Implement `OrderDetailActivity`

Pass `orderId: Long` via `Intent.putExtra`. Call `getOrderDetail(id)`.

**`activity_order_detail.xml`:**

```
[Toolbar — back button + "Order #<id>" title]
[Chip — status badge]
[TextView — date, total]
[RecyclerView — order items (read-only)]
[Divider]
[TextView — "Delivery fee: ₱X.XX" — show when quoted]
[TextView — "Grand Total: ₱X.XX"]
```

### 5-G. Checkpoint

> Run `/diagnose`.  
> Test: order appears after placing it, detail screen opens, status badge colour correct.

---

## Part 6 — Profile (Customer)

### 6-A. Scaffold

```
/scaffold Profile fragment
```

### 6-B. Design `fragment_profile.xml`

```
[CardView]
  [CircleImageView or ImageView — avatar placeholder]
  [TextView — name (bold)]
  [TextView — email]
  [Chip — role badge "Customer"]
[Button "Log Out" — outlined, error color]
```

### 6-C. Implement `ProfileFragment`

Read from `SessionManager` directly — no API call needed.  
Logout: `sessionManager.clearSession()` → `Intent(LoginActivity)` + `finishAffinity()`.

### 6-D. Checkpoint

> Run `/diagnose`.  
> Test: name/email/role display, logout redirects to Login.

---

## Part 7 — Admin navigation shell (AdminActivity)

> **No `/scaffold`** — host activity, same pattern as `MainActivity`.

### 7-A. Design `activity_admin.xml`

```xml
<LinearLayout vertical>
  <FrameLayout android:id="@+id/adminFragmentContainer" layout_weight="1" />
  <BottomNavigationView android:id="@+id/adminBottomNav" app:menu="@menu/admin_nav_menu" />
</LinearLayout>
```

### 7-B. Create `res/menu/admin_nav_menu.xml`

```xml
<menu>
  <item android:id="@+id/nav_admin_dashboard" android:icon="@drawable/ic_dashboard" android:title="Dashboard" />
  <item android:id="@+id/nav_admin_products"  android:icon="@drawable/ic_inventory"  android:title="Products" />
  <item android:id="@+id/nav_admin_orders"    android:icon="@drawable/ic_orders"     android:title="Orders" />
</menu>
```

### 7-C. Implement `AdminActivity.kt`

Same pattern as `MainActivity` — `loadFragment()` + `BottomNavigationView`.  
Default tab: `AdminDashboardFragment`.

Include a "Switch to Customer View" option in the overflow menu (optional — useful for testing).

### 7-D. Checkpoint

> Run `/diagnose`.  
> Test: login as ADMIN → AdminActivity loads with 3-tab BottomNav.

---

## Part 8 — Admin Dashboard

### 8-A. Scaffold

```
/scaffold AdminDashboard fragment
```

### 8-B. Dashboard design

There is no dedicated `/admin/dashboard` endpoint — derive stats from the orders list.  
Call `GET /admin/orders` once on load; compute counts client-side.

**`fragment_admin_dashboard.xml`:**

```
[Toolbar — "Dashboard" title]
[ScrollView]
  [Row of 4 stat cards:]
    [CardView — "Pending" count, orange]
    [CardView — "Preparing" count, blue]
    [CardView — "Ready" count, green]
    [CardView — "Today's Orders" count, primary]
  [TextView — "Recent Orders" section header]
  [RecyclerView — last 5 orders, non-scrolling]
```

### 8-C. Implement `AdminDashboardViewModel`

Add to `ApiService.kt`:

```kotlin
@GET("admin/orders")
suspend fun getAdminOrders(
    @Query("status") status: String? = null,
    @Query("page")   page: Int = 0,
    @Query("size")   size: Int = 50
): Response<List<Order>>
```

LiveData: `stats: DashboardStats?`, `recentOrders: List<Order>`, `isLoading`, `error`

```kotlin
data class DashboardStats(
    val pending: Int,
    val confirmed: Int,
    val preparing: Int,
    val ready: Int,
    val delivered: Int,
    val cancelled: Int
)
```

Compute stats by filtering `orders.groupBy { it.status }`.

### 8-D. Checkpoint

> Run `/diagnose`.  
> Test: stat cards show correct counts matching backend data.

---

## Part 9 — Admin Products (CRUD)

### 9-A. Scaffold

```
/scaffold AdminProducts fragment
/scaffold AdminAddEditProduct activity
```

### 9-B. Add to `ApiService.kt`

```kotlin
// Read (shared with customer — already added in Part 3)
@GET("admin/products")
suspend fun getAdminProducts(
    @Query("page") page: Int = 0,
    @Query("size") size: Int = 20
): Response<Map<String, Any>>   // returns {content, totalPages, totalElements, currentPage}

// Create
@POST("admin/products")
suspend fun createProduct(@Body req: ProductRequest): Response<Product>

// Update
@PUT("admin/products/{id}")
suspend fun updateProduct(@Path("id") id: Long, @Body req: ProductRequest): Response<Product>

// Delete
@DELETE("admin/products/{id}")
suspend fun deleteProduct(@Path("id") id: Long): Response<Void>

// Image upload (multipart)
@Multipart
@POST("admin/products/upload-image")
suspend fun uploadProductImage(@Part image: MultipartBody.Part): Response<Map<String, String>>
```

Add `okhttp3.MultipartBody` import — already available via the OkHttp dependency.

### 9-C. Implement `AdminProductRepository` + `AdminProductsViewModel`

ViewModel LiveData: `products: List<Product>`, `isLoading`, `error`, `deleteSuccess: Boolean`  
Functions: `loadProducts()`, `deleteProduct(id)`, `refresh()`

### 9-D. Design `fragment_admin_products.xml`

```
[Toolbar — "Products" title + FAB or toolbar icon "Add Product"]
[RecyclerView — product list]
[ProgressBar — while loading]
[TextView "No products." — empty state]
[FloatingActionButton + — bottom right, opens AdminAddEditProductActivity]
```

### 9-E. Create `AdminProductAdapter.kt`

**`item_admin_product.xml`:**

```
[CardView]
  [ImageView — product image (Glide)]
  [Column:]
    [TextView — product name, bold]
    [TextView — category · stock: N]
    [TextView — ₱X.XX]
  [Row of icon buttons — right side:]
    [Edit icon → AdminAddEditProductActivity with product id]
    [Delete icon → AlertDialog confirm → viewModel.deleteProduct(id)]
```

### 9-F. Implement `AdminAddEditProductActivity`

Receives optional `productId: Long` via Intent (`-1` = create mode, `>0` = edit mode).

**`activity_admin_add_edit_product.xml`:**

```
[Toolbar — "Add Product" / "Edit Product" + Save icon]
[ScrollView]
  [ImageView — product image preview (Glide if editing)]
  [Button "Choose Image" — launches image picker]
  [TextInputLayout — Name]
  [TextInputLayout — Description (multiline)]
  [TextInputLayout — Price (number, decimal)]
  [TextInputLayout — Category]
  [TextInputLayout — Stock (number)]
[ProgressBar — while uploading / saving]
```

**Flow:**
1. If edit mode: pre-fill fields from `getProductById()` or pass `Product` as JSON via Intent
2. "Choose Image": `Intent(Intent.ACTION_GET_CONTENT)` with `type = "image/*"` → `ActivityResultLauncher`
3. On image picked: call `uploadProductImage()` → get back `url` → store locally
4. On Save:
   - Validate all required fields
   - If new image was picked: upload first, then use returned URL
   - Call `createProduct()` or `updateProduct()` depending on mode
   - On success: `setResult(RESULT_OK)` + `finish()`

### 9-G. Checkpoint

> Run `/diagnose`.  
> Test: list loads, add product, edit product, delete product (with confirm dialog), image upload.

---

## Part 10 — Admin Orders

### 10-A. Scaffold

```
/scaffold AdminOrders fragment
/scaffold AdminOrderDetail activity
```

### 10-B. Implement `AdminOrdersViewModel`

Reuse `ApiService.getAdminOrders()` (added in Part 8).

LiveData: `orders: List<Order>`, `filteredOrders: List<Order>`, `isLoading`, `error`  
Functions: `loadOrders()`, `filterByStatus(status: String?)`

### 10-C. Design `fragment_admin_orders.xml`

```
[Toolbar — "Orders" title]
[HorizontalScrollView — status filter chips]
  [Chip "All"] [Chip "PENDING"] [Chip "CONFIRMED"] [Chip "PREPARING"] [Chip "READY"] [Chip "DELIVERED"] [Chip "CANCELLED"]
[SwipeRefreshLayout]
  [RecyclerView — order list]
  [TextView "No orders." — empty state]
[ProgressBar]
```

Status chips filter the local list — no extra API call needed after initial load.

### 10-D. Create `AdminOrderAdapter.kt`

Same `item_order.xml` reused from Part 5, or create `item_admin_order.xml` with an
additional customer name field if the Order model includes it.

### 10-E. Implement `AdminOrderDetailActivity`

Receives `orderId: Long` via Intent.

**`activity_admin_order_detail.xml`:**

```
[Toolbar — back + "Order #<id>"]
[ScrollView]
  [CardView — Order info]
    [TextView — Customer name + email]
    [TextView — Date]
    [Chip — current status (colored)]
    [TextView — Delivery address (if present)]
  [CardView — Order items]
    [RecyclerView — items (read-only, non-scrolling inside ScrollView)]
  [CardView — Financials]
    [TextView — Subtotal: ₱X.XX]
    [Row: TextInputLayout "Delivery fee" | Button "Quote"]
    [TextView — Total: ₱X.XX]
  [CardView — Status update]
    [TextView — "Update status to:"]
    [Row of status Buttons — only valid next transitions shown]
```

### 10-F. Add to `ApiService.kt`

```kotlin
@GET("admin/orders/{id}")
suspend fun getAdminOrderDetail(@Path("id") id: Long): Response<Order>

@PUT("admin/orders/{id}/status")
suspend fun updateOrderStatus(
    @Path("id") id: Long,
    @Body req: UpdateOrderStatusRequest
): Response<Order>

@PUT("admin/orders/{id}/delivery-fee")
suspend fun quoteDeliveryFee(
    @Path("id") id: Long,
    @Query("fee") fee: Double
): Response<Order>
```

### 10-G. Implement `AdminOrderDetailViewModel`

LiveData: `order: Order?`, `isLoading`, `error`, `updateSuccess: Boolean`  
Functions: `loadOrder(id)`, `updateStatus(id, status)`, `quoteDeliveryFee(id, fee)`

### 10-H. Status transition rules

Only show buttons for valid transitions (mirrors the backend state machine):

| Current status | Allowed next statuses |
|----------------|-----------------------|
| PENDING | CONFIRMED, CANCELLED |
| CONFIRMED | PREPARING, CANCELLED |
| PREPARING | READY, CANCELLED |
| READY | DELIVERED |
| DELIVERED | _(none)_ |
| CANCELLED | _(none)_ |

Implement as a `fun allowedTransitions(currentStatus: String): List<String>` helper in the
ViewModel or a `OrderStatusHelper` util class.

### 10-I. Checkpoint

> Run `/diagnose`.  
> Test: order list loads, status filter chips work, detail opens, status update succeeds, delivery fee quote saves.

---

## Part 11 — Polish & hardening

### 11-A. UX checklist (manual — per screen)

For **every** screen:

- [ ] Loading spinner shown while API call is in-flight
- [ ] Button/FAB disabled while loading (no double-submit)
- [ ] Error shown as Snackbar/Toast with readable message (not raw JSON / stack trace)
- [ ] Empty state shown when list is empty (not blank screen)
- [ ] Network error (`IOException`) caught and shown to user
- [ ] Pull-to-refresh on all lists (`SwipeRefreshLayout`)
- [ ] Back navigation works correctly in all Activities
- [ ] Destructive actions (delete product, cancel order) require confirmation dialog

Admin-specific:
- [ ] "Add Product" FAB hidden while loading
- [ ] Status update buttons disabled while request is in-flight
- [ ] Image upload shows progress before navigating away

### 11-B. Security review

> Run `/security-review`

Key points for mobile:
- JWT stored in `SharedPreferences(MODE_PRIVATE)` only
- `HttpLoggingInterceptor` disabled (or set to `NONE`) in release builds
- No credentials hardcoded in source
- `INTERNET` is the only permission
- Session cleared on `401` response (add response interceptor)

### 11-C. Session expiry — response interceptor

```kotlin
// In RetrofitClient.kt, add after AuthInterceptor:
.addInterceptor { chain ->
    val response = chain.proceed(chain.request())
    if (response.code == 401) {
        sessionManager.clearSession()
        // post an event/broadcast to redirect to LoginActivity
    }
    response
}
```

### 11-D. Image loading fallback (all Glide calls)

```kotlin
Glide.with(context)
    .load(product.imageUrl)
    .placeholder(R.drawable.ic_cookie_placeholder)
    .error(R.drawable.ic_cookie_placeholder)
    .centerCrop()
    .into(imageView)
```

### 11-E. Final review

> Run `/review` before merging to `main`

---

## Part 12 — Final PR

1. Run `/diagnose` — zero errors
2. Run `/security-review` — no JWT leaks, no hardcoded credentials
3. Run `/review` — approve diff
4. Commit all mobile files
5. Push and open PR targeting `main`

---

## Suggested additions (stretch goals)

| Feature | Effort | Skill / notes |
|---------|--------|---------------|
| Product detail screen | Low | `/scaffold ProductDetail activity` |
| Search with debounce (300ms) | Low | `TextWatcher` + `Handler.postDelayed` in HomeFragment |
| Order cancel button for PENDING | Low | `DELETE /orders/{id}` + button in OrderDetailActivity |
| In-app notifications | Medium | Poll `GET /notifications` on resume; badge on BottomNav |
| Admin sales chart | Medium | Add MPAndroidChart dep; group orders by date |
| Google OAuth login | Medium | `CustomTabsIntent` + deep-link callback Activity |
| Room offline cache | High | Local DB as cache layer behind all Repositories |
| Dark mode | Low | `DayNight` theme already handles it; verify colors |
| ProGuard / R8 release build | Low | `isMinifyEnabled = true` + Retrofit/Gson keep rules |

---

## File creation order summary

```
Part 0   — gradle deps, SessionManager, RetrofitClient, AuthInterceptor, ApiService (empty), models
Part 1   — /scaffold Splash  → /scaffold Login  → /scaffold Register
           → role-based routing (ADMIN → AdminActivity, CUSTOMER → MainActivity)
Part 2   — MainActivity + customer_nav_menu.xml
Part 3   — /scaffold ProductList fragment → ProductAdapter + item_product.xml
Part 4   — /scaffold Cart fragment → CartItemAdapter + item_cart.xml
Part 5   — /scaffold Orders fragment + /scaffold OrderDetail activity
           → OrderAdapter + item_order.xml
Part 6   — /scaffold Profile fragment
Part 7   — AdminActivity + admin_nav_menu.xml
Part 8   — /scaffold AdminDashboard fragment → stat cards + recent orders
Part 9   — /scaffold AdminProducts fragment + /scaffold AdminAddEditProduct activity
           → AdminProductAdapter + item_admin_product.xml + image upload
Part 10  — /scaffold AdminOrders fragment + /scaffold AdminOrderDetail activity
           → status filter chips + status transition buttons + delivery fee quoting
Part 11  — polish: empty states, pull-to-refresh, session expiry, error handling
Part 12  — /security-review → /review → PR
```

---

## Estimated time

| Part | What | Time |
|------|------|------|
| 0 — Foundation | Gradle, network layer, models | 1.5 h |
| 1 — Auth | Splash + Login + Register + routing | 1.5 h |
| 2 — Customer nav shell | MainActivity + BottomNav | 30 min |
| 3 — Home / Products | Product list + adapter | 1.5 h |
| 4 — Cart | Cart + adapter + place order | 1.5 h |
| 5 — Orders | Order list + detail | 1.5 h |
| 6 — Profile | Profile + logout | 30 min |
| 7 — Admin nav shell | AdminActivity + BottomNav | 30 min |
| 8 — Admin Dashboard | Stats + recent orders | 1 h |
| 9 — Admin Products | CRUD + image upload | 2.5 h |
| 10 — Admin Orders | All orders + status machine + delivery fee | 2 h |
| 11 — Polish | UX hardening, session expiry | 1 h |
| 12 — Final PR | Review + PR | 30 min |
| **Total** | | **~16 hours** |

`/scaffold` is called **12 times** across all parts, saving approximately **7 hours**
of boilerplate compared to writing from scratch.
