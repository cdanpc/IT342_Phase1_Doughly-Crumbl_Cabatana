package com.example.mobile.profile.data

import com.example.mobile.model.DeliveryAddressRequest
import com.example.mobile.model.UpdateCustomerProfileRequest
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager

class ProfileRepository(sessionManager: SessionManager) {
    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun getProfile() = api.getProfile()
    suspend fun updateProfile(request: UpdateCustomerProfileRequest) = api.updateProfile(request)
    suspend fun getAddresses() = api.getDeliveryAddresses()
    suspend fun addAddress(request: DeliveryAddressRequest) = api.addDeliveryAddress(request)
    suspend fun getFavorites() = api.getFavorites()
    suspend fun addFavorite(productId: Long) = api.addFavorite(productId)
    suspend fun removeFavorite(productId: Long) = api.removeFavorite(productId)
}
