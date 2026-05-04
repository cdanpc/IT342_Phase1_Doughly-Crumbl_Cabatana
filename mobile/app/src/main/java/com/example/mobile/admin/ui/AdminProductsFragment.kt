package com.example.mobile.admin.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.FragmentAdminProductsBinding
import com.example.mobile.model.Product
import com.example.mobile.util.SessionManager
import com.google.gson.Gson

class AdminProductsFragment : Fragment() {

    private var _binding: FragmentAdminProductsBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: AdminProductsViewModel
    private lateinit var adapter: AdminProductAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAdminProductsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, AdminProductsViewModelFactory(session))[AdminProductsViewModel::class.java]

        adapter = AdminProductAdapter(
            onEdit = { product -> openAddEdit(product) },
            onDelete = { product -> confirmDelete(product) }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        observeViewModel()

        binding.fab.setOnClickListener { openAddEdit(null) }
        binding.swipeRefresh.setOnRefreshListener { viewModel.loadProducts() }

        viewModel.loadProducts()
    }

    private fun observeViewModel() {
        viewModel.products.observe(viewLifecycleOwner) { list ->
            adapter.submitList(list)
            binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.deleteSuccess.observe(viewLifecycleOwner) { success ->
            if (success == true) Toast.makeText(requireContext(), "Product deleted", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openAddEdit(product: Product?) {
        val intent = Intent(requireContext(), AdminAddEditProductActivity::class.java)
        product?.let { intent.putExtra("productJson", Gson().toJson(it)) }
        startActivity(intent)
    }

    private fun confirmDelete(product: Product) {
        AlertDialog.Builder(requireContext())
            .setTitle("Delete Product")
            .setMessage("Delete \"${product.name}\"? This cannot be undone.")
            .setPositiveButton("Delete") { _, _ -> viewModel.deleteProduct(product.id) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadProducts()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
