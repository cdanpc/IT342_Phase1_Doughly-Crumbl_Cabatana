package com.example.mobile.home.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.bumptech.glide.Glide
import com.example.mobile.R
import com.example.mobile.databinding.BottomSheetProductDetailBinding
import com.example.mobile.model.Product
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class ProductDetailBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetProductDetailBinding? = null
    private val binding get() = _binding!!

    var onAddToCart: ((Product, Int) -> Unit)? = null

    private var quantity = 1
    private var productPrice = 0.0

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetProductDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val args = requireArguments()
        val product = Product(
            id = args.getLong(ARG_ID),
            name = args.getString(ARG_NAME, ""),
            price = args.getDouble(ARG_PRICE),
            description = args.getString(ARG_DESC),
            imageUrl = args.getString(ARG_IMAGE_URL),
            category = args.getString(ARG_CATEGORY, "")
        )
        productPrice = product.price

        binding.tvName.text = product.name
        binding.tvPrice.text = getString(R.string.price_format, product.price)
        binding.chipCategory.text = product.category
        binding.tvDescription.text = product.description
            ?: getString(R.string.default_description)

        Glide.with(this)
            .load(product.imageUrl)
            .placeholder(R.mipmap.ic_launcher_round)
            .error(R.mipmap.ic_launcher_round)
            .centerCrop()
            .into(binding.ivProduct)

        updateQuantityControls()

        binding.btnDecrement.setOnClickListener {
            if (quantity > 1) {
                quantity--
                updateQuantityControls()
            }
        }
        binding.btnIncrement.setOnClickListener {
            if (quantity < 10) {
                quantity++
                updateQuantityControls()
            }
        }
        binding.btnAddToCart.setOnClickListener {
            onAddToCart?.invoke(product, quantity)
            dismiss()
        }
    }

    override fun onStart() {
        super.onStart()
        val sheet = dialog?.findViewById<View>(com.google.android.material.R.id.design_bottom_sheet)
        sheet?.let {
            val maxHeight = (resources.displayMetrics.heightPixels * 0.75).toInt()
            val behavior = BottomSheetBehavior.from(it)
            behavior.maxHeight = maxHeight
            behavior.peekHeight = maxHeight
            behavior.state = BottomSheetBehavior.STATE_EXPANDED
            behavior.skipCollapsed = true
        }
    }

    private fun updateQuantityControls() {
        binding.tvQuantity.text = quantity.toString()
        binding.btnDecrement.isEnabled = quantity > 1
        binding.btnDecrement.alpha = if (quantity > 1) 1f else 0.45f
        binding.btnIncrement.isEnabled = quantity < 10
        binding.btnIncrement.alpha = if (quantity < 10) 1f else 0.55f
        binding.btnAddToCart.text = getString(R.string.add_with_price, productPrice * quantity)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "ProductDetailBottomSheet"
        private const val ARG_ID = "id"
        private const val ARG_NAME = "name"
        private const val ARG_PRICE = "price"
        private const val ARG_DESC = "desc"
        private const val ARG_IMAGE_URL = "imageUrl"
        private const val ARG_CATEGORY = "category"

        fun newInstance(product: Product) = ProductDetailBottomSheet().apply {
            arguments = Bundle().apply {
                putLong(ARG_ID, product.id)
                putString(ARG_NAME, product.name)
                putDouble(ARG_PRICE, product.price)
                putString(ARG_DESC, product.description)
                putString(ARG_IMAGE_URL, product.imageUrl)
                putString(ARG_CATEGORY, product.category)
            }
        }
    }
}
