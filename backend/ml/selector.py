"""Selector automático de modelos para el backend de Telco Customer Churn.

Escanea los archivos de métricas JSON en `ml/`, selecciona el modelo con mejor 
rendimiento basado en una métrica principal y lo registra como activo en la base de datos.
"""

from __future__ import annotations

import glob
import json
import os
import sys

from sqlalchemy.orm import Session

# Permitir que el script encuentre el módulo 'src' al ejecutarse desde la raíz del backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Importamos la conexión y el modelo de la base de datos

from src.database.connection import SessionLocal  # generador de sesiones de SQLAlchemy
from src.models.models_registry import ModelRegistry

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def select_best_model(db: Session, primary_metric: str = "f1_score") -> dict | None:
    """Busca todas las métricas JSON en ml/, compara y registra el ganador en la DB."""
    # 1. Escanear todos los archivos metrics_*.json en la carpeta ml/
    metric_files = glob.glob(os.path.join(BASE_DIR, "metrics_*.json"))

    if not metric_files:
        print("⚠️ No se encontraron archivos de métricas (metrics_*.json) en la carpeta 'ml/'.")
        return None

    candidate_models = []

    # 2. Leer cada archivo JSON y extraer el rendimiento
    for file_path in metric_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

                # Extraer el nombre del algoritmo del nombre de archivo (p.ej. "gradient_boosting")
                algo_name = os.path.basename(file_path).replace("metrics_", "").replace(".json", "")
                pkl_filename = f"model_{algo_name}.pkl"
                pkl_path = os.path.join("ml", pkl_filename)

                # Buscamos la métrica elegida dentro del diccionario 'holdout'
                holdout_metrics = data.get("holdout", {})
                metric_val = holdout_metrics.get(primary_metric)

                if metric_val is not None:
                    candidate_models.append({
                        "model_name": data.get("model", "UnknownModel"),
                        "algorithm": algo_name,
                        "file_path": pkl_path,
                        "metric_name": primary_metric,
                        "metric_value": float(metric_val),
                    })
        except Exception as e:
            print(f"❌ Error leyendo el archivo {file_path}: {e}")

    if not candidate_models:
        print(f"⚠️ Ninguno de los modelos candidatos contiene la métrica '{primary_metric}'.")
        return None

    # 3. Comparar las puntuaciones y encontrar el ganador absoluto
    best_candidate = max(candidate_models, key=lambda x: x["metric_value"])

    print("\n==================================================")
    print(f"MODELO GANADOR SELECCIONADO:")
    print(f"   • Algoritmo: {best_candidate['model_name']}")
    print(f"   • Métrica ({primary_metric}): {best_candidate['metric_value']:.4f}")
    print(f"   • Ruta del archivo: {best_candidate['file_path']}")
    print("==================================================\n")

    try:
        # 4. Actualizar la Base de Datos
        # Desactivar todos los modelos que estaban previamente marcados como activos
        db.query(ModelRegistry).filter(ModelRegistry.is_active == True).update({"is_active": False})

        # Insertar el nuevo modelo campeón como activo
        new_active_model = ModelRegistry(
            model_name=best_candidate["model_name"],
            algorithm=best_candidate["algorithm"],
            file_path=best_candidate["file_path"],
            metric_name=best_candidate["metric_name"],
            metric_value=best_candidate["metric_value"],
            is_active=True,
        )
        db.add(new_active_model)
        db.commit()
        db.refresh(new_active_model)

        print(f"💾 Éxito: Se ha registrado el modelo en la base de datos con ID {new_active_model.id}.")
        return best_candidate

    except Exception as e:
        db.rollback()
        print(f"❌ Error al escribir en la base de datos: {e}")
        return None


if __name__ == "__main__":
    print("🚀 Ejecutando el selector de modelos...")
    
    #  Importar 'engine' y 'Base' para poder crear la tabla
    from src.database.connection import engine 
    from src.models.models_registry import Base
    
    db_session = None
    try:
        print("🔨 Verificando y creando tablas en la base de datos...")
        Base.metadata.create_all(bind=engine)

        db_session = SessionLocal()
        select_best_model(db_session, primary_metric="f1_score")
    except Exception as e:
        print(f"❌ No se pudo inicializar la base de datos para el selector: {e}")
    finally:
        if db_session is not None:
            db_session.close()
