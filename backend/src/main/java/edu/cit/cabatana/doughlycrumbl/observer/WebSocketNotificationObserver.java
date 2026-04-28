package edu.cit.cabatana.doughlycrumbl.observer;

import edu.cit.cabatana.doughlycrumbl.model.Order;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketNotificationObserver implements OrderObserver {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public void onOrderPlaced(Order order) {
        // Notify customer
        notificationService.send(
                order.getUser(),
                order.getId(),
                "ORDER_PLACED",
                "Order Placed!",
                "Your order #" + order.getId() + " has been placed successfully. We'll confirm it soon."
        );

        // Notify all admins
        notifyAdmins(order.getId(), "NEW_ORDER",
                "New Order Received",
                "Order #" + order.getId() + " was just placed by " + order.getUser().getName() + ".");
    }

    @Override
    public void onOrderStatusChanged(Order order, String oldStatus, String newStatus) {
        // Notify customer about their order update
        String customerMessage = buildCustomerMessage(order.getId(), newStatus);
        notificationService.send(
                order.getUser(),
                order.getId(),
                "STATUS_CHANGED",
                "Order #" + order.getId() + " Updated",
                customerMessage
        );

        // Notify admins when a customer submits payment proof
        if ("PAYMENT_SUBMITTED_AWAITING_CONFIRMATION".equals(newStatus)) {
            notifyAdmins(order.getId(), "PAYMENT_SUBMITTED",
                    "Payment Proof Submitted",
                    order.getUser().getName() + " submitted payment proof for order #" + order.getId() + ". Please review.");
        }
    }

    @Override
    public void onOrderCancelled(Order order) {
        notificationService.send(
                order.getUser(),
                order.getId(),
                "ORDER_CANCELLED",
                "Order #" + order.getId() + " Cancelled",
                "Your order #" + order.getId() + " has been cancelled."
                        + (order.getCancellationReason() != null ? " Reason: " + order.getCancellationReason() : "")
        );
    }

    private void notifyAdmins(Long orderId, String type, String title, String message) {
        List<User> admins = userRepository.findByRole("ADMIN");
        for (User admin : admins) {
            notificationService.send(admin, orderId, type, title, message);
        }
    }

    private String buildCustomerMessage(Long orderId, String status) {
        return switch (status) {
            case "ORDER_PLACED"                              -> "Your order #" + orderId + " has been placed.";
            case "AWAITING_DELIVERY_QUOTE"                  -> "Your order #" + orderId + " is awaiting a delivery fee quote.";
            case "DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED"     -> "Delivery fee has been set for order #" + orderId + ". Please check payment instructions.";
            case "PAYMENT_SUBMITTED_AWAITING_CONFIRMATION"  -> "Your payment for order #" + orderId + " is being verified. We'll notify you once confirmed.";
            case "PAYMENT_CONFIRMED"                        -> "Payment confirmed for order #" + orderId + "! We're preparing your order.";
            case "PREPARING"                                -> "Your order #" + orderId + " is now being prepared.";
            case "OUT_FOR_DELIVERY"                         -> "Your order #" + orderId + " is out for delivery!";
            case "READY"                                    -> "Your order #" + orderId + " is ready for pickup!";
            case "COMPLETED"                                -> "Your order #" + orderId + " has been completed. Enjoy!";
            case "CANCELLED"                                -> "Your order #" + orderId + " has been cancelled.";
            default -> "Your order #" + orderId + " status has been updated to: " + status;
        };
    }
}
