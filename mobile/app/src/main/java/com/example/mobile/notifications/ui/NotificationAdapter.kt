package com.example.mobile.notifications.ui

import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemNotificationBinding
import com.example.mobile.model.Notification

class NotificationAdapter(
    private val onItemClick: (Notification) -> Unit
) : ListAdapter<Notification, NotificationAdapter.VH>(Diff) {

    inner class VH(val binding: ItemNotificationBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemNotificationBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = getItem(position)
        with(holder.binding) {
            tvTitle.text = n.title
            tvMessage.text = n.message
            tvTime.text = formatTime(n.createdAt)
            unreadDot.visibility = if (n.isRead) View.GONE else View.VISIBLE

            val iconColor = iconColorFor(n.type)
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(ContextCompat.getColor(root.context, iconColor))
            }
            iconContainer.background = bg

            root.setOnClickListener { onItemClick(n) }
        }
    }

    private fun iconColorFor(type: String): Int = when (type) {
        "PAYMENT_CONFIRMED" -> R.color.colorSuccess
        "NEW_PRODUCT"       -> R.color.colorWarning
        "ORDER_CANCELLED"   -> R.color.colorError
        else                -> R.color.colorPrimary
    }

    private fun formatTime(createdAt: String): String {
        if (createdAt.length < 10) return createdAt
        return createdAt.take(10)
    }

    companion object Diff : DiffUtil.ItemCallback<Notification>() {
        override fun areItemsTheSame(a: Notification, b: Notification) = a.id == b.id
        override fun areContentsTheSame(a: Notification, b: Notification) = a == b
    }
}
