package edu.cit.cabatana.doughlycrumbl.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long orderId;
    private LocalDateTime orderDate;
    private String status;
    private String paymentStatus;
    private String deliveryAddress;
    private String contactNumber;
    private String deliveryNotes;
    private String proofImageUrl;
    private String cancellationReason;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private Integer itemCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
