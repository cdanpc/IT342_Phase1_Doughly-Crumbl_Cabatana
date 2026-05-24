package com.example.mobile.cart.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.mobile.R
import com.example.mobile.databinding.ItemCartBinding
import com.example.mobile.model.CartItem

class CartItemAdapter(
    private val onQtyChanged: (itemId: Long, newQty: Int) -> Unit,
    private val onRemove: (itemId: Long) -> Unit
) : ListAdapter<CartItem, CartItemAdapter.ViewHolder>(DIFF) {

    var actionsEnabled: Boolean = true
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    inner class ViewHolder(private val b: ItemCartBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(item: CartItem) {
            val context = b.root.context
            b.tvName.text = item.productName
            b.tvPrice.text = context.getString(R.string.price_format, item.subtotal)
            b.tvCategory.text = context.getString(
                R.string.cart_item_unit_price,
                context.getString(R.string.price_format, item.unitPrice)
            )
            b.tvQty.text = item.quantity.toString()

            b.btnMinus.isEnabled = actionsEnabled && item.quantity > 1
            b.btnPlus.isEnabled = actionsEnabled
            b.btnRemove.isEnabled = actionsEnabled
            val enabledAlpha = if (actionsEnabled) 1f else 0.55f
            b.btnPlus.alpha = enabledAlpha
            b.btnMinus.alpha = if (actionsEnabled && item.quantity > 1) 1f else 0.45f
            b.btnRemove.alpha = enabledAlpha

            Glide.with(b.root)
                .load(item.productImageUrl)
                .placeholder(R.drawable.bg_product_placeholder)
                .error(R.drawable.bg_product_placeholder)
                .centerCrop()
                .into(b.ivProduct)

            b.btnMinus.setOnClickListener {
                val newQty = item.quantity - 1
                if (newQty >= 1) onQtyChanged(item.cartItemId, newQty)
            }
            b.btnPlus.setOnClickListener { onQtyChanged(item.cartItemId, item.quantity + 1) }
            b.btnRemove.setOnClickListener { onRemove(item.cartItemId) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemCartBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<CartItem>() {
            override fun areItemsTheSame(a: CartItem, b: CartItem) = a.cartItemId == b.cartItemId
            override fun areContentsTheSame(a: CartItem, b: CartItem) = a == b
        }
    }
}
