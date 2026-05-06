package com.example.mobile.profile.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.orders.data.OrderRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class ProfileViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val orderRepository = OrderRepository(sessionManager)

    val name: String get() = sessionManager.getName() ?: ""
    val email: String get() = sessionManager.getEmail() ?: ""

    private val _stats = MutableLiveData(Triple(0, 0, 0))
    val stats: LiveData<Triple<Int, Int, Int>> = _stats

    fun loadStats() {
        viewModelScope.launch {
            try {
                val r = orderRepository.getOrders()
                if (r.isSuccessful) {
                    val orders = r.body() ?: emptyList()
                    val total = orders.size
                    val completed = orders.count { it.status == "COMPLETED" }
                    val cancelled = orders.count { it.status == "CANCELLED" }
                    _stats.value = Triple(total, completed, cancelled)
                }
            } catch (e: Exception) { /* stats are best-effort */ }
        }
    }
}

class ProfileViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProfileViewModel::class.java))
            return ProfileViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
