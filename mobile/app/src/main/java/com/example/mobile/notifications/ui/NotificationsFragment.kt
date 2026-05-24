package com.example.mobile.notifications.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mobile.databinding.FragmentNotificationsBinding
import com.example.mobile.orders.ui.OrderDetailActivity
import com.example.mobile.util.SessionManager

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val session = SessionManager(requireContext())
        val factory = NotificationsViewModelFactory(session)
        val viewModel = ViewModelProvider(this, factory)[NotificationsViewModel::class.java]

        val adapter = NotificationAdapter { notification ->
            if (!notification.isRead) viewModel.markRead(notification.id)
            if (notification.orderId != null) {
                startActivity(Intent(requireContext(), OrderDetailActivity::class.java).apply {
                    putExtra("orderId", notification.orderId)
                })
            } else {
                startActivity(Intent(requireContext(), NotificationDetailActivity::class.java).apply {
                    putExtra("title", notification.title)
                    putExtra("message", notification.message)
                    putExtra("createdAt", notification.createdAt)
                })
            }
        }

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        viewModel.notifications.observe(viewLifecycleOwner) { list ->
            adapter.submitList(list)
            binding.errorState.visibility = View.GONE
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }

        viewModel.isUpdating.observe(viewLifecycleOwner) { updating ->
            binding.btnMarkAllRead.isEnabled = !updating
        }

        viewModel.error.observe(viewLifecycleOwner) { msg ->
            if (msg != null) {
                binding.tvNotificationsError.text = msg
                binding.errorState.visibility = View.VISIBLE
                binding.emptyState.visibility = View.GONE
                binding.recyclerView.visibility = View.GONE
            }
        }

        viewModel.isEmpty.observe(viewLifecycleOwner) { empty ->
            if (viewModel.error.value == null) {
                binding.emptyState.visibility = if (empty) View.VISIBLE else View.GONE
                binding.recyclerView.visibility = if (empty) View.GONE else View.VISIBLE
            }
        }

        binding.btnMarkAllRead.setOnClickListener {
            viewModel.markAllRead()
        }

        binding.btnNotificationsRetry.setOnClickListener {
            viewModel.load()
        }

        viewModel.load()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
