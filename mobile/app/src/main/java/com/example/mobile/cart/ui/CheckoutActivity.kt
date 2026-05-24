package com.example.mobile.cart.ui

import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.widget.RadioButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.R
import com.example.mobile.databinding.ActivityCheckoutBinding
import com.example.mobile.model.Cart
import com.example.mobile.model.CheckoutRequest
import com.example.mobile.util.SessionManager
import com.google.android.material.snackbar.Snackbar

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
            title = getString(R.string.checkout_title)
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
            binding.tvItemCount.text = if (count == 1) {
                getString(R.string.item_count_single)
            } else {
                getString(R.string.item_count_format, count)
            }
            val total = getString(R.string.price_format, cart.totalAmount)
            binding.tvSummarySubtotal.text = total
            binding.tvTotal.text = getString(R.string.checkout_total_format, total)
            buildExpandedItems(cart)
        }
        viewModel.isLoading.observe(this) { loading ->
            binding.btnPlaceOrder.isEnabled = !loading
            binding.btnPlaceOrder.text = getString(
                if (loading) R.string.placing_order else R.string.place_order
            )
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { showMessage(it) }
        }
        viewModel.orderPlaced.observe(this) { order ->
            order ?: return@observe
            setResult(RESULT_OK)
            finish()
        }
    }

    private fun toggleOrderSummary() {
        val expanded = binding.layoutExpandedItems.visibility == View.VISIBLE
        binding.layoutExpandedItems.visibility = if (expanded) View.GONE else View.VISIBLE
        binding.btnToggleSummary.text = getString(
            if (expanded) R.string.show_summary else R.string.hide_summary
        )
    }

    private fun buildExpandedItems(cart: Cart) {
        binding.layoutExpandedItems.removeAllViews()
        cart.items.forEach { item ->
            val tv = TextView(this).apply {
                text = getString(
                    R.string.checkout_item_line_format,
                    item.productName,
                    item.quantity,
                    getString(R.string.price_format, item.subtotal)
                )
                setTextSize(TypedValue.COMPLEX_UNIT_PX, resources.getDimension(R.dimen.textCaption))
                setTextColor(ContextCompat.getColor(this@CheckoutActivity, R.color.colorTextSecondary))
                val vPad = resources.getDimensionPixelSize(R.dimen.spacing_4)
                setPadding(0, vPad, 0, vPad)
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
        binding.paymentCash.root.alpha = if (cashEnabled) 1f else 0.45f
        binding.paymentCash.root.isEnabled = cashEnabled
        binding.paymentCash.root.isClickable = cashEnabled
        binding.paymentCash.rbCash.isEnabled = cashEnabled
        if (!cashEnabled && selectedPayment == Payment.CASH_ON_PICKUP) {
            applyPayment(Payment.GCASH)
        }
    }

    private fun setupPayment() {
        applyPayment(Payment.GCASH)
        binding.paymentGcash.root.setOnClickListener { applyPayment(Payment.GCASH) }
        binding.paymentMaya.root.setOnClickListener { applyPayment(Payment.MAYA) }
        binding.paymentBank.root.setOnClickListener { applyPayment(Payment.BANK_TRANSFER) }
        binding.paymentCash.root.setOnClickListener {
            if (selectedFulfillment == Fulfillment.PICKUP) applyPayment(Payment.CASH_ON_PICKUP)
        }
    }

    private fun applyPayment(method: Payment) {
        selectedPayment = method
        data class Option(val container: View, val radio: RadioButton, val pm: Payment)
        listOf(
            Option(binding.paymentGcash.root, binding.paymentGcash.rbGcash, Payment.GCASH),
            Option(binding.paymentMaya.root, binding.paymentMaya.rbMaya, Payment.MAYA),
            Option(binding.paymentBank.root, binding.paymentBank.rbBank, Payment.BANK_TRANSFER),
            Option(binding.paymentCash.root, binding.paymentCash.rbCash, Payment.CASH_ON_PICKUP)
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
            binding.tilContactPhone.error = getString(R.string.contact_required)
            return
        }
        if (!Regex("^(09\\d{9}|\\+639\\d{9})$").matches(contactNumber)) {
            binding.tilContactPhone.error = getString(R.string.contact_invalid)
            return
        }
        binding.tilContactPhone.error = null

        val deliveryAddress: String
        if (selectedFulfillment == Fulfillment.DELIVERY) {
            val street = binding.etStreet.text?.toString()?.trim().orEmpty()
            val city = binding.etCity.text?.toString()?.trim().orEmpty()
            var valid = true
            if (street.isEmpty() || city.isEmpty()) {
                binding.tilStreet.error = if (street.isEmpty()) getString(R.string.street_required) else null
                binding.tilCity.error = if (city.isEmpty()) getString(R.string.city_required) else null
                valid = false
            } else {
                binding.tilStreet.error = null
                binding.tilCity.error = null
            }
            if (!valid) return

            val landmark = binding.etLandmark.text?.toString()?.trim().orEmpty()
            deliveryAddress = if (landmark.isNotBlank()) "$street, $city, $landmark" else "$street, $city"
        } else {
            deliveryAddress = getString(R.string.fulfillment_pickup_body)
            binding.tilStreet.error = null
            binding.tilCity.error = null
        }
        val userNotes = binding.etNotes.text?.toString()?.trim()?.ifBlank { null }
        viewModel.placeOrder(
            CheckoutRequest(
                deliveryAddress = deliveryAddress,
                contactNumber = contactNumber,
                fulfillmentMethod = selectedFulfillment.name,
                paymentMethod = selectedPayment.name,
                deliveryNotes = userNotes
            )
        )
    }

    private fun paymentLabel(payment: Payment): String = when (payment) {
        Payment.GCASH -> getString(R.string.payment_gcash)
        Payment.MAYA -> getString(R.string.payment_maya)
        Payment.BANK_TRANSFER -> getString(R.string.payment_bank)
        Payment.CASH_ON_PICKUP -> getString(R.string.payment_cash_pickup)
    }

    private fun showMessage(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_LONG).show()
    }
}
