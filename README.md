# Projet Kubernetes

--

## Prérequis

- **Minikube** : Pour le déploiement local
- **kubectl** : Client Kubernetes
- **Docker** : Pour builder les images (optionnel)
- **gcloud CLI** : Pour le déploiement sur GCP (optionnel)

## Images Docker

Les images sont disponibles publiquement sur Docker Hub :
- `ayyubmgc/smart-todo-backend:latest`
- `ayyubmgc/smart-todo-frontend:latest`

Vous n'avez **pas besoin** de builder les images pour déployer l'application. Kubernetes va automatiquement les télécharger depuis Docker Hub.

### Reconstruire les images (Note pour Moi-même)

pour modifier le code source et reconstruire les images :

```bash
cd docker-project-master

# Builder les images
docker build --network=host -t ayyubmgc/smart-todo-backend:latest -f backend/Dockerfile .
docker build --network=host -t ayyubmgc/smart-todo-frontend:latest -f frontend/Dockerfile .

# Pousser sur Docker Hub (nécessite docker login)
docker push ayyubmgc/smart-todo-backend:latest
docker push ayyubmgc/smart-todo-frontend:latest
```

---

## Déploiement

### Déploiement sur Minikube (Local)

#### 1. Démarrer Minikube

```bash
# Démarrer Minikube
minikube start

# Vérifier que Minikube fonctionne
minikube status
```

#### 2. Déployer l'application

```bash
# Utiliser le script de déploiement automatique
./deploy.sh minikube
```

Le script va :
- Activer les addons nécessaires (ingress, metrics-server)
- Créer le namespace `smart-todo-app`
- Déployer PostgreSQL avec son volume persistant
- Déployer le backend et le frontend
- Configurer l'Ingress et le HPA

**Alternative manuelle** :

```bash
# Déploiement dans l'ordre
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-postgres-secret.yaml
kubectl apply -f 02-postgres-pvc.yaml
kubectl apply -f 03-postgres-deployment.yaml
kubectl apply -f 04-postgres-service.yaml
kubectl apply -f 05-backend-deployment.yaml
kubectl apply -f 06-backend-service.yaml
kubectl apply -f 07-frontend-deployment.yaml
kubectl apply -f 08-frontend-service.yaml
kubectl apply -f 09-ingress.yaml
kubectl apply -f 10-backend-hpa.yaml
```

Ou tout déployer en une seule commande

```bash
kubectl apply -f .
```

