package edu.cit.cabatana.doughlycrumbl.service;

import edu.cit.cabatana.doughlycrumbl.adapter.OrderAdapter;
import edu.cit.cabatana.doughlycrumbl.dto.request.CheckoutRequest;
import edu.cit.cabatana.doughlycrumbl.dto.request.UpdateOrderStatusRequest;
import edu.cit.cabatana.doughlycrumbl.dto.response.OrderResponse;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import edu.cit.cabatana.doughlycrumbl.factory.OrderFactory;
import edu.cit.cabatana.doughlycrumbl.model.Cart;
import edu.cit.cabatana.doughlycrumbl.model.Order;
import edu.cit.cabatana.doughlycrumbl.model.User;
import edu.cit.cabatana.doughlycrumbl.observer.OrderEventPublisher;
import edu.cit.cabatana.doughlycrumbl.repository.CartRepository;
import edu.cit.cabatana.doughlycrumbl.repository.OrderRepository;
import edu.cit.cabatana.doughlycrumbl.repository.UserRepository;
import edu.cit.cabatana.doughlycrumbl.strategy.OrderStatusContext;
import edu.cit.cabatana.doughlycrumbl.service.FileUploadService;
import org.springframework.web.multipart.MultipartFile;
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

/**
 * Refactored OrderService using Design Patterns
 * 
 * This service now demonstrates:
 * - Factory Pattern: Delegates order creation to OrderFactory
 * - Adapter Pattern: Uses OrderAdapter for entity-to-DTO conversion
 * - Strategy Pattern: Uses OrderStatusContext for status transitions
 * - Observer Pattern: Publishes events via OrderEventPublisher
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> VALID_STATUSES = Set.of(
            // Legacy statuses (kept for backwards compatibility)
            "PENDING", "CONFIRMED", "DELIVERED",
            // New order flow statuses
            "ORDER_PLACED",
            "AWAITING_DELIVERY_QUOTE",
            "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED",
            "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION",
            "PAYMENT_CONFIRMED",
            "PREPARING", "OUT_FOR_DELIVERY", "READY", "COMPLETED", "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    
    // Design Pattern Components
    private final OrderFactory orderFactory;              // Factory Pattern
    private final OrderAdapter orderAdapter;              // Adapter Pattern
    private final OrderStatusContext orderStatusContext;  // Strategy Pattern
    private final OrderEventPublisher eventPublisher;     // Observer Pattern
    private final FileUploadService fileUploadService;

    /**
     * Places a new order using Factory and Observer patterns.
     * 
     * BEFORE: Order creation logic was scattered in this method (50+ lines)
     * AFTER: Delegated to OrderFactory, and observers are notified automatically
     */
    @Transactional
    public OrderResponse placeOrder(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Factory Pattern: Delegate complex order creation to factory
        Order order = orderFactory.createOrderFromCart(user, cart, request);

        Order savedOrder = orderRepository.save(order);

        // Clear the cart after order placement
        cart.getItems().clear();
        cartRepository.save(cart);

        // Observer Pattern: Notify all observers about the new order
        eventPublisher.publishOrderPlaced(savedOrder);

        // Adapter Pattern: Convert entity to DTO
        return orderAdapter.toDto(savedOrder);
    }

    /**
     * Gets all orders for a user.
     * Uses Adapter Pattern for entity-to-DTO conversion.
     */
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(orderAdapter::toSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * Gets a specific order by ID for a customer.
     * Uses Adapter Pattern for entity-to-DTO conversion.
     */
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Customers can only view their own orders
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        return orderAdapter.toDto(order);
    }

    // --- Admin methods ---

    /**
     * Gets all orders (admin only) with optional status filter.
     * Uses Adapter Pattern for entity-to-DTO conversion.
     */
    public Page<OrderResponse> getAllOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;

        if (status != null && !status.isBlank()) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(orderAdapter::toDto);
    }

    /**
     * Gets a specific order by ID (admin only).
     * Uses Adapter Pattern for entity-to-DTO conversion.
     */
    public OrderResponse getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return orderAdapter.toDto(order);
    }

    /**
     * Updates order status using Strategy and Observer patterns.
     * 
     * BEFORE: Complex conditional logic for status validation (15+ lines of if-else)
     * AFTER: Strategy Pattern encapsulates validation, Observer notifies stakeholders
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        String oldStatus = order.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Invalid order status: " + newStatus);
        }

        // Strategy Pattern: Delegate status transition logic to strategy
        orderStatusContext.transitionOrderStatus(order, newStatus);

        // Keep paymentStatus in sync with key status transitions
        if ("PAYMENT_CONFIRMED".equals(newStatus)) {
            order.setPaymentStatus("PAID");
        } else if ("CANCELLED".equals(newStatus)) {
            order.setPaymentStatus("CANCELLED");
            if (request.getReason() != null && !request.getReason().isBlank()) {
                order.setCancellationReason(request.getReason().trim());
            }
        }

        order = orderRepository.save(order);

        // Observer Pattern: Notify observers about status change
        if ("CANCELLED".equals(newStatus)) {
            eventPublisher.publishOrderCancelled(order);
        } else {
            eventPublisher.publishOrderStatusChanged(order, oldStatus, newStatus);
        }

        // Adapter Pattern: Convert entity to DTO
        return orderAdapter.toDto(order);
    }

    /**
     * Called by the customer to confirm they've submitted payment.
     * Advances status from DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED (delivery)
     * or ORDER_PLACED (pickup) to PAYMENT_SUBMITTED_AWAITING_CONFIRMATION.
     */
    @Transactional
    public OrderResponse submitPayment(Long orderId, Long userId, MultipartFile proofImage) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        String current = order.getStatus();
        if (!"DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED".equals(current)
                && !"ORDER_PLACED".equals(current)) {
            throw new BadRequestException(
                    "Cannot submit payment for an order in status: " + current);
        }

        if (proofImage != null && !proofImage.isEmpty()) {
            String proofUrl = fileUploadService.saveImage(proofImage);
            order.setProofImageUrl(proofUrl);
        }

        String oldStatus = current;
        order.setStatus("PAYMENT_SUBMITTED_AWAITING_CONFIRMATION");
        order.setPaymentStatus("SUBMITTED");
        order = orderRepository.save(order);

        eventPublisher.publishOrderStatusChanged(order, oldStatus,
                "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION");

        return orderAdapter.toDto(order);
    }

    /**
     * Allows a customer to cancel their own order before it starts preparing.
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        String current = order.getStatus();
        if ("PREPARING".equals(current) || "OUT_FOR_DELIVERY".equals(current)
                || "READY".equals(current) || "COMPLETED".equals(current)
                || "CANCELLED".equals(current)) {
            throw new BadRequestException("Order cannot be cancelled at this stage.");
        }

        order.setStatus("CANCELLED");
        order.setPaymentStatus("CANCELLED");
        if (reason != null && !reason.isBlank()) {
            order.setCancellationReason(reason.trim());
        }
        order = orderRepository.save(order);

        eventPublisher.publishOrderCancelled(order);
        return orderAdapter.toDto(order);
    }

    /**
     * Quotes a delivery fee for an order (admin only).
     * Adds the delivery fee to the existing totalAmount and moves status to
     * DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED.
     */
    @Transactional
    public OrderResponse quoteDeliveryFee(Long orderId, BigDecimal deliveryFee) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (deliveryFee == null || deliveryFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Delivery fee must be a non-negative amount");
        }

        // Add delivery fee on top of existing totalAmount (items subtotal)
        order.setTotalAmount(order.getTotalAmount().add(deliveryFee));
        order.setStatus("DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED");

        Order saved = orderRepository.save(order);
        eventPublisher.publishOrderStatusChanged(saved, "AWAITING_DELIVERY_QUOTE", "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED");
        return orderAdapter.toDto(saved);
    }

    /**
     * REFACTORING NOTE:
     * 
     * The toResponse() and toSummaryResponse() methods have been removed.
     * They are now handled by the OrderAdapter (Adapter Pattern).
     * 
     * Benefits:
     * - Centralized mapping logic
     * - Reduced code duplication
     * - Easier to maintain and test
     * - Follows Single Responsibility Principle
     */
}

