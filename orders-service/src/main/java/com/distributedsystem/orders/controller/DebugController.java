package com.distributedsystem.orders.controller;

import com.distributedsystem.orders.service.ProductServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final ProductServiceClient productServiceClient;

    @GetMapping("/product/{id}")
    public Object testProductService(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            String jwt = authHeader.replace("Bearer ", "");
            var product = productServiceClient.getProduct(id, jwt);
            return product;
        } catch (Exception e) {
            return "ERROR: " + e.getMessage() + "\nCause: "
                    + (e.getCause() != null ? e.getCause().getMessage() : "none");
        }
    }
}
