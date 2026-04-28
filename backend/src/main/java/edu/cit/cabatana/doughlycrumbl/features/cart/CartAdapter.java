package edu.cit.cabatana.doughlycrumbl.features.cart;

import edu.cit.cabatana.doughlycrumbl.shared.util.EntityToDtoAdapter;

import edu.cit.cabatana.doughlycrumbl.features.cart.CartResponse;
import edu.cit.cabatana.doughlycrumbl.features.cart.CartResponse.CartItemResponse;
import edu.cit.cabatana.doughlycrumbl.features.cart.Cart;
import edu.cit.cabatana.doughlycrumbl.features.cart.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapter Pattern Implementation - Cart Entity to DTO Adapter
 * 
 * This adapter converts Cart entities to CartResponse DTOs,
 * including nested cart items and total calculations.
 */
@Component
public class CartAdapter implements EntityToDtoAdapter<Cart, CartResponse> {

    @Override
    public CartResponse toDto(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal total = calculateTotal(items);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalAmount(total)
                .itemCount(calculateItemCount(items))
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        BigDecimal subtotal = item.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(item.getProduct().getImageUrl())
                .unitPrice(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }

    private BigDecimal calculateTotal(List<CartItemResponse> items) {
        return items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int calculateItemCount(List<CartItemResponse> items) {
        return items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();
    }
}
