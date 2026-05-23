package com.example.mobile.network

import android.content.Context
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException

class ApiHostInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val baseUrl = ApiServerDiscovery.currentOrDiscover(context)
        val request = chain.request().withBaseUrl(baseUrl)

        return try {
            chain.proceed(request)
        } catch (e: IOException) {
            ApiServerDiscovery.clearIfMatches(baseUrl)
            val retryBaseUrl = ApiServerDiscovery.discover(context, force = true)
            if (retryBaseUrl == baseUrl) {
                throw e
            }
            chain.proceed(chain.request().withBaseUrl(retryBaseUrl))
        }
    }

    private fun Request.withBaseUrl(baseUrl: String): Request {
        val target = baseUrl.toHttpUrl()
        val newUrl = url.newBuilder()
            .scheme(target.scheme)
            .host(target.host)
            .port(target.port)
            .build()

        return newBuilder()
            .url(newUrl)
            .build()
    }
}
