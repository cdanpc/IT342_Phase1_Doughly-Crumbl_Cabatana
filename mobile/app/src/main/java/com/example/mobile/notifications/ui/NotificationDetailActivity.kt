package com.example.mobile.notifications.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.mobile.databinding.ActivityNotificationDetailBinding

class NotificationDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNotificationDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNotificationDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        binding.tvTitle.text   = intent.getStringExtra("title")   ?: ""
        binding.tvMessage.text = intent.getStringExtra("message") ?: ""
        val raw = intent.getStringExtra("createdAt") ?: ""
        binding.tvDate.text    = if (raw.length >= 10) raw.take(10) else raw
    }
}
