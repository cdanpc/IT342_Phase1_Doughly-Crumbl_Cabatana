package edu.cit.cabatana.doughlycrumbl.features.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotBlank(message = "Fulfillment method is required")
    @Pattern(regexp = "DELIVERY|PICKUP", message = "Fulfillment method must be DELIVERY or PICKUP")
    private String fulfillmentMethod;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "GCASH|MAYA|BANK_TRANSFER|CASH_ON_PICKUP", message = "Unsupported payment method")
    private String paymentMethod;

    private String deliveryNotes;
}
