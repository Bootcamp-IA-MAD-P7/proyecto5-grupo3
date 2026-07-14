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
# ## Preprocessing — carga y limpieza de datos (Telco Customer Churn)
#
# Descarga el dataset original desde Kaggle, lo deja tal cual en `data/raw/`
# (snapshot inmutable) y genera una versión limpia en `data/processed/` lista
# para el EDA (`02_exploratory.py`) y para el pipeline de carga a la base de
# datos (`src/db/load_raw.py`).

# %% 1. Imports
import os

import kagglehub
import pandas as pd

# %% 2. Load raw data
path = kagglehub.dataset_download("yeanzc/telco-customer-churn-ibm-dataset")
raw_df = pd.read_excel(os.path.join(path, "Telco_customer_churn.xlsx"))
raw_df.shape

# %%
raw_df.info()

# %% [markdown]
# ### Snapshot de datos crudos
#
# Guardamos una copia en `.csv` sin ninguna modificación: es la referencia
# inmutable de la fuente original (no se debe editar a mano).

# %% 3. Persist raw snapshot
RAW_DIR = os.path.join("..", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)
raw_path = os.path.join(RAW_DIR, "telco_customer_churn.csv")
raw_df.to_csv(raw_path, index=False)
raw_path

# %% [markdown]
# ### Limpieza
#
# - Nombres de columna normalizados a `snake_case`.
# - `total_charges` llega como texto y tiene 11 celdas en blanco (clientes con
#   0 meses de antigüedad); se convierte a numérico y se imputan a `0.0`.
# - Se descartan columnas sin valor informativo: `count` (siempre 1), `country`
#   y `state` (un único valor en todo el dataset) y `lat_long` (redundante con
#   `latitude`/`longitude`).
# - Se eliminan duplicados por `customer_id`.
#
# **Nota sobre fuga de información (data leakage):** `churn_score` es la
# puntuación de propensión al churn calculada por IBM con su propio modelo, y
# `churn_reason` solo existe cuando el cliente ya se ha dado de baja. Ambas
# columnas se conservan en la tabla para análisis exploratorio y trazabilidad,
# pero **no deben usarse como features** al entrenar el modelo de
# clasificación — se detalla en `02_exploratory.py`.

# %% 4. Clean
df = raw_df.copy()
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
df = df.rename(columns={"customerid": "customer_id"})

df["total_charges"] = pd.to_numeric(
    df["total_charges"].astype(str).str.strip(), errors="coerce"
)
df["total_charges"] = df["total_charges"].fillna(0.0)

df = df.drop(columns=["count", "country", "state", "lat_long"])
df = df.drop_duplicates(subset="customer_id")
df.shape

# %%
df.isna().sum()[df.isna().sum() > 0]

# %% [markdown]
# ### Guardado del dataset procesado

# %% 5. Persist processed data
PROCESSED_DIR = os.path.join("..", "data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)
processed_path = os.path.join(PROCESSED_DIR, "telco_customer_churn_clean.csv")
df.to_csv(processed_path, index=False)
processed_path

# %%
df.head()
