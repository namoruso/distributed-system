from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import re
from .config import secret, algoritmo, expMin

pwd = CryptContext(schemes=["argon2"], deprecated="auto")

def hashClave(clave):
    return pwd.hash(clave)

def verificaClave(clave, hash_):
    return pwd.verify(clave, hash_)

def genCodigo(n=6):
    import random, string
    letras = string.ascii_uppercase + string.digits
    return "".join(random.choice(letras) for _ in range(n))

def validaClave(c):
    if len(c) < 8:
        return False
    if not re.search(r"[A-Z]", c):
        return False
    if not re.search(r"[a-z]", c):
        return False
    if not re.search(r"[0-9]", c):
        return False
    if not re.search(r"[!@#\$%\^&\*\(\)\-\_=\+\[\]\{\};:'\",<\.>\/\?\\\|`~]", c):
        return False
    return True

def crearToken(data: dict):
    toEncode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expMin)
    toEncode.update({"exp": expire})
    return jwt.encode(toEncode, secret, algorithm=algoritmo)

def decodToken(token: str):
    try:
        return jwt.decode(token, secret, algorithms=[algoritmo])
    except JWTError:
        raise
