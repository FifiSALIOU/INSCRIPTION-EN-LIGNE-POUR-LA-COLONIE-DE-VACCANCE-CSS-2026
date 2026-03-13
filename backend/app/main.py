from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import get_db
from .models import User


app = FastAPI(
    title="API Colonie de vacances CSS 2026",
    description="Backend FastAPI pour l'inscription en ligne à la colonie de vacances 2026.",
    version="0.1.0",
)


@app.get("/", tags=["général"])
def read_root():
    return {"message": "API Colonie de vacances CSS 2026 - backend opérationnel"}


@app.get("/health", tags=["général"])
def health_check():
    return {"status": "ok"}


@app.get("/users/count", tags=["users"])
def count_users(db: Session = Depends(get_db)):
    """
    Endpoint de test simple pour vérifier la connexion à la base de données.
    Retourne le nombre d'utilisateurs enregistrés dans la table users.
    """
    return {"count": db.query(User).count()}

