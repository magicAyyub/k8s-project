#!/bin/bash

# Script de déploiement de l'application Smart Todo sur Kubernetes
# Supporte les déploiements locaux (Minikube) et production (GCP)
# Usage: ./deploy.sh [minikube|gcp]

set -e

DEPLOYMENT_MODE=${1:-"minikube"}

# Fonction pour afficher l'usage
usage() {
    echo "Usage: $0 [minikube|gcp]"
    echo ""
    echo "Options:"
    echo "  minikube  - Déploiement local avec Minikube (par défaut)"
    echo "  gcp       - Déploiement en production sur GCP"
    echo ""
    exit 1
}

# Valider le mode de déploiement
if [[ "$DEPLOYMENT_MODE" != "minikube" && "$DEPLOYMENT_MODE" != "gcp" ]]; then
    echo "Erreur: Mode de déploiement invalide: $DEPLOYMENT_MODE"
    usage
fi

echo "=================================================="
echo "Déploiement de l'application Smart Todo"
echo "Mode: $DEPLOYMENT_MODE"
echo "=================================================="
echo ""

# Vérifier que kubectl est installé
if ! command -v kubectl &> /dev/null; then
    echo "Erreur: kubectl n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier la connexion au cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "Erreur: Impossible de se connecter au cluster Kubernetes."
    exit 1
fi

echo "Connexion au cluster: OK"
echo ""

# Configuration spécifique selon le mode
if [[ "$DEPLOYMENT_MODE" == "minikube" ]]; then
    echo "Configuration Minikube..."
    
    # Vérifier que Minikube est installé
    if ! command -v minikube &> /dev/null; then
        echo "Erreur: Minikube n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier que Minikube est démarré
    if ! minikube status &> /dev/null; then
        echo "Démarrage de Minikube..."
        minikube start
    fi
    
    # Activer les addons nécessaires
    echo "Activation des addons Minikube..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    
    # Vérifier/Charger les images Docker
    echo "Vérification des images Docker..."
    if ! minikube ssh -- docker images | grep -q "smart-todo-backend"; then
        echo "Attention: L'image smart-todo-backend n'est pas chargée dans Minikube."
        echo "Exécutez: minikube image load smart-todo-backend:latest"
    fi
    if ! minikube ssh -- docker images | grep -q "smart-todo-frontend"; then
        echo "Attention: L'image smart-todo-frontend n'est pas chargée dans Minikube."
        echo "Exécutez: minikube image load smart-todo-frontend:latest"
    fi
    
elif [[ "$DEPLOYMENT_MODE" == "gcp" ]]; then
    echo "Configuration GCP..."
    
    # Vérifier que gcloud est installé
    if ! command -v gcloud &> /dev/null; then
        echo "Erreur: gcloud CLI n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier l'installation de l'Ingress Controller NGINX
    if ! kubectl get namespace ingress-nginx &> /dev/null; then
        echo "Installation de l'Ingress Controller NGINX..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
        
        echo "Attente du démarrage de l'Ingress Controller..."
        kubectl wait --namespace ingress-nginx \
            --for=condition=ready pod \
            --selector=app.kubernetes.io/component=controller \
            --timeout=120s
    else
        echo "Ingress Controller NGINX: OK"
    fi
fi

echo ""

# Créer le namespace
echo "Création du namespace..."
kubectl apply -f 00-namespace.yaml

sleep 2

# Créer les secrets et PVC
echo "Création des secrets et volumes..."
kubectl apply -f 01-postgres-secret.yaml
kubectl apply -f 02-postgres-pvc.yaml

sleep 2

# Déployer PostgreSQL
echo "Déploiement de PostgreSQL..."
kubectl apply -f 03-postgres-deployment.yaml
kubectl apply -f 04-postgres-service.yaml

# Attendre que PostgreSQL soit prêt
echo "Attente du démarrage de PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n smart-todo-app --timeout=120s

# Déployer le Backend
echo "Déploiement du Backend..."
kubectl apply -f 05-backend-deployment.yaml
kubectl apply -f 06-backend-service.yaml

# Attendre que le backend soit prêt
echo "Attente du démarrage du Backend..."
kubectl wait --for=condition=ready pod -l app=backend -n smart-todo-app --timeout=120s

