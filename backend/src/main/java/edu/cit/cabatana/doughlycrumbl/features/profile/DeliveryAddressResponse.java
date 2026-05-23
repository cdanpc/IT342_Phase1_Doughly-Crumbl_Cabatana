package edu.cit.cabatana.doughlycrumbl.features.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddressResponse {
    private Long id;
    private String label;
    private String address;
    private Boolean defaultAddress;
}
