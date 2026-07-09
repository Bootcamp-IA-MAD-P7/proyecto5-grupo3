"""Carga el dataset procesado de Telco Customer Churn en la tabla `customers`.

Requiere que Postgres esté levantado (`docker compose up -d` desde la raíz
del repo) y que exista `data/processed/telco_customer_churn_clean.csv`
(generado por `notebooks/01_preprocessing.py`).

Uso, desde `backend/`:
    uv run python -m src.db.load_raw
"""

from pathlib import Path

import pandas as pd

from src.db.models import Customer
from src.db.session import SessionLocal, init_db

PROCESSED_PATH = (
    Path(__file__).resolve().parents[2] / "data" / "processed" / "telco_customer_churn_clean.csv"
)


def load() -> int:
    init_db()
    df = pd.read_csv(PROCESSED_PATH)
    df = df.where(pd.notnull(df), None)
    records = df.to_dict(orient="records")

    session = SessionLocal()
    try:
        inserted = 0
        for record in records:
            if session.get(Customer, record["customer_id"]) is not None:
                continue
            session.add(Customer(**record))
            inserted += 1
        session.commit()
        return inserted
    finally:
        session.close()


if __name__ == "__main__":
    n = load()
    print(f"Insertadas {n} filas nuevas en 'customers'.")
