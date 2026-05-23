package com.example.mobile.cart.ui

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.material.snackbar.Snackbar
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.R
import com.example.mobile.databinding.FragmentCartBinding
import com.example.mobile.util.SessionManager
import com.google.android.material.bottomnavigation.BottomNavigationView

class CartFragment : Fragment() {

    private var _binding: FragmentCartBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: CartViewModel
    private lateinit var adapter: CartItemAdapter

    private val checkoutLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            viewModel.loadCart()
            Snackbar.make(requireView(), getString(R.string.order_placed_success), Snackbar.LENGTH_LONG)
                .setAction(getString(R.string.view_orders)) {
                    activity?.findViewById<BottomNavigationView>(R.id.bottomNav)
                        ?.selectedItemId = R.id.nav_orders
                }
                .show()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCartBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, CartViewModelFactory(session))[CartViewModel::class.java]

        adapter = CartItemAdapter(
            onQtyChanged = { id, qty -> viewModel.updateItem(id, qty) },
            onRemove = { id -> viewModel.removeItem(id) }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        observeViewModel()

        binding.btnCheckout.setOnClickListener {
            checkoutLauncher.launch(Intent(requireContext(), CheckoutActivity::class.java))
        }

        binding.btnBrowseMenu.setOnClickListener {
            activity?.findViewById<BottomNavigationView>(R.id.bottomNav)
                ?.selectedItemId = R.id.nav_home
        }

        binding.swipeRefresh.setOnRefreshListener { viewModel.loadCart() }

        viewModel.loadCart()
    }

    private fun observeViewModel() {
        viewModel.cart.observe(viewLifecycleOwner) { cart ->
            val items = cart?.items ?: emptyList()
            adapter.submitList(items)

            val isEmpty = items.isEmpty()
            binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
            binding.recyclerView.visibility = if (isEmpty) View.GONE else View.VISIBLE
            binding.orderSummaryCard.visibility = if (isEmpty) View.GONE else View.VISIBLE
            binding.btnCheckout.visibility = if (isEmpty) View.GONE else View.VISIBLE
            binding.btnCheckout.isEnabled = !isEmpty

            binding.tvSubtotal.text = getString(R.string.price_format, cart?.totalAmount ?: 0.0)
            binding.tvTotal.text = getString(R.string.price_format, cart?.totalAmount ?: 0.0)
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
            adapter.actionsEnabled = !loading
            if (loading) binding.btnCheckout.isEnabled = false
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            binding.swipeRefresh.isRefreshing = false
            msg?.let {
                Snackbar.make(requireView(), it, Snackbar.LENGTH_LONG)
                    .setAction(getString(R.string.retry)) { viewModel.loadCart() }
                    .show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
