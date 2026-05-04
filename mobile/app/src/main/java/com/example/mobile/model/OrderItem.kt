package com.example.mobile.model

data class OrderItem(
    val id: Long,
    val product: Product,
    val quantity: Int,
    val price: Double
)
