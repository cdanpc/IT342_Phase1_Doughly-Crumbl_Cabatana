package com.example.mobile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.example.mobile.cart.ui.CartFragment
import com.example.mobile.databinding.ActivityMainBinding
import com.example.mobile.home.ui.HomeFragment
import com.example.mobile.notifications.data.NotificationsRepository
import com.example.mobile.notifications.ui.NotificationsFragment
import com.example.mobile.orders.ui.OrdersFragment
import com.example.mobile.profile.ui.ProfileFragment
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val openTab = intent.getStringExtra("openTab")
        if (savedInstanceState == null) {
            if (openTab == "cart") {
                binding.bottomNav.selectedItemId = R.id.nav_cart
                loadFragment(CartFragment())
            } else {
                loadFragment(HomeFragment())
            }
        }

        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home          -> loadFragment(HomeFragment())
                R.id.nav_cart          -> loadFragment(CartFragment())
                R.id.nav_orders        -> loadFragment(OrdersFragment())
                R.id.nav_notifications -> {
                    binding.bottomNav.removeBadge(R.id.nav_notifications)
                    loadFragment(NotificationsFragment())
                }
                R.id.nav_profile       -> loadFragment(ProfileFragment())
            }
            true
        }

        startNotificationBadgePolling()
    }

    private fun startNotificationBadgePolling() {
        val repo = NotificationsRepository(SessionManager(this))
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                while (true) {
                    val count = repo.getUnreadCount()
                    setAlertsBadge(count)
                    delay(30_000L)
                }
            }
        }
    }

    fun setCartBadge(count: Int) {
        if (count > 0) {
            binding.bottomNav.getOrCreateBadge(R.id.nav_cart).apply {
                isVisible = true
                number = count
            }
        } else {
            binding.bottomNav.removeBadge(R.id.nav_cart)
        }
    }

    fun setAlertsBadge(count: Int) {
        if (count > 0) {
            binding.bottomNav.getOrCreateBadge(R.id.nav_notifications).apply {
                isVisible = true
                number = count
            }
        } else {
            binding.bottomNav.removeBadge(R.id.nav_notifications)
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }
}
