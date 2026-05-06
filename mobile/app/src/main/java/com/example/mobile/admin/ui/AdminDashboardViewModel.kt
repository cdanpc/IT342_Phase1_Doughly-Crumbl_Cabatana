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

data class DashboardStats(
    val pending: Int,
    val confirmed: Int,
    val preparing: Int,
    val ready: Int,
    val delivered: Int,
    val cancelled: Int
)

class AdminDashboardViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private val _stats = MutableLiveData<DashboardStats>()
    val stats: LiveData<DashboardStats> = _stats

    private val _recentOrders = MutableLiveData<List<Order>>()
    val recentOrders: LiveData<List<Order>> = _recentOrders

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun load() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val r = repository.getAllOrders()
                if (r.isSuccessful) {
                    val orders = r.body() ?: emptyList()
                    val grouped = orders.groupBy { it.status }
                    _stats.value = DashboardStats(
                        pending   = grouped["PENDING"]?.size ?: 0,
                        confirmed = grouped["CONFIRMED"]?.size ?: 0,
                        preparing = grouped["PREPARING"]?.size ?: 0,
                        ready     = grouped["READY"]?.size ?: 0,
                        delivered = grouped["DELIVERED"]?.size ?: 0,
                        cancelled = grouped["CANCELLED"]?.size ?: 0
                    )
                    _recentOrders.value = orders.take(5)
                } else {
                    _error.value = "Failed to load dashboard"
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class AdminDashboardViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminDashboardViewModel::class.java))
            return AdminDashboardViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
