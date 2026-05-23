package edu.cit.cabatana.doughlycrumbl.features.profile;

import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class CustomerProfileController {
    private final CustomerProfileService profileService;

    @GetMapping
    public ResponseEntity<CustomerProfileResponse> getProfile(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PutMapping
    public ResponseEntity<CustomerProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody UpdateCustomerProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(user.getId(), request));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<DeliveryAddressResponse>> getAddresses(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(profileService.getAddresses(user.getId()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<DeliveryAddressResponse> addAddress(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody DeliveryAddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addAddress(user.getId(), request));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<DeliveryAddressResponse> updateAddress(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody DeliveryAddressRequest request) {
        return ResponseEntity.ok(profileService.updateAddress(user.getId(), id, request));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        profileService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<ProductResponse>> getFavorites(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(profileService.getFavorites(user.getId()));
    }

    @PostMapping("/favorites/{productId}")
    public ResponseEntity<List<ProductResponse>> addFavorite(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long productId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addFavorite(user.getId(), productId));
    }

    @DeleteMapping("/favorites/{productId}")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long productId) {
        profileService.removeFavorite(user.getId(), productId);
        return ResponseEntity.noContent().build();
    }
}
