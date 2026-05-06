package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class Cart(
    @SerializedName("cartId")
    val cartId: Long = 0,

    @SerializedName("items")
    val items: List<CartItem> = emptyList(),

    @SerializedName("totalAmount")
    val totalAmount: Double = 0.0,

    @SerializedName("itemCount")
    val itemCount: Int = 0
)
