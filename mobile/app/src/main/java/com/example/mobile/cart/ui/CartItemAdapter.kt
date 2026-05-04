package com.example.mobile.cart.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.mobile.databinding.ItemCartBinding
import com.example.mobile.model.CartItem

class CartItemAdapter(
    private val onQtyChanged: (itemId: Long, newQty: Int) -> Unit,
    private val onRemove: (itemId: Long) -> Unit
) : ListAdapter<CartItem, CartItemAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemCartBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(item: CartItem) {
            b.tvName.text = item.product.name
            b.tvCategory.text = item.product.category
            b.tvPrice.text = "₱%.2f".format(item.product.price)
            b.tvQty.text = item.quantity.toString()
            Glide.with(b.root).load(item.product.imageUrl)
                .placeholder(android.R.drawable.ic_menu_gallery)
                .centerCrop().into(b.ivProduct)
            b.btnMinus.setOnClickListener {
                val newQty = item.quantity - 1
                if (newQty >= 1) onQtyChanged(item.id, newQty)
            }
            b.btnPlus.setOnClickListener { onQtyChanged(item.id, item.quantity + 1) }
            b.btnRemove.setOnClickListener { onRemove(item.id) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemCartBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<CartItem>() {
            override fun areItemsTheSame(a: CartItem, b: CartItem) = a.id == b.id
            override fun areContentsTheSame(a: CartItem, b: CartItem) = a == b
        }
    }
}
