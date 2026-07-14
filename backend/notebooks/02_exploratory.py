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
# ## Exploratory Data Analysis (EDA) — Telco Customer Churn
#
# Objetivo: entender qué variables se relacionan con la fuga de clientes
# (`churn_value`) antes de entrenar un modelo de clasificación. Partimos del
# dataset ya limpio generado por `01_preprocessing.py`
# (`data/processed/telco_customer_churn_clean.csv`).

# %% 1. Imports
import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (12, 5)

# %% 2. Load processed data
PROCESSED_PATH = os.path.join("..", "data", "processed", "telco_customer_churn_clean.csv")
df = pd.read_csv(PROCESSED_PATH)
df.shape

# %%
df.head()

# %%
df.info()

# %%
df.isna().sum()[df.isna().sum() > 0]

# %% [markdown]
# `churn_reason` solo está informado para clientes que ya se dieron de baja
# (1869 de 7043) — es esperable, no un problema de calidad de datos.

# %% [markdown]
# ### Columnas de fuga de información (data leakage)
#
# Antes de analizar relaciones con el target, dejamos explícito qué columnas
# **no deben entrar como features** del modelo de clasificación:
#
# - `churn_score`: puntuación de propensión al churn calculada por el propio
#   IBM con otro modelo — usarla sería filtrar la respuesta.
# - `churn_reason`: solo existe cuando el cliente ya ha hecho churn — fuga
#   directa y perfecta del target.
# - `churn_label`: es el mismo target (`churn_value`) en texto.
# - `customer_id`, `city`, `zip_code`, `latitude`, `longitude`: identificadores
#   o variables geográficas de alta cardinalidad sin relación causal esperada
#   con el churn en este dataset (todos los clientes son de California).
#
# El resto de columnas (19) forman el conjunto de features candidatas para el
# modelo.

# %%
TARGET = "churn_value"
LEAKAGE_OR_ID_COLUMNS = [
    "customer_id", "city", "zip_code", "latitude", "longitude",
    "churn_label", "churn_score", "cltv", "churn_reason",
]
FEATURE_COLUMNS = [c for c in df.columns if c not in LEAKAGE_OR_ID_COLUMNS + [TARGET]]
FEATURE_COLUMNS

# %% [markdown]
# ### 1. Distribución del target
#
# El churn está desbalanceado (~27% positivos). Es relevante para elegir
# métricas (no solo accuracy) y estrategia de validación (estratificada) en la
# fase de modelado.

# %%
churn_counts = df["churn_label"].value_counts()
churn_pct = df["churn_label"].value_counts(normalize=True) * 100

fig, ax = plt.subplots(figsize=(6, 5))
sns.countplot(data=df, x="churn_label", order=["No", "Yes"], ax=ax)
for i, label in enumerate(["No", "Yes"]):
    ax.text(i, churn_counts[label] + 50, f"{churn_pct[label]:.1f}%", ha="center")
ax.set_title("Distribución de churn")
ax.set_xlabel("Churn")
ax.set_ylabel("Clientes")
plt.tight_layout()

# %% [markdown]
# ### 2. Histogramas de variables numéricas

# %%
numeric_cols = ["tenure_months", "monthly_charges", "total_charges"]

fig, axes = plt.subplots(1, len(numeric_cols), figsize=(16, 4))
for ax, col in zip(axes, numeric_cols):
    sns.histplot(df[col], bins=30, kde=True, ax=ax)
    ax.set_title(col)
plt.tight_layout()

# %% [markdown]
# ### 3. Variables numéricas vs. churn (boxplots)
#
# Los clientes que hacen churn tienden a tener menor antigüedad (`tenure_months`)
# y cargos mensuales más altos.

# %%
fig, axes = plt.subplots(1, len(numeric_cols), figsize=(16, 5))
for ax, col in zip(axes, numeric_cols):
    sns.boxplot(data=df, x="churn_label", y=col, order=["No", "Yes"], ax=ax)
    ax.set_title(f"{col} vs churn")
plt.tight_layout()

