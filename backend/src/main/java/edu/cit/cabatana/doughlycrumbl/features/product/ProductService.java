package edu.cit.cabatana.doughlycrumbl.features.product;

import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Refactored ProductService using Adapter Pattern
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductAdapter productAdapter;  // Adapter Pattern

    public Page<ProductResponse> getAllAvailableProducts(String search, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String cleanSearch = search == null || search.isBlank() ? null : search.trim();
        String cleanCategory = category == null || category.isBlank() ? null : category.trim();

        Page<Product> products;
        if (cleanSearch != null && cleanCategory != null) {
            products = productRepository.searchAvailableByCategory(cleanSearch, cleanCategory, pageable);
        } else if (cleanSearch != null) {
            products = productRepository.searchAvailable(cleanSearch, pageable);
        } else if (cleanCategory != null) {
            products = productRepository.findAvailableByCategory(cleanCategory, pageable);
        } else {
            products = productRepository.findByAvailableTrue(pageable);
        }

        return products.map(productAdapter::toDto);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return productAdapter.toDto(product);
    }

    // --- Admin methods ---

    public Page<ProductResponse> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAll(pageable)
                .map(productAdapter::toDto);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        product = productRepository.save(product);
        return productAdapter.toDto(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getAvailable() != null) product.setAvailable(request.getAvailable());

        product = productRepository.save(product);
        return productAdapter.toDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }
}

