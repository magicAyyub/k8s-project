# Script de nettoyage
# Usage: ./cleanup.sh

#!/bin/bash

echo "🗑️  Suppression de l'application Todo"
echo "===================================="
echo ""

read -p "Êtes-vous sûr de vouloir supprimer l'application ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🞨 Annulation"
    exit 1
fi

echo "🗑️  Suppression du namespace et de toutes les ressources..."
kubectl delete namespace smart-todo-app

echo ""
echo "✔️ Application supprimée avec succès !"
echo ""

