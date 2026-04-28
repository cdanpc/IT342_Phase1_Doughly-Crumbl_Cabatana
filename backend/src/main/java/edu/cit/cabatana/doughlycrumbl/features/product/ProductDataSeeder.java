package edu.cit.cabatana.doughlycrumbl.features.product;

import edu.cit.cabatana.doughlycrumbl.features.product.Product;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Order(2)
@RequiredArgsConstructor
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        seedIfMissing(
            "Classic Chocolate Chip",
            "Soft-baked chocolate chip cookie with rich buttery dough and dark chocolate chunks.",
            "85.00",
            "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80",
            "CLASSIC"
        );

        seedIfMissing(
            "Red Velvet Cream Cheese",
            "Moist red velvet cookie topped with a smooth cream cheese frosting swirl.",
            "110.00",
            "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80",
            "SPECIALTY"
        );

        seedIfMissing(
            "Sea Salt Caramel Crunch",
            "Caramel cookie with toasted crumble and sea salt flakes for a sweet-salty finish.",
            "105.00",
            "https://images.unsplash.com/photo-1590080876212-6c28ea2c3ea4?auto=format&fit=crop&w=1200&q=80",
            "BEST_SELLERS"
        );
        }

        private void seedIfMissing(String name, String description, String price, String imageUrl, String category) {
        if (productRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Product product = Product.builder()
            .name(name)
            .description(description)
            .price(new BigDecimal(price))
            .imageUrl(imageUrl)
            .category(category)
            .available(true)
            .build();

        productRepository.save(product);
    }
}
