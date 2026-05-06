package com.example.mobile.orders.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.model.Order
import com.example.mobile.orders.data.OrderRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class OrderDetailViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = OrderRepository(sessionManager)

    private val _order = MutableLiveData<Order>()
    val order: LiveData<Order> = _order

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _cancelSuccess = MutableLiveData<Boolean>()
    val cancelSuccess: LiveData<Boolean> = _cancelSuccess

    fun loadOrder(id: Long) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.getOrderDetail(id)
                if (r.isSuccessful) _order.value = r.body()
                else _error.value = "Failed to load order"
            } catch (e: Exception) {
                _error.value = e.localizedMessage
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
                    _error.value = "Could not cancel order"
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
