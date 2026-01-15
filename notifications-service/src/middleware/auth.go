package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"notifications-service/src/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func VerifyToken(ctx *gin.Context) {
	data := ctx.GetHeader("Authorization")
	dataList := strings.Split(data, " ")

	if data == "" || dataList[0] != "Bearer" || len(dataList) != 2 {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"Success": false,
			"Error":   "Error validating data, without authorization",
		})
		return
	}

	token := dataList[1]

	tokenInfo, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(utils.GetVar("JWT_SECRET_KEY", "")), nil
	})

	if err != nil || !tokenInfo.Valid {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"Success": false,
			"Error":   "Error validating data, without authorization",
		})
		return
	}

	tokenClaims, ok := tokenInfo.Claims.(jwt.MapClaims)

	if !ok {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"Success": false,
			"Error":   "Error validating data, without authorization",
		})
		return
	}

	ctx.Set("email", tokenClaims["correo"].(string))
	ctx.Set("role", tokenClaims["rol"].(string))
	ctx.Next()
}
