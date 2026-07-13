from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from src.database.connection import Base 

class CustomerPrediction(Base):
    __tablename__ = "customer_predictions"

    # 1. Control e Identificador Único en Base de Datos
    id = Column(Integer, primary_key=True, index=True)
    
    # 2. FEATURE_COLUMNS: Los campos existentes en el Notebook 
    # Demográficos
    gender = Column(String, nullable=False)
    senior_citizen = Column(Integer, nullable=False) # Viene como 0 o 1
    partner = Column(String, nullable=False)
    dependents = Column(String, nullable=False)
    
    # Servicios Contratados
    phone_service = Column(String, nullable=False)
    multiple_lines = Column(String, nullable=False)
    internet_service = Column(String, nullable=False)
    online_security = Column(String, nullable=False)
    online_backup = Column(String, nullable=False)
    device_protection = Column(String, nullable=False)
    tech_support = Column(String, nullable=False)
    streaming_tv = Column(String, nullable=False)
    streaming_movies = Column(String, nullable=False)
    
    # Detalles de la Cuenta y Facturación
    contract = Column(String, nullable=False)
    paperless_billing = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    monthly_charges = Column(Float, nullable=False)
    total_charges = Column(Float, nullable=False) 

    # 3. TARGET: El valor real si se conoce (para reentrenamiento futuro)
    churn_value = Column(Integer, nullable=True) # 0 o 1

    # 4. OUTPUTS DE IA: Métricas financieras y predicciones para el Front-End (Vue)
    churn_probability = Column(Float, nullable=False)       # Probabilidad en %
    prediction_label = Column(String, nullable=False)        # "Riesgo Alto" / "Riesgo Bajo"
    model_confidence = Column(Float, nullable=False)        # Confianza del modelo
    estimated_lifetime_months = Column(Integer)             # Permanencia estimada
    revenue_at_risk = Column(Float)                         # Ingreso en riesgo
    clv_exposed = Column(Float)                             # CLV Expuesto

    # Timestamp de auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now())