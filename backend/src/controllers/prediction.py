from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

# Importamos las dependencias de base de datos que configuramos antes
from src.database.connection import get_db
from src.models.prediction import CustomerPrediction

# Importamos esquemas de validación de Pydantic
from src.schemas.prediction import PredictionCreate, PredictionResponse

# 🟢 MODIFICADO: Importación corregida al archivo y función en inglés
from ml.predict import predict_customer_churn

# 1. Crear la instancia del router adaptada a tu proyecto
router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)

# =====================================================================
# Endpoint para obtener el historial
# =====================================================================
@router.get("/", response_model=List[PredictionResponse])
def get_predictions(db: Session = Depends(get_db)):
    """
    Retorna el historial completo de predicciones almacenadas en PostgreSQL
    para mostrarlo en las tablas o dashboards en el Front-End en React.
    """
    predictions = db.query(CustomerPrediction).all()
    return predictions


# =====================================================================
#  Endpoint de Inferencia y Persistencia (Vue usará POST)
# =====================================================================
@router.post("/predict", response_model=PredictionResponse, status_code=201)
def create_prediction(payload: PredictionCreate, db: Session = Depends(get_db)):
    """
    Recibe los datos validados del cliente desde React, ejecuta los entrenamientos  
    persiste los resultados financieros en PostgreSQL y retorna el registro.
    """
    try:
        # 🟢 MODIFICADO: Variables locales cambiadas a inglés
        customer_data = payload.model_dump()
        
        # Invoca modelo de Inteligencia Artificial
        prediction_result = predict_customer_churn(customer_data)
        
        # Mapea explícitamente los campos hacia tu modelo SQLAlchemy
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
            churn_value=customer_data.get("churn_value"),
            
            # Outputs calculados e inyectados por tu IA
            churn_probability=prediction_result["churn_probability"],
            prediction_label=prediction_result["prediction_label"],
            model_confidence=prediction_result["model_confidence"],
            estimated_lifetime_months=prediction_result.get("estimated_lifetime_months"),
            revenue_at_risk=prediction_result.get("revenue_at_risk"),
            clv_exposed=prediction_result.get("clv_exposed")
        )
        
        # Escritura atómica en PostgreSQL
        db.add(new_prediction)
        db.commit()
        db.refresh(new_prediction) # Captura el id y el created_at autogenerados
        
        return new_prediction

    except KeyError as ke:
        raise HTTPException(
            status_code=400, 
            detail=f"Error en la estructura interna de la IA. Falta el campo clave: {str(ke)}"
        )
    except Exception as e:
        db.rollback() # Revierte la transacción ante cualquier caída de escritura
        raise HTTPException(
            status_code=500, 
            detail=f"Fallo crítico en el pipeline del servidor de inferencia: {str(e)}"
        )