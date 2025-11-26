# Projet Kubernetes - Smart Todo App

App Todo smart, piloté par NLP déployée avec Kubernetes, Minikube et GCP.

## Construction des images Docker

### Option 1 : Pour Minikube (Local)

```bash
cd docker-project-master

# Builder les images localement (avec --network=host si problème DNS)
docker build --network=host -t smart-todo-backend:latest -f backend/Dockerfile .
docker build --network=host -t smart-todo-frontend:latest -f frontend/Dockerfile .

# Charger les images dans Minikube
minikube image load smart-todo-backend:latest
minikube image load smart-todo-frontend:latest
```

> **Note** : Les deployments utilisent `imagePullPolicy: Never` pour Minikube.

### Option 2 : Pour GCP/Production (Docker Hub)

```bash
cd docker-project-master

# Builder et pousser sur Docker Hub
docker build --network=host -t VOTRE_USERNAME/smart-todo-backend:latest -f backend/Dockerfile .
docker build --network=host -t VOTRE_USERNAME/smart-todo-frontend:latest -f frontend/Dockerfile .

docker push VOTRE_USERNAME/smart-todo-backend:latest
docker push VOTRE_USERNAME/smart-todo-frontend:latest
```

Puis modifier les deployments :
- `05-backend-deployment.yaml` : Remplacer `image: smart-todo-backend:latest` par `image: VOTRE_USERNAME/smart-todo-backend:latest`
- `07-frontend-deployment.yaml` : Remplacer `image: smart-todo-frontend:latest` par `image: VOTRE_USERNAME/smart-todo-frontend:latest`
- Retirer ou commenter `imagePullPolicy: Never` dans les deux fichiers

---

## 📦 Déploiement

### Déploiement sur Minikube (Local)

#### 1. Démarrer et configurer Minikube

```bash
# Démarrer Minikube
minikube start

# Activer les addons nécessaires
minikube addons enable ingress
minikube addons enable metrics-server

# Vérifier que Minikube fonctionne
minikube status
```

#### 2. Charger les images Docker (si pas sur Docker Hub)

```bash
# Charger les images dans Minikube
minikube image load smart-todo-backend:latest
minikube image load smart-todo-frontend:latest

# Vérifier que les images sont chargées
minikube ssh -- docker images | grep smart-todo
```

#### 3. Déployer l'application

```bash
cd k8s-project

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

**Ou en une seule commande** :
```bash
kubectl apply -f .
```

#### 4. Configurer l'accès local

```bash
# Ajouter l'entrée dans /etc/hosts
echo "$(minikube ip) smart-todo-app.local" | sudo tee -a /etc/hosts

# Lancer le tunnel Minikube (dans un terminal séparé)
minikube tunnel
```

#### 5. Accéder à l'application

**Option A : Via Port-Forward (Recommandé pour le développement)**

```bash
# Backend
kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000

# Frontend (dans un autre terminal)
kubectl port-forward -n smart-todo-app svc/frontend-service 3000:3000
```

Puis accéder à :
- Backend : http://localhost:8000/health
- Frontend : http://localhost:3000

**Option B : Via Ingress**

Après avoir lancé `minikube tunnel` :
- Frontend : http://smart-todo-app.local
- Backend : http://smart-todo-app.local/health

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

#### 2. Installer l'Ingress Controller NGINX

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Attendre que l'Ingress Controller soit prêt
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

#### 3. Déployer l'application

```bash
cd k8s-project

# Déployer toutes les ressources
kubectl apply -f .
```

#### 4. Obtenir l'IP externe de l'Ingress

```bash
# Attendre que l'IP externe soit assignée
kubectl get ingress -n smart-todo-app -w

