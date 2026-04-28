package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import org.springframework.stereotype.Component;

/**
 * Strategy for transitioning from PREPARING to READY status.
 * 
 * Business Rules:
 * - Only PREPARING orders can be marked as READY
 */
@Component
public class PreparingToReadyStrategy implements OrderStatusStrategy {

    @Override
    public boolean canTransition(Order order) {
        return "PREPARING".equals(order.getStatus());
    }

    @Override
    public String getValidationError() {
        return "Can only mark PREPARING orders as READY";
    }

    @Override
    public String getTargetStatus() {
        return "READY";
    }
}
