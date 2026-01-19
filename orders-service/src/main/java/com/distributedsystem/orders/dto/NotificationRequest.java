package com.distributedsystem.orders.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    private Long orderId;

    @JsonProperty("email")
    private String userEmail;

    private String state; // ORDER_CREATED, ORDER_PAID, ORDER_SHIPPED, ORDER_COMPLETED, ORDER_CANCELLED

    private String message;

    private Object metadata; // Additional data like order details, tracking number, etc.
}
