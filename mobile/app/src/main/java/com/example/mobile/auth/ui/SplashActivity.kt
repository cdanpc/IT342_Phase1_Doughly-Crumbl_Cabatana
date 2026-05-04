package com.example.mobile.auth.ui

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.example.mobile.MainActivity
import com.example.mobile.R
import com.example.mobile.admin.ui.AdminActivity
import com.example.mobile.util.SessionManager

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        Handler(Looper.getMainLooper()).postDelayed({
            val session = SessionManager(this)
            val intent = when {
                !session.isLoggedIn() -> Intent(this, LoginActivity::class.java)
                session.isAdmin()     -> Intent(this, AdminActivity::class.java)
                else                  -> Intent(this, MainActivity::class.java)
            }
            startActivity(intent)
            finish()
        }, 1500)
    }
}
