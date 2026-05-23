package com.example.mobile.util

import com.example.mobile.R
import com.example.mobile.model.Order

object OrderStatusUi {
    val adminStatuses = listOf(
        "ORDER_PLACED",
        "AWAITING_DELIVERY_QUOTE",
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED",
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION",
        "PAYMENT_CONFIRMED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "READY",
        "COMPLETED",
        "CANCELLED"
    )

    val deliveryFlow = listOf(
        "AWAITING_DELIVERY_QUOTE",
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED",
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION",
        "PAYMENT_CONFIRMED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "COMPLETED"
    )

    val pickupFlow = listOf(
        "ORDER_PLACED",
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION",
        "PAYMENT_CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED"
    )

    fun label(status: String): String = when (status) {
        "ORDER_PLACED" -> "Order Placed"
        "AWAITING_DELIVERY_QUOTE" -> "Getting Quote"
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" -> "Payment Due"
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION" -> "Confirming"
        "PAYMENT_CONFIRMED" -> "Payment Confirmed"
        "PREPARING" -> "Preparing"
        "OUT_FOR_DELIVERY" -> "On the Way"
        "COMPLETED" -> "Completed"
        else -> status.lowercase().split("_")
            .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
    }

    fun fullText(status: String): String = when (status) {
        "AWAITING_DELIVERY_QUOTE" -> "Awaiting Delivery Quote"
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" -> "Delivery Fee Quoted - Payment Required"
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION" -> "Payment Submitted - Awaiting Confirmation"
        "OUT_FOR_DELIVERY" -> "Out for Delivery"
        else -> ""
    }

    fun helperText(status: String): String = when (status) {
        "ORDER_PLACED" -> "Your order has been placed and is awaiting seller confirmation."
        "AWAITING_DELIVERY_QUOTE" -> "Seller is calculating your delivery fee. You'll be notified here once it's ready."
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" -> "Delivery fee has been confirmed. Please review the total and submit your payment."
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION" -> "We've received your proof of payment and are verifying it. Hang tight!"
        "PAYMENT_CONFIRMED" -> "Payment verified! Your order is now being prepared."
        "PREPARING" -> "Your order is being freshly prepared."
        "OUT_FOR_DELIVERY" -> "Your order is on its way! The rider is heading to your location."
        "READY" -> "Your order is ready! Please come to the store to pick it up."
        "COMPLETED" -> "Order completed. Thank you for choosing Doughly Crumbl!"
        "CANCELLED" -> "This order has been cancelled."
        else -> ""
    }

    fun colorRes(status: String): Int = when (status) {
        "ORDER_PLACED", "AWAITING_DELIVERY_QUOTE", "PENDING" -> R.color.statusOrderPlaced
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" -> R.color.statusOutForDelivery
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION", "CONFIRMED" -> R.color.statusPaymentSubmitted
        "PAYMENT_CONFIRMED" -> R.color.statusPaymentConfirmed
        "PREPARING" -> R.color.statusPreparingWeb
        "OUT_FOR_DELIVERY" -> R.color.statusOutForDeliveryWeb
        "READY" -> R.color.statusReadyForPickup
        "DELIVERED", "COMPLETED" -> R.color.statusCompleted
        "CANCELLED" -> R.color.statusCancelled
        else -> R.color.statusDefault
    }

    fun flowFor(order: Order): List<String> =
        if (isPickup(order)) pickupFlow else deliveryFlow

    fun isPickup(order: Order): Boolean =
        order.fulfillmentMethod.equals("PICKUP", ignoreCase = true) ||
            order.deliveryAddress?.startsWith("Pickup", ignoreCase = true) == true

    fun nextAdminStatus(order: Order): String? {
        val isPickup = isPickup(order)
        return when (order.status) {
            "ORDER_PLACED" -> if (isPickup && isCashOnPickup(order)) "PREPARING" else null
            "PAYMENT_CONFIRMED" -> "PREPARING"
            "PREPARING" -> if (isPickup) "READY" else "OUT_FOR_DELIVERY"
            "READY" -> "COMPLETED"
            "OUT_FOR_DELIVERY" -> "COMPLETED"
            else -> null
        }
    }

    fun isCashOnPickup(order: Order): Boolean =
        order.paymentMethod.equals("CASH_ON_PICKUP", ignoreCase = true) ||
            order.deliveryNotes?.contains("Payment Method: Cash on Pickup", ignoreCase = true) == true
}
