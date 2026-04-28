package edu.cit.cabatana.doughlycrumbl.features.cart;

import edu.cit.cabatana.doughlycrumbl.features.user.User;

import edu.cit.cabatana.doughlycrumbl.features.cart.CartAdapter;
import edu.cit.cabatana.doughlycrumbl.features.cart.AddToCartRequest;
import edu.cit.cabatana.doughlycrumbl.features.cart.UpdateCartItemRequest;
import edu.cit.cabatana.doughlycrumbl.features.cart.CartResponse;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import edu.cit.cabatana.doughlycrumbl.features.cart.CartItemRepository;
import edu.cit.cabatana.doughlycrumbl.features.cart.CartRepository;
import edu.cit.cabatana.doughlycrumbl.features.product.Product;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductRepository;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Refactored CartService using Adapter Pattern
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartAdapter cartAdapter;  // Adapter Pattern

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartAdapter.toDto(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        // Check if product already in cart â€” if so, update quantity
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        // Reload cart to reflect changes
        cart = cartRepository.findByUserId(userId).orElseThrow();
        return cartAdapter.toDto(cart);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", cartItemId));

        // Verify ownership
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Cart item", cartItemId);
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        cart = cartRepository.findByUserId(userId).orElseThrow();
        return cartAdapter.toDto(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", cartItemId));

        // Verify ownership
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Cart item", cartItemId);
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        cart = cartRepository.findByUserId(userId).orElseThrow();
        return cartAdapter.toDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // --- Helpers ---

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }
}

