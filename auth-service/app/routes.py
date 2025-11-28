from fastapi import APIRouter, HTTPException, Depends, Header, Body
from typing import List
from .schemas import RegReq, VerReq, LoginReq, TokenResp, UsuarioResp, CambiarRolReq
from . import db, utils, mailer
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/registro", response_model=UsuarioResp)
def registro(req: RegReq):
    if db.buscarNombre(req.nombre):
        raise HTTPException(status_code=400, detail="nombre ya existe")
    if db.buscarCorreo(req.correo):
        raise HTTPException(status_code=400, detail="correo ya existe")
    if req.clave != req.clave2:
        raise HTTPException(status_code=400, detail="claves no coinciden")
    if not utils.validaClave(req.clave):
        raise HTTPException(status_code=400, detail="clave no cumple")
    codigo = utils.genCodigo(6)
    exp = (datetime.utcnow() + timedelta(minutes=30)).isoformat()
    obj = {
        "nombre": req.nombre,
        "correo": req.correo,
        "claveHash": utils.hashClave(req.clave),
        "rol": "user", 
        "verif": False,
        "codigo": codigo,
        "codigoExp": exp,
        "creado": datetime.utcnow().isoformat()
    }
    try:
        u = db.crear(obj)
    except Exception as e:
        raise HTTPException(status_code=500, detail="error al crear usuario")
    try:
        mailer.enviar(req.correo, "Código verificación", f"Tu código es: {codigo}")
    except Exception:
        pass
    return UsuarioResp(id=u.id, nombre=u.nombre, correo=u.correo, rol=u.rol, verif=u.verif)

@router.post("/verificar")
def verificar(req: VerReq):
    u = db.buscarCorreo(req.correo)
    if not u:
        raise HTTPException(status_code=404, detail="usuario no existe")
    if getattr(u, "verif", False):
        return {"ok": True, "msg": "ya verificado"}
    if not getattr(u, "codigo", None) or not getattr(u, "codigoExp", None):
        raise HTTPException(status_code=400, detail="sin codigo")
    enviado = (req.codigo or "").strip().upper()
    esperado = (getattr(u, "codigo", "") or "").strip().upper()
    try:
        exp = datetime.fromisoformat(getattr(u, "codigoExp"))
    except Exception:
        raise HTTPException(status_code=400, detail="codigo invalido")
    if datetime.utcnow() > exp:
        raise HTTPException(status_code=400, detail="codigo expirado")
    if enviado != esperado:
        raise HTTPException(status_code=400, detail="codigo invalido")
    db.actualizar(u.id, {"verif": True, "codigo": None, "codigoExp": None})
    return {"ok": True}

@router.post("/reenviar")
def reenviar(data: dict = Body(...)):
    correo = data.get("correo")
    if not correo:
        raise HTTPException(status_code=400, detail="correo requerido")
    u = db.buscarCorreo(correo)
    if not u:
        raise HTTPException(status_code=404, detail="usuario no existe")
    if getattr(u, "verif", False):
        return {"ok": True, "msg": "ya verificado"}
    codigo = utils.genCodigo(6)
    exp = (datetime.utcnow() + timedelta(minutes=30)).isoformat()
    db.actualizar(u.id, {"codigo": codigo, "codigoExp": exp})
    try:
        mailer.enviar(correo, "Código verificación", f"Tu código es: {codigo}")
    except Exception:
        pass
    return {"ok": True, "codigo": codigo}

@router.post("/login", response_model=TokenResp)
def login(req: LoginReq):
    u = db.buscarCorreo(req.correo)
    if not u:
        raise HTTPException(status_code=401, detail="credenciales invalidas")
    if not getattr(u, "verif", False):
        raise HTTPException(status_code=401, detail="usuario no verificado")
    if not utils.verificaClave(req.clave, getattr(u, "claveHash", "")):
        raise HTTPException(status_code=401, detail="credenciales invalidas")
    
    token = utils.crearToken({
        "sub": str(u.id),
        "correo": u.correo,
        "rol": u.rol  
    })
    return TokenResp(access_token=token)

def obtenerPorToken(authorization: str = Header(...)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="token invalido")
    token = authorization.split(" ")[1]
    try:
        payload = utils.decodToken(token)
    except Exception:
        raise HTTPException(status_code=401, detail="token invalido")
    try:
        uid = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="token invalido")
    u = db.buscarId(uid)
    if not u:
        raise HTTPException(status_code=401, detail="usuario no existe")
    return u

@router.get("/me", response_model=UsuarioResp)
def me(usuario = Depends(obtenerPorToken)):
    return UsuarioResp(id=usuario.id, nombre=usuario.nombre, correo=usuario.correo, rol=usuario.rol, verif=usuario.verif)

@router.put("/cambiar-rol")
def cambiarRol(req: CambiarRolReq, usuario = Depends(obtenerPorToken)):
    if usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="no tienes permisos")
    
    u = db.buscarCorreo(req.correo)
    if not u:
        raise HTTPException(status_code=404, detail="usuario no existe")
    
    db.actualizar(u.id, {"rol": req.rol})
    
    return {
        "ok": True,
        "mensaje": f"Rol de {req.correo} cambiado a {req.rol}"
    }

@router.get("/debug/lista", response_model=List[UsuarioResp])
def lista():
    return [UsuarioResp(id=u.id, nombre=u.nombre, correo=u.correo, rol=u.rol, verif=u.verif) for u in db.listar()]