#### 3. Accéder à l'application
Utiliser le port-forward (plus fiable que l'ingress en local) :

```bash
# Backend
kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000

# Frontend (dans un autre terminal)
kubectl port-forward -n smart-todo-app svc/frontend-service 3000:3000
```

Puis accéder à :
- Frontend : http://localhost:3000
- Backend : http://localhost:8000/health
- Documentation API : http://localhost:8000/docs


---

### Déploiement sur GCP (Production)

#### 1. Créer un cluster GKE

```bash
# Configurer gcloud
gcloud config set project VOTRE_PROJECT_ID

# Créer le cluster
gcloud container clusters create smart-todo-cluster \
  --zone=europe-west1-b \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=5

# Obtenir les credentials
gcloud container clusters get-credentials smart-todo-cluster --zone=europe-west1-b
```

#### 2. Déployer l'application

```bash
# Utiliser le script de déploiement automatique
./deploy.sh gcp
```

Le script va :
- Installer l'Ingress Controller NGINX pour GCP
- Déployer toutes les ressources Kubernetes
- Attendre l'assignation de l'IP externe

**Alternative manuelle** :

```bash
# Installer l'Ingress Controller NGINX
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Attendre que l'Ingress Controller soit prêt
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Déployer toutes les ressources
kubectl apply -f .
```

#### 3. Obtenir l'IP externe et configurer le DNS

```bash
# Attendre que l'IP externe soit assignée
kubectl get ingress -n smart-todo-app -w

# Une fois l'IP obtenue
export INGRESS_IP=$(kubectl get ingress smart-todo-app-ingress -n smart-todo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "IP de l'Ingress : $INGRESS_IP"
```

#### 4. Configurer le DNS

Option 1 : Ajouter à `/etc/hosts` pour tester
```bash
echo "$INGRESS_IP smart-todo-app.local" | sudo tee -a /etc/hosts
```

Option 2 : Configurer un vrai DNS (Production)
- Créer un enregistrement A dans votre DNS
- Pointer `smart-todo-app.votredomaine.com` vers `$INGRESS_IP`
- Modifier `09-ingress.yaml` pour utiliser votre domaine

#### 5. Accéder à l'application

- Frontend : http://smart-todo-app.local (ou votre domaine)
- Backend : http://smart-todo-app.local/health
- Documentation API : http://smart-todo-app.local/docs

---

## Vérifier le déploiement

```bash
# Vérifier les pods
kubectl get pods -n smart-todo-app

# Vérifier les services
kubectl get svc -n smart-todo-app

# Vérifier l'ingress
kubectl get ingress -n smart-todo-app

# Vérifier le HPA
kubectl get hpa -n smart-todo-app

# Vue d'ensemble complète
kubectl get all,pvc,ingress -n smart-todo-app

# Voir les détails d'un pod
kubectl describe pod <pod-name> -n smart-todo-app

# Voir les logs
kubectl logs <pod-name> -n smart-todo-app
```

---

## Tests de l'application

### Test avec curl

**Avec Port-Forward (Minikube)** :

```bash
# Démarrer le port-forward
kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000

# Test du backend
curl http://localhost:8000/health

# Créer une tâche
curl -X POST http://localhost:8000/create_task \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma première tâche",
    "description": "Test depuis Kubernetes",
    "priority": "high",
    "starred": false
  }'

# Lister les tâches
curl http://localhost:8000/get_task
```

**Via Ingress (GCP)** :

```bash
# Test du backend
curl http://smart-todo-app.local/health

# Créer une tâche
curl -X POST http://smart-todo-app.local/create_task \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma première tâche",
    "description": "Test depuis Kubernetes",
    "priority": "high",
    "starred": false
  }'

# Lister les tâches
curl http://smart-todo-app.local/get_task
```

---

## Tests du HPA (Autoscaling)

### Générer de la charge

```bash
# Lancer un pod de test
kubectl run -it --rm load-generator --image=busybox:1.35 -n smart-todo-app -- /bin/sh

# Dans le pod, exécuter :
while true; do wget -q -O- http://backend-service:8000/health; sleep 0.01; done

# niveau extra : Lancer plusieurs pods de test en parallèle
for i in {1..5}; do
  kubectl run load-generator-$i --image=busybox:1.35 -n smart-todo-app -- /bin/sh -c "while true; do wget -q -O- http://backend-service:8000/get_task >/dev/null 2>&1; done" &
done
```

### Observer le scaling

```bash
# Surveiller le HPA
kubectl get hpa -n smart-todo-app -w

# Surveiller les pods
kubectl get pods -n smart-todo-app -w

# Voir les métriques
kubectl top pods -n smart-todo-app
```


## Commandes utiles

### Gestion des pods

```bash
# Lister tous les pods
kubectl get pods -n smart-todo-app

# Voir les logs d'un pod
kubectl logs -f <pod-name> -n smart-todo-app

# Se connecter à un pod
kubectl exec -it <pod-name> -n smart-todo-app -- /bin/sh

# Redémarrer un deployment
kubectl rollout restart deployment/<deployment-name> -n smart-todo-app
```


### Vérifications

```bash
# Vérifier les ReplicaSets
kubectl get replicasets -n smart-todo-app

# Vérifier les PVC
kubectl get pvc -n smart-todo-app

# Vérifier les secrets
kubectl get secrets -n smart-todo-app

# Voir les événements
kubectl get events -n smart-todo-app --sort-by='.lastTimestamp'
```

---

## Test de persistance des données

### Test 1 : Vérifier la persistance PostgreSQL

```bash
# Créer des données via l'API
curl -X POST http://localhost:8000/create_task \
  -H "Content-Type: application/json" \
  -d '{"title": "Test persistance", "description": "Cette tâche doit survivre", "priority": "high"}'

# Supprimer le pod PostgreSQL
kubectl delete pod -l app=postgres -n smart-todo-app

# Attendre que le pod redémarre (quelques secondes)
kubectl get pods -n smart-todo-app -w

# Vérifier que les données sont toujours là
curl http://localhost:8000/get_task
```

### Test 2 : Tester le ReplicaSet

```bash
# Supprimer un pod backend
kubectl delete pod -l app=backend -n smart-todo-app --force

# Observer la recréation automatique
kubectl get pods -n smart-todo-app -w
```

---

## Nettoyage

### Supprimer toute l'application

```bash
# Supprimer le namespace complet
kubectl delete namespace smart-todo-app

# ou

# Utiliser le script de nettoyage
./cleanup.sh
```

### Supprimer uniquement certains composants

```bash
kubectl delete -f 10-backend-hpa.yaml
kubectl delete -f 09-ingress.yaml
# etc...
```

### Nettoyage Minikube complet

```bash
# Arrêter Minikube
minikube stop

# Supprimer Minikube (si nécessaire)
minikube delete
```

---

## Notes importantes

1. **Images Docker** : Les images sont disponibles publiquement sur Docker Hub (`ayyubmgc/smart-todo-backend` et `ayyubmgc/smart-todo-frontend`). Aucune action manuelle requise.

2. **Metrics Server** : Requis pour le HPA. Activé automatiquement par `deploy.sh` pour Minikube.

3. **Services ClusterIP** : Accessibles uniquement via Ingress ou port-forward, non exposés directement sur Internet.

4. **Communication Backend** : Le frontend communique avec le backend via `NEXT_PUBLIC_API_URL=http://backend-service:8000`.
