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
    val totalProducts: Int,
    val totalOrders: Int,
    val needsAttention: Int,
    val paymentPending: Int,
    val inProgress: Int,
    val completed: Int,
    val revenue: Double
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
                    val products = repository.getProducts()
                    val grouped = orders.groupBy { it.status }
                    _stats.value = DashboardStats(
                        totalProducts = if (products.isSuccessful) {
                            products.body()?.totalElements?.toInt() ?: 0
                        } else {
                            0
                        },
                        totalOrders = orders.size,
                        needsAttention = countStatuses(
                            grouped,
                            "AWAITING_DELIVERY_QUOTE",
                            "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION"
                        ),
                        paymentPending = countStatuses(grouped, "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED"),
                        inProgress = countStatuses(
                            grouped,
                            "PAYMENT_CONFIRMED",
                            "PREPARING",
                            "OUT_FOR_DELIVERY",
                            "READY"
                        ),
                        completed = countStatuses(grouped, "COMPLETED"),
                        revenue = orders
                            .filter { it.status == "COMPLETED" }
                            .sumOf { it.totalAmount }
                    )
                    _recentOrders.value = orders.sortedByDescending { it.orderDate }.take(8)
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

    private fun countStatuses(grouped: Map<String, List<Order>>, vararg statuses: String): Int =
        statuses.sumOf { grouped[it]?.size ?: 0 }
}

class AdminDashboardViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminDashboardViewModel::class.java))
            return AdminDashboardViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
