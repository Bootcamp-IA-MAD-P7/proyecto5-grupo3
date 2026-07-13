from pydantic import BaseModel

# Modelo de datos (Pydantic) para validar lo que React enviará ---- ADMIN de prueba
class Admin(BaseModel):
    gender: str
    senior_citizen: str
    partner: str
    
