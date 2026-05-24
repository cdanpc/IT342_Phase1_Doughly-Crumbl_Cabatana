package com.example.mobile.admin.ui

import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.R
import com.example.mobile.databinding.ActivityAdminOrderDetailBinding
import com.example.mobile.model.Order
import com.example.mobile.orders.ui.OrderItemAdapter
import com.example.mobile.util.OrderStatusUi
import com.example.mobile.util.SessionManager
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout

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
            binding.btnQuoteFee.isEnabled = !loading && viewModel.order.value?.status == "AWAITING_DELIVERY_QUOTE"
            setStatusButtonsEnabled(!loading)
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }

        binding.btnQuoteFee.setOnClickListener {
            if (viewModel.order.value?.status != "AWAITING_DELIVERY_QUOTE") {
                Toast.makeText(this, getString(R.string.admin_delivery_fee_invalid_state), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val fee = binding.etDeliveryFee.text.toString().toDoubleOrNull()
            if (fee == null || fee < 0) {
                Toast.makeText(this, getString(R.string.admin_delivery_fee_invalid_amount), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.quoteDeliveryFee(orderId, fee)
        }

        viewModel.loadOrder(orderId)
    }

    private fun bindOrder(order: Order, adapter: OrderItemAdapter) {
        supportActionBar?.title = getString(R.string.admin_order_title_format, order.orderId)
        binding.tvCustomerName.text = order.customerName ?: getString(R.string.profile_unknown_user)
        binding.tvCustomerEmail.text = order.customerEmail ?: ""
        binding.tvDate.text = order.orderDate.take(10)
        binding.chipStatus.text = OrderStatusUi.label(order.status)
        binding.chipStatus.setChipBackgroundColorResource(OrderStatusUi.colorRes(order.status))
        val canQuoteDeliveryFee = order.status == "AWAITING_DELIVERY_QUOTE"
        binding.tvQuoteDeliveryFeeLabel.visibility = if (canQuoteDeliveryFee) View.VISIBLE else View.GONE
        binding.layoutQuoteDeliveryFee.visibility = if (canQuoteDeliveryFee) View.VISIBLE else View.GONE
        binding.btnQuoteFee.isEnabled = canQuoteDeliveryFee && viewModel.isLoading.value != true

        adapter.submitList(order.items)

        binding.tvSubtotal.text = getString(
            R.string.admin_order_subtotal_format,
            getString(R.string.price_format, order.totalAmount)
        )

        binding.layoutStatusButtons.removeAllViews()
        bindStatusActions(order)
    }

    private fun bindStatusActions(order: Order) {
        val isTerminal = order.status == "COMPLETED" || order.status == "CANCELLED"
        val nextStatus = OrderStatusUi.nextAdminStatus(order)
        if (nextStatus != null && !isTerminal) {
            binding.layoutStatusButtons.addView(
                createStatusButton(
                    text = getString(R.string.admin_move_to_status_format, OrderStatusUi.label(nextStatus))
                ) {
                    viewModel.updateStatus(order.orderId, nextStatus)
                }
            )
        }

        if (!isTerminal) {
            binding.layoutStatusButtons.addView(
                createStatusButton(
                    text = getString(R.string.admin_override_status),
                    isOutlined = true
                ) {
                    showOverrideStatusDialog(order)
                }
            )
            binding.layoutStatusButtons.addView(
                createStatusButton(
                    text = getString(R.string.admin_cancel_order),
                    isOutlined = true,
                    isDanger = true
                ) {
                    showCancelOrderDialog(order)
                }
            )
        }
    }

    private fun createStatusButton(
        text: String,
        isOutlined: Boolean = false,
        isDanger: Boolean = false,
        onClick: () -> Unit
    ): MaterialButton {
        val margin = resources.getDimensionPixelSize(R.dimen.spacing_8)
        val styleAttr = if (isOutlined) {
            com.google.android.material.R.attr.materialButtonOutlinedStyle
        } else {
            com.google.android.material.R.attr.materialButtonStyle
        }
        return MaterialButton(this, null, styleAttr).apply {
            this.text = text
            isAllCaps = false
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = margin
            }
            if (isDanger) {
                setTextColor(getColor(R.color.colorError))
                strokeColor = getColorStateList(R.color.colorError)
            }
            setOnClickListener { onClick() }
        }
    }

    private fun showCancelOrderDialog(order: Order) {
        val reasonInput = createReasonInput(getString(R.string.admin_cancel_reason_hint))
        val dialog = MaterialAlertDialogBuilder(this)
            .setTitle(R.string.admin_cancel_order_title)
            .setView(reasonInput.container)
            .setNegativeButton(R.string.cancel, null)
            .setPositiveButton(R.string.admin_confirm_cancel_order, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            submitStatusChange(dialog, order, "CANCELLED", reasonInput)
        }
    }

    private fun showOverrideStatusDialog(order: Order) {
        val statusOptions = OrderStatusUi.adminStatuses.filter { it != order.status }
        val spinner = Spinner(this).apply {
            adapter = ArrayAdapter(
                this@AdminOrderDetailActivity,
                android.R.layout.simple_spinner_dropdown_item,
                statusOptions.map { OrderStatusUi.label(it) }
            )
        }
        val reasonInput = createReasonInput(getString(R.string.admin_override_reason_hint))
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val padding = resources.getDimensionPixelSize(R.dimen.spacing_20)
            setPadding(padding, padding / 2, padding, 0)
            addView(spinner)
            addView(reasonInput.container)
        }

        val dialog = MaterialAlertDialogBuilder(this)
            .setTitle(R.string.admin_override_status_title)
            .setMessage(R.string.admin_override_status_message)
            .setView(content)
            .setNegativeButton(R.string.cancel, null)
            .setPositiveButton(R.string.admin_confirm_override, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val selectedStatus = statusOptions[spinner.selectedItemPosition]
            submitStatusChange(dialog, order, selectedStatus, reasonInput)
        }
    }

    private fun submitStatusChange(
        dialog: AlertDialog,
        order: Order,
        status: String,
        reasonInput: ReasonInput
    ) {
        val reason = reasonInput.editText.text?.toString()?.trim().orEmpty()
        if (reason.isBlank()) {
            reasonInput.container.error = getString(R.string.error_required)
            return
        }
        reasonInput.container.error = null
        viewModel.updateStatus(order.orderId, status, reason)
        dialog.dismiss()
    }

    private fun createReasonInput(hint: String): ReasonInput {
        val editText = TextInputEditText(this).apply {
            minLines = 2
            maxLines = 4
        }
        val inputLayout = TextInputLayout(this).apply {
            this.hint = hint
            addView(editText)
        }
        return ReasonInput(inputLayout, editText)
    }

    private fun setStatusButtonsEnabled(enabled: Boolean) {
        (0 until binding.layoutStatusButtons.childCount).forEach { index ->
            binding.layoutStatusButtons.getChildAt(index).isEnabled = enabled
        }
    }

    private data class ReasonInput(
        val container: TextInputLayout,
        val editText: TextInputEditText
    )
}
