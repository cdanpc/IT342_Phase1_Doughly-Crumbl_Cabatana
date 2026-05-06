package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class Product(
    @SerializedName("id")
    val id: Long = 0,

    @SerializedName("name")
    val name: String = "",

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("price")
    val price: Double = 0.0,

    @SerializedName("imageUrl")
    val imageUrl: String? = null,

    @SerializedName("category")
    val category: String = "",

    @SerializedName("available")
    val available: Boolean = true
)
