package com.example.mobile.model

data class ProductRequest(
    val name: String,
    val description: String,
    val price: Double,
    val category: String,
    val stock: Int,
    val imageUrl: String? = null
)
