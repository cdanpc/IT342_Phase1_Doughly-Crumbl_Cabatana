package com.example.mobile.orders.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.View
import android.widget.ImageView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.MainActivity
import com.example.mobile.R
import com.example.mobile.databinding.ActivityOrderDetailBinding
import com.example.mobile.model.Order
import com.example.mobile.util.OrderStatusUi
import com.example.mobile.util.SessionManager
import com.google.android.material.snackbar.Snackbar
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class OrderDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderDetailBinding
    private lateinit var viewModel: OrderDetailViewModel
    private var orderId = -1L
    private var canUploadProof = false
    private var selectedStars = 0
    private var ratingLocked = false
    private val proofPickerLauncher =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            uri ?: return@registerForActivityResult
            submitProof(uri)
        }

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
            binding.btnCancel.isEnabled = !loading
            binding.btnReorder.isEnabled = !loading
            binding.btnUploadProof.isEnabled = !loading && canUploadProof
            binding.btnSubmitRating.isEnabled = !loading
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { showMessage(it) }
        }
        viewModel.cancelSuccess.observe(this) { success ->
            if (success == true) showMessage(getString(R.string.order_cancelled_toast))
        }
        viewModel.paymentSubmitted.observe(this) { success ->
            if (success == true) showMessage(getString(R.string.payment_proof_submitted))
        }

        viewModel.reorderResult.observe(this) { result ->
            result ?: return@observe
            if (result.startsWith("success:")) {
                val count = result.substringAfter("success:").toIntOrNull() ?: 0
                val itemLabel = getString(
                    if (count == 1) R.string.reorder_item_singular else R.string.reorder_item_plural
                )
                showMessage(getString(R.string.reorder_added_to_cart, count, itemLabel))
                startActivity(Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("openTab", "cart")
                })
            } else {
                showMessage(result.substringAfter("error:"))
            }
        }

        viewModel.ratingSubmitted.observe(this) { success ->
            if (success == true) showMessage(getString(R.string.rating_submitted))
        }

        setupStarListeners()

        binding.btnSubmitRating.setOnClickListener {
            if (selectedStars == 0) {
                showMessage(getString(R.string.rating_select_stars))
                return@setOnClickListener
            }
            val comment = binding.etComment.text?.toString()
            viewModel.submitRating(orderId, selectedStars, comment)
        }

        binding.btnCancel.setOnClickListener { showCancelDialog() }
        binding.btnReorder.setOnClickListener {
            viewModel.order.value?.let { viewModel.reorder(it) }
        }
        binding.btnUploadProof.setOnClickListener {
            proofPickerLauncher.launch("image/*")
        }

        viewModel.loadOrder(orderId)
    }

    private fun bindOrder(order: Order, adapter: OrderItemAdapter) {
        supportActionBar?.title = getString(R.string.order_detail_title_format, order.orderId)

        bindStatusBanner(order.status)
        bindTimeline(order)
        adapter.submitList(order.items)

        val subtotal = getString(R.string.price_format, order.subtotalAmount ?: order.totalAmount)
        binding.tvSubtotal.text = getString(R.string.subtotal_format, subtotal)
        val deliveryFee = order.deliveryFee ?: 0.0
        if (deliveryFee > 0.0) {
            binding.tvDeliveryFee.visibility = View.VISIBLE
            binding.tvGrandTotal.visibility = View.VISIBLE
            binding.tvDeliveryFee.text = getString(
                R.string.delivery_fee_format,
                getString(R.string.price_format, deliveryFee)
            )
            binding.tvGrandTotal.text = getString(
                R.string.grand_total_format,
                getString(R.string.price_format, order.totalAmount)
            )
        } else {
            binding.tvDeliveryFee.visibility = View.GONE
            binding.tvGrandTotal.visibility = View.GONE
        }
        binding.tvDeliveryNotes.visibility = View.GONE

        if (order.deliveryAddress != null) {
            binding.cardDelivery.visibility = View.VISIBLE
            binding.tvDeliveryAddress.text = getString(R.string.delivery_address_format, order.deliveryAddress)
            binding.tvContactNumber.text = getString(R.string.contact_number_format, order.contactNumber ?: "-")
            if (!order.deliveryNotes.isNullOrBlank()) {
                binding.tvDeliveryNotes.visibility = View.VISIBLE
                binding.tvDeliveryNotes.text = getString(R.string.note_format, order.deliveryNotes)
            }
        }

        if (order.status == "CANCELLED") {
            binding.cardCancellation.visibility = View.VISIBLE
            binding.tvCancellationReason.text =
                if (order.cancellationReason.isNullOrBlank()) getString(R.string.no_reason_provided)
                else order.cancellationReason
        }

        binding.btnCancel.visibility =
            if (order.status in listOf("PENDING", "ORDER_PLACED")) View.VISIBLE else View.GONE

        binding.btnReorder.visibility =
            if (order.status == "COMPLETED") View.VISIBLE else View.GONE

        bindRatingCard(order)

        val canSubmitProof = order.status == "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" ||
            (OrderStatusUi.isPickup(order) && order.status == "ORDER_PLACED" && !OrderStatusUi.isCashOnPickup(order))
        binding.cardPaymentAction.visibility = if (canSubmitProof) View.VISIBLE else View.GONE
        canUploadProof = canSubmitProof && order.proofImageUrl.isNullOrBlank()
        binding.btnUploadProof.isEnabled = canUploadProof && viewModel.isLoading.value != true
        binding.btnUploadProof.text = getString(
            if (canUploadProof) R.string.upload_payment_proof else R.string.proof_already_uploaded
        )
        binding.tvProofStatus.text = if (canUploadProof) {
            getString(R.string.no_payment_proof)
        } else {
            getString(R.string.payment_proof_waiting)
        }
    }

    private fun bindStatusBanner(status: String) {
        binding.tvStatusLabel.text = OrderStatusUi.label(status)
        binding.tvStatusDesc.text = OrderStatusUi.helperText(status)
        binding.cardStatusBanner.setCardBackgroundColor(
            ContextCompat.getColor(this, OrderStatusUi.colorRes(status))
        )
    }

    private fun bindTimeline(order: Order) {
        val flow = OrderStatusUi.flowFor(order)
        val step = statusToStep(order.status, flow)
        val rows = listOf<View?>(null, null, null, null, binding.rowStep5, binding.rowStep6, binding.rowStep7)
        val labels = listOf(
            binding.tvStep1Label,
            binding.tvStep2Label,
            binding.tvStep3Label,
            binding.tvStep4Label,
            binding.tvStep5Label,
            binding.tvStep6Label,
            binding.tvStep7Label
        )
        val dots = listOf(binding.dot1, binding.dot2, binding.dot3, binding.dot4, binding.dot5, binding.dot6, binding.dot7)
        val lines = listOf(binding.line1, binding.line2, binding.line3, binding.line4, binding.line5, binding.line6)

        labels.forEachIndexed { index, label ->
            if (index < flow.size) {
                rows[index]?.visibility = View.VISIBLE
                label.text = timelineLabel(flow[index])
            } else {
                rows[index]?.visibility = View.GONE
            }
        }
        binding.line5.visibility = if (flow.size > 5) View.VISIBLE else View.GONE
        binding.line6.visibility = if (flow.size > 6) View.VISIBLE else View.GONE

        if (step == -1) {
            dots.forEach { it.setBackgroundResource(R.drawable.bg_timeline_dot_pending) }
            lines.forEach { it.setBackgroundColor(ContextCompat.getColor(this, R.color.colorBorder)) }
            return
        }

        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(
                when {
                    i < step -> R.drawable.bg_timeline_dot_complete
                    i == step -> R.drawable.bg_timeline_dot_active
                    else -> R.drawable.bg_timeline_dot_pending
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

    private fun statusToStep(status: String, flow: List<String>): Int =
        if (status == "CANCELLED") -1 else flow.indexOf(status).takeIf { it >= 0 } ?: 0

    private fun timelineLabel(status: String): String = when (status) {
        "AWAITING_DELIVERY_QUOTE" -> getString(R.string.timeline_awaiting_delivery_quote)
        "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED" -> getString(R.string.timeline_delivery_fee_quoted)
        "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION" -> getString(R.string.timeline_payment_submitted)
        "OUT_FOR_DELIVERY" -> getString(R.string.out_for_delivery)
        "READY" -> getString(R.string.timeline_ready_for_pickup)
        else -> OrderStatusUi.label(status)
    }
    private fun bindRatingCard(order: Order) {
        if (order.status != "COMPLETED") {
            binding.cardRating.visibility = View.GONE
            return
        }

        binding.cardRating.visibility = View.VISIBLE

        if (order.rating != null && order.rating > 0) {
            ratingLocked = true
            selectedStars = order.rating
            updateStars(order.rating)
            binding.tvRatingTitle.text = getString(R.string.your_rating)
            binding.etComment.isEnabled = false
            binding.btnSubmitRating.visibility = View.GONE
        } else {
            ratingLocked = false
            binding.tvRatingTitle.text = getString(R.string.rate_order)
            binding.etComment.isEnabled = true
            binding.btnSubmitRating.visibility = View.VISIBLE
        }
    }

    private fun setupStarListeners() {
        val stars = listOf(binding.star1, binding.star2, binding.star3, binding.star4, binding.star5)
        stars.forEachIndexed { index, star ->
            star.setOnClickListener {
                if (ratingLocked) return@setOnClickListener
                selectedStars = index + 1
                updateStars(selectedStars)
            }
        }
    }

    private fun updateStars(count: Int) {
        val stars = listOf(binding.star1, binding.star2, binding.star3, binding.star4, binding.star5)
        stars.forEachIndexed { index, star ->
            star.setImageResource(
                if (index < count) R.drawable.ic_star else R.drawable.ic_star_outline
            )
        }
    }

    private fun showCancelDialog() {
        AlertDialog.Builder(this)
            .setTitle(R.string.cancel_order)
            .setMessage(R.string.cancel_order_message)
            .setPositiveButton(R.string.cancel_order) { _, _ ->
                viewModel.cancelOrder(orderId, getString(R.string.customer_request))
            }
            .setNegativeButton(R.string.keep_order, null)
            .show()
    }

    private fun submitProof(uri: Uri) {
        val mimeType = contentResolver.getType(uri)
        if (mimeType?.startsWith("image/") != true) {
            showMessage(getString(R.string.select_image_file))
            return
        }

        val fileSize = queryFileSize(uri)
        if (fileSize != null && fileSize > MAX_PROOF_BYTES) {
            showMessage(getString(R.string.image_size_limit))
            return
        }

        val bytes = try {
            contentResolver.openInputStream(uri)?.use { it.readBytes() }
        } catch (e: Exception) {
            null
        }

        if (bytes == null) {
            showMessage(getString(R.string.image_read_failed))
            return
        }

        if (bytes.size > MAX_PROOF_BYTES) {
            showMessage(getString(R.string.image_size_limit))
            return
        }

        val body = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        val proof = MultipartBody.Part.createFormData("proof", "payment-proof.jpg", body)
        viewModel.submitPayment(orderId, proof)
    }

    private fun queryFileSize(uri: Uri): Long? =
        contentResolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.SIZE)
            if (index >= 0 && cursor.moveToFirst()) cursor.getLong(index) else null
        }

    private fun showMessage(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_LONG).show()
    }

    companion object {
        private const val MAX_PROOF_BYTES = 5L * 1024L * 1024L
    }
}
