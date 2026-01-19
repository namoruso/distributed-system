package com.distributedsystem.orders.service;

import com.distributedsystem.orders.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceClient {

    private final RestTemplate restTemplate;

    @Value("${notifications.service.url:http://notifications-service:5040}")
    private String notificationsServiceUrl;

    public boolean sendNotification(NotificationRequest request) {
        try {
            String url = notificationsServiceUrl + "/api/notifications";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<NotificationRequest> entity = new HttpEntity<>(request, headers);

            log.info("Sending notification to Notifications Service: order={}, state={}",
                    request.getOrderId(), request.getState());

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Notification sent successfully for order: {}", request.getOrderId());
                return true;
            } else {
                log.warn("Failed to send notification, status: {}", response.getStatusCode());
                return false;
            }

        } catch (RestClientException e) {
            log.error("Error communicating with Notifications Service for order: {}",
                    request.getOrderId(), e);
            return false;
        }
    }

    public boolean sendOrderNotification(Long orderId, String userEmail, String state, String message) {
        NotificationRequest request = NotificationRequest.builder()
                .orderId(orderId)
                .userEmail(userEmail)
                .state(state)
                .message(message)
                .build();

        return sendNotification(request);
    }
}
