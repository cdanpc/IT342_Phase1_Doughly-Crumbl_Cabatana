package com.example.mobile.model

data class CheckoutRequest(
    val deliveryAddress: String,
    val contactNumber: String,
    val deliveryNotes: String? = null
)
