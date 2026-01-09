package com.distributedsystem.orders.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private String userId;
    private String email;
    private String role;

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }
}
