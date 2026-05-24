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

    /** True only when the user explicitly tapped "Delivery Addresses" row. */
    private var addressDialogRequested = false

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

        // Seed UI from session while the network call completes
        val name = viewModel.name
        binding.tvName.text = name.ifEmpty { getString(R.string.profile_unknown_user) }
        binding.tvEmail.text = viewModel.email.ifEmpty { getString(R.string.profile_unknown_email) }
        updateAvatarInitials(name)

        // Stats + full profile come back together from loadStats()
        viewModel.stats.observe(viewLifecycleOwner) { (total, completed, _) ->
            binding.tvOrderCount.text = total.toString()
            binding.tvCompletedCount.text = completed.toString()
        }
        viewModel.profile.observe(viewLifecycleOwner) { profile ->
            profile ?: return@observe
            bindProfile(profile)
        }

        // Only show address dialog when the user explicitly requested it
        viewModel.addresses.observe(viewLifecycleOwner) { addresses ->
            if (addressDialogRequested) {
                addressDialogRequested = false
                showAddressDialog(addresses, viewModel)
            }
        }

        viewModel.message.observe(viewLifecycleOwner) { message ->
            message?.let { showMessage(it) }
        }

        viewModel.loadStats()

        // --- Row click listeners ---
        binding.rowMyOrders.setOnClickListener {
            requireActivity().findViewById<BottomNavigationView>(R.id.bottomNav)
                ?.selectedItemId = R.id.nav_orders
        }
        binding.rowFavorites.setOnClickListener {
            viewModel.favoritesTapped = true
            viewModel.loadFavoritesCount()
        }
        viewModel.favoritesCount.observe(viewLifecycleOwner) { count ->
            if (viewModel.favoritesTapped) {
                viewModel.favoritesTapped = false
                showMessage(
                    if (count == 0) getString(R.string.favorites_empty)
                    else getString(R.string.favorites_count_format, count)
                )
            }
        }
        binding.rowDeliveryAddress.setOnClickListener {
            addressDialogRequested = true
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
        updateAvatarInitials(profile.name)

        binding.tvRating.text = if (profile.rating > 0.0) {
            "%.1f".format(profile.rating)
        } else {
            "-"
        }

        bindMeritProgress(profile)
    }

    private fun bindMeritProgress(profile: CustomerProfile) {
        binding.cardMerit.visibility = View.VISIBLE
        binding.tvMeritTierName.text = profile.meritTierName

        val completed = profile.completedOrders
        val plural = if (completed == 1) "" else "s"
        binding.tvMeritOrderCount.text = getString(R.string.merit_completed_orders_format, completed, plural)

        val milestones = listOf(1 to "New Crumbler", 3 to "Topping Ready", 5 to "Discount Ready", 10 to "Cookie Box", 15 to "VIP Crumbler")
        val next = milestones.firstOrNull { completed < it.first }
        val prev = milestones.lastOrNull { completed >= it.first }
        val prevCount = prev?.first ?: 0
        val target = next ?: milestones.last()
        val range = (target.first - prevCount).coerceAtLeast(1)
        val progress = if (next != null) {
            ((completed - prevCount).toFloat() / range * 100).toInt().coerceIn(0, 100)
        } else {
            100
        }

        binding.progressMerit.progress = progress

        if (next != null) {
            val remaining = next.first - completed
            val remPlural = if (remaining == 1) "" else "s"
            binding.tvMeritNextTier.text = getString(R.string.merit_orders_until_format, remaining, remPlural, next.second)
        } else {
            binding.tvMeritNextTier.text = getString(R.string.merit_top_reached)
        }
    }

    private fun updateAvatarInitials(name: String) {
        binding.tvAvatarInitials.text = name.split(" ")
            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
            .take(2)
            .joinToString("")
            .ifEmpty { "?" }
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

        // Use null listener so the dialog stays open on validation failure
        val dialog = AlertDialog.Builder(context)
            .setTitle(R.string.edit_profile_title)
            .setView(fields)
            .setPositiveButton(R.string.update_profile, null)
            .setNegativeButton(R.string.cancel, null)
            .show()

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val nameValue = name.text.toString().trim()
            val phoneValue = phone.text.toString().trim()

            if (nameValue.isBlank()) {
                name.error = getString(R.string.error_name_required)
                return@setOnClickListener
            }

            val phPhoneRegex = Regex("^(09|\\+639)\\d{9}$")
            if (phoneValue.isNotBlank() && !phPhoneRegex.matches(phoneValue)) {
                phone.error = getString(R.string.error_phone_invalid)
                return@setOnClickListener
            }

            viewModel.updateProfile(
                nameValue,
                email.text.toString().trim(),
                phoneValue.ifBlank { null },
                address.text.toString().trim().ifBlank { null }
            )
            dialog.dismiss()
        }
    }

    private fun showAddressDialog(addresses: List<DeliveryAddress>, viewModel: ProfileViewModel) {
        if (addresses.isEmpty()) {
            AlertDialog.Builder(requireContext())
                .setTitle(R.string.saved_addresses_title)
                .setMessage(R.string.addresses_empty)
                .setPositiveButton(R.string.add_address) { _, _ -> showAddAddressDialog(viewModel) }
                .setNegativeButton(R.string.cancel, null)
                .show()
            return
        }

        val labels = addresses.map { addr ->
            val defaultMark = if (addr.defaultAddress) " ★" else ""
            "${addr.label}$defaultMark\n${addr.address}"
        }.toTypedArray()

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.saved_addresses_title)
            .setItems(labels) { _, which ->
                showAddressOptions(addresses[which], viewModel)
            }
            .setPositiveButton(R.string.add_address) { _, _ -> showAddAddressDialog(viewModel) }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun showAddressOptions(address: DeliveryAddress, viewModel: ProfileViewModel) {
        val options = arrayOf(getString(R.string.delete_address))
        AlertDialog.Builder(requireContext())
            .setTitle("${address.label}\n${address.address}")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> viewModel.deleteAddress(address.id)
                }
            }
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
