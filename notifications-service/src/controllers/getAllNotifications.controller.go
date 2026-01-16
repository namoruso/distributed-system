package controllers

import (
	"net/http"
	"notifications-service/src/db"

	"github.com/gin-gonic/gin"
)

func GetAllNotifications(c *gin.Context) {

	db.Database.Mu.RLock()
	data := db.Database.Data
	db.Database.Mu.RUnlock()

	ntf := "Here are all the current orders"
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": ntf,
		"data":    data,
	})

}
