package com.example.mobile.auth.ui

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.MainActivity
import com.example.mobile.R
import com.example.mobile.admin.ui.AdminActivity
import com.example.mobile.databinding.ActivityLoginBinding
import com.example.mobile.util.SessionManager

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: LoginViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val factory = LoginViewModelFactory(SessionManager(this))
        viewModel = ViewModelProvider(this, factory)[LoginViewModel::class.java]

        observeViewModel()
        setupListeners()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { loading ->
            binding.loadingContainer.visibility = if (loading) View.VISIBLE else View.GONE
            binding.btnLogin.isEnabled = !loading
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
            val dest = if (SessionManager(this).isAdmin()) AdminActivity::class.java
                       else MainActivity::class.java
            startActivity(Intent(this, dest))
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
        clearErrorOnType(binding.etEmail, binding.tilEmail, binding.tvEmailError)
        clearErrorOnType(binding.etPassword, binding.tilPassword, binding.tvPasswordError)

        binding.btnLogin.setOnClickListener {
            binding.errorBanner.visibility = View.GONE
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                showFieldError(binding.tilEmail, binding.tvEmailError, getString(R.string.error_email_invalid))
                return@setOnClickListener
            }
            showFieldError(binding.tilEmail, binding.tvEmailError, null)
            if (password.isEmpty()) {
                showFieldError(binding.tilPassword, binding.tvPasswordError, getString(R.string.error_password_required))
                return@setOnClickListener
            }
            showFieldError(binding.tilPassword, binding.tvPasswordError, null)
            viewModel.login(email, password)
        }
        binding.tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
        binding.tvForgotPassword.setOnClickListener {
            Toast.makeText(this, getString(R.string.msg_forgot_password_unavailable), Toast.LENGTH_SHORT).show()
        }
        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, getString(R.string.msg_google_signin_unavailable), Toast.LENGTH_SHORT).show()
        }
    }
}
