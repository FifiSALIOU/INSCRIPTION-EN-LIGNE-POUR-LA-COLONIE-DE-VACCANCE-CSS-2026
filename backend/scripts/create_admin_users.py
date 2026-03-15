"""
Script pour créer 1 compte Super Admin (admin) et 1 compte Administrateur (gestionnaire).

À exécuter depuis le dossier backend :
    python scripts/create_admin_users.py

Vous pourrez modifier les matricules, emails et mots de passe dans la section
CONFIG ci-dessous avant de lancer le script.
"""
import os
import sys
from datetime import datetime, timezone

# Permettre l'import du package app depuis le dossier backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

from app.database import SessionLocal
from app.models import User, UserRole
from app.security import hash_password


# ---------- CONFIG : modifiez ici matricules, emails et mots de passe ----------
SUPER_ADMIN = {
    "matricule": "SUPERADMIN",
    "prenom": "Super",
    "nom": "Admin",
    "email": "super.admin@css.dj",
    "service": "Direction Générale",
    "password": "SuperAdmin2026!",  # à changer après première connexion
    "role": UserRole.ADMIN,  # = Super Admin dans l'interface
}

GESTIONNAIRE = {
    "matricule": "GESTION01",
    "prenom": "Gestionnaire",
    "nom": "Colonie",
    "email": "gestionnaire@css.dj",
    "service": "Prestations Sociales",
    "password": "Gestionnaire2026!",  # à changer après première connexion
    "role": UserRole.GESTIONNAIRE,  # = Administrateur (gestionnaire) dans l'interface
}
# ------------------------------------------------------------------------------


def main():
    db = SessionLocal()
    try:
        for label, data in [("Super Admin (admin)", SUPER_ADMIN), ("Administrateur (gestionnaire)", GESTIONNAIRE)]:
            existing = db.query(User).filter(User.matricule == data["matricule"]).first()
            if existing:
                print(f"  Ignoré : {label} avec matricule {data['matricule']} existe déjà.")
                continue
            user = User(
                matricule=data["matricule"],
                prenom=data["prenom"],
                nom=data["nom"],
                email=data["email"],
                service=data["service"],
                role=data["role"],
                password_hash=hash_password(data["password"]),
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"  Créé : {label} — matricule {data['matricule']}, email {data['email']}")
        print("Terminé.")
    except Exception as e:
        db.rollback()
        print(f"Erreur : {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
