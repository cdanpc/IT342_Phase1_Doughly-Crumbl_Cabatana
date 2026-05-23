package edu.cit.cabatana.doughlycrumbl.features.product;

import edu.cit.cabatana.doughlycrumbl.features.auth.JwtTokenProvider;
import edu.cit.cabatana.doughlycrumbl.shared.config.SecurityConfig;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ProductControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @MockBean  private ProductService productService;
    @MockBean  private JwtTokenProvider jwtTokenProvider;
    @MockBean  private UserDetailsService userDetailsService;

    private ProductResponse cookie(long id, String name) {
        return ProductResponse.builder()
                .id(id).name(name)
                .price(BigDecimal.valueOf(55))
                .category("CLASSIC")
                .available(true)
                .build();
    }

    // ── GET /api/products ─────────────────────────────────────────────────

    @Test
    void getProducts_noFilter_returns200WithContent() throws Exception {
        when(productService.getAllAvailableProducts(isNull(), isNull(), eq(0), eq(12)))
                .thenReturn(new PageImpl<>(List.of(cookie(1L, "Choco Chip"), cookie(2L, "Sugar Cookie"))));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Choco Chip"))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void getProducts_searchFilter_returnsFilteredResults() throws Exception {
        when(productService.getAllAvailableProducts(eq("choco"), isNull(), eq(0), eq(12)))
                .thenReturn(new PageImpl<>(List.of(cookie(1L, "Choco Chip"))));

        mockMvc.perform(get("/api/products").param("search", "choco"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Choco Chip"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getProducts_noMatch_returnsEmptyContent() throws Exception {
        when(productService.getAllAvailableProducts(eq("xyz"), isNull(), eq(0), eq(12)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/products").param("search", "xyz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ── GET /api/products/{id} ────────────────────────────────────────────

    @Test
    void getProductById_found_returns200() throws Exception {
        when(productService.getProductById(1L)).thenReturn(cookie(1L, "Choco Chip"));

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Choco Chip"));
    }

    @Test
    void getProductById_notFound_returns404() throws Exception {
        when(productService.getProductById(99L))
                .thenThrow(new ResourceNotFoundException("Product", 99L));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound());
    }
}
