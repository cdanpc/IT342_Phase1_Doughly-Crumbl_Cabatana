package com.doughlycrumbl.backend.service;

import com.doughlycrumbl.backend.dto.request.CheckoutRequest;
import com.doughlycrumbl.backend.dto.request.UpdateOrderStatusRequest;
import com.doughlycrumbl.backend.dto.response.OrderResponse;
import com.doughlycrumbl.backend.dto.response.OrderResponse.OrderItemResponse;
import com.doughlycrumbl.backend.exception.BadRequestException;
import com.doughlycrumbl.backend.exception.ResourceNotFoundException;
import com.doughlycrumbl.backend.model.*;
import com.doughlycrumbl.backend.repository.CartRepository;
import com.doughlycrumbl.backend.repository.OrderRepository;
import com.doughlycrumbl.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Build order items from cart (snapshot product data)
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            BigDecimal subtotal = cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            return OrderItem.builder()
                    .product(cartItem.getProduct())
                    .productName(cartItem.getProduct().getName())
                    .unitPrice(cartItem.getProduct().getPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .status("PENDING")
                .deliveryAddress(request.getDeliveryAddress())
                .contactNumber(request.getContactNumber())
                .deliveryNotes(request.getDeliveryNotes())
                .totalAmount(totalAmount)
                .items(orderItems)
                .build();

        // Set back-reference
        orderItems.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        // Clear the cart after order placement
        cart.getItems().clear();
        cartRepository.save(cart);

        return toResponse(savedOrder);
    }

    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Customers can only view their own orders
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        return toResponse(order);
    }

    // --- Admin methods ---

    public Page<OrderResponse> getAllOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;

        if (status != null && !status.isBlank()) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(this::toResponse);
    }

    public OrderResponse getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        String newStatus = request.getStatus().toUpperCase();

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Invalid order status: " + newStatus);
        }

        // Cannot change status of delivered orders (except to cancel)
        if ("DELIVERED".equals(order.getStatus()) && !"CANCELLED".equals(newStatus)) {
            throw new BadRequestException("Cannot change status of a delivered order");
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        return toResponse(order);
    }

    // --- Mappers ---

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .contactNumber(order.getContactNumber())
                .deliveryNotes(order.getDeliveryNotes())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .itemCount(items.stream().mapToInt(OrderItemResponse::getQuantity).sum())
                .build();
    }

    private OrderResponse toSummaryResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .itemCount(order.getItems().stream().mapToInt(OrderItem::getQuantity).sum())
                .build();
    }
}
