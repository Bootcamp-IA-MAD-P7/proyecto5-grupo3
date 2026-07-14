import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

#(Configura tu contraseña local o de Docker aquí)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:12345678@localhost:5432/churn_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
