package com.example.mobile.model

data class Cart(
    val id: Long,
    val items: List<CartItem>,
    val totalPrice: Double
)
