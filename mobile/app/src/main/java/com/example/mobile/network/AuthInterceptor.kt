package com.example.mobile.network

import android.content.Context
import android.content.Intent
import com.example.mobile.auth.ui.LoginActivity
import com.example.mobile.util.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(
    private val sessionManager: SessionManager,
    private val context: Context
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sessionManager.getToken()
        val request = if (token != null)
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        else chain.request()
        val response = chain.proceed(request)
        if (response.code == 401) {
            sessionManager.clearSession()
            val intent = Intent(context, LoginActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            context.startActivity(intent)
        }
        return response
    }
}
