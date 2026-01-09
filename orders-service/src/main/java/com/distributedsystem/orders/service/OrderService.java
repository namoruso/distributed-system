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

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;

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

            // Handle null stock (Products Service might not return stock field)
            Integer productStock = product.getStock();
            if (productStock == null) {
                productStock = 0; // Treat null as out of stock
            }

            if (productStock < itemDTO.getQuantity()) {
                throw new InsufficientStockException(
                        product.getName(),
                        itemDTO.getQuantity(),
                        productStock);
            }

            // Ensure price is not null (Products Service should always return a price)
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
                    .subtotal(subtotal) // Initialize subtotal directly
                    .build();

            order.addItem(orderItem);
        }

        order.calculateTotalAmount();
        Order savedOrder = orderRepository.save(order);

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

        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);

        log.info("Order status updated successfully: {}", updatedOrder.getId());
        return convertToDTO(updatedOrder);
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
