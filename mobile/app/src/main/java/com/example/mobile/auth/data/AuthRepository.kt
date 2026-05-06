package com.example.mobile.auth.data

import com.example.mobile.model.AuthRequest
import com.example.mobile.model.AuthResponse
import com.example.mobile.model.RegisterRequest
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import retrofit2.Response

class AuthRepository(private val sessionManager: SessionManager) {

    private val api: ApiService =
        RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun login(email: String, password: String): Response<AuthResponse> =
        api.login(AuthRequest(email, password))

    suspend fun register(
        name: String,
        email: String,
        password: String,
        phone: String = "",
        address: String = ""
    ): Response<AuthResponse> =
        api.register(RegisterRequest(name, email, password, phone, address))
}
