package com.example.mobile.profile.ui

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.mobile.R
import com.example.mobile.auth.ui.LoginActivity
import com.example.mobile.databinding.FragmentProfileBinding
import com.example.mobile.model.CustomerProfile
import com.example.mobile.model.DeliveryAddress
import com.example.mobile.util.SessionManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.snackbar.Snackbar

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
        binding.tvName.text = name.ifEmpty { getString(R.string.profile_unknown_user) }
        binding.tvEmail.text = viewModel.email.ifEmpty { getString(R.string.profile_unknown_email) }
        binding.tvAvatarInitials.text = name.split(" ")
            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
            .take(2)
            .joinToString("")
            .ifEmpty { "?" }

        viewModel.stats.observe(viewLifecycleOwner) { (total, completed, _) ->
            binding.tvOrderCount.text = total.toString()
            binding.tvCompletedCount.text = completed.toString()
        }
        viewModel.profile.observe(viewLifecycleOwner) { profile ->
            profile ?: return@observe
            bindProfile(profile)
        }
        viewModel.addresses.observe(viewLifecycleOwner) { addresses ->
            showAddressDialog(addresses, viewModel)
        }
        viewModel.favoritesCount.observe(viewLifecycleOwner) { count ->
            if (count > 0) showMessage(getString(R.string.favorites_count_format, count))
        }
        viewModel.message.observe(viewLifecycleOwner) { message ->
            message?.let { showMessage(it) }
        }
        binding.tvRating.text = getString(R.string.profile_default_rating)

        viewModel.loadStats()
        viewModel.loadFavoritesCount()

        binding.rowMyOrders.setOnClickListener {
            requireActivity().findViewById<BottomNavigationView>(R.id.bottomNav)
                ?.selectedItemId = R.id.nav_orders
        }
        binding.rowFavorites.setOnClickListener {
            val count = viewModel.favoritesCount.value ?: 0
            showMessage(
                if (count == 0) getString(R.string.favorites_empty)
                else getString(R.string.favorites_count_format, count)
            )
        }
        binding.rowDeliveryAddress.setOnClickListener {
            viewModel.loadAddresses()
        }
        binding.rowEditProfile.setOnClickListener {
            showEditProfileDialog(viewModel.profile.value, viewModel)
        }
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
            AlertDialog.Builder(requireContext())
                .setTitle(R.string.confirm_logout_title)
                .setMessage(R.string.confirm_logout_message)
                .setPositiveButton(R.string.logout) { _, _ ->
                    session.clearSession()
                    startActivity(Intent(requireContext(), LoginActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    })
                    requireActivity().finish()
                }
                .setNegativeButton(R.string.cancel, null)
                .show()
        }
    }

    private fun bindProfile(profile: CustomerProfile) {
        binding.tvName.text = profile.name.ifEmpty { getString(R.string.profile_unknown_user) }
        binding.tvEmail.text = profile.email.ifEmpty { getString(R.string.profile_unknown_email) }
        binding.tvAvatarInitials.text = profile.name.split(" ")
            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
            .take(2)
            .joinToString("")
            .ifEmpty { "?" }
        binding.tvRating.text = "%.1f".format(profile.rating)
    }

    private fun showEditProfileDialog(profile: CustomerProfile?, viewModel: ProfileViewModel) {
        val context = requireContext()
        val fields = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(R.dimen.spacing_16)
            setPadding(pad, pad, pad, 0)
        }
        val name = editText(profile?.name.orEmpty(), getString(R.string.name), InputType.TYPE_CLASS_TEXT)
        val email = editText(profile?.email.orEmpty(), getString(R.string.email), InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        email.isEnabled = false
        val phone = editText(profile?.phoneNumber.orEmpty(), getString(R.string.contact_number), InputType.TYPE_CLASS_PHONE)
        val address = editText(profile?.address.orEmpty(), getString(R.string.delivery_address), InputType.TYPE_CLASS_TEXT)
        listOf(name, email, phone, address).forEach { fields.addView(it) }

        AlertDialog.Builder(context)
            .setTitle(R.string.edit_profile_title)
            .setView(fields)
            .setPositiveButton(R.string.update_profile) { _, _ ->
                viewModel.updateProfile(
                    name.text.toString().trim(),
                    email.text.toString().trim(),
                    phone.text.toString().trim().ifBlank { null },
                    address.text.toString().trim().ifBlank { null }
                )
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun showAddressDialog(addresses: List<DeliveryAddress>, viewModel: ProfileViewModel) {
        val labels = if (addresses.isEmpty()) {
            arrayOf(getString(R.string.addresses_empty))
        } else {
            addresses.map { address ->
                val defaultText = if (address.defaultAddress) " - Default" else ""
                "${address.label}$defaultText\n${address.address}"
            }.toTypedArray()
        }

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.saved_addresses_title)
            .setItems(labels, null)
            .setPositiveButton(R.string.add_address) { _, _ -> showAddAddressDialog(viewModel) }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun showAddAddressDialog(viewModel: ProfileViewModel) {
        val context = requireContext()
        val fields = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(R.dimen.spacing_16)
            setPadding(pad, pad, pad, 0)
        }
        val label = editText("", getString(R.string.address_label_hint), InputType.TYPE_CLASS_TEXT)
        val address = editText("", getString(R.string.address_detail_hint), InputType.TYPE_CLASS_TEXT)
        fields.addView(label)
        fields.addView(address)

        AlertDialog.Builder(context)
            .setTitle(R.string.add_address)
            .setView(fields)
            .setPositiveButton(R.string.save) { _, _ ->
                val labelText = label.text.toString().trim().ifBlank { "Home" }
                val addressText = address.text.toString().trim()
                if (addressText.isBlank()) {
                    showMessage(getString(R.string.address_required))
                } else {
                    viewModel.addAddress(labelText, addressText, defaultAddress = false)
                }
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun editText(value: String, hint: String, inputTypeValue: Int): EditText =
        EditText(requireContext()).apply {
            setText(value)
            this.hint = hint
            inputType = inputTypeValue
            minHeight = resources.getDimensionPixelSize(R.dimen.minTouchTarget)
        }

    private fun showMessage(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
