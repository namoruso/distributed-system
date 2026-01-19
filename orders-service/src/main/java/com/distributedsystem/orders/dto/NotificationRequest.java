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

    private String state;

    private String message;

    private Object metadata;
}
