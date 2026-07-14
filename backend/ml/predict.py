import os
import random
import joblib
import numpy as np

# 1. Rutas para que FastAPI encuentre el modelo sin importar el contexto de ejecución
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model_xgboost.pkl")

# 2. Cargar el modelo entrenado en memoria una sola vez al importar el módulo
try:
    # Nota: También puedes cargar tu Scaler o Encoder aquí si es necesario
    trained_model = joblib.load(MODEL_PATH)
except Exception as e:
    # Modelo de respaldo (Mock) para propósitos de prueba si no existe el archivo .pkl aún
    trained_model = None
    print(f"⚠️ Alerta: No se pudo cargar el modelo en {MODEL_PATH}. Usando lógica de prueba. Error: {e}")


def predict_customer_churn(customer_data: dict) -> dict:
    """
    Toma el diccionario crudo enviado por el frontend/FastAPI, lo preprocesa,
    ejecuta la inferencia con el modelo y calcula los KPIs de negocio.
    """
    
    # === PASO A: Preprocesamiento (Alineación con tu Notebook) ===
    # Replicar el mapeo utilizado durante el entrenamiento (ej. 'Yes'=1, 'No'=0, etc.)
    # Por ahora, extraemos las variables numéricas principales requeridas para los cálculos
    tenure = float(customer_data.get("tenure_months", 0))
    monthly_charges = float(customer_data.get("monthly_charges", 0.0))
    total_charges = float(customer_data.get("total_charges", 0.0))
    
    # === PASO B: Inferencia del Modelo ===
    if trained_model is not None:
        # 1. Convertir el diccionario a la estructura de matriz que pide Scikit-Learn / XGBoost
        # El orden dentro de este array debe coincidir EXACTAMENTE con el orden de X_train.columns
        features = np.array([[
            # Ejemplo de orden (reemplaza con el orden exacto de tus características de entrenamiento):
            tenure, monthly_charges, total_charges
        ]])
        
        # 2. Predecir probabilidad (retorna un array, ej: [[prob_no_fuga, prob_fuga]])
        probabilities = trained_model.predict_proba(features)
        churn_probability = float(probabilities[0][1])  # Nos quedamos con la probabilidad de fuga (clase 1)
        
        # 3. Determinar la etiqueta de predicción usando el umbral estándar de 0.5
        prediction_label = "High Risk" if churn_probability >= 0.5 else "Low Risk"
        
        # 4. Confianza del modelo (el porcentaje de certeza de la clase seleccionada)
        model_confidence = churn_probability if churn_probability >= 0.5 else (1.0 - churn_probability)
    
    else:
        # LÓGICA MOCK / SIMULACIÓN (Para probar la DB y FastAPI antes de exportar el .pkl real)
        churn_probability = random.uniform(0.1, 0.9)
        prediction_label = "High Risk" if churn_probability >= 0.5 else "Low Risk"
        model_confidence = random.uniform(0.7, 0.99)

    # === PASO C: Inteligencia de Negocio y KPIs Financieros ===
    # Calcular el impacto económico basado en los cargos mensuales y la antigüedad
    if prediction_label == "Low Risk":
        estimated_lifetime_months = int(max(1, round(tenure * 1.2)))
    else:
        estimated_lifetime_months = int(max(1, round(tenure * 0.5)))
    
    # Ingreso directo en riesgo si el cliente se va inmediatamente
    revenue_at_risk = float(monthly_charges * tenure) if prediction_label == "High Risk" else 0.0
    
    # Valor de Vida del Cliente Expuesto (Proyección a 2 años ponderada por la probabilidad de fuga)
    clv_exposed = float(monthly_charges * 24 * churn_probability)

    # 3. Retornar el diccionario con las llaves exactas que espera la aplicación
    return {
        "churn_probability": round(churn_probability * 100, 2),  # Convertido a porcentaje (ej. 75.4)
        "prediction_label": prediction_label,
        "model_confidence": round(model_confidence * 100, 2),
        "estimated_lifetime_months": estimated_lifetime_months,
        "revenue_at_risk": round(revenue_at_risk, 2),
        "clv_exposed": round(clv_exposed, 2)
    }