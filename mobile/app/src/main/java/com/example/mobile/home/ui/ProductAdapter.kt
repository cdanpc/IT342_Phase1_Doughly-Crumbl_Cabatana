package com.example.mobile.home.ui

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.mobile.R
import com.example.mobile.databinding.ItemProductBinding
import com.example.mobile.model.Product

class ProductAdapter(
    private val onAddToCart: (Product) -> Unit,
    private val onFavoriteClick: (Product) -> Unit,
    private val onProductClick: (Product) -> Unit
) : ListAdapter<Product, ProductAdapter.ViewHolder>(DIFF) {

    var pendingProductIds: Set<Long> = emptySet()
        set(value) {
            field = value
            notifyDataSetChanged()
        }
    var favoriteProductIds: Set<Long> = emptySet()
        set(value) {
            field = value
            notifyDataSetChanged()
        }
    var pendingFavoriteProductIds: Set<Long> = emptySet()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    inner class ViewHolder(private val binding: ItemProductBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(product: Product) {
            binding.tvName.text = product.name
            binding.tvCategory.text = product.category
            binding.tvPrice.text = binding.root.context.getString(R.string.price_format, product.price)
            Glide.with(binding.root)
                .load(product.imageUrl)
                .placeholder(R.drawable.bg_product_placeholder)
                .error(R.drawable.bg_product_placeholder)
                .centerCrop()
                .into(binding.ivProduct)
            val context = binding.root.context
            val isPending = product.id in pendingProductIds
            val transparentColor = ContextCompat.getColor(context, android.R.color.transparent)

            binding.btnAddToCart.isEnabled = !isPending
            binding.btnAddToCart.alpha = 1f
            binding.btnAddToCart.backgroundTintList = ColorStateList.valueOf(transparentColor)
            binding.btnAddToCart.setIconResource(
                if (isPending) R.drawable.ic_nav_cart_filled else R.drawable.ic_nav_cart
            )
            binding.btnAddToCart.setIconTintResource(
                if (isPending) R.color.colorPrimary else R.color.colorTextPrimary
            )
            val isFavorite = product.id in favoriteProductIds
            val favoritePending = product.id in pendingFavoriteProductIds
            binding.btnFavorite.isEnabled = !favoritePending
            binding.btnFavorite.alpha = if (favoritePending) 0.55f else 1f
            binding.btnFavorite.backgroundTintList = ColorStateList.valueOf(transparentColor)
            binding.btnFavorite.setIconResource(
                if (isFavorite) R.drawable.ic_heart_filled else R.drawable.ic_heart
            )
            binding.btnFavorite.setIconTintResource(
                if (isFavorite) R.color.colorPrimary else R.color.colorTextPrimary
            )
            binding.btnFavorite.contentDescription = context.getString(
                if (isFavorite) R.string.remove_product_from_favorites
                else R.string.add_product_to_favorites
            )
            binding.root.setOnClickListener { onProductClick(product) }
            binding.btnAddToCart.setOnClickListener {
                onAddToCart(product)
            }
            binding.btnFavorite.setOnClickListener {
                onFavoriteClick(product)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemProductBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) =
        holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Product>() {
            override fun areItemsTheSame(a: Product, b: Product) = a.id == b.id
            override fun areContentsTheSame(a: Product, b: Product) = a == b
        }
    }
}
