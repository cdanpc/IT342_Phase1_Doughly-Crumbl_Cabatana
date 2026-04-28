package edu.cit.cabatana.doughlycrumbl.features.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.features.auth.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
class CartControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private CartService cartService;
    @MockBean private JwtTokenProvider jwtTokenProvider;
    @MockBean private UserDetailsService userDetailsService;

    private CustomUserDetails customerPrincipal() {
        return new CustomUserDetails(1L, "Test User", "test@doughlycrumbl.com", "pass", "CUSTOMER");
    }

    private CartResponse emptyCart() {
        return CartResponse.builder()
                .cartId(1L)
                .items(List.of())
                .totalAmount(BigDecimal.ZERO)
                .itemCount(0)
                .build();
    }

    @Test
    void getCart_authenticated_returns200() throws Exception {
        when(cartService.getCart(1L)).thenReturn(emptyCart());

        mockMvc.perform(get("/api/cart")
                .with(user(customerPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value(1));
    }

    @Test
    void addToCart_authenticated_returns201() throws Exception {
        AddToCartRequest req = AddToCartRequest.builder()
                .productId(10L)
                .quantity(2)
                .build();

        CartResponse updated = CartResponse.builder()
                .cartId(1L)
                .items(List.of(CartResponse.CartItemResponse.builder()
                        .cartItemId(100L)
                        .productId(10L)
                        .productName("Choco Cookie")
                        .quantity(2)
                        .unitPrice(BigDecimal.valueOf(55))
                        .subtotal(BigDecimal.valueOf(110))
                        .build()))
                .totalAmount(BigDecimal.valueOf(110))
                .itemCount(1)
                .build();

        when(cartService.addItem(eq(1L), any(AddToCartRequest.class))).thenReturn(updated);

        mockMvc.perform(post("/api/cart/items")
                .with(user(customerPrincipal()))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itemCount").value(1))
                .andExpect(jsonPath("$.items[0].productName").value("Choco Cookie"));
    }

    @Test
    void addToCart_unauthenticated_isRejected() throws Exception {
        AddToCartRequest req = AddToCartRequest.builder()
                .productId(10L)
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }
}