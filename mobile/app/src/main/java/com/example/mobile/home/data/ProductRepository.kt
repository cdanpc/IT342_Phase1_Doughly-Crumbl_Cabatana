package com.example.mobile.home.data

import com.example.mobile.model.PagedResponse
import com.example.mobile.model.Product
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import retrofit2.Response

class ProductRepository(sessionManager: SessionManager) {
    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun getProducts(
        page: Int = 0,
        search: String? = null,
        category: String? = null
    ): Response<PagedResponse<Product>> =
        api.getProducts(page = page, search = search, category = category)
}
