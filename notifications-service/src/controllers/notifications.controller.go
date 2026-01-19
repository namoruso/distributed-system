package controllers

import (
	"fmt"
	"net/http"
	"notifications-service/src/db"
	"notifications-service/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

func GetUserNotifications(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User email not found in context",
		})
		return
	}

	userEmail := email.(string)

	db.Database.Mu.RLock()
	var userNotifications []models.Notification
	for _, notification := range db.Database.Data {
		if notification.Email == userEmail {
			userNotifications = append(userNotifications, notification)
		}
	}
	db.Database.Mu.RUnlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    userNotifications,
		"count":   len(userNotifications),
	})
}

func GetNotificationById(c *gin.Context) {
	id := c.Param("id")
	email, exists := c.Get("email")
	
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User email not found in context",
		})
		return
	}

	userEmail := email.(string)
	role, _ := c.Get("role")

	db.Database.Mu.RLock()
	notification, exists := db.Database.Data[id]
	db.Database.Mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Notification not found",
		})
		return
	}

	if role != "admin" && notification.Email != userEmail {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "You don't have permission to view this notification",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notification,
	})
}

func CreateNotification(c *gin.Context) {
	var request models.CreateNotificationRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data: " + err.Error(),
		})
		return
	}

	notificationID := fmt.Sprintf("order_%d_%d", request.OrderID, time.Now().Unix())

	notification := models.Notification{
		ID:        notificationID,
		OrderID:   request.OrderID,
		Email:     request.Email,
		State:     request.State,
		Message:   request.Message,
		Read:      false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	db.Database.Mu.Lock()
	db.Database.Data[notificationID] = notification
	db.Database.Mu.Unlock()

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    notification,
		"message": "Notification created successfully",
	})
}

func MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	email, exists := c.Get("email")
	
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User email not found in context",
		})
		return
	}

	userEmail := email.(string)

	db.Database.Mu.Lock()
	notification, exists := db.Database.Data[id]
	if !exists {
		db.Database.Mu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Notification not found",
		})
		return
	}

	if notification.Email != userEmail {
		db.Database.Mu.Unlock()
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "You don't have permission to modify this notification",
		})
		return
	}

	notification.Read = true
	notification.UpdatedAt = time.Now()
	db.Database.Data[id] = notification
	db.Database.Mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notification,
		"message": "Notification marked as read",
	})
}

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"service": "Notifications Service",
		"status":  "healthy",
		"timestamp": time.Now(),
	})
}
