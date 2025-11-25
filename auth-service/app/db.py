import json
from pathlib import Path
from threading import Lock
from .models import Usuario

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "usuarios.json"
lock = Lock()

def leer():
    with lock:
        if not DATA_PATH.exists():
            DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
            DATA_PATH.write_text("[]")
        return json.loads(DATA_PATH.read_text())

def guardar(lista):
    with lock:
        DATA_PATH.write_text(json.dumps(lista, default=str, indent=2))

def listar():
    raw = leer()
    return [Usuario(**r) for r in raw]

def buscarCorreo(correo):
    raw = leer()
    for r in raw:
        if r.get("correo","").lower() == correo.lower():
            return Usuario(**r)
    return None

def buscarId(uid):
    raw = leer()
    for r in raw:
        if r.get("id") == uid:
            return Usuario(**r)
    return None

def nextId():
    raw = leer()
    if not raw:
        return 1
    return max(r.get("id",0) for r in raw) + 1

def crear(obj):
    raw = leer()
    raw.append(obj)
    guardar(raw)
    return Usuario(**obj)

def actualizar(uid, cambios: dict):
    raw = leer()
    for i, r in enumerate(raw):
        if r.get("id") == uid:
            r.update(cambios)
            raw[i] = r
            guardar(raw)
            return Usuario(**r)
    return None

def buscarNombre(nombre):
    raw = leer()
    for r in raw:
        if r.get("nombre","").lower() == nombre.lower():
            return Usuario(**r)
    return None