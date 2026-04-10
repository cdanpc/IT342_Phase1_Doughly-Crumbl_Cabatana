package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.model.Order;
import org.springframework.stereotype.Component;

/**
 * Strategy for transitioning from CONFIRMED to PREPARING status.
 * 
 * Business Rules:
 * - Only CONFIRMED orders can move to PREPARING
 */
@Component
public class ConfirmedToPreparingStrategy implements OrderStatusStrategy {

    @Override
    public boolean canTransition(Order order) {
        return "CONFIRMED".equals(order.getStatus());
    }

    @Override
    public String getValidationError() {
        return "Can only prepare CONFIRMED orders";
    }

    @Override
    public String getTargetStatus() {
        return "PREPARING";
    }
}
