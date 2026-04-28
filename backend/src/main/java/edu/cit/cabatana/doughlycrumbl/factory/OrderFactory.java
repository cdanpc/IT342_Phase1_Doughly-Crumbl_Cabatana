package edu.cit.cabatana.doughlycrumbl.factory;

import edu.cit.cabatana.doughlycrumbl.dto.request.CheckoutRequest;
import edu.cit.cabatana.doughlycrumbl.features.cart.Cart;
import edu.cit.cabatana.doughlycrumbl.model.Order;
import edu.cit.cabatana.doughlycrumbl.model.OrderItem;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Factory Pattern Implementation - Creational Pattern
 * 
 * Purpose: Encapsulates the complex creation process of Order objects.
 * This factory handles the conversion of a shopping cart into an order,
 * including item conversion, price calculation, and relationship setup.
 * 
 * Benefits:
 * - Centralized Creation: All order creation logic is in one place
 * - Consistency: Ensures orders are created with consistent rules
 * - Reduced Coupling: Services don't need to know order creation details
 * - Easy to Extend: New order types can be added without modifying services
 * 
 * Real-world Use Case:
 * In e-commerce systems like Amazon or Shopee, order creation involves
 * complex business rules (pricing, discounts, inventory checks). A factory
 * pattern centralizes this logic for maintainability.
 */
@Component
@RequiredArgsConstructor
public class OrderFactory {

    private final OrderItemFactory orderItemFactory;

    /**
     * Creates a new Order from a shopping cart and checkout request.
     * This method handles the entire order creation process including:
     * - Converting cart items to order items
     * - Calculating total amount
     * - Setting up bidirectional relationships
     * - Initializing order status
     * 
     * @param user The user placing the order
     * @param cart The shopping cart containing items to order
     * @param request The checkout request with delivery details
     * @return A fully constructed Order ready to be persisted
     */
    public Order createOrderFromCart(User user, Cart cart, CheckoutRequest request) {
        // Convert cart items to order items using the OrderItemFactory
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(orderItemFactory::createFromCartItem)
                .collect(Collectors.toList());

        // Calculate total amount
        BigDecimal totalAmount = calculateTotalAmount(orderItems);

        // Determine initial status based on fulfillment method
        boolean isPickup = request.getDeliveryNotes() != null
                && request.getDeliveryNotes().contains("Fulfillment: PICKUP");
        String initialStatus = isPickup ? "ORDER_PLACED" : "AWAITING_DELIVERY_QUOTE";

        // Build the order
        Order order = Order.builder()
                .user(user)
                .status(initialStatus)
                .deliveryAddress(request.getDeliveryAddress())
                .contactNumber(request.getContactNumber())
                .deliveryNotes(request.getDeliveryNotes())
                .totalAmount(totalAmount)
                .items(orderItems)
                .build();

        // Set back-references for bidirectional relationship
        orderItems.forEach(item -> item.setOrder(order));

        return order;
    }

    /**
     * Calculates the total amount for an order by summing all item subtotals.
     * 
     * @param orderItems The list of order items
     * @return The total amount for the order
     */
    private BigDecimal calculateTotalAmount(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
