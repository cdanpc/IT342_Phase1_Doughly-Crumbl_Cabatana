package com.example.mobile.admin.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.admin.data.AdminRepository
import com.example.mobile.model.AdminUser
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class AdminUsersViewModel(sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private val _users = MutableLiveData<List<AdminUser>>()
    val users: LiveData<List<AdminUser>> = _users

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _message = MutableLiveData<String?>()
    val message: LiveData<String?> = _message

    fun loadUsers() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = repository.getUsers()
                if (response.isSuccessful) {
                    _users.value = response.body().orEmpty()
                } else {
                    _error.value = ApiErrorParser.message(response, "Failed to load users")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Failed to load users"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun banUser(user: AdminUser) = updateUser(user, UserAction.BAN)
    fun unbanUser(user: AdminUser) = updateUser(user, UserAction.UNBAN)
    fun disableUser(user: AdminUser) = updateUser(user, UserAction.DISABLE)
    fun restoreUser(user: AdminUser) = updateUser(user, UserAction.RESTORE)

    private fun updateUser(user: AdminUser, action: UserAction) {
        viewModelScope.launch {
            if (_isLoading.value == true) return@launch
            _isLoading.value = true
            _error.value = null
            try {
                val response = when (action) {
                    UserAction.BAN -> repository.banUser(user.id)
                    UserAction.UNBAN -> repository.unbanUser(user.id)
                    UserAction.DISABLE -> repository.disableUser(user.id)
                    UserAction.RESTORE -> repository.restoreUser(user.id)
                }
                if (response.isSuccessful) {
                    response.body()?.let { updatedUser ->
                        _users.value = _users.value.orEmpty().map { existing ->
                            if (existing.id == updatedUser.id) updatedUser else existing
                        }
                    }
                    _message.value = action.successMessage
                } else {
                    _error.value = ApiErrorParser.message(response, "Failed to update user")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Failed to update user"
            } finally {
                _isLoading.value = false
            }
        }
    }

    private enum class UserAction(val successMessage: String) {
        BAN("User banned"),
        UNBAN("User unbanned"),
        DISABLE("User removed"),
        RESTORE("User restored")
    }
}

class AdminUsersViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminUsersViewModel::class.java)) {
            return AdminUsersViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
