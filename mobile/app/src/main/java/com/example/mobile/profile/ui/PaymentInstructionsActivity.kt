package com.example.mobile.profile.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.mobile.databinding.ActivityPaymentInstructionsBinding

class PaymentInstructionsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaymentInstructionsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentInstructionsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }
}
