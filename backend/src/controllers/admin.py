from fastapi import APIRouter, HTTPException
from typing import List
from src.models.admin import Admin

# 1. Crear la instancia del router
router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# Base de datos simulada en memoria para prueba
db_admin = [
    {"id": 1, "nombre": "Ana", "email": "ana@example.com"},
    {"id": 2, "nombre": "jose", "email": "naim@example.com"}
]

# Endpoint para obtener todos los datos del administrador (React usará GET)
@router.get("/", response_model=List[Admin])
def obtener_admin():
    return db_admin

# Endpoint para crear un Admin 
@router.post("/", response_model=Admin, status_code=201)
def crear_Admin(Admin: Admin):

    # Verificar si el ID ya existe
    if any(u["id"] == Admin.id for u in db_admin):
        raise HTTPException(status_code=400, detail="El ID ya existe")
    
    nuevo_Admin = Admin.model_dump() # Convierte el modelo a diccionario
    db_admin.append(nuevo_Admin)
    return nuevo_Admin