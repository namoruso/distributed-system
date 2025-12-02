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
        print(f"[MAILER] Enviando email a {correo} via {smtpHost}:{smtpPort}")
        srv = smtplib.SMTP(smtpHost, smtpPort, timeout=10)
        if smtpUser and smtpPass:
            srv.starttls()
            srv.login(smtpUser, smtpPass)
        srv.send_message(msg)
        srv.quit()
        print(f"[MAILER] Email enviado exitosamente a {correo}")
        return True
    except Exception as e:
        print(f"[MAILER ERROR] No se pudo enviar email a {correo}: {e}")
        import traceback
        traceback.print_exc()
        return False

