package com.example.mobile.cart.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.cart.data.CartRepository
import com.example.mobile.model.Cart
import com.example.mobile.model.CheckoutRequest
import com.example.mobile.model.Order
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class CheckoutViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = CartRepository(sessionManager)

    private val _cart = MutableLiveData<Cart?>()
    val cart: LiveData<Cart?> = _cart

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _orderPlaced = MutableLiveData<Order?>()
    val orderPlaced: LiveData<Order?> = _orderPlaced

    init {
        loadCart()
    }

    fun loadCart() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.getCart()
                if (r.isSuccessful) _cart.value = r.body()
                else _error.value = "Failed to load order summary"
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun placeOrder(request: CheckoutRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.placeOrder(request)
                if (r.isSuccessful) _orderPlaced.value = r.body()
                else _error.value = ApiErrorParser.message(r, "Failed to place order. Please try again.")
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class CheckoutViewModelFactory(private val sessionManager: SessionManager) :
    ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(CheckoutViewModel::class.java))
            return CheckoutViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
