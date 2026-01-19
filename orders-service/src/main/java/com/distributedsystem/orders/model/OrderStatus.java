package com.distributedsystem.orders.model;

import java.util.Set;
import java.util.Map;
import java.util.HashMap;

public enum OrderStatus {
    CREADO("Order Created"),
    PAGADO("Payment Confirmed"),
    SHIPPED("Shipped (admin updates)"),
    DELIVERED("Delivered (admin updates)"),
    CANCELADO("Order Cancelled");

    private final String description;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = new HashMap<>();

    static {
        ALLOWED_TRANSITIONS.put(CREADO, Set.of(PAGADO, CANCELADO));
        ALLOWED_TRANSITIONS.put(PAGADO, Set.of(SHIPPED, CANCELADO));
        ALLOWED_TRANSITIONS.put(SHIPPED, Set.of(DELIVERED));
        ALLOWED_TRANSITIONS.put(DELIVERED, Set.of()); // Final state
        ALLOWED_TRANSITIONS.put(CANCELADO, Set.of()); // Final state
    }

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean canTransitionTo(OrderStatus targetStatus) {
        if (targetStatus == null) {
            return false;
        }

        if (this == targetStatus) {
            return true;
        }

        Set<OrderStatus> allowedTargets = ALLOWED_TRANSITIONS.get(this);
        return allowedTargets != null && allowedTargets.contains(targetStatus);
    }

    public Set<OrderStatus> getAllowedTransitions() {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of());
    }

    public boolean isFinalState() {
        Set<OrderStatus> allowedTargets = ALLOWED_TRANSITIONS.get(this);
        return allowedTargets == null || allowedTargets.isEmpty();
    }
}
