package com.distributedsystem.orders.service;

import com.distributedsystem.orders.dto.*;
import com.distributedsystem.orders.exception.InsufficientStockException;
import com.distributedsystem.orders.exception.OrderNotFoundException;
import com.distributedsystem.orders.model.Order;
import com.distributedsystem.orders.model.OrderItem;
import com.distributedsystem.orders.model.OrderStatus;
import com.distributedsystem.orders.repository.OrderRepository;
import com.distributedsystem.orders.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, UserPrincipal userPrincipal, String jwtToken) {
        log.info("Creating order for user: {}", userPrincipal.getUserId());

        Order order = Order.builder()
                .userId(userPrincipal.getUserId())
                .userEmail(userPrincipal.getEmail())
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .status(OrderStatus.CREADO)
                .build();

        for (OrderItemDTO itemDTO : request.getItems()) {
            ProductDTO product = productServiceClient.getProduct(itemDTO.getProductId(), jwtToken);

            Integer productStock = product.getStock();
            if (productStock == null) {
                productStock = 0;
            }

            if (productStock < itemDTO.getQuantity()) {
                throw new InsufficientStockException(
                        product.getName(),
                        itemDTO.getQuantity(),
                        productStock);
            }

            Double productPrice = product.getPrice();
            if (productPrice == null) {
                log.error("Product {} has null price, defaulting to 0", product.getId());
                productPrice = 0.0;
            }

            BigDecimal unitPrice = BigDecimal.valueOf(productPrice);
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productSku(product.getSku())
                    .productName(product.getName())
                    .quantity(itemDTO.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            order.addItem(orderItem);
        }

        order.calculateTotalAmount();
        Order savedOrder = orderRepository.save(order);

        notificationServiceClient.sendOrderNotification(
                savedOrder.getId(),
                savedOrder.getUserEmail(),
                "ORDER_CREATED",
                String.format("Your order #%d has been created successfully", savedOrder.getId()));

        log.info("Order created successfully: {}", savedOrder.getId());
        return convertToDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(UserPrincipal userPrincipal, OrderStatus status, Pageable pageable) {
        log.info("Fetching orders for user: {}", userPrincipal.getUserId());

        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByUserIdAndStatus(userPrincipal.getUserId(), status, pageable);
        } else {
            orders = orderRepository.findByUserId(userPrincipal.getUserId(), pageable);
        }

        return orders.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(OrderStatus status, Pageable pageable) {
        log.info("Admin fetching all orders. Status filter: {}", status);

        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(this::convertToDTO);
    }

    @Transactional
    public OrderDTO handlePaymentCallback(Long orderId, PaymentCallbackRequest request) {
        log.info("Processing payment callback for order: {}, paymentId: {}, status: {}",
                orderId, request.getPaymentId(), request.getStatus());

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!"completed".equalsIgnoreCase(request.getStatus())) {
            log.warn("Payment callback received with non-completed status: {}", request.getStatus());
            throw new IllegalArgumentException("Payment status must be 'completed'");
        }

        BigDecimal paymentAmount = BigDecimal.valueOf(request.getAmount());
        if (paymentAmount.compareTo(order.getTotalAmount()) != 0) {
            String errorMsg = String.format(
                    "Payment amount (%.2f) does not match order total (%.2f)",
                    paymentAmount, order.getTotalAmount());
            log.error(errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }

        OrderStatus currentStatus = order.getStatus();
        if (!currentStatus.canTransitionTo(OrderStatus.PAGADO)) {
            String errorMsg = String.format(
                    "Cannot mark order as paid. Current status: %s", currentStatus);
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        List<StockUpdateItem> stockUpdates = order.getItems().stream()
                .map(item -> StockUpdateItem.builder()
                        .id(item.getProductId())
                        .quantity(-item.getQuantity())
                        .build())
                .toList();

        try {
            productServiceClient.updateStock(stockUpdates, null);
            log.info("Stock reduced successfully for order: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to reduce stock for order: {}", orderId, e);
            throw new RuntimeException("Failed to reduce stock. Payment cannot be completed.", e);
        }

        order.setStatus(OrderStatus.PAGADO);
        Order updatedOrder = orderRepository.save(order);

        notificationServiceClient.sendOrderNotification(
                updatedOrder.getId(),
                updatedOrder.getUserEmail(),
                "ORDER_PAID",
                String.format("Payment confirmed for order #%d. Your order will be shipped soon.",
                        updatedOrder.getId()));

        log.info("Order {} marked as PAGADO. PaymentId: {}", orderId, request.getPaymentId());
        return convertToDTO(updatedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, UserPrincipal userPrincipal) {
        log.info("Fetching order: {} for user: {}", orderId, userPrincipal.getUserId());

        Order order;
        if (userPrincipal.isAdmin()) {
            order = orderRepository.findByIdWithItems(orderId)
                    .orElseThrow(() -> new OrderNotFoundException(orderId));
        } else {
            order = orderRepository.findByIdAndUserId(orderId, userPrincipal.getUserId())
                    .orElseThrow(() -> new OrderNotFoundException(orderId));
        }

        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, UserPrincipal userPrincipal) {
        log.info("Updating order status: {} to {}", orderId, request.getStatus());

        if (!userPrincipal.isAdmin()) {
            throw new AccessDeniedException("Only admins can update order status");
        }

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus targetStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(targetStatus)) {
            String allowedTransitions = currentStatus.getAllowedTransitions().stream()
                    .map(Enum::name)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("none (final state)");

            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s. Allowed transitions: %s",
                            currentStatus, targetStatus, allowedTransitions));
        }

        order.setStatus(targetStatus);
        Order updatedOrder = orderRepository.save(order);

        String notificationState = getNotificationState(targetStatus);
        String notificationMessage = String.format("Your order #%d status has been updated to %s",
                updatedOrder.getId(), targetStatus.getDescription());

        notificationServiceClient.sendOrderNotification(
                updatedOrder.getId(),
                updatedOrder.getUserEmail(),
                notificationState,
                notificationMessage);

        log.info("Order status updated successfully: {} from {} to {}",
                updatedOrder.getId(), currentStatus, targetStatus);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long orderId, UserPrincipal userPrincipal) {
        log.info("Cancelling order: {} by user: {}", orderId, userPrincipal.getUserId());

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!userPrincipal.isAdmin() && !order.getUserId().equals(userPrincipal.getUserId())) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == OrderStatus.CANCELADO) {
            throw new IllegalStateException("Order is already cancelled");
        }

        if (currentStatus == OrderStatus.PAGADO || currentStatus == OrderStatus.SHIPPED
                || currentStatus == OrderStatus.DELIVERED) {
            List<StockUpdateItem> stockUpdates = order.getItems().stream()
                    .map(item -> StockUpdateItem.builder()
                            .id(item.getProductId())
                            .quantity(item.getQuantity()) // Positive to restore stock
                            .build())
                    .toList();

            try {
                productServiceClient.updateStock(stockUpdates, null);
                log.info("Stock restored successfully for cancelled order: {}", orderId);
            } catch (Exception e) {
                log.error("Failed to restore stock for cancelled order: {}, but order will still be cancelled", orderId,
                        e);
            }
        } else {
            log.info("Order {} was in status {} (not paid yet), no stock to restore", orderId, currentStatus);
        }

        order.setStatus(OrderStatus.CANCELADO);
        Order updatedOrder = orderRepository.save(order);

        notificationServiceClient.sendOrderNotification(
                updatedOrder.getId(),
                updatedOrder.getUserEmail(),
                "ORDER_CANCELLED",
                String.format("Your order #%d has been cancelled", updatedOrder.getId()));

        log.info("Order {} cancelled successfully by user {}", orderId, userPrincipal.getUserId());
        return convertToDTO(updatedOrder);
    }

    private String getNotificationState(OrderStatus status) {
        return switch (status) {
            case CREADO -> "ORDER_CREATED";
            case PAGADO -> "ORDER_PAID";
            case SHIPPED -> "ORDER_SHIPPED";
            case DELIVERED -> "ORDER_DELIVERED";
            case CANCELADO -> "ORDER_CANCELLED";
        };
    }

    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .totalAmount(order.getTotalAmount().doubleValue())
                .status(order.getStatus())
                .notes(order.getNotes())
                .items(order.getItems().stream()
                        .map(item -> OrderItemDTO.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productSku(item.getProductSku())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice().doubleValue())
                                .subtotal(item.getSubtotal().doubleValue())
                                .build())
                        .toList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
