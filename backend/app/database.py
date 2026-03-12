import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


load_dotenv()  # charge les variables depuis .env


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "La variable d'environnement DATABASE_URL est manquante. "
        "Vérifiez le fichier .env dans le dossier backend."
    )


engine = create_engine(DATABASE_URL, echo=False, future=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Classe de base pour tous les modèles SQLAlchemy."""


def get_db() -> Generator:
    """Dépendance FastAPI pour obtenir une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

