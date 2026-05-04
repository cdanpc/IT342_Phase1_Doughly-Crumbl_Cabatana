package com.example.mobile.admin.ui

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.bumptech.glide.Glide
import com.example.mobile.databinding.ActivityAdminAddEditProductBinding
import com.example.mobile.model.Product
import com.example.mobile.model.ProductRequest
import com.example.mobile.util.SessionManager
import com.google.gson.Gson
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class AdminAddEditProductActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminAddEditProductBinding
    private lateinit var viewModel: AdminAddEditProductViewModel
    private var editingProduct: Product? = null
    private var pendingImageUri: Uri? = null

    private val imagePickerLauncher =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            uri ?: return@registerForActivityResult
            pendingImageUri = uri
            Glide.with(this).load(uri).centerCrop().into(binding.ivPreview)
            uploadImage(uri)
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminAddEditProductBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val session = SessionManager(this)
        val factory = AdminAddEditProductViewModelFactory(session)
        viewModel = ViewModelProvider(this, factory)[AdminAddEditProductViewModel::class.java]

        // Decode editing product if passed
        intent.getStringExtra("productJson")?.let { json ->
            editingProduct = Gson().fromJson(json, Product::class.java)
        }

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = if (editingProduct == null) "Add Product" else "Edit Product"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        editingProduct?.let { prefill(it) }

        observeViewModel()
        setupListeners()
    }

    private fun prefill(p: Product) {
        binding.etName.setText(p.name)
        binding.etDescription.setText(p.description ?: "")
        binding.etPrice.setText(p.price.toString())
        binding.etCategory.setText(p.category)
        binding.etStock.setText(if (p.available) "1" else "0")
        binding.etImageUrl.setText(p.imageUrl ?: "")
        Glide.with(this).load(p.imageUrl)
            .placeholder(android.R.drawable.ic_menu_gallery)
            .into(binding.ivPreview)
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
            binding.btnSave.isEnabled = !loading
        }
        viewModel.error.observe(this) { msg ->
            msg?.let { Toast.makeText(this, it, Toast.LENGTH_LONG).show() }
        }
        viewModel.uploadedImageUrl.observe(this) { url ->
            url?.let {
                binding.etImageUrl.setText(it)
                Toast.makeText(this, "Image uploaded", Toast.LENGTH_SHORT).show()
            }
        }
        viewModel.saveSuccess.observe(this) { product ->
            product ?: return@observe
            Toast.makeText(this, "Product saved!", Toast.LENGTH_SHORT).show()
            setResult(RESULT_OK)
            finish()
        }
    }

    private fun setupListeners() {
        binding.btnChooseImage.setOnClickListener {
            imagePickerLauncher.launch("image/*")
        }
        binding.btnSave.setOnClickListener { save() }
    }

    private fun uploadImage(uri: Uri) {
        val stream = contentResolver.openInputStream(uri) ?: return
        val bytes = stream.readBytes()
        stream.close()
        val requestBody = bytes.toRequestBody("image/*".toMediaTypeOrNull())
        val part = MultipartBody.Part.createFormData("file", "image.jpg", requestBody)
        viewModel.uploadImage(part)
    }

    private fun save() {
        val name = binding.etName.text.toString().trim()
        val desc = binding.etDescription.text.toString().trim()
        val priceStr = binding.etPrice.text.toString().trim()
        val category = binding.etCategory.text.toString().trim()
        val availableStr = binding.etStock.text.toString().trim()
        val imageUrl = binding.etImageUrl.text.toString().trim().ifEmpty { null }

        var valid = true
        if (name.isEmpty()) { binding.tilName.error = "Required"; valid = false } else binding.tilName.error = null
        if (desc.isEmpty()) { binding.tilDescription.error = "Required"; valid = false } else binding.tilDescription.error = null
        val price = priceStr.toDoubleOrNull()
        if (price == null || price <= 0) { binding.tilPrice.error = "Enter a valid price"; valid = false } else binding.tilPrice.error = null
        if (category.isEmpty()) { binding.tilCategory.error = "Required"; valid = false } else binding.tilCategory.error = null
        val availableInput = availableStr.toIntOrNull()
        if (availableInput == null) { binding.tilStock.error = "Enter 1 (available) or 0 (unavailable)"; valid = false } else binding.tilStock.error = null

        if (!valid) return

        viewModel.save(
            editingProduct?.id,
            ProductRequest(
                name = name,
                description = desc,
                price = price!!,
                imageUrl = imageUrl,
                category = category,
                available = availableInput!! != 0
            )
        )
    }
}
