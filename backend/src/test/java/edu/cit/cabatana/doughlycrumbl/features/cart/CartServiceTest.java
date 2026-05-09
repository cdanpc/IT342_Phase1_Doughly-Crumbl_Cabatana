package edu.cit.cabatana.doughlycrumbl.features.cart;

import edu.cit.cabatana.doughlycrumbl.features.product.Product;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductRepository;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartAdapter cartAdapter;
    @InjectMocks private CartService cartService;

    private User user(long id) {
        return User.builder().id(id).name("Test").email("t@t.com").build();
    }

    private Cart emptyCart(long cartId, long userId) {
        return Cart.builder().id(cartId).user(user(userId)).items(new ArrayList<>()).build();
    }

    private Product product(long id, String name) {
        return Product.builder().id(id).name(name).price(BigDecimal.valueOf(55)).build();
    }

    private CartResponse dtoFor(Cart cart) {
        return CartResponse.builder()
                .cartId(cart.getId())
                .items(List.of())
                .totalAmount(BigDecimal.ZERO)
                .itemCount(0)
                .build();
    }

    // ── getCart ───────────────────────────────────────────────────────────

    @Test
    void getCart_existingCart_returnsDto() {
        Cart cart = emptyCart(1L, 10L);
        CartResponse dto = dtoFor(cart);

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartAdapter.toDto(cart)).thenReturn(dto);

        CartResponse result = cartService.getCart(10L);

        assertThat(result.getCartId()).isEqualTo(1L);
        verify(cartRepository, never()).save(any());
    }

    @Test
    void getCart_noCart_createsCartAndReturnsDto() {
        Cart created = emptyCart(2L, 11L);
        CartResponse dto = dtoFor(created);

        when(cartRepository.findByUserId(11L)).thenReturn(Optional.empty());
        when(userRepository.findById(11L)).thenReturn(Optional.of(user(11L)));
        when(cartRepository.save(any(Cart.class))).thenReturn(created);
        when(cartAdapter.toDto(created)).thenReturn(dto);

        CartResponse result = cartService.getCart(11L);

        assertThat(result.getCartId()).isEqualTo(2L);
        verify(cartRepository).save(any(Cart.class));
    }

    // ── addItem ───────────────────────────────────────────────────────────

    @Test
    void addItem_newProduct_addsItemToCart() {
        Cart cart = emptyCart(1L, 10L);
        Product prod = product(5L, "Choco Cookie");
        CartResponse dto = dtoFor(cart);

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(5L)).thenReturn(Optional.of(prod));
        when(cartItemRepository.findByCartIdAndProductId(1L, 5L)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> i.getArgument(0));
        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartAdapter.toDto(cart)).thenReturn(dto);

        AddToCartRequest req = AddToCartRequest.builder().productId(5L).quantity(2).build();
        CartResponse result = cartService.addItem(10L, req);

        assertThat(result).isNotNull();
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addItem_existingProduct_mergesQuantity() {
        Cart cart = emptyCart(1L, 10L);
        Product prod = product(5L, "Choco Cookie");
        CartItem existing = CartItem.builder().id(99L).cart(cart).product(prod).quantity(3).build();
        CartResponse dto = dtoFor(cart);

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(5L)).thenReturn(Optional.of(prod));
        when(cartItemRepository.findByCartIdAndProductId(1L, 5L)).thenReturn(Optional.of(existing));
        when(cartItemRepository.save(existing)).thenReturn(existing);
        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartAdapter.toDto(cart)).thenReturn(dto);

        AddToCartRequest req = AddToCartRequest.builder().productId(5L).quantity(2).build();
        cartService.addItem(10L, req);

        assertThat(existing.getQuantity()).isEqualTo(5);
        verify(cartItemRepository).save(existing);
    }

    @Test
    void addItem_productNotFound_throwsResourceNotFoundException() {
        Cart cart = emptyCart(1L, 10L);
        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        AddToCartRequest req = AddToCartRequest.builder().productId(999L).quantity(1).build();

        assertThatThrownBy(() -> cartService.addItem(10L, req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── removeItem ────────────────────────────────────────────────────────

    @Test
    void removeItem_wrongOwner_throwsResourceNotFoundException() {
        Cart cart = emptyCart(1L, 10L);
        Cart otherCart = emptyCart(2L, 99L);
        CartItem item = CartItem.builder().id(50L).cart(otherCart).build();

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> cartService.removeItem(10L, 50L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(cartItemRepository, never()).delete(any());
    }

    // ── clearCart ─────────────────────────────────────────────────────────

    @Test
    void clearCart_clearsItemsAndSaves() {
        Cart cart = emptyCart(1L, 10L);
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).build());

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(cart)).thenReturn(cart);

        cartService.clearCart(10L);

        assertThat(cart.getItems()).isEmpty();
        verify(cartRepository).save(cart);
    }
}
