package com.example.mobile.admin.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.admin.data.AdminRepository
import com.example.mobile.model.Product
import com.example.mobile.model.ProductRequest
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

class AdminAddEditProductViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = AdminRepository(sessionManager)

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _saveSuccess = MutableLiveData<Product?>()
    val saveSuccess: LiveData<Product?> = _saveSuccess

    private val _uploadedImageUrl = MutableLiveData<String?>()
    val uploadedImageUrl: LiveData<String?> = _uploadedImageUrl

    fun uploadImage(part: MultipartBody.Part) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val r = repository.uploadImage(part)
                if (r.isSuccessful) _uploadedImageUrl.value = r.body()?.get("url")
                else _error.value = ApiErrorParser.message(r, "Image upload failed")
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun save(productId: Long?, req: ProductRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val r = if (productId == null) repository.createProduct(req)
                        else repository.updateProduct(productId, req)
                if (r.isSuccessful) _saveSuccess.value = r.body()
                else _error.value = ApiErrorParser.message(r, "Save failed")
            } catch (e: Exception) {
                _error.value = e.localizedMessage
            } finally {
                _isLoading.value = false
            }
        }
    }
}

class AdminAddEditProductViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminAddEditProductViewModel::class.java))
            return AdminAddEditProductViewModel(sessionManager) as T
        throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
