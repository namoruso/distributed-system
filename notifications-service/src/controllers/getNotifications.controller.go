package controllers

import (
	"net/http"
	"notifications-service/src/db"
	"notifications-service/src/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetNotifications(c *gin.Context) {

	id := c.Param("id")

	db.Database.Mu.RLock()
	data, exist := db.Database.Data[id]
	db.Database.Mu.RUnlock()

	if !exist {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Notification not found",
		})
		return
	}
	ntf := "Your order is " + strings.ToLower(data.State)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": ntf,
		"data":    data,
	})

	go func() {
		email, exist := c.Get("email")
		if exist {
			msg := "Subject: Purchase order notification\n" + ntf
			utils.SendEmail(email.(string), msg)
		}
	}()

}
