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
# ## Modelado — Gradient Boosting (Telco Customer Churn)
#
# Entrena un `GradientBoostingClassifier` para predecir `churn_value` a partir del
# dataset procesado (`data/processed/telco_customer_churn_clean.csv`) y de las
# `FEATURE_COLUMNS` justificadas en la etapa exploratoria.
#
# Este notebook es exploratorio y de reporte: reutiliza la misma lógica de
# entrenamiento que el script reproducible `ml/train_gradient_boosting.py` y añade visualizaciones.

# %% 1. Imports
import os
import sys

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.abspath(".."))
from ml.train_gradient_boosting import (  # noqa: E402
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
print(f"Dimensiones del dataset: {df.shape}")

# %%
X = df[FEATURE_COLUMNS]
y = df[TARGET]
y.value_counts(normalize=True)

# %% [markdown]
# ### Train/test split estratificado (80/20)

# %% 3. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
)
print(f"Tamaño de entrenamiento: {len(X_train)}, Tamaño de test: {len(X_test)}")

# %% [markdown]
# ### Pipeline y búsqueda de hiperparámetros
#
# Optimizamos `n_estimators`, `learning_rate` y `max_depth` usando un Grid Search de 5 pliegues.

# %% 4. Train + hyperparameter tuning
base_pipeline = build_pipeline()
search = tune_hyperparameters(base_pipeline, X_train, y_train)
best_pipeline = search.best_estimator_
print(f"Mejores parámetros: {search.best_params_}")
print(f"Mejor puntuación ROC-AUC en CV: {search.best_score_:.4f}")

# %% [markdown]
# ### Evaluación en el conjunto de test (holdout)

# %% 5. Holdout metrics
holdout_metrics = evaluate(best_pipeline, X_test, y_test)
print("Métricas en test (Holdout):")
for metric, score in holdout_metrics.items():
    if metric != "classification_report":
        print(f" - {metric}: {score}")

# %%
print("\nInforme de Clasificación Detallado:")
print(pd.DataFrame(holdout_metrics["classification_report"]).T)

# %%
fig, ax = plt.subplots(figsize=(5, 5))
ConfusionMatrixDisplay.from_estimator(
    best_pipeline, X_test, y_test, display_labels=["No churn", "Churn"], ax=ax, cmap="Purples"
)
ax.set_title("Matriz de confusión — Gradient Boosting (test)")
plt.tight_layout()

# %%
fig, ax = plt.subplots(figsize=(6, 6))
RocCurveDisplay.from_estimator(best_pipeline, X_test, y_test, ax=ax, color="indigo")
ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Azar")
ax.set_title("Curva ROC — Gradient Boosting (test)")
ax.legend()
plt.tight_layout()

# %% [markdown]
# ### Validación cruzada (5-fold)

# %% 6. Cross-validation
cv_metrics = cross_validate_model(best_pipeline, X_train, y_train)
for metric, val in cv_metrics.items():
    print(f"{metric}: {val:.4f}")

# %% [markdown]
# ### Importancia de Características (Top 20)

# %% 7. Feature importances
feature_names = get_feature_names(best_pipeline)
importances = best_pipeline.named_steps["model"].feature_importances_
importance_df = (
    pd.DataFrame({"feature": feature_names, "importance": importances})
    .sort_values("importance", ascending=False)
    .head(20)
)

fig, ax = plt.subplots(figsize=(8, 8))
sns.barplot(data=importance_df, x="importance", y="feature", ax=ax, palette="Purples_r")
ax.set_title("Top 20 features más importantes — Gradient Boosting")
plt.tight_layout()

# %% [markdown]
# ### Conclusiones
#
# - Las métricas e hiperparámetros se guardan de forma automática en la carpeta `ml/`
#   al lanzar el comando `uv run python -m ml.train_gradient_boosting` en la terminal.