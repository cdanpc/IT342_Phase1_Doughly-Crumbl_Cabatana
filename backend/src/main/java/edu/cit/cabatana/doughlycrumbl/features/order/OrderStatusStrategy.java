package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;

/**
 * Strategy Pattern Implementation - Behavioral Pattern
 * 
 * Purpose: Defines a family of algorithms for order status transitions.
 * Each concrete strategy encapsulates the validation and business rules
 * for transitioning an order from one status to another.
 * 
 * Benefits:
 * - Open/Closed Principle: Easy to add new status transitions without modifying existing code
 * - Single Responsibility: Each strategy handles one specific transition
 * - Eliminates Conditionals: Replaces complex if-else chains with polymorphism
 * - Testability: Each strategy can be tested independently
 * 
 * Real-world Use Case:
 * E-commerce platforms like Lazada or Zalora use strategy patterns for order
 * state machines. Each status transition has specific business rules
 * (e.g., can't deliver an unconfirmed order, can't cancel a delivered order).
 */
public interface OrderStatusStrategy {
    
    /**
     * Validates if the status transition is allowed.
     * 
     * @param order The order to validate
     * @return true if the transition is valid, false otherwise
     */
    boolean canTransition(Order order);
    
    /**
     * Gets the error message if validation fails.
     * 
     * @return The error message
     */
    String getValidationError();
    
    /**
     * Gets the target status this strategy transitions to.
     * 
     * @return The target status string
     */
    String getTargetStatus();
    
    /**
     * Executes any additional logic needed during the transition.
     * Default implementation does nothing.
     * 
     * @param order The order being transitioned
     */
    default void executeTransition(Order order) {
        // Override if additional logic is needed
    }
}
