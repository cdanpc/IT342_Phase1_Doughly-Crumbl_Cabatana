package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.features.rating.OrderRatingRepository;
import edu.cit.cabatana.doughlycrumbl.shared.util.EntityToDtoAdapter;

import edu.cit.cabatana.doughlycrumbl.features.order.OrderResponse.OrderItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderAdapter implements EntityToDtoAdapter<Order, OrderResponse> {

    private final OrderRatingRepository ratingRepository;

    @Override
    public OrderResponse toDto(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        Integer rating = ratingRepository
                .findByOrderIdAndUserId(order.getId(), order.getUser().getId())
                .map(r -> r.getRating())
                .orElse(null);

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerName(order.getUser() != null ? order.getUser().getName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
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
                .rating(rating)
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
