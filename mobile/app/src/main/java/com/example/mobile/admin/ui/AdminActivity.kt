package com.example.mobile.admin.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.example.mobile.R
import com.example.mobile.databinding.ActivityAdminBinding

class AdminActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (savedInstanceState == null) loadFragment(AdminDashboardFragment())

        binding.adminBottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_admin_dashboard -> loadFragment(AdminDashboardFragment())
                R.id.nav_admin_products  -> loadFragment(AdminProductsFragment())
                R.id.nav_admin_orders    -> loadFragment(AdminOrdersFragment())
                R.id.nav_admin_users     -> loadFragment(AdminUsersFragment())
                R.id.nav_admin_profile   -> loadFragment(AdminProfileFragment())
            }
            true
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.adminFragmentContainer, fragment)
            .commit()
    }
}
