package models

import "time"

type Notification struct {
	ID        int       `json:"id"`
	State     string    `json:"state"`
	Email     string    `json:"userEmail"`
	CreatedAt time.Time `json:"createdAt"`
	UpdateAt  time.Time `json:"updateAt"`
}

type UpdateNotification struct {
	ID       int       `json:"id"`
	State    string    `json:"state"`
	UpdateAt time.Time `json:"updateAt"`
}
