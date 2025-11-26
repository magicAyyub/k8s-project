# Étape 1 - Utilise une image Python officielle comme base
FROM python:3.12

# Étape 2 - Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 - Copie les fichiers nécessaires
COPY backend/requirements.txt /app/requirements.txt

# Étape 4 - Installe les dépendances
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Étape 5 - Copie le reste du code de l'application
COPY . /app

# Étape 6 - Crée un répertoire pour les logs SIDECAR
RUN mkdir -p /app/logs

# Étape 7 - Expose le port utilisé par FastAPI (généralement 8000)
EXPOSE 8000

# Étape 8 - Commande pour lancer l'application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]