package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
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
        String s = order.getStatus();
        return !"DELIVERED".equals(s)
                && !"COMPLETED".equals(s)
                && !"CANCELLED".equals(s);
    }

    @Override
    public String getValidationError() {
        return "Cannot cancel an order that is already completed or cancelled";
    }

    @Override
    public String getTargetStatus() {
        return "CANCELLED";
    }
}
