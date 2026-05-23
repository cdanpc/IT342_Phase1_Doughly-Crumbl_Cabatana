package com.example.mobile.model

data class CustomerProfile(
    val userId: Long = 0,
    val name: String = "",
    val email: String = "",
    val phoneNumber: String? = null,
    val address: String? = null,
    val totalOrders: Int = 0,
    val completedOrders: Int = 0,
    val cancelledOrders: Int = 0,
    val rating: Double = 0.0
)
