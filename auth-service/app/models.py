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

    class Config:
        orm_mode = True

from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func

Base = declarative_base()

class UsuarioDB(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False, unique=False)
    correo = Column(String(255), nullable=False, unique=True, index=True)
    claveHash = Column(String(512), nullable=False)
    verif = Column(Boolean, default=False, nullable=False)
    codigo = Column(String(32), nullable=True)
    codigoExp = Column(DateTime, nullable=True)
    creado = Column(DateTime, server_default=func.datetime('now'), nullable=False)
