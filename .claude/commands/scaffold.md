# /scaffold — MVVM Feature Slice Generator

Generate a complete Android MVVM slice for one feature: ViewModel + ViewModelFactory +
Repository + Activity/Fragment (view binding) + XML layout stub.

Saves 30–45 min of boilerplate per screen.

---

## Usage

```
/scaffold <FeatureName> [activity|fragment]
```

**Examples:**
- `/scaffold Login activity` → LoginActivity + LoginViewModel + AuthRepository + `activity_login.xml`
- `/scaffold Cart fragment`  → CartFragment + CartViewModel + CartRepository + `fragment_cart.xml`
- `/scaffold ProductList fragment` → HomeFragment + HomeViewModel + ProductRepository + `fragment_product_list.xml`

If screen type is omitted, default to `fragment`.

---

## Step 0 — Prerequisites check

Before generating anything, verify these exist. If any are missing, print a warning but
continue generating the slice anyway (the developer will wire them up later).

- `mobile/app/build.gradle.kts` — must have `viewBinding = true` under `buildFeatures`
- `mobile/app/src/main/java/com/example/mobile/util/SessionManager.kt`
- `mobile/app/src/main/java/com/example/mobile/network/RetrofitClient.kt`
- `mobile/app/src/main/java/com/example/mobile/network/ApiService.kt`

---

## Step 1 — Derive names from the feature arg

Given `<FeatureName>` (PascalCase), compute:

| Variable          | Rule                                          | Example input `ProductList` |
|-------------------|-----------------------------------------------|-----------------------------|
| `FeatureName`     | Input as-is (PascalCase)                      | `ProductList`               |
| `featureName`     | lowerCamelCase of input                       | `productList`               |
| `feature_name`    | snake_case of input                           | `product_list`              |
| `featurePackage`  | Map to package folder (see table below)       | `home`                      |
| `screenType`      | `activity` or `fragment` (arg 2, default fragment) | `fragment`             |
| `bindingClass`    | `Fragment<FeatureName>Binding` or `Activity<FeatureName>Binding` | `FragmentProductListBinding` |
| `layoutFile`      | `fragment_<feature_name>.xml` or `activity_<feature_name>.xml` | `fragment_product_list.xml` |

**Package mapping** (use closest match; default to feature name lowercased):

| Feature name contains…         | featurePackage |
|---------------------------------|----------------|
| Login, Register, Auth           | `auth`         |
| Product, Home, Menu, Catalog    | `home`         |
| Cart                            | `cart`         |
| Order, Orders                   | `orders`       |
| Profile, Account, User          | `profile`      |
| Notification                    | `notification` |
| Anything else                   | `<featureName lowercased>` |

---

## Step 2 — Check what already exists

Read the directory `mobile/app/src/main/java/com/example/mobile/` to see which
packages and files are already present. If the file you are about to create already
exists, skip it and print `⚠️ Already exists — skipped: <path>`.

Also read `mobile/app/src/main/java/com/example/mobile/network/ApiService.kt` if
it exists so you know what endpoints are already defined.

---

## Step 3 — Generate the Repository

**Path:** `mobile/app/src/main/java/com/example/mobile/<featurePackage>/data/<FeatureName>Repository.kt`

```kotlin
package com.example.mobile.<featurePackage>.data

import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager

class <FeatureName>Repository(private val sessionManager: SessionManager) {

    private val api: ApiService =
        RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    // TODO: add suspend fun methods that call api.*
    // Example:
    // suspend fun getAll() = api.get<FeatureName>s()
}
```

---

## Step 4 — Generate the ViewModel + ViewModelFactory (same file)

**Path:** `mobile/app/src/main/java/com/example/mobile/<featurePackage>/ui/<FeatureName>ViewModel.kt`

```kotlin
package com.example.mobile.<featurePackage>.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.<featurePackage>.data.<FeatureName>Repository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class <FeatureName>ViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = <FeatureName>Repository(sessionManager)

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    // TODO: add feature-specific LiveData below
    // Example:
    // private val _items = MutableLiveData<List<SomeModel>>()
    // val items: LiveData<List<SomeModel>> = _items

    // fun load() {
    //     viewModelScope.launch {
    //         _isLoading.value = true
    //         _error.value = null
    //         try {
    //             val res = repository.getAll()
    //             if (res.isSuccessful) _items.value = res.body()
    //             else _error.value = "Error ${res.code()}: ${res.message()}"
    //         } catch (e: Exception) {
    //             _error.value = e.localizedMessage
    //         } finally {
    //             _isLoading.value = false
    //         }
    //     }
    // }
}

class <FeatureName>ViewModelFactory(
    private val sessionManager: SessionManager
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(<FeatureName>ViewModel::class.java))
            return <FeatureName>ViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
```

