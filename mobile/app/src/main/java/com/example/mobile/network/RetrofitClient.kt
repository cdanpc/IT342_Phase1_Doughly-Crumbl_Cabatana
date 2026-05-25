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

    private const val FALLBACK_BASE_URL = "https://doughly-crumbl.onrender.com/api/"

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
