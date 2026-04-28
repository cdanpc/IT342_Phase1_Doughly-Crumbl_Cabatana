package edu.cit.cabatana.doughlycrumbl.observer;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Logging Observer
 * 
 * This observer logs all order events for audit trails and analytics.
 * In production, logs could be sent to a centralized logging system
 * like ELK Stack, Splunk, or CloudWatch.
 */
@Slf4j
@Component
public class LoggingObserver implements OrderObserver {

    @Override
    public void onOrderPlaced(Order order) {
        log.info("📝 [AUDIT] Order placed - ID: {}, User: {}, Amount: ₱{}, Items: {}",
                order.getId(),
                order.getUser().getId(),
                order.getTotalAmount(),
                order.getItems().size());
        
        // In production, this could send to centralized logging:
        // auditLogger.logOrderPlaced(order);
    }

    @Override
    public void onOrderStatusChanged(Order order, String oldStatus, String newStatus) {
        log.info("📝 [AUDIT] Status changed - Order #{}: {} -> {}, Updated by: ADMIN",
                order.getId(), oldStatus, newStatus);
        
        // In production:
        // auditLogger.logStatusChange(order, oldStatus, newStatus);
    }

    @Override
    public void onOrderCancelled(Order order) {
        log.warn("📝 [AUDIT] Order cancelled - ID: {}, User: {}, Previous Status: {}",
                order.getId(),
                order.getUser().getId(),
                order.getStatus());
        
        // In production:
        // auditLogger.logOrderCancellation(order);
    }
}
