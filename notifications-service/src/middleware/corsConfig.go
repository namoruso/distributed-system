package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

func CorsConfig() gin.HandlerFunc {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type, Authorization, Accept"},
		AllowCredentials: true,
	})

	return func(ctx *gin.Context) {
		c.HandlerFunc(ctx.Writer, ctx.Request)
		ctx.Next()
	}
}
