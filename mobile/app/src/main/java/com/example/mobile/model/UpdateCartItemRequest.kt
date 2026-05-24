package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class UpdateCartItemRequest(
    @SerializedName("quantity")
    val quantity: Int
)
