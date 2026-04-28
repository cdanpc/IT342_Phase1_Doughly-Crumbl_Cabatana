package edu.cit.cabatana.doughlycrumbl.strategy;

import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
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

    // Allowed direct transitions for new status flow (no dedicated strategy class needed)
    // Key = target status, Value = set of valid source statuses
    private static final Map<String, String[]> DIRECT_TRANSITIONS = new HashMap<>();
    static {
        DIRECT_TRANSITIONS.put("PAYMENT_CONFIRMED",
                new String[]{"PAYMENT_SUBMITTED_AWAITING_CONFIRMATION"});
        DIRECT_TRANSITIONS.put("OUT_FOR_DELIVERY",
                new String[]{"PREPARING"});
        DIRECT_TRANSITIONS.put("COMPLETED",
                new String[]{"OUT_FOR_DELIVERY", "READY"});
    }

    /**
     * Transitions an order to a new status.
     * First tries a registered Strategy; falls back to the direct-transition map
     * for statuses added in the new order flow.
     */
    public void transitionOrderStatus(Order order, String newStatus) {
        OrderStatusStrategy strategy = getStrategy(newStatus);

        if (strategy != null) {
            if (!strategy.canTransition(order)) {
                throw new BadRequestException(strategy.getValidationError());
            }
            strategy.executeTransition(order);
            order.setStatus(strategy.getTargetStatus());
            return;
        }

        // Fall back to direct transition map for new-flow statuses
        String[] allowedSources = DIRECT_TRANSITIONS.get(newStatus);
        if (allowedSources == null) {
            throw new BadRequestException("Invalid order status: " + newStatus);
        }

        String currentStatus = order.getStatus();
        for (String allowed : allowedSources) {
            if (allowed.equals(currentStatus)) {
                order.setStatus(newStatus);
                return;
            }
        }

        throw new BadRequestException(
                "Cannot move order from " + currentStatus + " to " + newStatus);
    }

    /**
     * Returns the strategy for a target status, or null if none is registered.
     */
    private OrderStatusStrategy getStrategy(String targetStatus) {
        Map<String, OrderStatusStrategy> strategies = new HashMap<>();
        strategies.put("CONFIRMED", pendingToConfirmedStrategy);
        strategies.put("PREPARING", confirmedToPreparingStrategy);
        strategies.put("READY", preparingToReadyStrategy);
        strategies.put("DELIVERED", readyToDeliveredStrategy);
        strategies.put("CANCELLED", cancelOrderStrategy);
        return strategies.get(targetStatus);
    }
}

