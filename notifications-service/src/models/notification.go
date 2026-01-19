package models

import "time"

type Notification struct {
	ID        string    `json:"id" binding:"required"`
	OrderID   int64     `json:"orderId" binding:"required"`
	Email     string    `json:"email" binding:"required"`
	State     string    `json:"state" binding:"required"`
	Message   string    `json:"message"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateNotificationRequest struct {
	OrderID int64  `json:"orderId" binding:"required"`
	Email   string `json:"email" binding:"required"`
	State   string `json:"state" binding:"required"`
	Message string `json:"message"`
}
