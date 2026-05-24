package com.example.mobile.model

data class AdminUser(
    val id: Long = 0,
    val name: String = "",
    val email: String = "",
    val role: String = "",
    val phoneNumber: String? = null,
    val address: String? = null,
    val enabled: Boolean = true,
    val accountLocked: Boolean = false,
    val createdAt: String? = null
)
