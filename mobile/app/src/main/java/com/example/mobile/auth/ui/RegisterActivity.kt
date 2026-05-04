package com.example.mobile.auth.ui

import android.content.Intent
import android.graphics.Color
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
            msg?.let {
                binding.tilPassword.error = it
            }
        }
        viewModel.authResponse.observe(this) { response ->
            response ?: return@observe
            startActivity(Intent(this, MainActivity::class.java))
            finishAffinity()
        }
    }

    private fun setupListeners() {
        binding.etPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                updateStrengthBar(s?.toString() ?: "")
            }
        })

        binding.btnRegister.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val phone = binding.etPhone.text.toString().trim()
            val address = binding.etAddress.text.toString().trim()
            val password = binding.etPassword.text.toString()
            val confirmPassword = binding.etConfirmPassword.text.toString()

            var valid = true

            if (name.isEmpty()) {
                binding.tilName.error = "Name required"
                valid = false
            } else {
                binding.tilName.error = null
            }

            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.tilEmail.error = "Enter a valid email"
                valid = false
            } else {
                binding.tilEmail.error = null
            }

            if (phone.isEmpty()) {
                binding.tilPhone.error = "Phone number required"
                valid = false
            } else {
                binding.tilPhone.error = null
            }

            if (address.isEmpty()) {
                binding.tilAddress.error = "Delivery address required"
                valid = false
            } else {
                binding.tilAddress.error = null
            }

            if (password.length < 8) {
                binding.tilPassword.error = "Min 8 characters"
                valid = false
            } else {
                binding.tilPassword.error = null
            }

            if (confirmPassword != password) {
                binding.tilConfirmPassword.error = "Passwords do not match"
                valid = false
            } else {
                binding.tilConfirmPassword.error = null
            }

            if (valid) viewModel.register(name, email, password, phone, address)
        }

        binding.tvLogin.setOnClickListener { finish() }
    }

    private fun updateStrengthBar(password: String) {
        val strength = calcStrength(password)
        binding.strengthBar.progress = strength
        val (tint, label) = when (strength) {
            0 -> Pair(getColor(R.color.colorBorder), "")
            1 -> Pair(getColor(R.color.colorError), "Weak")
            2 -> Pair(getColor(R.color.colorWarning), "Medium")
            else -> Pair(getColor(R.color.colorSuccess), "Strong")
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
