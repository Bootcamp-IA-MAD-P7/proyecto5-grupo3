"""Busca el umbral de decisión óptimo para el modelo RandomForest ganador.

Reutiliza el mismo split holdout que `train_random_forest.py` (mismo
random_state) y recorre umbrales de 0.01 a 0.99 sobre las probabilidades ya
calculadas por el pipeline, buscando el umbral que maximiza accuracy sujeto a
recall >= RECALL_FLOOR. Escribe el resultado en
`ml/threshold_random_forest.json`, que `predict.py` puede leer para no
depender del 0.5 fijo.

Uso, desde `backend/`:
    uv run python -m ml.tune_threshold
"""

from __future__ import annotations

import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_PATH = os.path.join(BASE_DIR, "..", "data", "processed", "telco_customer_churn_clean.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model_random_forest.pkl")
OUTPUT_PATH = os.path.join(BASE_DIR, "threshold_random_forest.json")

TARGET = "churn_value"
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

RANDOM_STATE = 42
RECALL_FLOOR = 0.75


def main() -> dict:
    df = pd.read_csv(PROCESSED_PATH)
    X = df[FEATURE_COLUMNS]
    y = df[TARGET]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    pipeline = joblib.load(MODEL_PATH)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    best = None
    for threshold in np.arange(0.01, 1.0, 0.01):
        y_pred = (y_proba >= threshold).astype(int)
        recall = recall_score(y_test, y_pred)
        if recall < RECALL_FLOOR:
            continue
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        candidate = {
            "threshold": round(float(threshold), 2),
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
        }
        if best is None or accuracy > best["accuracy"]:
            best = candidate

    if best is None:
        raise RuntimeError(
            f"Ningún umbral logra recall >= {RECALL_FLOOR}. Revisa el modelo."
        )

    result = {
        "model": "RandomForestClassifier",
        "recall_floor": RECALL_FLOOR,
        "selected": best,
        "default_threshold_0.5": {
            "accuracy": accuracy_score(y_test, (y_proba >= 0.5).astype(int)),
            "precision": precision_score(y_test, (y_proba >= 0.5).astype(int)),
            "recall": recall_score(y_test, (y_proba >= 0.5).astype(int)),
        },
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nUmbral guardado en: {OUTPUT_PATH}")
    return result


if __name__ == "__main__":
    main()
