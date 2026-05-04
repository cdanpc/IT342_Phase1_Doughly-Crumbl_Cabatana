package com.example.mobile.home.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.widget.SearchView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import com.example.mobile.cart.data.CartRepository
import com.example.mobile.databinding.FragmentHomeBinding
import com.example.mobile.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: HomeViewModel
    private lateinit var adapter: ProductAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, HomeViewModelFactory(session))[HomeViewModel::class.java]

        adapter = ProductAdapter { product ->
            CoroutineScope(Dispatchers.Main).launch {
                try {
                    CartRepository(session).addToCart(product.id, 1)
                    Toast.makeText(requireContext(), "${product.name} added to cart", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    Toast.makeText(requireContext(), "Failed to add to cart", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.recyclerView.layoutManager = GridLayoutManager(requireContext(), 2)
        binding.recyclerView.adapter = adapter

        val skeletonAdapter = SkeletonAdapter(6)
        binding.skeletonRecyclerView.layoutManager = GridLayoutManager(requireContext(), 2)
        binding.skeletonRecyclerView.adapter = skeletonAdapter

        observeViewModel()
        setupSearch()
        setupCategoryChips()

        binding.swipeRefresh.setOnRefreshListener { viewModel.loadProducts() }
        binding.btnClearFilters.setOnClickListener {
            binding.chipAll.isChecked = true
            viewModel.loadProducts()
        }

        viewModel.loadProducts()
    }

    private fun observeViewModel() {
        viewModel.products.observe(viewLifecycleOwner) { list ->
            adapter.submitList(list)
            val isEmpty = list.isEmpty()
            binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
            binding.recyclerView.visibility = if (isEmpty) View.GONE else View.VISIBLE
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            if (loading) {
                binding.skeletonRecyclerView.visibility = View.VISIBLE
                binding.recyclerView.visibility = View.GONE
            } else {
                binding.skeletonRecyclerView.visibility = View.GONE
            }
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
            binding.swipeRefresh.isRefreshing = false
        }
    }

    private fun setupSearch() {
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(q: String?): Boolean {
                viewModel.loadProducts(q?.takeIf { it.isNotBlank() })
                return true
            }
            override fun onQueryTextChange(q: String?): Boolean {
                if (q.isNullOrBlank()) viewModel.loadProducts()
                return false
            }
        })
    }

    private fun setupCategoryChips() {
        binding.chipGroupCategories.setOnCheckedStateChangeListener { _, checkedIds ->
            val category = when (checkedIds.firstOrNull()) {
                binding.chipCookies.id    -> "Cookies"
                binding.chipCroissants.id -> "Croissants"
                binding.chipDonuts.id     -> "Donuts"
                binding.chipSourdough.id  -> "Sourdough"
                binding.chipCakes.id      -> "Cakes"
                binding.chipPastries.id   -> "Pastries"
                binding.chipBeverages.id  -> "Beverages"
                else                      -> null
            }
            viewModel.loadProducts(category = category)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
