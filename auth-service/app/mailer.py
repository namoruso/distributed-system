import smtplib
from email.message import EmailMessage
from .config import smtpHost, smtpPort, smtpUser, smtpPass, fromEmail

def enviar(correo, asunto, cuerpo):
    msg = EmailMessage()
    msg["From"] = fromEmail
    msg["To"] = correo
    msg["Subject"] = asunto
    msg.set_content(cuerpo)
    try:
        srv = smtplib.SMTP(smtpHost, smtpPort, timeout=5)
        if smtpUser:
            srv.starttls()
            srv.login(smtpUser, smtpPass)
        srv.send_message(msg)
        srv.quit()
    except Exception as e:
        print("mailErr", e)
