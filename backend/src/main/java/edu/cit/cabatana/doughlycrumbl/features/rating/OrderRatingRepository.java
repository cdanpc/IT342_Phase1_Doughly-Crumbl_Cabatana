package edu.cit.cabatana.doughlycrumbl.features.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrderRatingRepository extends JpaRepository<OrderRating, Long> {

    Optional<OrderRating> findByOrderIdAndUserId(Long orderId, Long userId);

    @Query("SELECT AVG(r.rating) FROM OrderRating r WHERE r.user.id = :userId")
    Double averageRatingByUserId(Long userId);
}
