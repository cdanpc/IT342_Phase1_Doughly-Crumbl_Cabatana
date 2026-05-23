package com.example.mobile.model

data class UpdateCustomerProfileRequest(
    val name: String,
    val email: String,
    val phoneNumber: String?,
    val address: String?
)
