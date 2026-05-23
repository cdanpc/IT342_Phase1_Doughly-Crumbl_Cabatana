package com.example.mobile.profile.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.mobile.model.CustomerProfile
import com.example.mobile.model.DeliveryAddress
import com.example.mobile.model.DeliveryAddressRequest
import com.example.mobile.model.UpdateCustomerProfileRequest
import com.example.mobile.network.ApiErrorParser
import com.example.mobile.profile.data.ProfileRepository
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.launch

class ProfileViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val repository = ProfileRepository(sessionManager)

    val name: String get() = sessionManager.getName() ?: ""
    val email: String get() = sessionManager.getEmail() ?: ""

    private val _stats = MutableLiveData(Triple(0, 0, 0))
    val stats: LiveData<Triple<Int, Int, Int>> = _stats
    private val _profile = MutableLiveData<CustomerProfile?>()
    val profile: LiveData<CustomerProfile?> = _profile
    private val _addresses = MutableLiveData<List<DeliveryAddress>>()
    val addresses: LiveData<List<DeliveryAddress>> = _addresses
    private val _favoritesCount = MutableLiveData(0)
    val favoritesCount: LiveData<Int> = _favoritesCount
    private val _message = MutableLiveData<String?>()
    val message: LiveData<String?> = _message

    fun loadStats() {
        viewModelScope.launch {
            try {
                val r = repository.getProfile()
                if (r.isSuccessful) {
                    val profile = r.body()
                    _profile.value = profile
                    _stats.value = Triple(
                        profile?.totalOrders ?: 0,
                        profile?.completedOrders ?: 0,
                        profile?.cancelledOrders ?: 0
                    )
                } else {
                    _message.value = ApiErrorParser.message(r, "Failed to load profile")
                }
            } catch (e: Exception) {
                _message.value = e.localizedMessage
            }
        }
    }

    fun loadAddresses() {
        viewModelScope.launch {
            try {
                val r = repository.getAddresses()
                if (r.isSuccessful) _addresses.value = r.body().orEmpty()
                else _message.value = ApiErrorParser.message(r, "Failed to load delivery addresses")
            } catch (e: Exception) {
                _message.value = e.localizedMessage
            }
        }
    }

    fun addAddress(label: String, address: String, defaultAddress: Boolean = false) {
        viewModelScope.launch {
            try {
                val r = repository.addAddress(
                    DeliveryAddressRequest(
                        label = label,
                        address = address,
                        defaultAddress = defaultAddress
                    )
                )
                if (r.isSuccessful) {
                    _message.value = "Delivery address saved"
                    loadAddresses()
                } else {
                    _message.value = ApiErrorParser.message(r, "Failed to save delivery address")
                }
            } catch (e: Exception) {
                _message.value = e.localizedMessage
            }
        }
    }

    fun loadFavoritesCount() {
        viewModelScope.launch {
            try {
                val r = repository.getFavorites()
                if (r.isSuccessful) _favoritesCount.value = r.body().orEmpty().size
                else _message.value = ApiErrorParser.message(r, "Failed to load favorites")
            } catch (e: Exception) {
                _message.value = e.localizedMessage
            }
        }
    }

    fun updateProfile(name: String, email: String, phone: String?, address: String?) {
        viewModelScope.launch {
            try {
                val r = repository.updateProfile(UpdateCustomerProfileRequest(name, email, phone, address))
                if (r.isSuccessful) {
                    val profile = r.body()
                    _profile.value = profile
                    if (profile != null) {
                        sessionManager.saveUser(profile.userId, profile.name, profile.email, sessionManager.getRole() ?: "CUSTOMER")
                    }
                    _message.value = "Profile updated"
                } else {
                    _message.value = ApiErrorParser.message(r, "Failed to update profile")
                }
            } catch (e: Exception) {
                _message.value = e.localizedMessage
            }
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
