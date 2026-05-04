package com.example.mobile.model

data class Product(
    val id: Long,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String?,
    val category: String,
    val stock: Int
)
