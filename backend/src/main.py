# Instancia FastAPI, incluye los routers y levanta el servidor

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.controllers import prediction
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from src.database.connection import get_db, engine, Base, SessionLocal
from src.models.prediction import CustomerPrediction
from src.models.models_registry import ModelRegistry # Asegúrate de que el archivo del modelo del selector coincida
from src.schemas.prediction import PredictionCreate, PredictionResponse

# Conexión directa con el pipeline de inferencia
from ml.predict import predict_customer_churn

#   Importar la función del selector de modelo real
from ml.selector import select_best_model


# Creación automática de la tabla independiente al arrancar
Base.metadata.create_all(bind=engine)

# =====================================================================
# Evento de arranque automático que ejecuta el selector
# =====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja el arranque (startup) y apagado (shutdown) de la aplicación.
    Sustituye de forma moderna al antiguo @app.on_event("startup").
    """
    # ------------------ CÓDIGO DE ARRANQUE (Startup) ------------------
    print("\n [FastAPI Arranque] Inicializando base de datos y modelos...")
    db = SessionLocal()
    try:
        print(" [FastAPI Arranque] Ejecutando  selector personalizado ml.selector...")
        # Llama directamente a tu función importada del selector
        select_best_model(db, primary_metric="roc_auc")
        print("✅ [FastAPI Arranque] ¡La selección del modelo activo finalizó con éxito!")
    except Exception as e:
        print(f"❌ [FastAPI Arranque] Error al seleccionar el modelo activo: {e}")
    finally:
        db.close()

    yield  # Aquí es donde FastAPI se queda encendido escuchando peticiones del frontend

    # ------------------ CÓDIGO DE APAGADO (Shutdown) ------------------
    print("[FastAPI Apagado] Limpiando recursos y cerrando el servidor.")


# Instancia de FastAPI con el evento de arranque personalizado
app = FastAPI(title="Backend Proyecto 5 Grupo 3", lifespan=lifespan)
#app = FastAPI(title="Backend Proyecto 5 Grupo 3")

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

# =====================================================================
# Endpoint administrativo 
# =====================================================================
@app.post("/admin/select-model", status_code=200, tags=["Admin"])
def trigger_model_selection(db: Session = Depends(get_db)):
    """
    Forces the backend to re-run your selector.py logic to re-scan 
    metrics and update the active model in the database without restarting.
    """
    # Llama físicamente a la función del script selector
    selection_result = select_best_model(db, primary_metric="roc_auc")
    
    if not selection_result:
        raise HTTPException(
            status_code=404, 
            detail="No valid metric files (metrics_*.json) were found in the 'ml/' directory."
        )
        
    return {
        "status": "success",
        "message": "The active model has been successfully updated using your selector.",
        "active_model": selection_result["model_name"],
        "metric_value": selection_result["metric_value"]
    }


# =====================================================================
#   Endpoint de Inferencia y Persistencia 
# =====================================================================
@app.post("/predict", response_model=PredictionResponse, status_code=201)
def create_prediction(payload: PredictionCreate, db: Session = Depends(get_db)):
    """
    Endpoint de inferencia. Recibe los datos validados de React, ejecuta la IA,
    guarda en PostgreSQL y retorna los resultados financieros al Front-End.
    """
    try:
        # Pydantic v2 extrae los datos limpios en un diccionario estándar
        customer_data = payload.model_dump()
        
        # Invoca la función predictora de la carpeta externa ml/
        # (Ahora cargará de manera dinámica el .pkl que el selector marcó como activo en DB)
        prediction_result = predict_customer_churn(customer_data)
        
        # Mapea de forma explícita cada columna del modelo SQLAlchemy
        new_prediction = CustomerPrediction(
            gender=customer_data["gender"],
            senior_citizen=customer_data["senior_citizen"],
            partner=customer_data["partner"],
            dependents=customer_data["dependents"],
            phone_service=customer_data["phone_service"],
            multiple_lines=customer_data["multiple_lines"],
            internet_service=customer_data["internet_service"],
            online_security=customer_data["online_security"],
            online_backup=customer_data["online_backup"],
            device_protection=customer_data["device_protection"],
            tech_support=customer_data["tech_support"],
            streaming_tv=customer_data["streaming_tv"],
            streaming_movies=customer_data["streaming_movies"],
            contract=customer_data["contract"],
            paperless_billing=customer_data["paperless_billing"],
            payment_method=customer_data["payment_method"],
            tenure_months=customer_data["tenure_months"],
            monthly_charges=customer_data["monthly_charges"],
            total_charges=customer_data["total_charges"],
            churn_value=customer_data.get("churn_value"), # .get() evita fallos si no se envía
            
            # Datos calculados e inyectados por la IA
            churn_probability=prediction_result["churn_probability"],
            prediction_label=prediction_result["prediction_label"],
            model_confidence=prediction_result["model_confidence"],
            estimated_lifetime_months=prediction_result.get("estimated_lifetime_months"),
            revenue_at_risk=prediction_result.get("revenue_at_risk"),
            clv_exposed=prediction_result.get("clv_exposed")
        )
        
        # Escritura atómica en LA base de datos
        db.add(new_prediction)
        db.commit()
        db.refresh(new_prediction) # Captura el id y la fecha autogenerada
        
        return new_prediction

    except KeyError as ke:
        raise HTTPException(
            status_code=400, 
            detail=f"Inference pipeline key error. Missing field: {str(ke)}" 
        )
    except Exception as e:
        db.rollback() # Revierte la sesión de base de datos ante caídas o errores de escritura
        raise HTTPException(
            status_code=500, 
            detail=f"Critical failure in the inference server pipeline: {str(e)}" 
        )

