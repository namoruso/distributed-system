package utils

import (
	"fmt"
	"os"
)

func GetVar(key string, defaultValue string) string {
	if varEnv, exist := os.LookupEnv(key); exist {
		return varEnv
	}

	if defaultValue != "" {
		fmt.Printf("Using default value of environment variable: %s\n", key)
		return defaultValue
	}

	fmt.Printf("Environment variable not found: %s\n", key)
	return ""
}
