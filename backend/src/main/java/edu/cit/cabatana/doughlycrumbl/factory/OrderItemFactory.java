package edu.cit.cabatana.doughlycrumbl.factory;

import edu.cit.cabatana.doughlycrumbl.features.cart.CartItem;
import edu.cit.cabatana.doughlycrumbl.model.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Factory Pattern Implementation - Creational Pattern
 * 
 * Purpose: Centralizes the creation logic for OrderItem objects.
 * This factory encapsulates the complex logic of converting CartItems
 * to OrderItems with proper price calculations and data snapshotting.
 * 
 * Benefits:
 * - Single Responsibility: Object creation is separated from business logic
 * - Reusability: Can be used by multiple services
 * - Maintainability: Changes to OrderItem creation logic are centralized
 * - Testability: Easy to mock and test independently
 */
@Component
public class OrderItemFactory {

    /**
     * Creates an OrderItem from a CartItem, snapshotting the product
     * details at the time of order placement.
     * 
     * @param cartItem The cart item to convert
     * @return A new OrderItem with calculated subtotal
     */
    public OrderItem createFromCartItem(CartItem cartItem) {
        BigDecimal subtotal = calculateSubtotal(
            cartItem.getProduct().getPrice(),
            cartItem.getQuantity()
        );

        return OrderItem.builder()
                .product(cartItem.getProduct())
                .productName(cartItem.getProduct().getName())
                .unitPrice(cartItem.getProduct().getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }

    /**
     * Calculates the subtotal for an order item.
     * 
     * @param unitPrice The price per unit
     * @param quantity The quantity ordered
     * @return The calculated subtotal
     */
    private BigDecimal calculateSubtotal(BigDecimal unitPrice, Integer quantity) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
