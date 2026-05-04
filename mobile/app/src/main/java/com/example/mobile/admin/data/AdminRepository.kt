package com.example.mobile.admin.data

import com.example.mobile.model.Order
import com.example.mobile.model.PagedResponse
import com.example.mobile.model.Product
import com.example.mobile.model.ProductRequest
import com.example.mobile.model.UpdateOrderStatusRequest
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import okhttp3.MultipartBody
import retrofit2.Response

class AdminRepository(sessionManager: SessionManager) {

    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    // Products
    suspend fun getProducts(page: Int = 0): Response<PagedResponse<Product>> =
        api.getAdminProducts(page = page)

    suspend fun createProduct(req: ProductRequest): Response<Product> =
        api.createProduct(req)

    suspend fun updateProduct(id: Long, req: ProductRequest): Response<Product> =
        api.updateProduct(id, req)

    suspend fun deleteProduct(id: Long): Response<Void> =
        api.deleteProduct(id)

    suspend fun uploadImage(part: MultipartBody.Part): Response<Map<String, String>> =
        api.uploadProductImage(part)

    // Orders
    suspend fun getAllOrders(status: String? = null): Response<List<Order>> =
        api.getAdminOrders(status = status)

    suspend fun getOrderDetail(id: Long): Response<Order> =
        api.getAdminOrderDetail(id)

    suspend fun updateOrderStatus(id: Long, status: String): Response<Order> =
        api.updateOrderStatus(id, UpdateOrderStatusRequest(status))

    suspend fun quoteDeliveryFee(id: Long, fee: Double): Response<Order> =
        api.quoteDeliveryFee(id, fee)
}
