package com.example.mobile.home.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.FragmentHomeBinding
import com.example.mobile.model.Product
import com.example.mobile.util.SessionManager

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: HomeViewModel
    private lateinit var adapter: ProductAdapter
    private var currentSearch: String? = null
    private var currentCategory: String? = null

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

        adapter = ProductAdapter(
            onAddToCart = { product -> viewModel.addToCart(product) },
            onFavoriteClick = { product -> viewModel.toggleFavorite(product) },
            onProductClick = { product -> showProductDetail(product) }
        )

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        val skeletonAdapter = SkeletonAdapter(6)
        binding.skeletonRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.skeletonRecyclerView.adapter = skeletonAdapter

        observeViewModel()
        setupSearch()
        setupCategoryChips()

        binding.swipeRefresh.setOnRefreshListener { viewModel.loadProducts() }
        binding.btnClearFilters.setOnClickListener {
            binding.chipAll.isChecked = true
            binding.etSearch.setText("")
            currentSearch = null
            currentCategory = null
            loadFilteredProducts()
        }

        viewModel.loadProducts()
        viewModel.loadFavorites()
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
        viewModel.addingProductIds.observe(viewLifecycleOwner) { pendingIds ->
            adapter.pendingProductIds = pendingIds
        }
        viewModel.addToCartMessage.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
        }
        viewModel.favoriteProductIds.observe(viewLifecycleOwner) { favoriteIds ->
            adapter.favoriteProductIds = favoriteIds
        }
        viewModel.pendingFavoriteProductIds.observe(viewLifecycleOwner) { pendingIds ->
            adapter.pendingFavoriteProductIds = pendingIds
        }
        viewModel.favoriteMessage.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
        }
    }

    private fun setupSearch() {
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val query = s?.toString()?.trim()
                currentSearch = query?.takeIf { it.isNotBlank() }
                loadFilteredProducts()
            }
        })
    }

    private fun setupCategoryChips() {
        binding.chipGroupCategories.setOnCheckedStateChangeListener { _, checkedIds ->
            currentCategory = when (checkedIds.firstOrNull()) {
                binding.chipCookies.id    -> "Cookies"
                binding.chipCroissants.id -> "Croissants"
                binding.chipDonuts.id     -> "Donuts"
                binding.chipSourdough.id  -> "Sourdough"
                binding.chipCakes.id      -> "Cakes"
                binding.chipPastries.id   -> "Pastries"
                binding.chipBeverages.id  -> "Beverages"
                else                      -> null
            }
            loadFilteredProducts()
        }
    }

    private fun loadFilteredProducts() {
        viewModel.loadProducts(search = currentSearch, category = currentCategory)
    }

    private fun showProductDetail(product: Product) {
        val sheet = ProductDetailBottomSheet.newInstance(product)
        sheet.onAddToCart = { p, qty ->
            viewModel.addToCart(p, qty)
        }
        sheet.show(childFragmentManager, ProductDetailBottomSheet.TAG)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
