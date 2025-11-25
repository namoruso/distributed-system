import smtplib
from email.message import EmailMessage
from .config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL

def enviar(correo, asunto, cuerpo):
    msg = EmailMessage()
    msg["From"] = FROM_EMAIL
    msg["To"] = correo
    msg["Subject"] = asunto
    msg.set_content(cuerpo)
    try:
        srv = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5)
        if SMTP_USER:
            srv.starttls()
            srv.login(SMTP_USER, SMTP_PASS)
        srv.send_message(msg)
        srv.quit()
    except Exception as e:
        print("mailErr", e)