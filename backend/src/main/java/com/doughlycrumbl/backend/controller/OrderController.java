package com.doughlycrumbl.backend.controller;

import com.doughlycrumbl.backend.dto.request.CheckoutRequest;
import com.doughlycrumbl.backend.dto.response.OrderResponse;
import com.doughlycrumbl.backend.security.CustomUserDetails;
import com.doughlycrumbl.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}
