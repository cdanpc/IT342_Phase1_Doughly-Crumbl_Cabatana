package com.example.mobile.auth.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.auth.data.AuthRepository
import com.example.mobile.model.AuthResponse
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class LoginViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = AuthRepository(sessionManager)

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _authResponse = MutableLiveData<AuthResponse?>()
    val authResponse: LiveData<AuthResponse?> = _authResponse

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = repository.login(email, password)
                val body = response.body()
                if (response.isSuccessful && body != null) {
                    sessionManager.saveToken(body.token)
                    sessionManager.saveUser(body.userId, body.name, body.email, body.role)
                    _authResponse.value = body
                } else {
                    _error.value = ApiErrorParser.message(response, "Login failed. Please try again.")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class LoginViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoginViewModel::class.java))
            return LoginViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
