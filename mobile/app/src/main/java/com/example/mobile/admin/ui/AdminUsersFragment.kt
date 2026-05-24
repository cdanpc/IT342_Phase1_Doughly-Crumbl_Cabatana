package com.example.mobile.admin.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.R
import com.example.mobile.databinding.FragmentAdminUsersBinding
import com.example.mobile.model.AdminUser
import com.example.mobile.util.SessionManager

class AdminUsersFragment : Fragment() {

    private var _binding: FragmentAdminUsersBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: AdminUsersViewModel
    private lateinit var adapter: AdminUserAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAdminUsersBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val session = SessionManager(requireContext())
        viewModel = ViewModelProvider(this, AdminUsersViewModelFactory(session))[AdminUsersViewModel::class.java]

        adapter = AdminUserAdapter(
            currentUserId = session.getUserId(),
            onBan = { confirmAction(it, R.string.admin_user_ban_title, R.string.admin_user_ban_message) { viewModel.banUser(it) } },
            onUnban = { viewModel.unbanUser(it) },
            onDisable = { confirmAction(it, R.string.admin_user_remove_title, R.string.admin_user_remove_message) { viewModel.disableUser(it) } },
            onRestore = { viewModel.restoreUser(it) }
        )
        binding.recyclerUsers.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerUsers.adapter = adapter

        observeViewModel()
        binding.swipeRefresh.setOnRefreshListener { viewModel.loadUsers() }
        binding.btnUsersRetry.setOnClickListener { viewModel.loadUsers() }
        viewModel.loadUsers()
    }

    private fun observeViewModel() {
        viewModel.users.observe(viewLifecycleOwner) { users ->
            adapter.submitList(users)
            binding.tvEmpty.visibility = if (users.isEmpty()) View.VISIBLE else View.GONE
            binding.errorState.visibility = View.GONE
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
            adapter.actionsEnabled = !loading
        }
        viewModel.error.observe(viewLifecycleOwner) { msg ->
            msg?.let {
                binding.tvUsersError.text = it
                binding.errorState.visibility = View.VISIBLE
                binding.tvEmpty.visibility = View.GONE
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
            }
            binding.swipeRefresh.isRefreshing = false
        }
        viewModel.message.observe(viewLifecycleOwner) { msg ->
            msg?.let { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
        }
    }

    private fun confirmAction(
        user: AdminUser,
        titleRes: Int,
        messageRes: Int,
        action: (AdminUser) -> Unit
    ) {
        AlertDialog.Builder(requireContext())
            .setTitle(titleRes)
            .setMessage(getString(messageRes, user.name))
            .setNegativeButton(R.string.cancel, null)
            .setPositiveButton(R.string.admin_user_confirm_action) { _, _ -> action(user) }
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