---

## Step 5 — Generate the Activity or Fragment

### 5a — If `screenType == fragment`

**Path:** `mobile/app/src/main/java/com/example/mobile/<featurePackage>/ui/<FeatureName>Fragment.kt`

```kotlin
package com.example.mobile.<featurePackage>.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.databinding.Fragment<FeatureName>Binding
import com.example.mobile.util.SessionManager

class <FeatureName>Fragment : Fragment() {

    private var _binding: Fragment<FeatureName>Binding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: <FeatureName>ViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = Fragment<FeatureName>Binding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val factory = <FeatureName>ViewModelFactory(SessionManager(requireContext()))
        viewModel = ViewModelProvider(this, factory)[<FeatureName>ViewModel::class.java]
        observeViewModel()
        setupListeners()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
        }
        // TODO: observe feature-specific LiveData here
    }

    private fun setupListeners() {
        // TODO: wire up button clicks and interactions
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### 5b — If `screenType == activity`

**Path:** `mobile/app/src/main/java/com/example/mobile/<featurePackage>/ui/<FeatureName>Activity.kt`

```kotlin
package com.example.mobile.<featurePackage>.ui

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.databinding.Activity<FeatureName>Binding
import com.example.mobile.util.SessionManager

class <FeatureName>Activity : AppCompatActivity() {

    private lateinit var binding: Activity<FeatureName>Binding
    private lateinit var viewModel: <FeatureName>ViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = Activity<FeatureName>Binding.inflate(layoutInflater)
        setContentView(binding.root)
        val factory = <FeatureName>ViewModelFactory(SessionManager(this))
        viewModel = ViewModelProvider(this, factory)[<FeatureName>ViewModel::class.java]
        observeViewModel()
        setupListeners()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }
        // TODO: observe feature-specific LiveData here
    }

    private fun setupListeners() {
        // TODO: wire up button clicks and interactions
    }
}
```

---

## Step 6 — Generate the XML layout stub

### If fragment: `mobile/app/src/main/res/layout/fragment_<feature_name>.xml`
### If activity: `mobile/app/src/main/res/layout/activity_<feature_name>.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background">

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <!-- TODO: add <FeatureName> UI here -->

</androidx.constraintlayout.widget.ConstraintLayout>
```

---

## Step 7 — Add API endpoint stub to ApiService.kt

If `ApiService.kt` exists, append a comment block inside the interface body for the new
feature's expected endpoints. Do NOT duplicate if it already has a matching comment.

```kotlin
    // --- <FeatureName> ---
    // TODO: define Retrofit @GET/@POST/@PUT/@DELETE methods here
    // Example:
    // @GET("<feature_name>s")
    // suspend fun get<FeatureName>s(): Response<List<<FeatureName>Response>>
```

---

## Step 8 — Print a summary

After all files are written, print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/scaffold — <FeatureName> slice created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files written:
  ✅ .../<featurePackage>/data/<FeatureName>Repository.kt
  ✅ .../<featurePackage>/ui/<FeatureName>ViewModel.kt
  ✅ .../<featurePackage>/ui/<FeatureName>[Activity|Fragment].kt
  ✅ .../res/layout/[activity|fragment]_<feature_name>.xml

Files updated:
  ✅ .../network/ApiService.kt  (endpoint stub appended)

Skipped (already existed):
  ⚠️  <list any skipped files here, or "none">

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next steps:
  1. Add your LiveData + load() to <FeatureName>ViewModel
  2. Implement suspend funs in <FeatureName>Repository
  3. Define the real endpoint in ApiService.kt
  4. Fill in the XML layout (fragment_<feature_name>.xml)
  5. If Activity: register it in AndroidManifest.xml
  6. If Fragment: add it to MainActivity's bottom nav / back stack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Project context

- **Package root:** `com.example.mobile`
- **Source root:** `mobile/app/src/main/java/com/example/mobile/`
- **Layout root:** `mobile/app/src/main/res/layout/`
- **Auth:** JWT token stored via `SessionManager`, injected into `RetrofitClient` via `AuthInterceptor`
- **Backend base URL:** configurable in `RetrofitClient.kt` (emulator default: `http://10.0.2.2:8080/api/`)
- **ViewBinding:** enabled — binding class name derived from layout filename (snake_case → PascalCase + Binding)
- **No Jetpack Compose** — all UI is XML layouts + ViewBinding
- **Coroutines** — use `viewModelScope.launch { }` in ViewModel; repository funs are `suspend`
