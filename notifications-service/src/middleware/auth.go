package middleware

import (
	"errors"
	"net/http"
	"strings"

	"notifications-service/src/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func obtainTokenInfo(tokenData string) (jwt.MapClaims, error) {
	dataList := strings.Split(tokenData, " ")

	if tokenData == "" || dataList[0] != "Bearer" || len(dataList) != 2 {
		return nil, errors.New("Error validating data, without authorization")
	}

	token := dataList[1]

	info, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(utils.GetVar("JWT_SECRET_KEY", "")), nil
	})

	if err != nil || !info.Valid {
		return nil, errors.New("Error validating data, without authorization")
	}

	claims, ok := info.Claims.(jwt.MapClaims)

	if !ok {
		return nil, errors.New("Error validating data, without authorization")
	}

	return claims, nil
}

func Auth(allowedRoles ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		claims, err := obtainTokenInfo(ctx.GetHeader("Authorization"))
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"Success": false, "Error": err.Error()})
			return
		}

		role := claims["rol"].(string)
		isAllowed := false
		for _, r := range allowedRoles {
			if role == r {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"Success": false, "Error": "Error validating data, without authorization"})
			return
		}

		ctx.Set("email", claims["correo"].(string))
		ctx.Next()
	}
}
