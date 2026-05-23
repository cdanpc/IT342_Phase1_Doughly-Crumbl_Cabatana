package com.example.mobile.orders.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.cart.data.CartRepository
import com.example.mobile.model.Order
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.orders.data.OrderRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

class OrderDetailViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = OrderRepository(sessionManager)
    private val cartRepository = CartRepository(sessionManager)

    private val _order = MutableLiveData<Order>()
    val order: LiveData<Order> = _order

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _cancelSuccess = MutableLiveData<Boolean>()
    val cancelSuccess: LiveData<Boolean> = _cancelSuccess

    private val _reorderResult = MutableLiveData<String?>()
    val reorderResult: LiveData<String?> = _reorderResult

    private val _paymentSubmitted = MutableLiveData<Boolean>()
    val paymentSubmitted: LiveData<Boolean> = _paymentSubmitted

    fun loadOrder(id: Long) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.getOrderDetail(id)
                if (r.isSuccessful) _order.value = r.body()
                else _error.value = ApiErrorParser.message(r, "Failed to load order")
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun reorder(order: Order) {
        val items = order.items.filter { it.productId != null }
        if (items.isEmpty()) {
            _reorderResult.value = "error:No items could be re-added — products may no longer be available."
            return
        }
        viewModelScope.launch {
            _isLoading.value = true
            try {
                var addedCount = 0
                items.forEach { item ->
                    val productId = item.productId ?: return@forEach
                    val r = cartRepository.addToCart(productId, item.quantity)
                    if (r.isSuccessful) addedCount++
                }
                _reorderResult.value = if (addedCount > 0) {
                    "success:$addedCount"
                } else {
                    "error:No items could be re-added."
                }
            } catch (e: Exception) {
                _reorderResult.value = "error:Failed to add items to cart."
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun cancelOrder(id: Long, reason: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.cancelOrder(id, reason)
                if (r.isSuccessful) {
                    _order.value = r.body()
                    _cancelSuccess.value = true
                } else {
                    _error.value = ApiErrorParser.message(r, "Could not cancel order")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun submitPayment(id: Long, proof: MultipartBody.Part) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.submitPayment(id, proof)
                if (r.isSuccessful) {
                    _order.value = r.body()
                    _paymentSubmitted.value = true
                } else {
                    _error.value = ApiErrorParser.message(r, "Could not submit payment proof")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class OrderDetailViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(OrderDetailViewModel::class.java))
            return OrderDetailViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
