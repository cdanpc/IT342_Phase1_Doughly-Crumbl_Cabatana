package com.example.mobile.model

data class Order(
    val id: Long,
    val status: String,
    val totalAmount: Double,
    val deliveryFee: Double?,
    val createdAt: String,
    val items: List<OrderItem>,
    val customerName: String? = null,
    val customerEmail: String? = null
)
