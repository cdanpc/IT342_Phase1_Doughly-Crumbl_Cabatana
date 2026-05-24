package com.example.mobile.admin.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.R
import com.example.mobile.databinding.FragmentAdminOrdersBinding
import com.example.mobile.util.OrderStatusUi
import com.example.mobile.util.SessionManager

class AdminOrdersFragment : Fragment() {

    private var _binding: FragmentAdminOrdersBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: AdminOrdersViewModel
    private lateinit var adapter: AdminOrderAdapter

    private val statuses = listOf<String?>(null) + OrderStatusUi.adminStatuses

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAdminOrdersBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, AdminOrdersViewModelFactory(session))[AdminOrdersViewModel::class.java]

        adapter = AdminOrderAdapter { order ->
            val intent = Intent(requireContext(), AdminOrderDetailActivity::class.java)
            intent.putExtra("orderId", order.orderId)
            startActivity(intent)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        // Build status filter chips programmatically
        val statusLabels = listOf(getString(R.string.admin_all_statuses)) +
            OrderStatusUi.adminStatuses.map(OrderStatusUi::label)
        statusLabels.forEachIndexed { index, label ->
            val chip = com.google.android.material.chip.Chip(requireContext()).apply {
                text = label
                isCheckable = true
                isChecked = index == 0
            }
            chip.setOnCheckedChangeListener { _, checked ->
                if (checked) {
                    viewModel.filterByStatus(statuses[index])
                    // Uncheck siblings
                    (0 until binding.chipGroupStatus.childCount).forEach { i ->
                        if (i != index) {
                            (binding.chipGroupStatus.getChildAt(i) as? com.google.android.material.chip.Chip)
                                ?.isChecked = false
                        }
                    }
                }
            }
            binding.chipGroupStatus.addView(chip)
        }

        observeViewModel()
        binding.swipeRefresh.setOnRefreshListener { viewModel.loadOrders() }
        binding.btnOrdersRetry.setOnClickListener { viewModel.loadOrders() }
        viewModel.loadOrders()
    }

    private fun observeViewModel() {
        viewModel.orders.observe(viewLifecycleOwner) { list ->
            adapter.submitList(list)
            binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
            binding.errorState.visibility = View.GONE
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let {
                binding.tvOrdersError.text = it
                binding.errorState.visibility = View.VISIBLE
                binding.tvEmpty.visibility = View.GONE
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
            binding.swipeRefresh.isRefreshing = false
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadOrders()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
