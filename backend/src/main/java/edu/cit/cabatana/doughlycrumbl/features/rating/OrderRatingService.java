package edu.cit.cabatana.doughlycrumbl.features.rating;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderRepository;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderRatingService {

    private final OrderRatingRepository ratingRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderRatingResponse submitRating(Long userId, Long orderId, OrderRatingRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        if (!"COMPLETED".equals(order.getStatus())) {
            throw new BadRequestException("Only completed orders can be rated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Optional<OrderRating> existing = ratingRepository.findByOrderIdAndUserId(orderId, userId);
        OrderRating rating;

        if (existing.isPresent()) {
            rating = existing.get();
            rating.setRating(request.getRating());
            rating.setComment(clean(request.getComment()));
        } else {
            rating = OrderRating.builder()
                    .order(order)
                    .user(user)
                    .rating(request.getRating())
                    .comment(clean(request.getComment()))
                    .build();
        }

        return toResponse(ratingRepository.save(rating));
    }

    public OrderRatingResponse getRating(Long userId, Long orderId) {
        OrderRating rating = ratingRepository.findByOrderIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating for order", orderId));
        return toResponse(rating);
    }

    public Optional<OrderRatingResponse> findRating(Long userId, Long orderId) {
        return ratingRepository.findByOrderIdAndUserId(orderId, userId).map(this::toResponse);
    }

    public Double averageRating(Long userId) {
        Double avg = ratingRepository.averageRatingByUserId(userId);
        return avg != null ? avg : 0.0;
    }

    private OrderRatingResponse toResponse(OrderRating rating) {
        return OrderRatingResponse.builder()
                .id(rating.getId())
                .orderId(rating.getOrder().getId())
                .rating(rating.getRating())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
