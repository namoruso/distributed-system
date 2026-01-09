package com.distributedsystem.orders.service;

import com.distributedsystem.orders.dto.ProductDTO;
import com.distributedsystem.orders.exception.ProductNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${products.service.url}")
    private String productsServiceUrl;

    public ProductDTO getProduct(Long productId, String jwtToken) {
        try {
            String url = productsServiceUrl + "/api/products/" + productId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<ProductResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    ProductResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }

            throw new ProductNotFoundException(productId);
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Product not found: {}", productId);
            throw new ProductNotFoundException(productId);
        } catch (Exception e) {
            log.error("Error fetching product {}: {}", productId, e.getMessage());
            throw new RuntimeException("Error communicating with Products Service", e);
        }
    }

    @lombok.Data
    private static class ProductResponse {
        private boolean success;
        private ProductDTO data;
    }
}
