package utils

import (
	"fmt"
	"net/smtp"
)

func SendEmail(email string, msg string) {
	fromEmail := GetVar("SMTP_EMAIL", "")
	password := GetVar("SMTP_PASSWORD", "")
	port := GetVar("SMTP_PORT", "587")
	host := GetVar("SMTP_HOST", "smtp.gmail.com")
	message := []byte(msg)
	lisToEmail := []string{email}

	auth := smtp.PlainAuth("", fromEmail, password, host)
	if err := smtp.SendMail(host+":"+port, auth, fromEmail, lisToEmail, message); err != nil {
		fmt.Println("Error sending email")
	}
}
