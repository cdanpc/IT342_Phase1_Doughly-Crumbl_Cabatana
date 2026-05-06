package com.example.mobile.orders.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.MainActivity
import com.example.mobile.R
import com.example.mobile.databinding.ActivityOrderDetailBinding
import com.example.mobile.model.Order
import com.example.mobile.util.SessionManager

class OrderDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderDetailBinding
    private lateinit var viewModel: OrderDetailViewModel
    private var orderId = -1L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        orderId = intent.getLongExtra("orderId", -1L)
        if (orderId == -1L) { finish(); return }

        val session = SessionManager(this)
        val factory = OrderDetailViewModelFactory(session)
        viewModel = ViewModelProvider(this, factory)[OrderDetailViewModel::class.java]

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
        viewModel.cancelSuccess.observe(this) { success ->
            if (success == true) Toast.makeText(this, "Order cancelled", Toast.LENGTH_SHORT).show()
        }

        binding.btnCancel.setOnClickListener { showCancelDialog() }
        binding.btnReorder.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            })
        }

        viewModel.loadOrder(orderId)
    }

    private fun bindOrder(order: Order, adapter: OrderItemAdapter) {
        supportActionBar?.title = "Order #${order.orderId}"

        bindStatusBanner(order.status)
        bindTimeline(order.status)
        adapter.submitList(order.items)

        binding.tvSubtotal.text = "Subtotal: ₱%.2f".format(order.totalAmount)

        if (order.deliveryAddress != null) {
            binding.cardDelivery.visibility = View.VISIBLE
            binding.tvDeliveryAddress.text = "📍 ${order.deliveryAddress}"
            binding.tvContactNumber.text = "📞 ${order.contactNumber ?: "—"}"
            if (!order.deliveryNotes.isNullOrBlank()) {
                binding.tvDeliveryNotes.visibility = View.VISIBLE
                binding.tvDeliveryNotes.text = "Note: ${order.deliveryNotes}"
            }
        }

        if (order.status == "CANCELLED") {
            binding.cardCancellation.visibility = View.VISIBLE
            binding.tvCancellationReason.text =
                if (order.cancellationReason.isNullOrBlank()) "No reason provided"
                else order.cancellationReason
        }

        binding.btnCancel.visibility =
            if (order.status in listOf("PENDING", "ORDER_PLACED")) View.VISIBLE else View.GONE

        binding.btnReorder.visibility =
            if (order.status == "COMPLETED") View.VISIBLE else View.GONE
    }

    private fun bindStatusBanner(status: String) {
        val (label, desc, colorRes) = when (status) {
            "PENDING", "ORDER_PLACED" ->
                Triple("Order Placed", "We've received your order!", R.color.statusOrderPlaced)
            "CONFIRMED" ->
                Triple("Confirmed", "Your order has been confirmed", R.color.statusPreparing)
            "PAYMENT_CONFIRMED" ->
                Triple("Payment Confirmed", "Payment has been verified", R.color.statusPreparing)
            "PREPARING" ->
                Triple("Preparing", "Your order is being prepared", R.color.statusPreparing)
            "READY" ->
                Triple("Ready for Pickup", "Your order is ready!", R.color.statusCompleted)
            "DELIVERED" ->
                Triple("Out for Delivery", "Your order is on the way!", R.color.statusCompleted)
            "COMPLETED" ->
                Triple("Completed", "Enjoy your order!", R.color.statusCompleted)
            "CANCELLED" ->
                Triple("Cancelled", "This order was cancelled", R.color.statusCancelled)
            else ->
                Triple(status, "", R.color.statusOrderPlaced)
        }
        binding.tvStatusLabel.text = label
        binding.tvStatusDesc.text = desc
        binding.cardStatusBanner.setCardBackgroundColor(ContextCompat.getColor(this, colorRes))
    }

    private fun bindTimeline(status: String) {
        val step = statusToStep(status)
        val dots = listOf(binding.dot1, binding.dot2, binding.dot3, binding.dot4, binding.dot5)
        val lines = listOf(binding.line1, binding.line2, binding.line3, binding.line4)

        if (step == -1) {
            // Cancelled — all pending
            dots.forEach { it.setBackgroundResource(R.drawable.bg_timeline_dot_pending) }
            lines.forEach { it.setBackgroundColor(ContextCompat.getColor(this, R.color.colorBorder)) }
            return
        }

        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(
                when {
                    i < step  -> R.drawable.bg_timeline_dot_complete
                    i == step -> R.drawable.bg_timeline_dot_active
                    else      -> R.drawable.bg_timeline_dot_pending
                }
            )
        }

        lines.forEachIndexed { i, line ->
            line.setBackgroundColor(
                ContextCompat.getColor(
                    this,
                    if (i < step) R.color.colorPrimary else R.color.colorBorder
                )
            )
        }
    }

    private fun statusToStep(status: String): Int = when (status) {
        "PENDING", "ORDER_PLACED"        -> 0
        "CONFIRMED", "PAYMENT_CONFIRMED" -> 1
        "PREPARING"                      -> 2
        "READY", "DELIVERED"             -> 3
        "COMPLETED"                      -> 4
        "CANCELLED"                      -> -1
        else                             -> 0
    }

    private fun showCancelDialog() {
        AlertDialog.Builder(this)
            .setTitle("Cancel Order")
            .setMessage("Are you sure you want to cancel this order?")
            .setPositiveButton("Cancel Order") { _, _ ->
                viewModel.cancelOrder(orderId, "Customer request")
            }
            .setNegativeButton("Keep Order", null)
            .show()
    }
}
