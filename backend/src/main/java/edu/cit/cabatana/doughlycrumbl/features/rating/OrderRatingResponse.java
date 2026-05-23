package edu.cit.cabatana.doughlycrumbl.features.rating;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRatingResponse {
    private Long id;
    private Long orderId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
