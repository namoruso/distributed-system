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

	api := router.Group("/notifications")
	{
		api.GET("", middleware.VerifyToken, controllers.GetNotifications)
		api.POST("", middleware.VerifyToken, controllers.SendNotification)
	}

	router.Run(":" + utils.GetVar("PORT", "5040"))
}