# Déployer le Frontend
echo "Déploiement du Frontend..."
kubectl apply -f 07-frontend-deployment.yaml
kubectl apply -f 08-frontend-service.yaml

# Attendre que le frontend soit prêt
echo "Attente du démarrage du Frontend..."
kubectl wait --for=condition=ready pod -l app=frontend -n smart-todo-app --timeout=120s

# Déployer l'Ingress
echo "Déploiement de l'Ingress..."
kubectl apply -f 09-ingress.yaml

# Déployer le HPA
echo "Déploiement du HPA..."
kubectl apply -f 10-backend-hpa.yaml

echo ""
echo "=================================================="
echo "Déploiement terminé avec succès"
echo "=================================================="
echo ""

# Afficher l'état
echo "État des ressources:"
echo ""
kubectl get all -n smart-todo-app
echo ""
kubectl get ingress -n smart-todo-app
echo ""
kubectl get pvc -n smart-todo-app
echo ""
kubectl get hpa -n smart-todo-app

echo ""
echo "=================================================="
echo "Instructions d'accès"
echo "=================================================="
echo ""

if [[ "$DEPLOYMENT_MODE" == "minikube" ]]; then
    MINIKUBE_IP=$(minikube ip)
    NODEPORT=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')
    
    echo "Mode: Minikube (Local)"
    echo ""
    echo "RECOMMANDATION: Utilisez Port-Forward pour un accès fiable"
    echo ""
    echo "Option 1: Port-Forward (Méthode recommandée)"
    echo "  Backend:"
    echo "    kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000"
    echo "  Frontend (dans un autre terminal):"
    echo "    kubectl port-forward -n smart-todo-app svc/frontend-service 3000:3000"
    echo ""
    echo "  Puis accédez à:"
    echo "    Frontend: http://localhost:3000"
    echo "    Backend:  http://localhost:8000"
    echo "    API Docs: http://localhost:8000/docs"
    echo ""
    echo "Option 2: Via Ingress (peut nécessiter configuration réseau)"
    echo "  Note: Sur macOS, l'accès via Ingress peut être problématique."
    echo "  L'IP Minikube ($MINIKUBE_IP) n'est pas toujours accessible depuis l'hôte."
    echo ""
    echo "  Si vous souhaitez quand même tester:"
    echo "  1. Vérifiez que minikube tunnel est actif (déjà lancé)"
    echo "  2. Ajoutez à /etc/hosts (si pas déjà fait):"
    echo "     echo \"$MINIKUBE_IP smart-todo-app.local\" | sudo tee -a /etc/hosts"
    echo "  3. Accédez via NodePort:"
    echo "     http://$MINIKUBE_IP:$NODEPORT (avec Host header dans navigateur)"
    echo ""
    echo "  Alternative: Utilisez 'minikube service' pour accès direct:"
    echo "    minikube service frontend-service -n smart-todo-app"
    echo ""
    
elif [[ "$DEPLOYMENT_MODE" == "gcp" ]]; then
    echo "Mode: GCP (Production)"
    echo ""
    echo "Attente de l'assignation de l'IP externe..."
    sleep 10
    
    INGRESS_IP=$(kubectl get ingress smart-todo-app-ingress -n smart-todo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "En attente...")
    
    if [[ "$INGRESS_IP" == "En attente..." ]]; then
        echo "L'IP externe est en cours d'assignation."
        echo "Exécutez cette commande pour la récupérer:"
        echo "  kubectl get ingress -n smart-todo-app -w"
        echo ""
    else
        echo "IP de l'Ingress: $INGRESS_IP"
        echo ""
        echo "Pour tester localement, ajoutez à /etc/hosts:"
        echo "  echo \"$INGRESS_IP smart-todo-app.local\" | sudo tee -a /etc/hosts"
        echo ""
        echo "Pour la production, configurez votre DNS:"
        echo "  Créez un enregistrement A pointant vers: $INGRESS_IP"
        echo ""
    fi
    
    echo "Accès à l'application:"
    echo "  Frontend: http://smart-todo-app.local"
    echo "  Backend:  http://smart-todo-app.local/health"
    echo "  API Docs: http://smart-todo-app.local/docs"
    echo ""
fi

echo "=================================================="
