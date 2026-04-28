package edu.cit.cabatana.doughlycrumbl.controller;

import edu.cit.cabatana.doughlycrumbl.dto.request.AddToCartRequest;
import edu.cit.cabatana.doughlycrumbl.dto.request.UpdateCartItemRequest;
import edu.cit.cabatana.doughlycrumbl.dto.response.CartResponse;
import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addItem(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(user.getId(), cartItemId, request));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(user.getId(), cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal CustomUserDetails user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
