package edu.cit.cabatana.doughlycrumbl.features.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddressRequest {
    @NotBlank(message = "Label is required")
    @Size(max = 80, message = "Label must not exceed 80 characters")
    private String label;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    private Boolean defaultAddress;
}
