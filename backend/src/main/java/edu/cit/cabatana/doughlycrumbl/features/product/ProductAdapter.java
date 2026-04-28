package edu.cit.cabatana.doughlycrumbl.features.product;

import edu.cit.cabatana.doughlycrumbl.shared.util.EntityToDtoAdapter;

import edu.cit.cabatana.doughlycrumbl.features.product.ProductResponse;
import edu.cit.cabatana.doughlycrumbl.features.product.Product;
import org.springframework.stereotype.Component;

/**
 * Adapter Pattern Implementation - Product Entity to DTO Adapter
 * 
 * This adapter converts Product entities to ProductResponse DTOs.
 * It provides a centralized location for all product mapping logic.
 */
@Component
public class ProductAdapter implements EntityToDtoAdapter<Product, ProductResponse> {

    @Override
    public ProductResponse toDto(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory())
                .available(product.getAvailable())
                .build();
    }
}
