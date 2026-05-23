package com.example.mobile.orders.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemOrderItemBinding
import com.example.mobile.model.OrderItem

class OrderItemAdapter : ListAdapter<OrderItem, OrderItemAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemOrderItemBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(item: OrderItem) {
            val context = b.root.context
            b.tvName.text = item.productName
            b.tvQty.text = context.getString(R.string.quantity_x_format, item.quantity)
            b.tvPrice.text = context.getString(R.string.price_format, item.subtotal)
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemOrderItemBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<OrderItem>() {
            override fun areItemsTheSame(a: OrderItem, b: OrderItem) = a.productName == b.productName
            override fun areContentsTheSame(a: OrderItem, b: OrderItem) = a == b
        }
    }
}
