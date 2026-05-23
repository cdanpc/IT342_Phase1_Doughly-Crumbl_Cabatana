package edu.cit.cabatana.doughlycrumbl.features.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRatingRequest {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
