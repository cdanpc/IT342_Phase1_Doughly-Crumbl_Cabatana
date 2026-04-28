package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;

/**
 * Observer Pattern Implementation - Behavioral Pattern
 * 
 * Purpose: Defines an interface for objects that should be notified
 * of changes in order state. This allows for a publish-subscribe model
 * where multiple observers can react to order events independently.
 * 
 * Benefits:
 * - Loose Coupling: Publishers don't need to know about subscribers
 * - Extensibility: Easy to add new observers without modifying existing code
 * - Multiple Subscribers: Many observers can react to the same event
 * - Separation of Concerns: Notification logic is separated from business logic
 * 
 * Real-world Use Case:
 * Food delivery apps like GrabFood use observer patterns extensively:
 * - When an order is placed: notify customer (email/SMS), notify restaurant,
 *   update inventory, log to analytics, send to delivery assignment system
 * - Each of these is a separate observer that reacts independently
 */
public interface OrderObserver {
    
    /**
     * Called when a new order is placed.
     * 
     * @param order The order that was placed
     */
    void onOrderPlaced(Order order);
    
    /**
     * Called when an order status changes.
     * 
     * @param order The order whose status changed
     * @param oldStatus The previous status
     * @param newStatus The new status
     */
    void onOrderStatusChanged(Order order, String oldStatus, String newStatus);
    
    /**
     * Called when an order is cancelled.
     * 
     * @param order The order that was cancelled
     */
    void onOrderCancelled(Order order);
}
