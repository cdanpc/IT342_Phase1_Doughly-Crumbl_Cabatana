package com.example.mobile.admin.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.mobile.R
import com.example.mobile.databinding.ItemAdminUserBinding
import com.example.mobile.model.AdminUser

class AdminUserAdapter(
    private val currentUserId: Long,
    private val onBan: (AdminUser) -> Unit,
    private val onUnban: (AdminUser) -> Unit,
    private val onDisable: (AdminUser) -> Unit,
    private val onRestore: (AdminUser) -> Unit
) : ListAdapter<AdminUser, AdminUserAdapter.ViewHolder>(DIFF) {

    var actionsEnabled: Boolean = true
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    inner class ViewHolder(private val b: ItemAdminUserBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(user: AdminUser) {
            val context = b.root.context
            val isRemoved = !user.enabled
            val isBanned = user.accountLocked
            val isCurrentUser = user.id == currentUserId

            b.tvUserName.text = user.name
            b.tvUserEmail.text = user.email
            b.tvUserMeta.text = context.getString(
                R.string.admin_user_meta_format,
                user.role,
                user.phoneNumber ?: context.getString(R.string.admin_user_no_phone)
            )
            b.chipUserStatus.text = when {
                isRemoved -> context.getString(R.string.admin_user_status_removed)
                isBanned -> context.getString(R.string.admin_user_status_banned)
                else -> context.getString(R.string.admin_user_status_active)
            }
            b.chipUserStatus.setChipBackgroundColorResource(
                when {
                    isRemoved -> R.color.colorTextMuted
                    isBanned -> R.color.colorError
                    else -> R.color.colorSuccess
                }
            )
            b.chipUserStatus.setTextColor(context.getColor(R.color.colorSurface))

            b.tvCurrentAdmin.visibility = if (isCurrentUser) View.VISIBLE else View.GONE
            b.btnBan.visibility = if (!isCurrentUser && !isRemoved && !isBanned) View.VISIBLE else View.GONE
            b.btnUnban.visibility = if (!isCurrentUser && !isRemoved && isBanned) View.VISIBLE else View.GONE
            b.btnRemove.visibility = if (!isCurrentUser && !isRemoved) View.VISIBLE else View.GONE
            b.btnRestore.visibility = if (!isCurrentUser && isRemoved) View.VISIBLE else View.GONE
            listOf(b.btnBan, b.btnUnban, b.btnRemove, b.btnRestore).forEach {
                it.isEnabled = actionsEnabled
            }

            b.btnBan.setOnClickListener { onBan(user) }
            b.btnUnban.setOnClickListener { onUnban(user) }
            b.btnRemove.setOnClickListener { onDisable(user) }
            b.btnRestore.setOnClickListener { onRestore(user) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(ItemAdminUserBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<AdminUser>() {
            override fun areItemsTheSame(a: AdminUser, b: AdminUser) = a.id == b.id
            override fun areContentsTheSame(a: AdminUser, b: AdminUser) = a == b
        }
    }
}
