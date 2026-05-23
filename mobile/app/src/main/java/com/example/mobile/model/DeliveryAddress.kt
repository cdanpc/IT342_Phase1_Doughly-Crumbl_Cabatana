package com.example.mobile.model

data class DeliveryAddress(
    val id: Long = 0,
    val label: String = "",
    val address: String = "",
    val defaultAddress: Boolean = false
)
