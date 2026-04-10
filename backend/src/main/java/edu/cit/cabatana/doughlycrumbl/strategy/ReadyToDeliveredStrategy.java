package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.model.Order;
import org.springframework.stereotype.Component;

/**
 * Strategy for transitioning from READY to DELIVERED status.
 * 
 * Business Rules:
 * - Only READY orders can be marked as DELIVERED
 */
@Component
public class ReadyToDeliveredStrategy implements OrderStatusStrategy {

    @Override
    public boolean canTransition(Order order) {
        return "READY".equals(order.getStatus());
    }

    @Override
    public String getValidationError() {
        return "Can only deliver READY orders";
    }

    @Override
    public String getTargetStatus() {
        return "DELIVERED";
    }
}
