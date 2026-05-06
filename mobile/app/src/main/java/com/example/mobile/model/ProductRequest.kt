package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class ProductRequest(
    @SerializedName("name")
    val name: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("price")
    val price: Double,

    @SerializedName("imageUrl")
    val imageUrl: String? = null,

    @SerializedName("category")
    val category: String? = null,

    @SerializedName("available")
    val available: Boolean = true
)
