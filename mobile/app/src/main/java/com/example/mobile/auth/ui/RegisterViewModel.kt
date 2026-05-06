package com.example.mobile.auth.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.auth.data.AuthRepository
import com.example.mobile.model.AuthResponse
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class RegisterViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = AuthRepository(sessionManager)

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _authResponse = MutableLiveData<AuthResponse?>()
    val authResponse: LiveData<AuthResponse?> = _authResponse

    fun register(name: String, email: String, password: String, phone: String, address: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = repository.register(name, email, password, phone, address)
                if (response.isSuccessful) {
                    val body = response.body()!!
                    sessionManager.saveToken(body.token)
                    sessionManager.saveUser(body.userId, body.name, body.email, body.role)
                    _authResponse.value = body
                } else {
                    _error.value = "Registration failed: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class RegisterViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(RegisterViewModel::class.java))
            return RegisterViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
