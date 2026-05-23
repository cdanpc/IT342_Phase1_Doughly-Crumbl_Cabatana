package edu.cit.cabatana.doughlycrumbl.features.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByAvailableTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.available = true AND LOWER(p.category) = LOWER(:category)")
    Page<Product> findAvailableByCategory(
            @Param("category") String category,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.available = true AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchAvailable(
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.available = true " +
           "AND LOWER(p.category) = LOWER(:category) AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchAvailableByCategory(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable);

    Page<Product> findAll(Pageable pageable);

    boolean existsByNameIgnoreCase(String name);
}
