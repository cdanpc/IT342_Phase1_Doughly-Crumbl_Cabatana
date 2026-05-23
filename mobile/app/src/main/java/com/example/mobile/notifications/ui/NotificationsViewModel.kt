package com.example.mobile.notifications.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.model.Notification
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.notifications.data.NotificationsRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class NotificationsViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = NotificationsRepository(sessionManager)

    private val _notifications = MutableLiveData<List<Notification>>(emptyList())
    val notifications: LiveData<List<Notification>> = _notifications

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _isEmpty = MutableLiveData(false)
    val isEmpty: LiveData<Boolean> = _isEmpty

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _isUpdating = MutableLiveData(false)
    val isUpdating: LiveData<Boolean> = _isUpdating

    fun load() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val r = repository.getNotifications()
                if (r.isSuccessful) {
                    val list = r.body() ?: emptyList()
                    _notifications.value = list
                    _isEmpty.value = list.isEmpty()
                } else {
                    _error.value = ApiErrorParser.message(r, "Failed to load notifications")
                    _isEmpty.value = true
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
                _isEmpty.value = true
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            _isUpdating.value = true
            _error.value = null
            try {
                val r = repository.markAllRead()
                if (r.isSuccessful) {
                    _notifications.value = _notifications.value?.map { it.copy(isRead = true) }
                } else {
                    _error.value = ApiErrorParser.message(r, "Could not mark notifications as read")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
            } finally {
                _isUpdating.value = false
            }
        }
    }

    fun markRead(id: Long) {
        viewModelScope.launch {
            _error.value = null
            try {
                val r = repository.markRead(id)
                if (r.isSuccessful) {
                    _notifications.value = _notifications.value?.map {
                        if (it.id == id) it.copy(isRead = true) else it
                    }
                } else {
                    _error.value = ApiErrorParser.message(r, "Could not mark notification as read")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
            }
        }
    }
}

class NotificationsViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(NotificationsViewModel::class.java))
            return NotificationsViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
