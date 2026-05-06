package com.example.mobile.admin.ui

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.R
import com.example.mobile.databinding.ActivityAdminOrderDetailBinding
import com.example.mobile.model.Order
import com.example.mobile.orders.ui.OrderItemAdapter
import com.example.mobile.util.SessionManager
import com.google.android.material.button.MaterialButton

class AdminOrderDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminOrderDetailBinding
    private lateinit var viewModel: AdminOrderDetailViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminOrderDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        val orderId = intent.getLongExtra("orderId", -1L)
        if (orderId == -1L) { finish(); return }

        val session = SessionManager(this)
        val factory = AdminOrderDetailViewModelFactory(session)
        viewModel = ViewModelProvider(this, factory)[AdminOrderDetailViewModel::class.java]

        val itemAdapter = OrderItemAdapter()
        binding.recyclerItems.layoutManager = LinearLayoutManager(this)
        binding.recyclerItems.adapter = itemAdapter

        viewModel.order.observe(this) { order ->
            bindOrder(order, itemAdapter)
        }
        viewModel.isLoading.observe(this) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }

        binding.btnQuoteFee.setOnClickListener {
            val fee = binding.etDeliveryFee.text.toString().toDoubleOrNull()
            if (fee == null || fee < 0) {
                Toast.makeText(this, "Enter a valid delivery fee", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.quoteDeliveryFee(orderId, fee)
        }

        viewModel.loadOrder(orderId)
    }

    private fun bindOrder(order: Order, adapter: OrderItemAdapter) {
        supportActionBar?.title = "Order #${order.orderId}"
        binding.tvCustomerName.text = "Order #${order.orderId}"
        binding.tvCustomerEmail.text = order.contactNumber ?: ""
        binding.tvDate.text = order.orderDate.take(10)
        binding.chipStatus.text = order.status
        binding.chipStatus.setChipBackgroundColorResource(statusColor(order.status))

        adapter.submitList(order.items)

        binding.tvSubtotal.text = "Subtotal: ₱%.2f".format(order.totalAmount)

        // Build status transition buttons
        binding.layoutStatusButtons.removeAllViews()
        OrderStatusHelper.allowedTransitions(order.status).forEach { nextStatus ->
            val btn = MaterialButton(this).apply {
                text = nextStatus
                isAllCaps = false
                setOnClickListener { viewModel.updateStatus(order.orderId, nextStatus) }
            }
            binding.layoutStatusButtons.addView(btn)
        }
    }

    private fun statusColor(status: String) = when (status) {
        "PENDING"                 -> R.color.statusOrderPlaced
        "CONFIRMED", "PREPARING"  -> R.color.statusPreparing
        "READY", "DELIVERED"      -> R.color.statusCompleted
        else                      -> R.color.statusCancelled
    }
}
