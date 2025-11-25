import os
from dotenv import load_dotenv
load_dotenv()
SECRET=os.getenv("SECRET_KEY","secreto")
ALGORITMO=os.getenv("ALGORITMO","HS256")
EXP_MIN=int(os.getenv("EXP_MIN","60"))
SMTP_HOST=os.getenv("SMTP_HOST","localhost")
SMTP_PORT=int(os.getenv("SMTP_PORT","25"))
SMTP_USER=os.getenv("SMTP_USER","")
SMTP_PASS=os.getenv("SMTP_PASS","")
FROM_EMAIL=os.getenv("FROM_EMAIL","no-reply@local")