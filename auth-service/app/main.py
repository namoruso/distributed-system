from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from . import db as dbmod

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
def startup():
    dbmod.initDb()
