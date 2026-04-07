package edu.cit.cabatana.doughlycrumbl.observer;

import edu.cit.cabatana.doughlycrumbl.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Order Event Publisher - Subject in the Observer Pattern
 * 
 * This class acts as the publisher/subject in the observer pattern.
 * It maintains a list of observers and notifies them when order events occur.
 * 
 * Benefits:
 * - Centralized Event Management: All order events are published from one place
 * - Automatic Observer Registration: Spring injects all observers automatically
 * - Easy to Extend: Just create a new observer component, no registration code needed
 */
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    // Spring automatically injects all beans that implement OrderObserver
    private final List<OrderObserver> observers;

    /**
     * Publishes an order placed event to all observers.
     * 
     * @param order The order that was placed
     */
    public void publishOrderPlaced(Order order) {
        observers.forEach(observer -> observer.onOrderPlaced(order));
    }

    /**
     * Publishes an order status changed event to all observers.
     * 
     * @param order The order whose status changed
     * @param oldStatus The previous status
     * @param newStatus The new status
     */
    public void publishOrderStatusChanged(Order order, String oldStatus, String newStatus) {
        observers.forEach(observer -> observer.onOrderStatusChanged(order, oldStatus, newStatus));
    }

    /**
     * Publishes an order cancelled event to all observers.
     * 
     * @param order The order that was cancelled
     */
    public void publishOrderCancelled(Order order) {
        observers.forEach(observer -> observer.onOrderCancelled(order));
    }
}
