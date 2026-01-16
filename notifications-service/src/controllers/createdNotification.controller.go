package controllers

import (
	"net/http"
	"notifications-service/src/db"
	"notifications-service/src/models"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreatedNotification(c *gin.Context) {

	var content models.Notification

	if err := c.ShouldBindJSON(&content); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Error getting data",
		})
		return
	}
	state := strings.ToLower(content.State)

	if state != "created" && state != "sent" && state != "delivered" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Error getting data",
		})
		return
	}

	db.Database.Mu.Lock()
	db.Database.Data[strconv.Itoa(content.ID)] = content
	db.Database.Mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Notification created",
	})
}
