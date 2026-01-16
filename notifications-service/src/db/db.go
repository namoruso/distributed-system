package db

import (
	"notifications-service/src/models"
	"sync"
)

type DB struct {
	Mu   sync.RWMutex
	Data map[string]models.Notification
}

var Database = &DB{
	Data: make(map[string]models.Notification),
}
