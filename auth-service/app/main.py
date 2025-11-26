from fastapi import FastAPI
from .routes import router
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # quienes pueden acceder
    allow_credentials=True,
    allow_methods=["*"],        # permite GET, POST, etc
    allow_headers=["*"],        # permite headers como Authorization
)

app.include_router(router, prefix="/api")