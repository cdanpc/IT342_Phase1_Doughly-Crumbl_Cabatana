package com.example.mobile.cart.data

import com.example.mobile.model.Cart
import com.example.mobile.model.CartItemRequest
import com.example.mobile.model.CheckoutRequest
import com.example.mobile.model.UpdateCartItemRequest
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import retrofit2.Response

class CartRepository(sessionManager: SessionManager) {
    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun getCart(): Response<Cart> = api.getCart()
    suspend fun addToCart(productId: Long, qty: Int): Response<Cart> = api.addToCart(CartItemRequest(productId, qty))
    suspend fun updateItem(itemId: Long, qty: Int): Response<Cart> = api.updateCartItem(itemId, UpdateCartItemRequest(qty))
    suspend fun removeItem(itemId: Long): Response<Cart> = api.removeCartItem(itemId)
    suspend fun clearCart(): Response<Void> = api.clearCart()
    suspend fun placeOrder(request: CheckoutRequest) = api.placeOrder(request)
}
