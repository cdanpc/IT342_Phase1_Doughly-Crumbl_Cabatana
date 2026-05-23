package com.example.mobile.admin.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
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
            b.tvName.text = product.name
            b.tvCategory.text = "${product.category} · ${if (product.available) "Available" else "Unavailable"}"
            b.tvPrice.text = "₱%.2f".format(product.price)
            Glide.with(b.root)
                .load(product.imageUrl)
                .placeholder(android.R.drawable.ic_menu_gallery)
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
