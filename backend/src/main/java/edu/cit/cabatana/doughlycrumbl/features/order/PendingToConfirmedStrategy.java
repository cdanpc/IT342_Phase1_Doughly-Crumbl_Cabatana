package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import org.springframework.stereotype.Component;

/**
 * Strategy for transitioning from PENDING to CONFIRMED status.
 * 
 * Business Rules:
 * - Only PENDING orders can be confirmed
 * - Order must have items
 * - Order must have valid delivery details
 */
@Component
public class PendingToConfirmedStrategy implements OrderStatusStrategy {

    @Override
    public boolean canTransition(Order order) {
        return "PENDING".equals(order.getStatus()) 
                && order.getItems() != null 
                && !order.getItems().isEmpty()
                && order.getDeliveryAddress() != null 
                && !order.getDeliveryAddress().isBlank();
    }

    @Override
    public String getValidationError() {
        return "Can only confirm PENDING orders with valid delivery details";
    }

    @Override
    public String getTargetStatus() {
        return "CONFIRMED";
    }
}
