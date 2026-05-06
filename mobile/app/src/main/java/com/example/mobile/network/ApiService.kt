package com.example.mobile.network

import com.example.mobile.model.AuthRequest
import com.example.mobile.model.AuthResponse
import com.example.mobile.model.Cart
import com.example.mobile.model.CartItemRequest
import com.example.mobile.model.CheckoutRequest
import com.example.mobile.model.MessageResponse
import com.example.mobile.model.Notification
import com.example.mobile.model.Order
import com.example.mobile.model.PagedResponse
import com.example.mobile.model.Product
import com.example.mobile.model.ProductRequest
import com.example.mobile.model.RegisterRequest
import com.example.mobile.model.UpdateOrderStatusRequest
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // --- Auth ---
    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    // --- Products (customer) ---
    @GET("products")
    suspend fun getProducts(
        @Query("page")     page: Int = 0,
        @Query("size")     size: Int = 20,
        @Query("search")   search: String? = null,
        @Query("category") category: String? = null
    ): Response<PagedResponse<Product>>

    // --- Cart ---
    @GET("cart")
    suspend fun getCart(): Response<Cart>

    @POST("cart/items")
    suspend fun addToCart(@Body request: CartItemRequest): Response<Cart>

    @PUT("cart/items/{itemId}")
    suspend fun updateCartItem(
        @Path("itemId") itemId: Long,
        @Body request: CartItemRequest
    ): Response<Cart>

    @DELETE("cart/items/{itemId}")
    suspend fun removeCartItem(@Path("itemId") itemId: Long): Response<Cart>

    @DELETE("cart")
    suspend fun clearCart(): Response<MessageResponse>

    // --- Orders (customer) ---
    @POST("orders")
    suspend fun placeOrder(@Body request: CheckoutRequest): Response<Order>

    @GET("orders/my-orders")
    suspend fun getOrders(): Response<List<Order>>

    @GET("orders/{id}")
    suspend fun getOrderDetail(@Path("id") id: Long): Response<Order>

    @PUT("orders/{id}/cancel")
    suspend fun cancelOrder(
        @Path("id") id: Long,
        @Query("reason") reason: String? = null
    ): Response<Order>

    // --- Notifications ---
    @GET("notifications")
    suspend fun getNotifications(): Response<List<Notification>>

    @GET("notifications/unread-count")
    suspend fun getNotificationsUnreadCount(): Response<Map<String, @JvmSuppressWildcards Any>>

    @PUT("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: Long): Response<Void>

    @PUT("notifications/read-all")
    suspend fun markAllNotificationsRead(): Response<Void>

    // --- Admin: Products ---
    @GET("admin/products")
    suspend fun getAdminProducts(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 50
    ): Response<PagedResponse<Product>>

    @POST("admin/products")
    suspend fun createProduct(@Body request: ProductRequest): Response<Product>

    @PUT("admin/products/{id}")
    suspend fun updateProduct(
        @Path("id") id: Long,
        @Body request: ProductRequest
    ): Response<Product>

    @DELETE("admin/products/{id}")
    suspend fun deleteProduct(@Path("id") id: Long): Response<Void>

    @Multipart
    @POST("admin/products/upload-image")
    suspend fun uploadProductImage(@Part image: MultipartBody.Part): Response<Map<String, String>>

    // --- Admin: Orders ---
    @GET("admin/orders")
    suspend fun getAdminOrders(
        @Query("status") status: String? = null,
        @Query("page")   page: Int = 0,
        @Query("size")   size: Int = 100
    ): Response<List<Order>>

    @GET("admin/orders/{id}")
    suspend fun getAdminOrderDetail(@Path("id") id: Long): Response<Order>

    @PUT("admin/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: Long,
        @Body request: UpdateOrderStatusRequest
    ): Response<Order>

    @PUT("admin/orders/{id}/delivery-fee")
    suspend fun quoteDeliveryFee(
        @Path("id") id: Long,
        @Query("fee") fee: Double
    ): Response<Order>
}
