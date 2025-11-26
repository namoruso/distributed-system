import os
from dotenv import load_dotenv

load_dotenv()

secret = os.getenv("JWT_SECRET", "cambia_por_un_secreto_local")
algoritmo = os.getenv("JWT_ALGO", "HS256")
expMin = int(os.getenv("JWT_EXP_MIN", "60"))

smtpHost = os.getenv("SMTP_HOST", "localhost")
smtpPort = int(os.getenv("SMTP_PORT", "25"))
smtpUser = os.getenv("SMTP_USER", "")
smtpPass = os.getenv("SMTP_PASS", "")
fromEmail = os.getenv("FROM_EMAIL", "no-reply@local")

dbUrl = os.getenv("DATABASE_URL", "sqlite:///./data/auth.db")
