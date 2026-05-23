package edu.cit.cabatana.doughlycrumbl.features.rating;

import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/{orderId}/rating")
@RequiredArgsConstructor
public class OrderRatingController {

    private final OrderRatingService ratingService;

    @PostMapping
    public ResponseEntity<OrderRatingResponse> submitRating(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long orderId,
            @Valid @RequestBody OrderRatingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ratingService.submitRating(user.getId(), orderId, request));
    }

    @GetMapping
    public ResponseEntity<OrderRatingResponse> getRating(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long orderId) {
        return ratingService.findRating(user.getId(), orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
