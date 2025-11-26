#!/bin/bash

# Script de nettoyage de l'application Smart Todo sur Kubernetes
# Usage: ./cleanup.sh

set -e

echo "=================================================="
echo "Nettoyage de l'application Smart Todo"
echo "=================================================="
echo ""

read -p "Êtes-vous sûr de vouloir supprimer l'application ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulation"
    exit 1
fi

echo ""
echo "Suppression du namespace et de toutes les ressources..."
kubectl delete namespace smart-todo-app

echo ""
echo "=================================================="
echo "Application supprimée avec succès"
echo "=================================================="
echo ""


