package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class Notification(
    @SerializedName("id")
    val id: Long = 0,

    @SerializedName("orderId")
    val orderId: Long? = null,

    @SerializedName("type")
    val type: String = "",

    @SerializedName("title")
    val title: String = "",

    @SerializedName("message")
    val message: String = "",

    @SerializedName("read")
    val isRead: Boolean = false,

    @SerializedName("createdAt")
    val createdAt: String = ""
)
