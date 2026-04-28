package edu.cit.cabatana.doughlycrumbl.observer;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Inventory Observer
 * 
 * This observer handles inventory-related actions when orders are placed or cancelled.
 * In a full system, this would decrement stock when orders are placed and
 * restore stock when orders are cancelled.
 */
@Slf4j
@Component
public class InventoryObserver implements OrderObserver {

    @Override
    public void onOrderPlaced(Order order) {
        log.info("📦 [INVENTORY] Processing stock deduction for order #{}",
                order.getId());
        
        order.getItems().forEach(item -> {
            log.info("📦 [INVENTORY] Reserved {} x {} (Product ID: {})",
                    item.getQuantity(),
                    item.getProductName(),
                    item.getProduct().getId());
            
            // In production, this would update inventory:
            // inventoryService.reserveStock(item.getProduct().getId(), item.getQuantity());
        });
        
        log.info("✅ [INVENTORY] Stock reserved successfully for order #{}", order.getId());
    }

    @Override
    public void onOrderStatusChanged(Order order, String oldStatus, String newStatus) {
        // Only log for significant transitions
        if ("DELIVERED".equals(newStatus)) {
            log.info("📦 [INVENTORY] Order #{} delivered - Stock reservation confirmed",
                    order.getId());
        }
    }

    @Override
    public void onOrderCancelled(Order order) {
        log.info("📦 [INVENTORY] Restoring stock for cancelled order #{}",
                order.getId());
        
        order.getItems().forEach(item -> {
            log.info("📦 [INVENTORY] Restored {} x {} (Product ID: {})",
                    item.getQuantity(),
                    item.getProductName(),
                    item.getProduct().getId());
            
            // In production:
            // inventoryService.releaseStock(item.getProduct().getId(), item.getQuantity());
        });
        
        log.info("✅ [INVENTORY] Stock restored successfully for order #{}", order.getId());
    }
}
