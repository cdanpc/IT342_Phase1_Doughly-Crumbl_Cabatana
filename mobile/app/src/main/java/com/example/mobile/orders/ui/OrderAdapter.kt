package com.example.mobile.orders.ui

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
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
            b.tvOrderId.text = "Order #${order.id}"
            b.tvDate.text = order.createdAt.take(10)
            b.tvTotal.text = "₱%.2f".format(order.totalAmount)
            b.chipStatus.text = order.status
            b.chipStatus.setChipBackgroundColorResource(statusColor(order.status))
            b.root.setOnClickListener { onClick(order) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    private fun statusColor(status: String): Int = when (status) {
        "PENDING"               -> R.color.statusOrderPlaced
        "CONFIRMED", "PREPARING" -> R.color.statusPreparing
        "READY", "DELIVERED"    -> R.color.statusCompleted
        else                    -> R.color.statusCancelled
    }

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Order>() {
            override fun areItemsTheSame(a: Order, b: Order) = a.id == b.id
            override fun areContentsTheSame(a: Order, b: Order) = a == b
        }
    }
}
