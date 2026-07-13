from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# =====================================================================
# 1. ESQUEMA BASE: Estructura exacta sincronizada con tu modelo SQL
# =====================================================================
class PredictionBase(BaseModel):
    gender: str = Field(..., examples=["Female"])
    senior_citizen: int = Field(..., ge=0, le=1, examples=[0])
    partner: str = Field(..., examples=["Yes"])
    dependents: str = Field(..., examples=["No"])
    
    phone_service: str = Field(..., examples=["Yes"])
    multiple_lines: str = Field(..., examples=["No"])
    internet_service: str = Field(..., examples=["Fiber optic"])
    online_security: str = Field(..., examples=["No"])
    online_backup: str = Field(..., examples=["Yes"])
    device_protection: str = Field(..., examples=["No"])
    tech_support: str = Field(..., examples=["No"])
    streaming_tv: str = Field(..., examples=["Yes"])
    streaming_movies: str = Field(..., examples=["No"])
    
    contract: str = Field(..., examples=["Month-to-month"])
    paperless_billing: str = Field(..., examples=["Yes"])
    payment_method: str = Field(..., examples=["Electronic check"])
    tenure_months: int = Field(..., ge=0, examples=[1])
    monthly_charges: float = Field(..., ge=0.0, examples=[70.65])
    total_charges: float = Field(..., ge=0.0, examples=[70.65])
    
    churn_value: Optional[int] = Field(None, ge=0, le=1, examples=[1])

# =====================================================================
# 2. ESQUEMA DE ENTRADA (Request)
# =====================================================================
class PredictionCreate(PredictionBase):
    pass 

# =====================================================================
# 3. ESQUEMA DE SALIDA (Response)
# =====================================================================
class PredictionResponse(PredictionBase):
    id: int
    
    # Métricas calculadas: pipeline en ml/predict.py
    churn_probability: float
    prediction_label: str
    model_confidence: float
    
    # Se asigna None por defecto por consistencia con campos Nullable de la DB
    estimated_lifetime_months: Optional[int] = None
    revenue_at_risk: Optional[float] = None
    clv_exposed: Optional[float] = None
    
    created_at: datetime

    # SINTAXIS PARA PYDANTIC V2
    model_config = ConfigDict(from_attributes=True)