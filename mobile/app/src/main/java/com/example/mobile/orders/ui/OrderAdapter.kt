package com.example.mobile.orders.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemOrderBinding
import com.example.mobile.model.Order

class OrderAdapter(
    private val onClick: (Order) -> Unit
) : ListAdapter<Order, OrderAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemOrderBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(order: Order) {
            b.tvOrderId.text = "Order #${order.orderId}"
            b.tvDate.text = order.orderDate.take(10)
            b.tvTotal.text = "₱%.2f".format(order.totalAmount)
            b.chipStatus.text = statusLabel(order.status)
            b.chipStatus.setChipBackgroundColorResource(statusColor(order.status))

            val full = statusFullText(order.status)
            if (full.isNotEmpty()) {
                b.tvStatusFull.text = full
                b.tvStatusFull.visibility = View.VISIBLE
            } else {
                b.tvStatusFull.visibility = View.GONE
            }

            b.root.setOnClickListener { onClick(order) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    private fun statusLabel(status: String): String = when (status) {
        "PENDING", "ORDER_PLACED"                    -> "Order Placed"
        "AWAITING_DELIVERY_QUOTE"                    -> "Getting Quote"
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED"       -> "Payment Due"
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION"    -> "Confirming"
        "PAYMENT_CONFIRMED"                          -> "Payment Confirmed"
        "CONFIRMED"                                  -> "Confirmed"
        "PREPARING"                                  -> "Preparing"
        "OUT_FOR_DELIVERY"                           -> "On the Way"
        "READY"                                      -> "Ready"
        "DELIVERED"                                  -> "Delivered"
        "COMPLETED"                                  -> "Completed"
        "CANCELLED"                                  -> "Cancelled"
        else -> status.lowercase().split("_")
            .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
    }

    private fun statusFullText(status: String): String = when (status) {
        "AWAITING_DELIVERY_QUOTE"                 -> "Awaiting Delivery Quote"
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED"    -> "Delivery Fee Quoted — Payment Required"
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION" -> "Payment Submitted — Awaiting Confirmation"
        "OUT_FOR_DELIVERY"                        -> "Out for Delivery"
        else -> ""
    }

    private fun statusColor(status: String): Int = when (status) {
        "PENDING"                -> R.color.statusOrderPlaced
        "CONFIRMED", "PREPARING" -> R.color.statusPreparing
        "READY", "DELIVERED"     -> R.color.statusCompleted
        else                     -> R.color.statusCancelled
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Order>() {
            override fun areItemsTheSame(a: Order, b: Order) = a.orderId == b.orderId
            override fun areContentsTheSame(a: Order, b: Order) = a == b
        }
    }
}
