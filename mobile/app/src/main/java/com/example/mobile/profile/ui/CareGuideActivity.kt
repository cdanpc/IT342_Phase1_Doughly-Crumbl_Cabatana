package com.example.mobile.profile.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.mobile.databinding.ActivityCareGuideBinding

class CareGuideActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCareGuideBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCareGuideBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }
}
