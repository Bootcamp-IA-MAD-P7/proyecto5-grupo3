"""Entrena un RandomForestClassifier para predecir churn (Telco Customer Churn).

Es un pipeline independiente y aditivo: no modifica `ml/predict.py` (inferencia
en producción, basada en XGBoost) ni el resto de la app. Genera sus propios
artefactos dentro de `ml/`:

- `ml/model_random_forest.pkl`   -> pipeline sklearn (preprocesado + modelo) entrenado
- `ml/metrics_random_forest.json` -> métricas de evaluación (holdout + cross-validation)
- `ml/feature_importances_random_forest.csv` -> importancia de features tras one-hot

Requiere `data/processed/telco_customer_churn_clean.csv` (generado por
`notebooks/01_preprocessing.py`).

Uso, desde `backend/`:
    uv run python -m ml.train_random_forest
"""

from __future__ import annotations

import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import (
    GridSearchCV,
    RandomizedSearchCV,
    StratifiedKFold,
    cross_validate,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_PATH = os.path.join(BASE_DIR, "..", "data", "processed", "telco_customer_churn_clean.csv")

MODEL_PATH = os.path.join(BASE_DIR, "model_random_forest.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "metrics_random_forest.json")
FEATURE_IMPORTANCES_PATH = os.path.join(BASE_DIR, "feature_importances_random_forest.csv")

TARGET = "churn_value"

# Mismas features candidatas que src/api/db/models.py::FEATURE_COLUMNS y el
# análisis de fuga de información documentado en notebooks/02_exploratory.py.
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

# Nota: en el dataset procesado `senior_citizen` llega como texto "Yes"/"No"
# (igual que en src/api/db/models.py::Customer), no como 0/1.
NUMERIC_COLUMNS = ["tenure_months", "monthly_charges", "total_charges"]
CATEGORICAL_COLUMNS = [c for c in FEATURE_COLUMNS if c not in NUMERIC_COLUMNS]

RANDOM_STATE = 42


def load_data() -> pd.DataFrame:
    if not os.path.exists(PROCESSED_PATH):
        raise FileNotFoundError(
            f"No se encontró {PROCESSED_PATH}. Ejecuta antes "
            "'notebooks/01_preprocessing.py' para generar el dataset procesado."
        )
    return pd.read_csv(PROCESSED_PATH)


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", NUMERIC_COLUMNS),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLUMNS),
        ]
    )

    model = RandomForestClassifier(random_state=RANDOM_STATE, class_weight="balanced")

    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def get_feature_names(pipeline: Pipeline) -> list[str]:
    return list(pipeline.named_steps["preprocessor"].get_feature_names_out())


def evaluate(pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    return {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_proba),
        "confusion_matrix": {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp),
        },
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
    }


def cross_validate_model(pipeline: Pipeline, X: pd.DataFrame, y: pd.Series) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    scores = cross_validate(pipeline, X, y, cv=cv, scoring=scoring)

    return {
        f"{metric}_mean": float(np.mean(scores[f"test_{metric}"]))
        for metric in scoring
    } | {
        f"{metric}_std": float(np.std(scores[f"test_{metric}"]))
        for metric in scoring
    }


def tune_hyperparameters(pipeline: Pipeline, X_train: pd.DataFrame, y_train: pd.Series) -> RandomizedSearchCV:
    param_distributions = {
        "model__n_estimators": [200, 300, 400, 600],
        "model__max_depth": [None, 10, 20, 30],
        "model__min_samples_leaf": [1, 2, 4],
        "model__min_samples_split": [2, 5, 10],
        "model__max_features": ["sqrt", "log2"],
        "model__class_weight": ["balanced", "balanced_subsample"],
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    search = RandomizedSearchCV(
        pipeline,
        param_distributions,
        n_iter=40,
        scoring="roc_auc",
        cv=cv,
        n_jobs=-1,
        random_state=RANDOM_STATE,
        refit=True,
    )
    search.fit(X_train, y_train)
    return search


def main() -> dict:
    df = load_data()
    X = df[FEATURE_COLUMNS]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    base_pipeline = build_pipeline()
    search = tune_hyperparameters(base_pipeline, X_train, y_train)
    best_pipeline = search.best_estimator_

    holdout_metrics = evaluate(best_pipeline, X_test, y_test)
    cv_metrics = cross_validate_model(best_pipeline, X_train, y_train)

    importances = best_pipeline.named_steps["model"].feature_importances_
    feature_names = get_feature_names(best_pipeline)
    importance_df = pd.DataFrame(
        {"feature": feature_names, "importance": importances}
    ).sort_values("importance", ascending=False)
    importance_df.to_csv(FEATURE_IMPORTANCES_PATH, index=False)

    metrics = {
        "model": "RandomForestClassifier",
        "best_params": search.best_params_,
        "holdout": holdout_metrics,
        "cross_validation": cv_metrics,
        "n_train": len(X_train),
        "n_test": len(X_test),
    }

    joblib.dump(best_pipeline, MODEL_PATH)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)

    print(json.dumps(metrics, indent=2, ensure_ascii=False))
    print(f"\nModelo guardado en: {MODEL_PATH}")
    print(f"Métricas guardadas en: {METRICS_PATH}")
    print(f"Importancia de features guardada en: {FEATURE_IMPORTANCES_PATH}")

    return metrics


if __name__ == "__main__":
    main()
