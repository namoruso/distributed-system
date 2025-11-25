from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Usuario(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    claveHash: str
    verif: bool = False
    codigo: Optional[str] = None
    codigoExp: Optional[str] = None
    creado: str = datetime.utcnow().isoformat()