# %% [markdown]
# ### 4. Matriz de correlación
#
# Incluimos las variables numéricas más el target. `churn_score` se muestra
# solo a título informativo (fuga de información: nótese su altísima
# correlación con `churn_value`, ~0.6+, precisamente porque ya es una
# predicción de churn) y no se usará como feature.

# %%
corr_cols = numeric_cols + ["churn_value", "churn_score", "cltv"]
corr = df[corr_cols].corr()

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, ax=ax)
ax.set_title("Matriz de correlación — variables numéricas")
plt.tight_layout()

# %% [markdown]
# ### 5. Correlación de features binarias/categóricas codificadas vs. churn
#
# Para incluir también las variables categóricas en un análisis de
# correlación, codificamos las binarias (`Yes`/`No`) como 0/1 y aplicamos
# one-hot a las multi-categoría, y ordenamos por correlación absoluta con el
# target. Es un proxy rápido de importancia de variable antes de modelar.

# %%
encoded = df[FEATURE_COLUMNS + [TARGET]].copy()
binary_yes_no = [
    c for c in FEATURE_COLUMNS
    if set(encoded[c].dropna().unique()) <= {"Yes", "No"}
]
for c in binary_yes_no:
    encoded[c] = encoded[c].map({"Yes": 1, "No": 0})
encoded["gender"] = encoded["gender"].map({"Male": 1, "Female": 0})

encoded = pd.get_dummies(encoded, drop_first=True)

target_corr = (
    encoded.corr()[TARGET]
    .drop(TARGET)
    .sort_values(key=np.abs, ascending=False)
)

fig, ax = plt.subplots(figsize=(8, 10))
sns.barplot(x=target_corr.values, y=target_corr.index, ax=ax)
ax.axvline(0, color="black", linewidth=0.8)
ax.set_title("Correlación de cada feature (codificada) con churn_value")
ax.set_xlabel("Correlación de Pearson")
plt.tight_layout()

# %% [markdown]
# ### 6. Tasa de churn por categoría
#
# Para las variables categóricas con más impacto (contrato, servicio de
# internet, método de pago, seguridad online) miramos directamente la tasa de
# churn por categoría, más interpretable que la correlación tras one-hot.

# %%
categorical_of_interest = [
    "contract", "internet_service", "payment_method",
    "online_security", "tech_support", "senior_citizen",
]

fig, axes = plt.subplots(2, 3, figsize=(18, 10))
for ax, col in zip(axes.ravel(), categorical_of_interest):
    rate = df.groupby(col)["churn_value"].mean().sort_values(ascending=False) * 100
    sns.barplot(x=rate.values, y=rate.index, ax=ax)
    ax.set_title(f"Tasa de churn por {col}")
    ax.set_xlabel("% churn")
    ax.set_ylabel("")
plt.tight_layout()

# %% [markdown]
# ### 7. Relación conjunta: antigüedad, cargo mensual y churn

# %%
fig, ax = plt.subplots(figsize=(8, 6))
sns.scatterplot(
    data=df, x="tenure_months", y="monthly_charges",
    hue="churn_label", alpha=0.5, ax=ax,
)
ax.set_title("Tenure vs. Monthly Charges, coloreado por churn")
plt.tight_layout()

# %% [markdown]
# ### Conclusiones
#
# - **Desbalance de clases** (~27% churn): usar métricas como F1/recall/ROC-AUC
#   y validación estratificada, no solo accuracy.
# - Mayor riesgo de churn: contrato **month-to-month**, **fiber optic** sin
#   `online_security`/`tech_support`, pago por **electronic check**, poca
#   antigüedad y cargos mensuales altos.
# - Menor riesgo de churn: contratos de **uno o dos años**, con servicios
#   adicionales contratados (seguridad, soporte técnico, backup online).
# - `churn_score` y `churn_reason` son fuga de información y se excluyen del
#   modelo (ver `FEATURE_COLUMNS` más arriba); `customer_id` y las variables
#   geográficas tampoco aportan señal causal utilizable aquí.
