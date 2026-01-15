package controllers

import (
	"log"
	"net/http"
	"notifications-service/src/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Item struct {
	ID          int     `json:"id"`
	ProductID   int     `json:"productId"`
	ProductName string  `json:"productName"`
	ProductSku  string  `json:"productSku"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
	UnitPrice   float64 `json:"unitPrice"`
}

type ContentOrder struct {
	ID          int       `json:"id"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UserEmail   string    `json:"userEmail"`
	TotalAmount float64   `json:"totalAmount"`
	Items       []Item    `json:"items"`
}

func SendNotification(c *gin.Context) {
	var content ContentOrder

	if err := c.ShouldBindJSON(&content); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Error getting data",
		})
		return
	}

	ntf := "Hello, your purchase order is ready.\nID: " + strconv.Itoa(content.ID) + "\n"
	ntf += "Creation date: " + content.CreatedAt.Format("01/02/2006 15:04:05") + "\n"
	ntf += "Total price: " + strconv.FormatFloat(content.TotalAmount, 'f', -1, 64) + "\n"
	ntf += "Status: " + content.Status + "\n\n"

	go func() {
		msg := "Subject: Purchase order notification\n" + ntf + "Products: \n"
		for i := 0; i < len(content.Items); i++ {
			msg += strconv.Itoa(i+1) + "- " + content.Items[i].ProductName + ": " + " quantity: " + strconv.Itoa(content.Items[i].Quantity) + "\n"
		}
		utils.SendEmail(content.UserEmail, msg)
	}()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": ntf,
	})

	log.Printf("\nNotification sent, Order ID: %d", content.ID)
}
