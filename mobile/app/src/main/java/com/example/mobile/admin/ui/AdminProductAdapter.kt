package com.example.mobile.admin.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.mobile.R
import com.example.mobile.databinding.ItemAdminProductBinding
import com.example.mobile.model.Product

class AdminProductAdapter(
    private val onEdit: (Product) -> Unit,
    private val onDelete: (Product) -> Unit
) : ListAdapter<Product, AdminProductAdapter.ViewHolder>(DIFF) {

    var actionsEnabled: Boolean = true
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    inner class ViewHolder(private val b: ItemAdminProductBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(product: Product) {
            val context = b.root.context
            val availability = context.getString(
                if (product.available) R.string.admin_product_available
                else R.string.admin_product_unavailable
            )

            b.tvName.text = product.name
            b.tvCategory.text = context.getString(
                R.string.admin_product_category_availability_format,
                product.category,
                availability
            )
            b.tvPrice.text = context.getString(R.string.price_format, product.price)
            Glide.with(b.root)
                .load(product.imageUrl)
                .placeholder(R.drawable.bg_product_placeholder)
                .error(R.drawable.bg_product_placeholder)
                .centerCrop()
                .into(b.ivProduct)
            b.btnEdit.isEnabled = actionsEnabled
            b.btnDelete.isEnabled = actionsEnabled
            b.btnEdit.setOnClickListener { onEdit(product) }
            b.btnDelete.setOnClickListener { onDelete(product) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemAdminProductBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<Product>() {
            override fun areItemsTheSame(a: Product, b: Product) = a.id == b.id
            override fun areContentsTheSame(a: Product, b: Product) = a == b
        }
    }
}
