package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
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
        String s = order.getStatus();
        // Legacy CONFIRMED, new PAYMENT_CONFIRMED, and ORDER_PLACED (cash-on-pickup)
        return "CONFIRMED".equals(s)
                || "PAYMENT_CONFIRMED".equals(s)
                || "ORDER_PLACED".equals(s);
    }

    @Override
    public String getValidationError() {
        return "Order must be in CONFIRMED, PAYMENT_CONFIRMED, or ORDER_PLACED status to start preparing";
    }

    @Override
    public String getTargetStatus() {
        return "PREPARING";
    }
}
