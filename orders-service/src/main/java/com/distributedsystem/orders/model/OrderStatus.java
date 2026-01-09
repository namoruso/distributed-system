package com.distributedsystem.orders.model;

public enum OrderStatus {
    CREADO("Orden creada, pendiente de pago"),
    PAGADO("Pago confirmado, pendiente de envío"),
    ENVIADO("Orden enviada al cliente"),
    COMPLETADO("Orden completada y entregada"),
    CANCELADO("Orden cancelada");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
