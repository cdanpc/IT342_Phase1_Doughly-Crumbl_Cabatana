package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.shared.util.EntityToDtoAdapter;

import edu.cit.cabatana.doughlycrumbl.features.order.OrderResponse.OrderItemResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapter Pattern Implementation - Order Entity to DTO Adapter
 * 
 * This adapter converts Order entities to OrderResponse DTOs,
 * handling the complexity of nested item mappings and calculations.
 */
@Component
public class OrderAdapter implements EntityToDtoAdapter<Order, OrderResponse> {

    @Override
    public OrderResponse toDto(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .contactNumber(order.getContactNumber())
                .deliveryNotes(order.getDeliveryNotes())
                .fulfillmentMethod(order.getFulfillmentMethod())
                .paymentMethod(order.getPaymentMethod())
                .proofImageUrl(order.getProofImageUrl())
                .cancellationReason(order.getCancellationReason())
                .items(items)
                .subtotalAmount(subtotalAmount(order))
                .deliveryFee(deliveryFee(order))
                .totalAmount(order.getTotalAmount())
                .itemCount(calculateItemCount(items))
                .build();
    }

    @Override
    public OrderResponse toSummaryDto(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .fulfillmentMethod(order.getFulfillmentMethod())
                .paymentMethod(order.getPaymentMethod())
                .subtotalAmount(subtotalAmount(order))
                .deliveryFee(deliveryFee(order))
                .totalAmount(order.getTotalAmount())
                .itemCount(calculateItemCount(order.getItems()))
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private int calculateItemCount(List<?> items) {
        return items.stream()
                .mapToInt(item -> {
                    if (item instanceof OrderItemResponse) {
                        return ((OrderItemResponse) item).getQuantity();
                    } else if (item instanceof OrderItem) {
                        return ((OrderItem) item).getQuantity();
                    }
                    return 0;
                })
                .sum();
    }

    private BigDecimal deliveryFee(Order order) {
        return order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
    }

    private BigDecimal subtotalAmount(Order order) {
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        return total.subtract(deliveryFee(order));
    }
}
