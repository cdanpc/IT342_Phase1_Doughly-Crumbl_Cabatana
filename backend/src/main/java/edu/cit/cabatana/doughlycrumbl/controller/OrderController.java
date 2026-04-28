package edu.cit.cabatana.doughlycrumbl.controller;

import edu.cit.cabatana.doughlycrumbl.dto.request.CheckoutRequest;
import edu.cit.cabatana.doughlycrumbl.dto.response.OrderResponse;
import edu.cit.cabatana.doughlycrumbl.security.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CheckoutRequest request) {
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, user.getId()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, user.getId(), reason));
    }

    @PutMapping("/{id}/submit-payment")
    public ResponseEntity<OrderResponse> submitPayment(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile proof) {
        return ResponseEntity.ok(orderService.submitPayment(id, user.getId(), proof));
    }
}
