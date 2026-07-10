# Instancia FastAPI, incluye los routers y levanta el servidor


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controllers import admin

app = FastAPI(title="Backend Proyecto 5 Grupo 3")

# Configuración de CORS
origins = [
    "http://localhost:5173",  # Puerto Vite + React
    "http://localhost:3000",  # Puerto Create React App
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Permite las URLs de la lista
    allow_credentials=True,
    allow_methods=["*"],            # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],            # Permite todas las cabeceras
)

app.include_router(admin.router)

""" @app.get("/")
def read_root():
    return {"status": "ACEPTADO", "message": "Bienvenido al backend "} """
