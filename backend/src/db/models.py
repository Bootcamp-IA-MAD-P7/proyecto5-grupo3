from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

# Features usadas por el modelo de clasificación (ver backend/notebooks/02_exploratory.py
# para la justificación de qué columnas se excluyen por fuga de información o
# falta de señal causal: churn_score, churn_reason, churn_label, customer_id,
# city, zip_code, latitude, longitude, cltv).
FEATURE_COLUMNS = [
    "gender",
    "senior_citizen",
    "partner",
    "dependents",
    "tenure_months",
    "phone_service",
    "multiple_lines",
    "internet_service",
    "online_security",
    "online_backup",
    "device_protection",
    "tech_support",
    "streaming_tv",
    "streaming_movies",
    "contract",
    "paperless_billing",
    "payment_method",
    "monthly_charges",
    "total_charges",
]


class Customer(Base):
    """Dataset Telco Customer Churn (IBM) usado para entrenar el modelo."""

    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True)
    city = Column(String)
    zip_code = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    gender = Column(String, nullable=False)
    senior_citizen = Column(String, nullable=False)
    partner = Column(String, nullable=False)
    dependents = Column(String, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    phone_service = Column(String, nullable=False)
    multiple_lines = Column(String, nullable=False)
    internet_service = Column(String, nullable=False)
    online_security = Column(String, nullable=False)
    online_backup = Column(String, nullable=False)
    device_protection = Column(String, nullable=False)
    tech_support = Column(String, nullable=False)
    streaming_tv = Column(String, nullable=False)
    streaming_movies = Column(String, nullable=False)
    contract = Column(String, nullable=False)
    paperless_billing = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    monthly_charges = Column(Float, nullable=False)
    total_charges = Column(Float, nullable=False)
    churn_label = Column(String, nullable=False)
    churn_value = Column(Integer, nullable=False)
    churn_score = Column(Integer)
    cltv = Column(Integer)
    churn_reason = Column(String, nullable=True)


class AppPrediction(Base):
    """Registro de cada predicción servida por la app: mismas features que
    `Customer` (sin identificadores ni columnas de fuga) más el resultado del
    modelo. Es la fuente de datos para monitorizar el modelo en producción y
    para futuros reentrenamientos."""

    __tablename__ = "app_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    gender = Column(String, nullable=False)
    senior_citizen = Column(String, nullable=False)
    partner = Column(String, nullable=False)
    dependents = Column(String, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    phone_service = Column(String, nullable=False)
    multiple_lines = Column(String, nullable=False)
    internet_service = Column(String, nullable=False)
    online_security = Column(String, nullable=False)
    online_backup = Column(String, nullable=False)
    device_protection = Column(String, nullable=False)
    tech_support = Column(String, nullable=False)
    streaming_tv = Column(String, nullable=False)
    streaming_movies = Column(String, nullable=False)
    contract = Column(String, nullable=False)
    paperless_billing = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    monthly_charges = Column(Float, nullable=False)
    total_charges = Column(Float, nullable=False)
    predicted_churn = Column(Integer, nullable=False)
    predicted_probability = Column(Float, nullable=False)
    model_version = Column(String, nullable=True)
    # Outcome real, si se llega a conocer más adelante (feedback de producción
    # para reentrenamiento). Null mientras no se sepa.
    actual_churn = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
