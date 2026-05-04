package com.example.mobile.admin.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.admin.data.AdminRepository
import com.example.mobile.model.Order
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

object OrderStatusHelper {
    fun allowedTransitions(status: String): List<String> = when (status) {
        "PENDING"   -> listOf("CONFIRMED", "CANCELLED")
        "CONFIRMED" -> listOf("PREPARING", "CANCELLED")
        "PREPARING" -> listOf("READY", "CANCELLED")
        "READY"     -> listOf("DELIVERED")
        else        -> emptyList()
    }
}

class AdminOrderDetailViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private val _order = MutableLiveData<Order>()
    val order: LiveData<Order> = _order

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

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

    fun updateStatus(id: Long, status: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.updateOrderStatus(id, status)
                if (r.isSuccessful) _order.value = r.body()
                else _error.value = "Status update failed"
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun quoteDeliveryFee(id: Long, fee: Double) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.quoteDeliveryFee(id, fee)
                if (r.isSuccessful) _order.value = r.body()
                else _error.value = "Failed to quote delivery fee"
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class AdminOrderDetailViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminOrderDetailViewModel::class.java))
            return AdminOrderDetailViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
