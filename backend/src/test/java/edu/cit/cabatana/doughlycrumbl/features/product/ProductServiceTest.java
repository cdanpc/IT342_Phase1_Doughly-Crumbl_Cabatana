package edu.cit.cabatana.doughlycrumbl.features.product;

import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductAdapter productAdapter;
    @InjectMocks private ProductService productService;

    @Test
    void getProducts_returnsPagedResults() {
        Product p = Product.builder().id(1L).name("Choco Cookie").price(BigDecimal.valueOf(50)).available(true).build();
        ProductResponse dto = ProductResponse.builder().id(1L).name("Choco Cookie").price(BigDecimal.valueOf(50)).build();
        Page<Product> page = new PageImpl<>(List.of(p));

        when(productRepository.findAllAvailable(isNull(), any())).thenReturn(page);
        when(productAdapter.toDto(p)).thenReturn(dto);

        Page<ProductResponse> result = productService.getAllAvailableProducts(null, null, 0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Choco Cookie");
        verify(productAdapter).toDto(p);
    }

    @Test
    void getProductById_found_returnsDto() {
        Product p = Product.builder().id(2L).name("Sugar Rush").build();
        ProductResponse dto = ProductResponse.builder().id(2L).name("Sugar Rush").build();

        when(productRepository.findById(2L)).thenReturn(Optional.of(p));
        when(productAdapter.toDto(p)).thenReturn(dto);

        ProductResponse result = productService.getProductById(2L);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("Sugar Rush");
    }

    @Test
    void getProductById_notFound_throwsResourceNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createProduct_savesAndReturnsDto() {
        ProductRequest req = ProductRequest.builder()
                .name("Classic Choc Chip")
                .price(BigDecimal.valueOf(55))
                .available(true)
                .build();
        Product saved = Product.builder().id(3L).name("Classic Choc Chip").build();
        ProductResponse dto = ProductResponse.builder().id(3L).name("Classic Choc Chip").build();

        when(productRepository.save(any(Product.class))).thenReturn(saved);
        when(productAdapter.toDto(saved)).thenReturn(dto);

        ProductResponse result = productService.createProduct(req);

        assertThat(result.getName()).isEqualTo("Classic Choc Chip");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void deleteProduct_notFound_throwsResourceNotFoundException() {
        when(productRepository.existsById(5L)).thenReturn(false);

        assertThatThrownBy(() -> productService.deleteProduct(5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(productRepository, never()).deleteById(any());
    }
}