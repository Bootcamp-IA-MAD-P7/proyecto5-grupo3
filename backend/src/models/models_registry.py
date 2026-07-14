from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ModelRegistry(Base):
    __tablename__ = "model_registry"
    

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String, nullable=False)          # p.ej., "GradientBoostingClassifier"
    algorithm = Column(String, nullable=False)           # p.ej., "gradient_boosting", "xgboost" o "random_forest"
    file_path = Column(String, nullable=False)           # Ruta al .pkl ("ml/model_gradient_boosting.pkl")
    metric_name = Column(String, default="roc_auc")      # Métrica clave de comparación
    metric_value = Column(Float, nullable=False)         # Valor obtenido (p.ej., 0.862)
    selected_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=False)           # True si es el modelo elegido actualmente