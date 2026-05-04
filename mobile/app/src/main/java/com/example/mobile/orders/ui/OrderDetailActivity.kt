package com.example.mobile.orders.ui

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.ActivityOrderDetailBinding
import com.example.mobile.model.Order
import com.example.mobile.util.SessionManager

class OrderDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        val orderId = intent.getLongExtra("orderId", -1L)
        if (orderId == -1L) { finish(); return }

        val session = SessionManager(this)
        val factory = OrderDetailViewModelFactory(session)
        val viewModel = ViewModelProvider(this, factory)[OrderDetailViewModel::class.java]

        val itemAdapter = OrderItemAdapter()
        binding.recyclerItems.layoutManager = LinearLayoutManager(this)
        binding.recyclerItems.adapter = itemAdapter

        viewModel.order.observe(this) { order -> bindOrder(order, itemAdapter) }
        viewModel.isLoading.observe(this) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }

        viewModel.loadOrder(orderId)
    }

    private fun bindOrder(order: Order, adapter: OrderItemAdapter) {
        supportActionBar?.title = "Order #${order.id}"
        binding.tvDate.text = order.createdAt.take(10)
        binding.chipStatus.text = order.status
        binding.chipStatus.setChipBackgroundColorResource(statusColor(order.status))
        adapter.submitList(order.items)
        binding.tvSubtotal.text = "Subtotal: ₱%.2f".format(order.totalAmount)
        if (order.deliveryFee != null) {
            binding.tvDeliveryFee.visibility = View.VISIBLE
            binding.tvDeliveryFee.text = "Delivery fee: ₱%.2f".format(order.deliveryFee)
            binding.tvGrandTotal.visibility = View.VISIBLE
            binding.tvGrandTotal.text = "Grand Total: ₱%.2f".format(order.totalAmount + order.deliveryFee)
        }
    }

    private fun statusColor(status: String) = when (status) {
        "PENDING"                  -> com.example.mobile.R.color.statusOrderPlaced
        "CONFIRMED", "PREPARING"   -> com.example.mobile.R.color.statusPreparing
        "READY", "DELIVERED"       -> com.example.mobile.R.color.statusCompleted
        else                       -> com.example.mobile.R.color.statusCancelled
    }
}
