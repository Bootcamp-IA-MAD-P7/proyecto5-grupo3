from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.db.config import DATABASE_URL
from src.db.models import Base

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    """Crea las tablas (`customers`, `app_predictions`) si no existen todavía."""
    Base.metadata.create_all(bind=engine)
