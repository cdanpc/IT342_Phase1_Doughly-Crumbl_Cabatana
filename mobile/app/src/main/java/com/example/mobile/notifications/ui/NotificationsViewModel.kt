package com.example.mobile.notifications.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.model.Notification
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

    fun load() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.getNotifications()
                if (r.isSuccessful) {
                    val list = r.body() ?: emptyList()
                    _notifications.value = list
                    _isEmpty.value = list.isEmpty()
                } else {
                    _isEmpty.value = true
                }
            } catch (e: Exception) {
                _isEmpty.value = true
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            try {
                repository.markAllRead()
                _notifications.value = _notifications.value?.map { it.copy(isRead = true) }
            } catch (e: Exception) { /* best effort */ }
        }
    }

    fun markRead(id: Long) {
        viewModelScope.launch {
            try {
                repository.markRead(id)
                _notifications.value = _notifications.value?.map {
                    if (it.id == id) it.copy(isRead = true) else it
                }
            } catch (e: Exception) { /* best effort */ }
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
