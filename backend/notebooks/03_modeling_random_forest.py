# ---
# jupyter:
#   jupytext:
#     cell_metadata_filter: title,-all
#     formats: py:percent,ipynb
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.19.4
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %% [markdown]
# ## Modelado — Random Forest (Telco Customer Churn)
#
# Entrena un `RandomForestClassifier` para predecir `churn_value` a partir del
# dataset procesado (`data/processed/telco_customer_churn_clean.csv`, generado
# por `01_preprocessing.py`) y de las `FEATURE_COLUMNS` justificadas en
# `02_exploratory.py` (se excluyen `churn_score`, `churn_reason`, `churn_label`
# y las columnas de identificación/geografía por fuga de información o falta
# de señal causal).
#
# Este notebook es exploratorio/de reporte: reutiliza la misma lógica de
# entrenamiento que el script reproducible `ml/train_random_forest.py` (fuente
# de verdad para generar el modelo en `ml/model_random_forest.pkl`), y añade
# visualizaciones (matriz de confusión, curva ROC, importancia de features)
# para documentar el resultado.
#
# No modifica nada del pipeline de inferencia en producción (`ml/predict.py`,
# basado en XGBoost) ni el resto de la app — es un artefacto adicional.

# %% 1. Imports
import os
import sys

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.abspath(".."))
from ml.train_random_forest import (  # noqa: E402
    FEATURE_COLUMNS,
    RANDOM_STATE,
    TARGET,
    build_pipeline,
    cross_validate_model,
    evaluate,
    get_feature_names,
    load_data,
    tune_hyperparameters,
)

sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (10, 5)

# %% 2. Load processed data
df = load_data()
df.shape

# %%
X = df[FEATURE_COLUMNS]
y = df[TARGET]
y.value_counts(normalize=True)

# %% [markdown]
# ### Train/test split estratificado
#
# 80/20, estratificado por `churn_value` para conservar el desbalance de
# clases (~27% churn) en ambos conjuntos.

# %% 3. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
)
len(X_train), len(X_test)

# %% [markdown]
# ### Pipeline y búsqueda de hiperparámetros
#
# El preprocesado (`ColumnTransformer`) codifica las variables categóricas con
# one-hot y deja las numéricas (`tenure_months`, `monthly_charges`,
# `total_charges`) sin transformar — Random Forest no requiere escalado. Se
# usa `class_weight="balanced"` por el desbalance de clases y `GridSearchCV`
# (5-fold estratificado, optimizando ROC-AUC) para elegir `n_estimators`,
# `max_depth` y `min_samples_leaf`.

# %% 4. Train + hyperparameter tuning
base_pipeline = build_pipeline()
search = tune_hyperparameters(base_pipeline, X_train, y_train)
best_pipeline = search.best_estimator_
search.best_params_, search.best_score_

# %% [markdown]
# ### Evaluación en el conjunto de test (holdout)

# %% 5. Holdout metrics
holdout_metrics = evaluate(best_pipeline, X_test, y_test)
{k: v for k, v in holdout_metrics.items() if k not in ("classification_report",)}

# %%
pd.DataFrame(holdout_metrics["classification_report"]).T

# %%
fig, ax = plt.subplots(figsize=(5, 5))
ConfusionMatrixDisplay.from_estimator(
    best_pipeline, X_test, y_test, display_labels=["No churn", "Churn"], ax=ax, cmap="Blues"
)
ax.set_title("Matriz de confusión — Random Forest (test)")
plt.tight_layout()

# %%
fig, ax = plt.subplots(figsize=(6, 6))
RocCurveDisplay.from_estimator(best_pipeline, X_test, y_test, ax=ax)
ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Azar")
ax.set_title("Curva ROC — Random Forest (test)")
ax.legend()
plt.tight_layout()

# %% [markdown]
# ### Validación cruzada (5-fold, sobre el conjunto de entrenamiento)
#
# Confirma que el desempeño en el holdout no es fruto del azar del split.

# %% 6. Cross-validation
cv_metrics = cross_validate_model(best_pipeline, X_train, y_train)
cv_metrics

# %% [markdown]
# ### Importancia de features
#
# Importancia nativa de Random Forest (`feature_importances_`) sobre las
# columnas ya codificadas (one-hot expande cada categórica).

# %% 7. Feature importances
feature_names = get_feature_names(best_pipeline)
importances = best_pipeline.named_steps["model"].feature_importances_
importance_df = (
    pd.DataFrame({"feature": feature_names, "importance": importances})
    .sort_values("importance", ascending=False)
    .head(20)
)

fig, ax = plt.subplots(figsize=(8, 8))
sns.barplot(data=importance_df, x="importance", y="feature", ax=ax)
ax.set_title("Top 20 features más importantes — Random Forest")
plt.tight_layout()

# %% [markdown]
# ### Conclusiones
#
# - Métricas de holdout y de validación cruzada quedan documentadas arriba y
#   se persisten (junto con el modelo) al ejecutar
#   `uv run python -m ml.train_random_forest` desde `backend/`:
#   - `ml/model_random_forest.pkl`
#   - `ml/metrics_random_forest.json`
#   - `ml/feature_importances_random_forest.csv`
# - El modelo usa `class_weight="balanced"` para compensar el desbalance de
#   clases (~27% churn) en lugar de sobre/sub-muestreo.
# - Consistente con el EDA: antigüedad (`tenure_months`), tipo de contrato y
#   cargos mensuales están entre las variables con mayor importancia.
