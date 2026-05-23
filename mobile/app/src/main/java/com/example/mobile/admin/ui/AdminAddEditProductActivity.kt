package com.example.mobile.admin.ui

import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.bumptech.glide.Glide
import com.example.mobile.R
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

        intent.getStringExtra("productJson")?.let { json ->
            editingProduct = Gson().fromJson(json, Product::class.java)
        }

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = if (editingProduct == null)
            getString(R.string.admin_add_product_title)
        else
            getString(R.string.admin_edit_product_title)
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
        binding.switchAvailable.isChecked = p.available
        binding.etImageUrl.setText(p.imageUrl ?: "")
        Glide.with(this).load(p.imageUrl).centerCrop().into(binding.ivPreview)
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
                Toast.makeText(this, getString(R.string.admin_image_uploaded), Toast.LENGTH_SHORT).show()
            }
        }
        viewModel.saveSuccess.observe(this) { product ->
            product ?: return@observe
            Toast.makeText(this, getString(R.string.admin_product_saved), Toast.LENGTH_SHORT).show()
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
        val mimeType = contentResolver.getType(uri)
        if (mimeType?.startsWith("image/") != true) {
            Toast.makeText(this, getString(R.string.select_image_file), Toast.LENGTH_SHORT).show()
            return
        }

        val fileSize = queryFileSize(uri)
        if (fileSize != null && fileSize > MAX_IMAGE_BYTES) {
            Toast.makeText(this, getString(R.string.image_size_limit), Toast.LENGTH_SHORT).show()
            return
        }

        val bytes = try {
            contentResolver.openInputStream(uri)?.use { it.readBytes() }
        } catch (e: Exception) {
            null
        }
        if (bytes == null) {
            Toast.makeText(this, getString(R.string.image_read_failed), Toast.LENGTH_SHORT).show()
            return
        }
        if (bytes.size > MAX_IMAGE_BYTES) {
            Toast.makeText(this, getString(R.string.image_size_limit), Toast.LENGTH_SHORT).show()
            return
        }

        val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        val part = MultipartBody.Part.createFormData("file", "image.jpg", requestBody)
        viewModel.uploadImage(part)
    }

    private fun save() {
        val name = binding.etName.text.toString().trim()
        val desc = binding.etDescription.text.toString().trim()
        val priceStr = binding.etPrice.text.toString().trim()
        val category = binding.etCategory.text.toString().trim()
        val available = binding.switchAvailable.isChecked
        val imageUrl = binding.etImageUrl.text.toString().trim().ifEmpty { null }

        var valid = true
        if (name.isEmpty()) { binding.tilName.error = getString(R.string.error_required); valid = false } else binding.tilName.error = null
        if (desc.isEmpty()) { binding.tilDescription.error = getString(R.string.error_required); valid = false } else binding.tilDescription.error = null
        val price = priceStr.toDoubleOrNull()
        if (price == null || price <= 0) { binding.tilPrice.error = getString(R.string.error_invalid_price); valid = false } else binding.tilPrice.error = null
        if (category.isEmpty()) { binding.tilCategory.error = getString(R.string.error_required); valid = false } else binding.tilCategory.error = null

        if (!valid) return

        viewModel.save(
            editingProduct?.id,
            ProductRequest(
                name = name,
                description = desc,
                price = price!!,
                imageUrl = imageUrl,
                category = category,
                available = available
            )
        )
    }

    private fun queryFileSize(uri: Uri): Long? =
        contentResolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.SIZE)
            if (index >= 0 && cursor.moveToFirst()) cursor.getLong(index) else null
        }

    companion object {
        private const val MAX_IMAGE_BYTES = 5L * 1024L * 1024L
    }
}
