package com.example.mobile.cart.ui

import android.os.Bundle
import android.view.View
import android.widget.RadioButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.R
import com.example.mobile.databinding.ActivityCheckoutBinding
import com.example.mobile.model.Cart
import com.example.mobile.model.CheckoutRequest
import com.example.mobile.util.SessionManager

class CheckoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCheckoutBinding
    private lateinit var viewModel: CheckoutViewModel

    private var selectedFulfillment = Fulfillment.DELIVERY
    private var selectedPayment = Payment.GCASH

    private enum class Fulfillment { DELIVERY, PICKUP }
    private enum class Payment { GCASH, MAYA, BANK_TRANSFER, CASH_ON_PICKUP }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCheckoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            title = "Checkout"
        }

        val session = SessionManager(this)
        viewModel = ViewModelProvider(this, CheckoutViewModelFactory(session))[CheckoutViewModel::class.java]

        setupFulfillment()
        setupPayment()
        observeViewModel()

        binding.btnToggleSummary.setOnClickListener { toggleOrderSummary() }
        binding.btnPlaceOrder.setOnClickListener { validateAndPlaceOrder() }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    private fun observeViewModel() {
        viewModel.cart.observe(this) { cart ->
            cart ?: return@observe
            val count = cart.items.size
            binding.tvItemCount.text = "$count ${if (count == 1) "item" else "items"}"
            binding.tvSummarySubtotal.text = "₱%.2f".format(cart.totalAmount)
            binding.tvTotal.text = "Total: ₱%.2f".format(cart.totalAmount)
            buildExpandedItems(cart)
        }
        viewModel.isLoading.observe(this) { loading ->
            binding.btnPlaceOrder.isEnabled = !loading
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }
        viewModel.orderPlaced.observe(this) { order ->
            order ?: return@observe
            Toast.makeText(this, "Order #${order.orderId} placed successfully!", Toast.LENGTH_LONG).show()
            setResult(RESULT_OK)
            finish()
        }
    }

    private fun toggleOrderSummary() {
        val expanded = binding.layoutExpandedItems.visibility == View.VISIBLE
        binding.layoutExpandedItems.visibility = if (expanded) View.GONE else View.VISIBLE
        binding.btnToggleSummary.text = if (expanded) "▼" else "▲"
    }

    private fun buildExpandedItems(cart: Cart) {
        binding.layoutExpandedItems.removeAllViews()
        cart.items.forEach { item ->
            val tv = TextView(this).apply {
                text = "${item.productName}  ×${item.quantity}   ₱%.2f".format(item.subtotal)
                textSize = 12f
                setTextColor(ContextCompat.getColor(this@CheckoutActivity, R.color.colorTextSecondary))
                setPadding(0, 6, 0, 6)
            }
            binding.layoutExpandedItems.addView(tv)
        }
    }

    private fun setupFulfillment() {
        applyFulfillment(Fulfillment.DELIVERY)
        binding.cardDelivery.setOnClickListener { applyFulfillment(Fulfillment.DELIVERY) }
        binding.cardPickup.setOnClickListener { applyFulfillment(Fulfillment.PICKUP) }
    }

    private fun applyFulfillment(method: Fulfillment) {
        selectedFulfillment = method
        binding.cardDelivery.setBackgroundResource(
            if (method == Fulfillment.DELIVERY) R.drawable.bg_fulfillment_selected
            else R.drawable.bg_fulfillment_unselected
        )
        binding.cardPickup.setBackgroundResource(
            if (method == Fulfillment.PICKUP) R.drawable.bg_fulfillment_selected
            else R.drawable.bg_fulfillment_unselected
        )
        binding.sectionDeliveryDetails.visibility =
            if (method == Fulfillment.DELIVERY) View.VISIBLE else View.GONE

        val cashEnabled = method == Fulfillment.PICKUP
        binding.paymentCash.alpha = if (cashEnabled) 1f else 0.4f
        binding.rbCash.isEnabled = cashEnabled
        if (!cashEnabled && selectedPayment == Payment.CASH_ON_PICKUP) {
            applyPayment(Payment.GCASH)
        }
    }

    private fun setupPayment() {
        applyPayment(Payment.GCASH)
        binding.paymentGcash.setOnClickListener { applyPayment(Payment.GCASH) }
        binding.paymentMaya.setOnClickListener { applyPayment(Payment.MAYA) }
        binding.paymentBank.setOnClickListener { applyPayment(Payment.BANK_TRANSFER) }
        binding.paymentCash.setOnClickListener {
            if (selectedFulfillment == Fulfillment.PICKUP) applyPayment(Payment.CASH_ON_PICKUP)
        }
    }

    private fun applyPayment(method: Payment) {
        selectedPayment = method
        data class Option(val container: View, val radio: RadioButton, val pm: Payment)
        listOf(
            Option(binding.paymentGcash, binding.rbGcash, Payment.GCASH),
            Option(binding.paymentMaya, binding.rbMaya, Payment.MAYA),
            Option(binding.paymentBank, binding.rbBank, Payment.BANK_TRANSFER),
            Option(binding.paymentCash, binding.rbCash, Payment.CASH_ON_PICKUP)
        ).forEach { opt ->
            val selected = opt.pm == method
            opt.container.setBackgroundResource(
                if (selected) R.drawable.bg_payment_selected else R.drawable.bg_payment_unselected
            )
            opt.radio.isChecked = selected
        }
    }

    private fun validateAndPlaceOrder() {
        val contactNumber = binding.etContactPhone.text?.toString()?.trim().orEmpty()
        if (contactNumber.isEmpty()) {
            Toast.makeText(this, "Please enter your contact number", Toast.LENGTH_SHORT).show()
            return
        }
        val deliveryAddress: String
        if (selectedFulfillment == Fulfillment.DELIVERY) {
            val street = binding.etStreet.text?.toString()?.trim().orEmpty()
            val city = binding.etCity.text?.toString()?.trim().orEmpty()
            if (street.isEmpty() || city.isEmpty()) {
                Toast.makeText(this, "Please fill in your delivery address", Toast.LENGTH_SHORT).show()
                return
            }
            val landmark = binding.etLandmark.text?.toString()?.trim().orEmpty()
            deliveryAddress = if (landmark.isNotBlank()) "$street, $city, $landmark" else "$street, $city"
        } else {
            deliveryAddress = "Pickup at store"
        }
        val notes = binding.etNotes.text?.toString()?.trim()?.ifBlank { null }
        viewModel.placeOrder(CheckoutRequest(deliveryAddress, contactNumber, notes))
    }
}
