package com.example.mobile.admin.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemAdminOrderBinding
import com.example.mobile.model.Order
import com.example.mobile.util.OrderStatusUi

class AdminOrderAdapter(
    private val onClick: (Order) -> Unit
) : ListAdapter<Order, AdminOrderAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemAdminOrderBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(order: Order) {
            b.tvOrderId.text = "Order #${order.orderId}"
            b.tvDate.text = order.orderDate.take(10)
            b.tvTotal.text = "₱%.2f".format(order.totalAmount)
            b.tvContact.text = order.contactNumber ?: "No contact"

            b.chipStatus.text = OrderStatusUi.label(order.status)
            b.chipStatus.setChipBackgroundColorResource(OrderStatusUi.colorRes(order.status))

            val full = OrderStatusUi.fullText(order.status)
            if (full.isNotEmpty()) {
                b.tvStatusFull.text = full
                b.tvStatusFull.visibility = View.VISIBLE
            } else {
                b.tvStatusFull.visibility = View.GONE
            }

            b.chipPayment.text = order.paymentStatus.ifEmpty { "UNPAID" }
            b.chipPayment.setChipBackgroundColorResource(paymentColor(order.paymentStatus))
            b.chipPayment.setTextColor(b.root.context.getColor(R.color.colorSurface))

            b.root.setOnClickListener { onClick(order) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemAdminOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    private fun paymentColor(paymentStatus: String): Int = when (paymentStatus) {
        "PAID", "PAYMENT_CONFIRMED" -> R.color.statusCompleted
        "PENDING"                   -> R.color.statusOrderPlaced
        "SUBMITTED"                 -> R.color.statusPreparing
        "CANCELLED"                 -> R.color.statusCancelled
        else                        -> R.color.colorTextMuted
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Order>() {
            override fun areItemsTheSame(a: Order, b: Order) = a.orderId == b.orderId
            override fun areContentsTheSame(a: Order, b: Order) = a == b
        }
    }
}
