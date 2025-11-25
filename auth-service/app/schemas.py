from pydantic import BaseModel, EmailStr, Field

class RegReq(BaseModel):
    nombre: str = Field(..., min_length=1)
    correo: EmailStr
    clave: str = Field(..., min_length=8)
    clave2: str = Field(..., min_length=8)

class VerReq(BaseModel):
    correo: EmailStr
    codigo: str

class LoginReq(BaseModel):
    correo: EmailStr
    clave: str

class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UsuarioResp(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    verif: bool