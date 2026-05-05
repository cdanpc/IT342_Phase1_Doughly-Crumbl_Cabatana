package com.example.mobile.admin.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemAdminOrderBinding
import com.example.mobile.model.Order

class AdminOrderAdapter(
    private val onClick: (Order) -> Unit
) : ListAdapter<Order, AdminOrderAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemAdminOrderBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(order: Order) {
            b.tvOrderId.text = "Order #${order.orderId}"
            b.tvDate.text = order.orderDate.take(10)
            b.tvTotal.text = "₱%.2f".format(order.totalAmount)
            b.tvContact.text = order.contactNumber ?: "No contact"

            b.chipStatus.text = order.status
            b.chipStatus.setChipBackgroundColorResource(statusColor(order.status))

            b.chipPayment.text = order.paymentStatus.ifEmpty { "UNPAID" }
            b.chipPayment.setChipBackgroundColorResource(paymentColor(order.paymentStatus))
            b.chipPayment.setTextColor(b.root.context.getColor(R.color.colorSurface))

            b.root.setOnClickListener { onClick(order) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemAdminOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    private fun statusColor(status: String): Int = when (status) {
        "PENDING"                -> R.color.statusOrderPlaced
        "CONFIRMED", "PREPARING" -> R.color.statusPreparing
        "READY", "DELIVERED"     -> R.color.statusCompleted
        else                     -> R.color.statusCancelled
    }

    private fun paymentColor(paymentStatus: String): Int = when (paymentStatus) {
        "PAID", "PAYMENT_CONFIRMED" -> R.color.statusCompleted
        "PENDING"                   -> R.color.statusOrderPlaced
        else                        -> R.color.colorTextMuted
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Order>() {
            override fun areItemsTheSame(a: Order, b: Order) = a.orderId == b.orderId
            override fun areContentsTheSame(a: Order, b: Order) = a == b
        }
    }
}
