package edu.cit.cabatana.doughlycrumbl.service;

import edu.cit.cabatana.doughlycrumbl.features.cart.CartRepository;
import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderAdapter;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderEventPublisher;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderFactory;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderRepository;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderResponse;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderService;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderStatusContext;
import edu.cit.cabatana.doughlycrumbl.features.order.UpdateOrderStatusRequest;
import edu.cit.cabatana.doughlycrumbl.features.payment.FileUploadService;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrderFactory orderFactory;
    @Mock private OrderAdapter orderAdapter;
    @Mock private OrderStatusContext orderStatusContext;
    @Mock private OrderEventPublisher eventPublisher;
    @Mock private FileUploadService fileUploadService;
    @InjectMocks private OrderService orderService;

    // --- updateOrderStatus ---

    @Test
    void updateStatus_unknownStatus_throwsBadRequest() {
        Order order = Order.builder().id(1L).status("ORDER_PLACED").build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("TOTALLY_MADE_UP").build();

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid order status");
    }

    @Test
    void updateStatus_validTransition_savesOrder() {
        Order order = Order.builder().id(1L).status("PAYMENT_CONFIRMED").build();
        OrderResponse dto = new OrderResponse();
        dto.setOrderId(1L);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        doNothing().when(orderStatusContext).transitionOrderStatus(any(), eq("PREPARING"));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderAdapter.toDto(order)).thenReturn(dto);

        OrderResponse result = orderService.updateOrderStatus(1L,
                UpdateOrderStatusRequest.builder().status("PREPARING").build());

        assertThat(result.getOrderId()).isEqualTo(1L);
        verify(orderRepository).save(order);
        verify(eventPublisher).publishOrderStatusChanged(eq(order), anyString(), eq("PREPARING"));
    }

    @Test
    void updateStatus_contextThrows_propagatesBadRequest() {
        Order order = Order.builder().id(2L).status("ORDER_PLACED").build();
        when(orderRepository.findById(2L)).thenReturn(Optional.of(order));
        doThrow(new BadRequestException("Cannot transition"))
                .when(orderStatusContext).transitionOrderStatus(any(), eq("COMPLETED"));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("COMPLETED").build();

        assertThatThrownBy(() -> orderService.updateOrderStatus(2L, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot transition");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateStatus_cancelOrder_setsPaymentStatusCancelled() {
        Order order = Order.builder().id(3L).status("ORDER_PLACED").paymentStatus("UNPAID").build();
        OrderResponse dto = new OrderResponse();
        dto.setOrderId(3L);

        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));
        doNothing().when(orderStatusContext).transitionOrderStatus(any(), eq("CANCELLED"));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderAdapter.toDto(order)).thenReturn(dto);

        orderService.updateOrderStatus(3L,
                UpdateOrderStatusRequest.builder().status("CANCELLED").reason("Customer request").build());

        assertThat(order.getPaymentStatus()).isEqualTo("CANCELLED");
        assertThat(order.getCancellationReason()).isEqualTo("Customer request");
        verify(eventPublisher).publishOrderCancelled(order);
    }
}