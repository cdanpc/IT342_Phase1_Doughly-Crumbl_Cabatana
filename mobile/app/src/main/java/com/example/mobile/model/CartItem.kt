package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class CartItem(
    @SerializedName("cartItemId")
    val cartItemId: Long = 0,

    @SerializedName("productId")
    val productId: Long = 0,

    @SerializedName("productName")
    val productName: String = "",

    @SerializedName("productImageUrl")
    val productImageUrl: String? = null,

    @SerializedName("unitPrice")
    val unitPrice: Double = 0.0,

    @SerializedName("quantity")
    val quantity: Int = 0,

    @SerializedName("subtotal")
    val subtotal: Double = 0.0
)
