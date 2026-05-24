package com.example.mobile.home.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.DoughlyApp
import com.example.mobile.R
import com.example.mobile.cart.data.CartRepository
import com.example.mobile.home.data.ProductRepository
import com.example.mobile.model.Product
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.profile.data.ProfileRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class HomeViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = ProductRepository(sessionManager)
    private val cartRepository = CartRepository(sessionManager)
    private val profileRepository = ProfileRepository(sessionManager)

    private val _products = MutableLiveData<List<Product>>()
    val products: LiveData<List<Product>> = _products

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _addingProductIds = MutableLiveData<Set<Long>>(emptySet())
    val addingProductIds: LiveData<Set<Long>> = _addingProductIds

    private val _addToCartMessage = MutableLiveData<String?>()
    val addToCartMessage: LiveData<String?> = _addToCartMessage
    private val _favoriteProductIds = MutableLiveData<Set<Long>>(emptySet())
    val favoriteProductIds: LiveData<Set<Long>> = _favoriteProductIds
    private val _pendingFavoriteProductIds = MutableLiveData<Set<Long>>(emptySet())
    val pendingFavoriteProductIds: LiveData<Set<Long>> = _pendingFavoriteProductIds
    private val _favoriteMessage = MutableLiveData<String?>()
    val favoriteMessage: LiveData<String?> = _favoriteMessage

    fun loadProducts(search: String? = null, category: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = repository.getProducts(search = search, category = category)
                if (response.isSuccessful) _products.value = response.body()?.content ?: emptyList()
                else _error.value = DoughlyApp.appContext.getString(R.string.error_load_products)
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: DoughlyApp.appContext.getString(R.string.error_network)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun loadFavorites() {
        viewModelScope.launch {
            try {
                val response = profileRepository.getFavorites()
                if (response.isSuccessful) {
                    _favoriteProductIds.value = response.body().orEmpty().map { it.id }.toSet()
                } else {
                    _error.value = ApiErrorParser.message(response, "Favorites could not be loaded")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Favorites could not be loaded"
            }
        }
    }

    fun toggleFavorite(product: Product) {
        val currentFavorites = _favoriteProductIds.value.orEmpty()
        val pending = _pendingFavoriteProductIds.value.orEmpty()
        if (product.id in pending) return

        viewModelScope.launch {
            _pendingFavoriteProductIds.value = pending + product.id
            try {
                val response = if (product.id in currentFavorites) {
                    profileRepository.removeFavorite(product.id)
                } else {
                    profileRepository.addFavorite(product.id)
                }
                val ctx = DoughlyApp.appContext
                if (response.isSuccessful) {
                    if (product.id in currentFavorites) {
                        _favoriteProductIds.value = currentFavorites - product.id
                        _favoriteMessage.value = ctx.getString(R.string.favorites_removed_format, product.name)
                    } else {
                        _favoriteProductIds.value = currentFavorites + product.id
                        _favoriteMessage.value = ctx.getString(R.string.favorites_added_format, product.name)
                    }
                } else {
                    _error.value = ApiErrorParser.message(response, ctx.getString(R.string.error_update_favorite))
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: DoughlyApp.appContext.getString(R.string.error_update_favorite)
            } finally {
                _pendingFavoriteProductIds.value = _pendingFavoriteProductIds.value.orEmpty() - product.id
            }
        }
    }

    fun addToCart(product: Product, quantity: Int = 1) {
        val current = _addingProductIds.value.orEmpty()
        if (product.id in current) return

        viewModelScope.launch {
            _addingProductIds.value = current + product.id
            try {
                val ctx = DoughlyApp.appContext
                val response = cartRepository.addToCart(product.id, quantity)
                if (response.isSuccessful) {
                    _addToCartMessage.value = ctx.getString(R.string.cart_added_format, product.name)
                } else {
                    _error.value = ApiErrorParser.message(response, ctx.getString(R.string.cart_add_failed_format, product.name))
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: DoughlyApp.appContext.getString(R.string.error_network)
            } finally {
                _addingProductIds.value = _addingProductIds.value.orEmpty() - product.id
            }
        }
    }
}

class HomeViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HomeViewModel::class.java))
            return HomeViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
