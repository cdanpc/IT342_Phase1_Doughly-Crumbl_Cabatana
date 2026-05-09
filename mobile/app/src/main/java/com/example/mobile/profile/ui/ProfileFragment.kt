package com.example.mobile.profile.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.auth.ui.LoginActivity
import com.example.mobile.databinding.FragmentProfileBinding
import com.example.mobile.util.SessionManager

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val session = SessionManager(requireContext())
        val factory = ProfileViewModelFactory(session)
        val viewModel = ViewModelProvider(this, factory)[ProfileViewModel::class.java]

        val name = viewModel.name
        binding.tvName.text = name.ifEmpty { "—" }
        binding.tvEmail.text = viewModel.email.ifEmpty { "—" }
        binding.tvAvatarInitials.text = name.split(" ")
            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
            .take(2)
            .joinToString("")
            .ifEmpty { "?" }

        viewModel.stats.observe(viewLifecycleOwner) { (total, completed, cancelled) ->
            binding.tvOrderCount.text = total.toString()
            binding.tvCompletedCount.text = completed.toString()
            binding.tvCancelledCount.text = cancelled.toString()
        }

        viewModel.loadStats()

        binding.rowCareGuide.setOnClickListener {
            startActivity(Intent(requireContext(), CareGuideActivity::class.java))
        }
        binding.rowFaq.setOnClickListener {
            startActivity(Intent(requireContext(), AboutFaqActivity::class.java))
        }
        binding.rowPayment.setOnClickListener {
            startActivity(Intent(requireContext(), PaymentInstructionsActivity::class.java))
        }
        binding.btnLogout.setOnClickListener {
            session.clearSession()
            startActivity(Intent(requireContext(), LoginActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            })
            requireActivity().finish()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
