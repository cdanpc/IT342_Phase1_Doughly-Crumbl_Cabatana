package com.example.mobile.admin.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.admin.data.AdminRepository
import com.example.mobile.model.Product
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class AdminProductsViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private val _products = MutableLiveData<List<Product>>()
    val products: LiveData<List<Product>> = _products

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _deleteSuccess = MutableLiveData<Boolean>()
    val deleteSuccess: LiveData<Boolean> = _deleteSuccess

    fun loadProducts() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val r = repository.getProducts()
                if (r.isSuccessful) _products.value = r.body()?.content ?: emptyList()
                else _error.value = ApiErrorParser.message(r, "Failed to load products")
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun deleteProduct(id: Long) {
        viewModelScope.launch {
            if (_isLoading.value == true) return@launch
            _isLoading.value = true
            _error.value = null
            try {
                val r = repository.deleteProduct(id)
                if (r.isSuccessful) {
                    _deleteSuccess.value = true
                    loadProducts()
                } else {
                    _error.value = ApiErrorParser.message(r, "Delete failed")
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class AdminProductsViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminProductsViewModel::class.java))
            return AdminProductsViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
