package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class OrderRating(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("orderId") val orderId: Long = 0,
    @SerializedName("rating") val rating: Int = 0,
    @SerializedName("comment") val comment: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null
)

data class OrderRatingRequest(
    @SerializedName("rating") val rating: Int,
    @SerializedName("comment") val comment: String? = null
)
