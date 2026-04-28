package edu.cit.cabatana.doughlycrumbl.observer;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Email Notification Observer
 * 
 * This observer sends email notifications to customers when order events occur.
 * In a production system, this would integrate with an email service like
 * SendGrid, AWS SES, or similar.
 */
@Slf4j
@Component
public class EmailNotificationObserver implements OrderObserver {

    @Override
    public void onOrderPlaced(Order order) {
        log.info("📧 [EMAIL] Sending order confirmation to user {} for order #{}",
                order.getUser().getEmail(), order.getId());
        
        // In production, this would call an email service:
        // emailService.sendOrderConfirmation(order.getUser().getEmail(), order);
        
        log.info("✅ [EMAIL] Order confirmation sent successfully");
    }

    @Override
    public void onOrderStatusChanged(Order order, String oldStatus, String newStatus) {
        log.info("📧 [EMAIL] Sending status update to user {} - Order #{}: {} -> {}",
                order.getUser().getEmail(), order.getId(), oldStatus, newStatus);
        
        // In production:
        // emailService.sendStatusUpdate(order.getUser().getEmail(), order, oldStatus, newStatus);
        
        log.info("✅ [EMAIL] Status update sent successfully");
    }

    @Override
    public void onOrderCancelled(Order order) {
        log.info("📧 [EMAIL] Sending cancellation notice to user {} for order #{}",
                order.getUser().getEmail(), order.getId());
        
        // In production:
        // emailService.sendOrderCancellation(order.getUser().getEmail(), order);
        
        log.info("✅ [EMAIL] Cancellation notice sent successfully");
    }
}
