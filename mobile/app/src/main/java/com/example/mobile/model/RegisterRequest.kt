package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("name")
    val name: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String,

    @SerializedName("phoneNumber")
    val phoneNumber: String = "",

    @SerializedName("address")
    val address: String = ""
)
