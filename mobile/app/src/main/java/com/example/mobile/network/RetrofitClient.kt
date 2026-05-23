package com.example.mobile.network

import android.content.pm.ApplicationInfo
import com.example.mobile.DoughlyApp
import com.example.mobile.util.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // Local WiFi — laptop must be on same network as the phone (192.168.1.52)
    private const val FALLBACK_BASE_URL = "http://10.0.2.2:8080/api/"

    fun getInstance(sessionManager: SessionManager): Retrofit {
        val isDebuggable = DoughlyApp.appContext.applicationInfo.flags and
            ApplicationInfo.FLAG_DEBUGGABLE != 0
        val logging = HttpLoggingInterceptor().apply {
            level = if (isDebuggable) {
                HttpLoggingInterceptor.Level.BASIC
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(ApiHostInterceptor(DoughlyApp.appContext))
            .addInterceptor(AuthInterceptor(sessionManager, DoughlyApp.appContext))
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(FALLBACK_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
