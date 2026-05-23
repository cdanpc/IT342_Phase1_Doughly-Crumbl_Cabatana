package com.example.mobile.orders.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemOrderBinding
import com.example.mobile.model.Order
import com.example.mobile.util.OrderStatusUi

class OrderAdapter(
    private val onClick: (Order) -> Unit
) : ListAdapter<Order, OrderAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemOrderBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(order: Order) {
            val context = b.root.context
            b.tvOrderId.text = context.getString(R.string.order_number_format, order.orderId)
            b.tvDate.text = order.orderDate.take(10)

            val price = context.getString(R.string.price_format, order.totalAmount)
            val itemCount = order.itemCount ?: order.items.size
            val itemText = if (itemCount == 1) {
                context.getString(R.string.order_items_single)
            } else {
                context.getString(R.string.order_items_format, itemCount)
            }
            b.tvTotal.text = "$itemText - ${context.getString(R.string.order_total_format, price)}"

            b.chipStatus.text = OrderStatusUi.label(order.status)
            b.chipStatus.setChipBackgroundColorResource(OrderStatusUi.colorRes(order.status))
            b.tvStatusFull.text = OrderStatusUi.fullText(order.status).ifEmpty {
                OrderStatusUi.label(order.status)
            }

            b.root.setOnClickListener { onClick(order) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemOrderBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Order>() {
            override fun areItemsTheSame(a: Order, b: Order) = a.orderId == b.orderId
            override fun areContentsTheSame(a: Order, b: Order) = a == b
        }
    }
}
