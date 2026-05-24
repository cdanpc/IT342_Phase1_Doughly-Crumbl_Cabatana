package com.example.mobile.admin.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.FragmentAdminDashboardBinding
import com.example.mobile.orders.ui.OrderAdapter
import com.example.mobile.util.SessionManager

class AdminDashboardFragment : Fragment() {

    private var _binding: FragmentAdminDashboardBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: AdminDashboardViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAdminDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, AdminDashboardViewModelFactory(session))[AdminDashboardViewModel::class.java]

        val recentAdapter = OrderAdapter { /* read-only on dashboard */ }
        binding.recyclerRecentOrders.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerRecentOrders.adapter = recentAdapter
        binding.recyclerRecentOrders.isNestedScrollingEnabled = false

        viewModel.stats.observe(viewLifecycleOwner) { s ->
            binding.tvTotalProductsCount.text = s.totalProducts.toString()
            binding.tvTotalOrdersCount.text = s.totalOrders.toString()
            binding.tvNeedsAttentionCount.text = s.needsAttention.toString()
            binding.tvPaymentPendingCount.text = s.paymentPending.toString()
            binding.tvInProgressCount.text = s.inProgress.toString()
            binding.tvRevenueCount.text = getString(com.example.mobile.R.string.price_format, s.revenue)
            binding.errorState.visibility = View.GONE
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.recentOrders.observe(viewLifecycleOwner) { orders ->
            recentAdapter.submitList(orders)
            binding.tvRecentOrdersEmpty.visibility = if (orders.isEmpty()) View.VISIBLE else View.GONE
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let {
                binding.tvDashboardError.text = it
                binding.errorState.visibility = View.VISIBLE
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
            binding.swipeRefresh.isRefreshing = false
        }

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.load()
        }
        binding.btnDashboardRetry.setOnClickListener {
            viewModel.load()
        }

        viewModel.load()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
