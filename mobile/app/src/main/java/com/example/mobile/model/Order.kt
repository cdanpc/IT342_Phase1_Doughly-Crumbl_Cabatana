package com.example.mobile.model

import com.google.gson.annotations.SerializedName

data class Order(
    @SerializedName("orderId")
    val orderId: Long = 0,

    @SerializedName("orderDate")
    val orderDate: String = "",

    @SerializedName("status")
    val status: String = "",

    @SerializedName("paymentStatus")
    val paymentStatus: String = "",

    @SerializedName("deliveryAddress")
    val deliveryAddress: String? = null,

    @SerializedName("contactNumber")
    val contactNumber: String? = null,

    @SerializedName("deliveryNotes")
    val deliveryNotes: String? = null,

    @SerializedName("fulfillmentMethod")
    val fulfillmentMethod: String? = null,

    @SerializedName("paymentMethod")
    val paymentMethod: String? = null,

    @SerializedName("proofImageUrl")
    val proofImageUrl: String? = null,

    @SerializedName("cancellationReason")
    val cancellationReason: String? = null,

    @SerializedName("items")
    val items: List<OrderItem> = emptyList(),

    @SerializedName("subtotalAmount")
    val subtotalAmount: Double? = null,

    @SerializedName("deliveryFee")
    val deliveryFee: Double? = null,

    @SerializedName("totalAmount")
    val totalAmount: Double = 0.0,

    @SerializedName("itemCount")
    val itemCount: Int? = null
)