# Une fois l'IP obtenue
export INGRESS_IP=$(kubectl get ingress smart-todo-app-ingress -n smart-todo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "IP de l'Ingress : $INGRESS_IP"
```

#### 5. Configurer le DNS

Option 1 : Ajouter à `/etc/hosts` pour tester
```bash
echo "$INGRESS_IP smart-todo-app.local" | sudo tee -a /etc/hosts
```

Option 2 : Configurer un vrai DNS (Production)
- Créer un enregistrement A dans votre DNS
- Pointer `smart-todo-app.votredomaine.com` vers `$INGRESS_IP`
- Modifier `09-ingress.yaml` pour utiliser votre domaine

#### 6. Accéder à l'application

- Frontend : http://smart-todo-app.local (ou votre domaine)
- Backend : http://smart-todo-app.local/health

---

### Vérifier le déploiement

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

## 🌐 Tests de l'application

### Test avec curl (Minikube - Port Forward)

```bash
# Démarrer le port-forward
kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000

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

### Test avec curl (GCP - Via Ingress)

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
while true; do wget -q -O- http://backend-service:8000/health; done
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

---

## 🌐 Accès à l'application

### Configuration du fichier hosts (GCP uniquement)

L'ingress utilise le host `smart-todo-app.local`. Pour GCP, ajoutez cette entrée à votre `/etc/hosts` :

```bash
# Récupérer l'IP de l'Ingress
kubectl get ingress -n smart-todo-app

# Ajouter au fichier hosts
echo "<INGRESS_IP> smart-todo-app.local" | sudo tee -a /etc/hosts
```

### Accès via navigateur (GCP)

- **Frontend** : http://smart-todo-app.local
- **API Backend** : http://smart-todo-app.local/health
- **Documentation API** : http://smart-todo-app.local/docs

### Port-forward pour Minikube

Pour Minikube, utilisez le port-forward (plus fiable que l'ingress en local) :

```bash
# Backend
kubectl port-forward -n smart-todo-app svc/backend-service 8000:8000

# Frontend (dans un autre terminal)
kubectl port-forward -n smart-todo-app svc/frontend-service 3000:3000
```

Puis accédez à :
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

---

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

### Scaling manuel

```bash
# Scaler le backend
kubectl scale deployment backend --replicas=5 -n smart-todo-app

# Scaler le frontend
kubectl scale deployment frontend --replicas=3 -n smart-todo-app
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

## 🧪 Test de persistance des données

### Test 1 : Vérifier la persistance PostgreSQL

```bash
# Créer des données via l'API (Minikube)
curl -X POST http://localhost:8000/create_task \
  -H "Content-Type: application/json" \
  -d '{"title": "Test persistance", "description": "Cette tâche doit survivre", "priority": "high"}'

# Créer des données via l'API (GCP)
curl -X POST http://smart-todo-app.local/create_task \
  -H "Content-Type: application/json" \
  -d '{"title": "Test persistance", "description": "Cette tâche doit survivre", "priority": "high"}'

# Supprimer le pod PostgreSQL
kubectl delete pod -l app=postgres -n smart-todo-app

# Attendre que le pod redémarre (quelques secondes)
kubectl get pods -n smart-todo-app -w

# Vérifier que les données sont toujours là (Minikube)
curl http://localhost:8000/get_task

# Vérifier que les données sont toujours là (GCP)
curl http://smart-todo-app.local/get_task
```

### Test 2 : Tester le ReplicaSet

```bash
# Supprimer un pod backend
kubectl delete pod -l app=backend -n smart-todo-app --force

# Observer la recréation automatique
kubectl get pods -n smart-todo-app -w
```

---

## 🗑️ Nettoyage

### Supprimer toute l'application

```bash
# Méthode 1 : Supprimer le namespace complet
kubectl delete namespace smart-todo-app

# Méthode 2 : Utiliser le script de nettoyage
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

1. **Les images Docker doivent être accessibles** : Assurez-vous que les images sont soit :
   - Pushées sur Docker Hub (publiques ou privées avec imagePullSecrets)
   - Chargées dans Minikube : `minikube image load <image-name>`

2. **Metrics Server requis pour le HPA** : Sans lui, le HPA ne fonctionnera pas.

3. **Les services sont en ClusterIP** : Ils ne sont accessibles que via l'Ingress, donc non exposés directement sur Internet.

4. **Le frontend doit pouvoir communiquer avec le backend** : L'environnement `NEXT_PUBLIC_API_URL` doit pointer vers `backend-service`.
