package main

import (
	"log"
	"notifications-service/src/middleware"
	"notifications-service/src/utils"

	"notifications-service/src/controllers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(".env"); err != nil {
		log.Fatalln(err)
	}

	router := gin.Default()

	router.Use(middleware.CorsConfig())
	
	router.SetTrustedProxies([]string{"127.0.0.1"})

	router.GET("/api/health", controllers.Health)

	router.GET("/api/notifications/all", middleware.Auth("admin"), controllers.GetAllNotifications)
	
	router.GET("/api/notifications", middleware.Auth("user", "admin"), controllers.GetUserNotifications)
	
	router.GET("/api/notifications/:id", middleware.Auth("user", "admin"), controllers.GetNotificationById)
	
	router.PUT("/api/notifications/:id/read", middleware.Auth("user", "admin"), controllers.MarkAsRead)
	
	router.POST("/api/notifications", controllers.CreateNotification)

	router.Run(":" + utils.GetVar("PORT", "5040"))
}
