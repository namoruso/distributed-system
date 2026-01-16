package models

import "time"

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
