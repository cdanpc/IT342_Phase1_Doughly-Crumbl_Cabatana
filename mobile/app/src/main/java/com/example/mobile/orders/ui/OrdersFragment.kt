package com.example.mobile.orders.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.FragmentOrdersBinding
import com.example.mobile.util.SessionManager

class OrdersFragment : Fragment() {

    private var _binding: FragmentOrdersBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: OrdersViewModel
    private lateinit var adapter: OrderAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentOrdersBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, OrdersViewModelFactory(session))[OrdersViewModel::class.java]

        adapter = OrderAdapter { order ->
            val intent = Intent(requireContext(), OrderDetailActivity::class.java)
            intent.putExtra("orderId", order.orderId)
            startActivity(intent)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        observeViewModel()
        binding.swipeRefresh.setOnRefreshListener { viewModel.loadOrders() }
        binding.btnOrdersRetry.setOnClickListener { viewModel.loadOrders() }
        viewModel.loadOrders()
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadOrders()
    }

    private fun observeViewModel() {
        viewModel.orders.observe(viewLifecycleOwner) { list ->
            adapter.submitList(list)
            val isEmpty = list.isEmpty()
            binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
            binding.recyclerView.visibility = if (isEmpty) View.GONE else View.VISIBLE
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
                binding.emptyState.visibility = View.GONE
            }
            binding.swipeRefresh.isRefreshing = false
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
