package com.distributedsystem.orders.controller;

import com.distributedsystem.orders.dto.CreateOrderRequest;
import com.distributedsystem.orders.dto.OrderDTO;
import com.distributedsystem.orders.dto.UpdateOrderStatusRequest;
import com.distributedsystem.orders.model.OrderStatus;
import com.distributedsystem.orders.security.UserPrincipal;
import com.distributedsystem.orders.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest httpRequest) {

        String jwtToken = extractToken(httpRequest);
        OrderDTO order = orderService.createOrder(request, userPrincipal, jwtToken);

        ApiResponse<OrderDTO> response = ApiResponse.<OrderDTO>builder()
                .success(true)
                .data(order)
                .message("Order created successfully")
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getUserOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderDTO> orders = orderService.getUserOrders(userPrincipal, status, pageable);

        ApiResponse<Page<OrderDTO>> response = ApiResponse.<Page<OrderDTO>>builder()
                .success(true)
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        OrderDTO order = orderService.getOrderById(id, userPrincipal);

        ApiResponse<OrderDTO> response = ApiResponse.<OrderDTO>builder()
                .success(true)
                .data(order)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        OrderDTO order = orderService.updateOrderStatus(id, request, userPrincipal);

        ApiResponse<OrderDTO> response = ApiResponse.<OrderDTO>builder()
                .success(true)
                .data(order)
                .message("Order status updated successfully")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("success", true);
        health.put("service", "Orders Service");
        health.put("status", "healthy");
        health.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(health);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ApiResponse<T> {
        private boolean success;
        private T data;
        private String message;
        private LocalDateTime timestamp;
    }
}
