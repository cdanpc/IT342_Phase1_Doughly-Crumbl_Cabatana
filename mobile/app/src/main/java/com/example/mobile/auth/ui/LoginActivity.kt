package com.example.mobile.auth.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.MainActivity
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
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
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

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            binding.errorBanner.visibility = View.GONE
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.tilEmail.error = "Enter a valid email"
                return@setOnClickListener
            }
            binding.tilEmail.error = null
            if (password.isEmpty()) {
                binding.tilPassword.error = "Password required"
                return@setOnClickListener
            }
            binding.tilPassword.error = null
            viewModel.login(email, password)
        }
        binding.tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
        binding.tvForgotPassword.setOnClickListener {
            // placeholder — no forgot password screen yet
        }
        binding.btnGoogle.setOnClickListener {
            // placeholder — Google OAuth not implemented yet
        }
    }
}
