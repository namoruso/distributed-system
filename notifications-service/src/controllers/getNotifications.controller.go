package controllers

import (
	"log"
	"net/http"
	"notifications-service/src/utils"

	"github.com/gin-gonic/gin"
)

func GetNotifications(c *gin.Context) {

	ntf := "Your order is on its way to be delivered"
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": ntf,
	})

	go func() {
		email, exist := c.Get("email")
		if exist {
			msg := "Subject: Purchase order notification\n" + ntf
			utils.SendEmail(email.(string), msg)
		}
	}()

	log.Printf("\nNotification sent, changed order status")

}
