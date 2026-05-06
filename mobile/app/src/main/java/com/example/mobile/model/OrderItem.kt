package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class OrderItem(
    @SerializedName("productId")
    val productId: Long? = null,

    @SerializedName("productName")
    val productName: String = "",

    @SerializedName("quantity")
    val quantity: Int = 0,

    @SerializedName("unitPrice")
    val unitPrice: Double = 0.0,

    @SerializedName("subtotal")
    val subtotal: Double = 0.0
)
