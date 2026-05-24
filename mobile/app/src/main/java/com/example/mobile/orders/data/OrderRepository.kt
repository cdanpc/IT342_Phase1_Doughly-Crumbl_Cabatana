package com.example.mobile.orders.data

import com.example.mobile.model.Order
import com.example.mobile.model.OrderRating
import com.example.mobile.model.OrderRatingRequest
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import okhttp3.MultipartBody
import retrofit2.Response

class OrderRepository(sessionManager: SessionManager) {
    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun getOrders(): Response<List<Order>> = api.getOrders()
    suspend fun getOrderDetail(id: Long): Response<Order> = api.getOrderDetail(id)
    suspend fun cancelOrder(id: Long, reason: String? = null): Response<Order> =
        api.cancelOrder(id, reason)
    suspend fun submitPayment(id: Long, proof: MultipartBody.Part): Response<Order> =
        api.submitPayment(id, proof)
    suspend fun submitRating(orderId: Long, request: OrderRatingRequest): Response<OrderRating> =
        api.submitOrderRating(orderId, request)
    suspend fun getRating(orderId: Long): Response<OrderRating> =
        api.getOrderRating(orderId)
}
