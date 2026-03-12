## Backend FastAPI - Colonie de vacances 2026

Ce dossier contient le backend de l'application d'inscription en ligne pour la colonie de vacances CSS 2026.

### Prérequis

- Python 3.10 ou plus récent
- PostgreSQL installé et accessible

### Installation (en ligne de commande)

1. Créer et activer un environnement virtuel Python :

   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # sous Windows
   ```

2. Installer les dépendances :

   ```bash
   pip install -r requirements.txt
   ```

3. Lancer le serveur de développement :

   ```bash
   uvicorn app.main:app --reload
   ```

L'API sera alors disponible par défaut sur `http://127.0.0.1:8000` et la documentation interactive sur `http://127.0.0.1:8000/docs`.

