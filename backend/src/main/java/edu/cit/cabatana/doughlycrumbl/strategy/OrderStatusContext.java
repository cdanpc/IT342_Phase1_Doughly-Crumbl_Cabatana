package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Context class for the Strategy Pattern.
 * 
 * This class manages the different status transition strategies
 * and delegates the transition logic to the appropriate strategy.
 */
@Component
@RequiredArgsConstructor
public class OrderStatusContext {

    private final PendingToConfirmedStrategy pendingToConfirmedStrategy;
    private final ConfirmedToPreparingStrategy confirmedToPreparingStrategy;
    private final PreparingToReadyStrategy preparingToReadyStrategy;
    private final ReadyToDeliveredStrategy readyToDeliveredStrategy;
    private final CancelOrderStrategy cancelOrderStrategy;

    /**
     * Transitions an order to a new status using the appropriate strategy.
     * 
     * @param order The order to transition
     * @param newStatus The desired new status
     * @throws BadRequestException if the transition is not allowed
     */
    public void transitionOrderStatus(Order order, String newStatus) {
        OrderStatusStrategy strategy = getStrategy(newStatus);
        
        if (!strategy.canTransition(order)) {
            throw new BadRequestException(strategy.getValidationError());
        }
        
        strategy.executeTransition(order);
        order.setStatus(strategy.getTargetStatus());
    }

    /**
     * Gets the appropriate strategy for a given target status.
     * 
     * @param targetStatus The target status
     * @return The corresponding strategy
     */
    private OrderStatusStrategy getStrategy(String targetStatus) {
        Map<String, OrderStatusStrategy> strategies = new HashMap<>();
        strategies.put("CONFIRMED", pendingToConfirmedStrategy);
        strategies.put("PREPARING", confirmedToPreparingStrategy);
        strategies.put("READY", preparingToReadyStrategy);
        strategies.put("DELIVERED", readyToDeliveredStrategy);
        strategies.put("CANCELLED", cancelOrderStrategy);
        
        OrderStatusStrategy strategy = strategies.get(targetStatus);
        if (strategy == null) {
            throw new BadRequestException("Invalid order status: " + targetStatus);
        }
        
        return strategy;
    }
}
