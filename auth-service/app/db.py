from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import NoResultFound, IntegrityError
from datetime import datetime
from .models import Base, UsuarioDB, Usuario
from .config import dbUrl

connectArgs = {}
if dbUrl.startswith("sqlite"):
    connectArgs = {"check_same_thread": False}

engine = create_engine(dbUrl, connect_args=connectArgs, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def initDb():
    Base.metadata.create_all(bind=engine)

def _filaAUsuario(fila: UsuarioDB):
    return Usuario(
        id = fila.id,
        nombre = fila.nombre,
        correo = fila.correo,
        claveHash = fila.claveHash,
        verif = bool(fila.verif),
        codigo = fila.codigo,
        codigoExp = fila.codigoExp.isoformat() if fila.codigoExp else None,
        creado = fila.creado.isoformat() if fila.creado else datetime.utcnow().isoformat()
    )

def listar():
    db = SessionLocal()
    try:
        filas = db.query(UsuarioDB).all()
        return [_filaAUsuario(f) for f in filas]
    finally:
        db.close()

def buscarCorreo(correo):
    db = SessionLocal()
    try:
        fila = db.query(UsuarioDB).filter(UsuarioDB.correo == correo.lower()).first()
        if not fila:
            return None
        return _filaAUsuario(fila)
    finally:
        db.close()

def buscarId(uid):
    db = SessionLocal()
    try:
        fila = db.query(UsuarioDB).filter(UsuarioDB.id == uid).first()
        if not fila:
            return None
        return _filaAUsuario(fila)
    finally:
        db.close()

def buscarNombre(nombre):
    db = SessionLocal()
    try:
        fila = db.query(UsuarioDB).filter(UsuarioDB.nombre.ilike(nombre)).first()
        if not fila:
            return None
        return _filaAUsuario(fila)
    finally:
        db.close()

def crear(obj: dict):
    """obj es un dict con las keys: nombre, correo, claveHash, verif, codigo, codigoExp, creado"""
    db = SessionLocal()
    try:
        fila = UsuarioDB(
            nombre = obj.get("nombre"),
            correo = obj.get("correo").lower(),
            claveHash = obj.get("claveHash"),
            verif = bool(obj.get("verif", False)),
            codigo = obj.get("codigo"),
            codigoExp = None if not obj.get("codigoExp") else datetime.fromisoformat(obj.get("codigoExp")),
            creado = None if not obj.get("creado") else datetime.fromisoformat(obj.get("creado"))
        )
        db.add(fila)
        db.commit()
        db.refresh(fila)
        return _filaAUsuario(fila)
    except IntegrityError as e:
        db.rollback()
        raise
    finally:
        db.close()

def actualizar(uid, cambios: dict):
    db = SessionLocal()
    try:
        fila = db.query(UsuarioDB).filter(UsuarioDB.id == uid).first()
        if not fila:
            return None
        if "nombre" in cambios:
            fila.nombre = cambios.get("nombre")
        if "correo" in cambios:
            fila.correo = cambios.get("correo").lower()
        if "claveHash" in cambios:
            fila.claveHash = cambios.get("claveHash")
        if "verif" in cambios:
            fila.verif = bool(cambios.get("verif"))
        if "codigo" in cambios:
            fila.codigo = cambios.get("codigo")
        if "codigoExp" in cambios:
            fila.codigoExp = None if not cambios.get("codigoExp") else datetime.fromisoformat(cambios.get("codigoExp"))
        db.add(fila)
        db.commit()
        db.refresh(fila)
        return _filaAUsuario(fila)
    finally:
        db.close()
