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
            binding.tvPendingCount.text = s.pending.toString()
            binding.tvConfirmedCount.text = s.confirmed.toString()
            binding.tvPreparingCount.text = s.preparing.toString()
            binding.tvReadyCount.text = s.ready.toString()
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.recentOrders.observe(viewLifecycleOwner) { orders ->
            recentAdapter.submitList(orders)
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
            binding.swipeRefresh.isRefreshing = false
        }

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.load()
        }

        viewModel.load()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
