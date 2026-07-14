# ml/predict.py
import os
import random
import joblib
import numpy as np
import pandas as pd  # Importamos pandas para alimentar el pipeline en su formato original

# Importamos la conexión de base de datos y modelo de registro
from src.database.connection import SessionLocal
from src.models.models_registry import ModelRegistry

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Variable global para mantener el modelo y su ruta en memoria RAM
_cached_model = None
_cached_model_path = None

# El orden EXACTO de las columnas con las que entrenaste tus modelos
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


def get_active_model():
    """
    Consulta la base de datos para ver cuál es el modelo marcado como activo (is_active=True).
    Si cambia en la base de datos, lo recarga automáticamente.
    """
    global _cached_model, _cached_model_path
    
    db = SessionLocal()
    try:
        # 1. Preguntar a la base de datos por el modelo activo
        active_record = db.query(ModelRegistry).filter(ModelRegistry.is_active == True).first()
        
        if not active_record:
            print("⚠️ Alerta: No hay ningún modelo activo registrado en la base de datos.")
            return None
            
        # Se construye la ruta absoluta del archivo .pkl ganador
        absolute_pkl_path = os.path.normpath(os.path.join(BASE_DIR, "..", active_record.file_path))
        
        # 2. Si el modelo no está en caché, o si el modelo activo ha cambiado, lo cargamos
        if _cached_model is None or _cached_model_path != absolute_pkl_path:
            if os.path.exists(absolute_pkl_path):
                print(f"🔄 Cargando el nuevo modelo activo en memoria: {active_record.model_name} ({absolute_pkl_path})")
                _cached_model = joblib.load(absolute_pkl_path)
                _cached_model_path = absolute_pkl_path
            else:
                print(f"⚠️ Alerta: El archivo físico no existe en {absolute_pkl_path}. Usando Mock.")
                _cached_model = None
                
        return _cached_model
        
    except Exception as e:
        print(f"❌ Error al consultar el modelo activo en la base de datos: {e}")
        return _cached_model  # Devolvemos el que tengamos en caché como plan de rescate
    finally:
        db.close()


def predict_customer_churn(customer_data: dict) -> dict:
    """
    Toma el diccionario crudo enviado por el frontend/FastAPI, lo preprocesa,
    ejecuta la inferencia con el modelo ACTIVO en base de datos y calcula los KPIs de negocio.
    """
    
    # === Preprocesamiento (Alineación con el Notebook) ===
    tenure = float(customer_data.get("tenure_months", 0))
    monthly_charges = float(customer_data.get("monthly_charges", 0.0))
    total_charges = float(customer_data.get("total_charges", 0.0))
    
    # === Inferencia del Modelo Activo ===
    trained_model = get_active_model()
    
    if trained_model is not None:
        try:
            # Reconstruimos la fila de datos en el formato y orden que espera el pipeline (DataFrame de una sola fila)
            # Esto evita errores de dimensiones por las variables categóricas.
            input_row = {col: customer_data.get(col) for col in FEATURE_COLUMNS}
            
            # El transformador de columnas de Scikit-Learn espera nombres de columna coincidentes
            features_df = pd.DataFrame([input_row])
            
            # Realizamos la inferencia
            probabilities = trained_model.predict_proba(features_df)
            churn_probability = float(probabilities[0][1])  # Probabilidad de fuga (clase 1)
            
            prediction_label = "High Risk" if churn_probability >= 0.5 else "Low Risk"
            model_confidence = churn_probability if churn_probability >= 0.5 else (1.0 - churn_probability)
            
        except Exception as e:
            print(f"⚠️ Error al calcular predicción con el modelo cargado ({e}). Usando lógica de respaldo (Mock).")
            # Caída segura (Fallback) ante cualquier discrepancia estructural
            churn_probability = random.uniform(0.1, 0.9)
            prediction_label = "High Risk" if churn_probability >= 0.5 else "Low Risk"
            model_confidence = random.uniform(0.7, 0.99)
    else:
        # LÓGICA MOCK / SIMULACIÓN (Si la base de datos está vacía o el .pkl no existe en disco)
        churn_probability = random.uniform(0.1, 0.9)
        prediction_label = "High Risk" if churn_probability >= 0.5 else "Low Risk"
        model_confidence = random.uniform(0.7, 0.99)

    # === Inteligencia de Negocio y KPIs Financieros ===
    if prediction_label == "Low Risk":
        estimated_lifetime_months = int(max(1, round(tenure * 1.2)))
    else:
        estimated_lifetime_months = int(max(1, round(tenure * 0.5)))
    
    revenue_at_risk = float(monthly_charges * tenure) if prediction_label == "High Risk" else 0.0
    clv_exposed = float(monthly_charges * 24 * churn_probability)

    return {
        "churn_probability": round(churn_probability * 100, 2),  # Convertido a porcentaje (ej. 75.4)
        "prediction_label": prediction_label,
        "model_confidence": round(model_confidence * 100, 2),
        "estimated_lifetime_months": estimated_lifetime_months,
        "revenue_at_risk": round(revenue_at_risk, 2),
        "clv_exposed": round(clv_exposed, 2)
    }