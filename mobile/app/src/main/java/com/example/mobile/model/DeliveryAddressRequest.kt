package com.example.mobile.model

data class DeliveryAddressRequest(
    val label: String,
    val address: String,
    val defaultAddress: Boolean = false
)
