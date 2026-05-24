package com.example.mobile.auth.ui

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.MainActivity
import com.example.mobile.R
import com.example.mobile.databinding.ActivityRegisterBinding
import com.example.mobile.util.SessionManager

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var viewModel: RegisterViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val factory = RegisterViewModelFactory(SessionManager(this))
        viewModel = ViewModelProvider(this, factory)[RegisterViewModel::class.java]

        observeViewModel()
        setupListeners()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
            binding.btnRegister.isEnabled = !loading
        }
        viewModel.error.observe(this) { msg ->
            if (msg != null) {
                binding.tvError.text = msg
                binding.errorBanner.visibility = View.VISIBLE
            } else {
                binding.errorBanner.visibility = View.GONE
            }
        }
        viewModel.authResponse.observe(this) { response ->
            response ?: return@observe
            startActivity(Intent(this, MainActivity::class.java))
            finishAffinity()
        }
    }

    private fun showFieldError(til: com.google.android.material.textfield.TextInputLayout, errorView: android.widget.TextView, msg: String?) {
        til.isActivated = msg != null
        errorView.text = msg ?: ""
        errorView.visibility = if (msg != null) View.VISIBLE else View.GONE
    }

    private fun clearErrorOnType(editText: android.widget.EditText, til: com.google.android.material.textfield.TextInputLayout, errorView: android.widget.TextView) {
        editText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) { showFieldError(til, errorView, null) }
        })
    }

    private fun setupListeners() {
        clearErrorOnType(binding.etName, binding.tilName, binding.tvNameError)
        clearErrorOnType(binding.etEmail, binding.tilEmail, binding.tvEmailError)
        clearErrorOnType(binding.etPhone, binding.tilPhone, binding.tvPhoneError)
        clearErrorOnType(binding.etAddress, binding.tilAddress, binding.tvAddressError)
        clearErrorOnType(binding.etConfirmPassword, binding.tilConfirmPassword, binding.tvConfirmPasswordError)

        binding.etPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                showFieldError(binding.tilPassword, binding.tvPasswordError, null)
                updateStrengthBar(s?.toString() ?: "")
            }
        })

        binding.btnRegister.setOnClickListener {
            binding.errorBanner.visibility = View.GONE
            val name = binding.etName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val phone = binding.etPhone.text.toString().trim()
            val address = binding.etAddress.text.toString().trim()
            val password = binding.etPassword.text.toString()
            val confirmPassword = binding.etConfirmPassword.text.toString()

            var valid = true

            if (name.isEmpty()) {
                showFieldError(binding.tilName, binding.tvNameError, getString(R.string.error_name_required))
                valid = false
            } else {
                showFieldError(binding.tilName, binding.tvNameError, null)
            }

            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                showFieldError(binding.tilEmail, binding.tvEmailError, getString(R.string.error_email_invalid))
                valid = false
            } else {
                showFieldError(binding.tilEmail, binding.tvEmailError, null)
            }

            if (phone.isEmpty()) {
                showFieldError(binding.tilPhone, binding.tvPhoneError, getString(R.string.error_phone_required))
                valid = false
            } else if (!Regex("^(09\\d{9}|\\+639\\d{9})$").matches(phone)) {
                showFieldError(binding.tilPhone, binding.tvPhoneError, getString(R.string.error_phone_invalid))
                valid = false
            } else {
                showFieldError(binding.tilPhone, binding.tvPhoneError, null)
            }

            if (address.isEmpty()) {
                showFieldError(binding.tilAddress, binding.tvAddressError, getString(R.string.error_delivery_address_required))
                valid = false
            } else {
                showFieldError(binding.tilAddress, binding.tvAddressError, null)
            }

            if (password.length < 8) {
                showFieldError(binding.tilPassword, binding.tvPasswordError, getString(R.string.error_password_min_length))
                valid = false
            } else {
                showFieldError(binding.tilPassword, binding.tvPasswordError, null)
            }

            if (confirmPassword != password) {
                showFieldError(binding.tilConfirmPassword, binding.tvConfirmPasswordError, getString(R.string.error_passwords_mismatch))
                valid = false
            } else {
                showFieldError(binding.tilConfirmPassword, binding.tvConfirmPasswordError, null)
            }

            if (valid) viewModel.register(name, email, password, confirmPassword, phone, address)
        }

        binding.tvLogin.setOnClickListener { finish() }
    }

    private fun updateStrengthBar(password: String) {
        val strength = calcStrength(password)
        binding.strengthBar.progress = strength
        val (tint, label) = when (strength) {
            0 -> Pair(getColor(R.color.colorBorder), "")
            1 -> Pair(getColor(R.color.colorError), getString(R.string.strength_weak))
            2 -> Pair(getColor(R.color.colorWarning), getString(R.string.strength_medium))
            else -> Pair(getColor(R.color.colorSuccess), getString(R.string.strength_strong))
        }
        binding.strengthBar.progressTintList = android.content.res.ColorStateList.valueOf(tint)
        binding.tvStrengthLabel.text = label
        binding.tvStrengthLabel.setTextColor(tint)
    }

    private fun calcStrength(pw: String): Int {
        if (pw.isEmpty()) return 0
        var score = 0
        if (pw.length >= 8) score++
        if (pw.length >= 12) score++
        if (pw.any { it.isDigit() } && pw.any { it.isLetter() }) score++
        return score.coerceAtMost(3)
    }
}
