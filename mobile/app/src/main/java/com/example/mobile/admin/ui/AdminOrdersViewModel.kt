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

class AdminOrdersViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private var allOrders: List<Order> = emptyList()

    private val _orders = MutableLiveData<List<Order>>()
    val orders: LiveData<List<Order>> = _orders

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun loadOrders() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val r = repository.getAllOrders()
                if (r.isSuccessful) {
                    allOrders = r.body() ?: emptyList()
                    _orders.value = allOrders
                } else {
                    _error.value = "Failed to load orders"
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun filterByStatus(status: String?) {
        _orders.value = if (status == null) allOrders
                        else allOrders.filter { it.status == status }
    }
}

class AdminOrdersViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminOrdersViewModel::class.java))
            return AdminOrdersViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
