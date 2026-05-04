package com.example.mobile.home.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R

class SkeletonAdapter(private val count: Int = 6) :
    RecyclerView.Adapter<SkeletonAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product_skeleton, parent, false)
    )

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val anim = AnimationUtils.loadAnimation(holder.itemView.context, R.anim.shimmer)
        holder.itemView.startAnimation(anim)
    }

    override fun getItemCount() = count
}
