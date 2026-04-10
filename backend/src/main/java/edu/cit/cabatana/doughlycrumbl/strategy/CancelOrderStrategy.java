package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.model.Order;
import org.springframework.stereotype.Component;

/**
 * Strategy for cancelling an order.
 * 
 * Business Rules:
 * - Cannot cancel DELIVERED orders
 * - Can cancel orders in any other status
 */
@Component
public class CancelOrderStrategy implements OrderStatusStrategy {

    @Override
    public boolean canTransition(Order order) {
        return !"DELIVERED".equals(order.getStatus()) 
                && !"CANCELLED".equals(order.getStatus());
    }

    @Override
    public String getValidationError() {
        return "Cannot cancel a delivered or already cancelled order";
    }

    @Override
    public String getTargetStatus() {
        return "CANCELLED";
    }
}
