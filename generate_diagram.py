from graphviz import Digraph
import os

def create_k8s_architecture_diagram():
    """Crée un diagramme complet de l'architecture Kubernetes Todo App"""
    
    # Créer le graphe principal
    dot = Digraph(
        comment='Architecture Kubernetes - Todo App',
        format='png',
        engine='dot'
    )
    
    # Configuration du graphe
    dot.attr(rankdir='TB', splines='polyline', nodesep='1.0', ranksep='1.5')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='11')
    dot.attr('edge', fontname='Arial', fontsize='9', labeldistance='2.0', labelangle='0')
    
    # ============================================
    # UTILISATEUR
    # ============================================
    with dot.subgraph(name='cluster_user') as c:
        c.attr(style='dashed', color='gray', label='Utilisateur', fontsize='14')
        c.node('user', 'Utilisateur\n(Browser)', 
               shape='ellipse', fillcolor='#E8F4F8', color='#4A90E2')
    
    # ============================================
    # CLUSTER KUBERNETES
    # ============================================
    with dot.subgraph(name='cluster_k8s') as k8s:
        k8s.attr(style='filled', color='#326CE5', fillcolor='#E3F2FD', 
                 label='Cluster Kubernetes', fontsize='16', fontcolor='#326CE5')
        
        # NAMESPACE
        with k8s.subgraph(name='cluster_namespace') as ns:
            ns.attr(style='filled', color='#5C6BC0', fillcolor='#F5F5F5',
                    label='Namespace: smart-todo-app', fontsize='14')
            
            # ============================================
            # INGRESS
            # ============================================
            with ns.subgraph(name='cluster_ingress') as ing:
                ing.attr(rank='same')
                ing.node('ingress', 
                        'Ingress Controller\n(NGINX)\n\nHost: smart-todo-app.local\n\n'
                        'Routes:\n'
                        '/ → frontend:3000\n'
                        '/api → backend:8000\n'
                        '/create_task → backend:8000\n'
                        '/get_task → backend:8000',
                        fillcolor='#FFF59D', color='#F9A825', fontsize='10')
            
            # ============================================
            # SERVICES
            # ============================================
            with ns.subgraph(name='cluster_services') as svc:
                svc.attr(rank='same')
                svc.node('frontend_svc', 
                        'Service: frontend\nClusterIP\nPort: 3000',
                        fillcolor='#BBDEFB', color='#1976D2')
                svc.node('backend_svc', 
                        'Service: backend\nClusterIP\nPort: 8000',
                        fillcolor='#C8E6C9', color='#388E3C')
                svc.node('postgres_svc', 
                        'Service: postgres\nClusterIP\nPort: 5432',
                        fillcolor='#E1BEE7', color='#7B1FA2')
            
            # ============================================
            # DEPLOYMENTS & PODS
            # ============================================
            
            # FRONTEND
            with ns.subgraph(name='cluster_frontend') as fe:
                fe.attr(style='filled', color='#1976D2', fillcolor='#E3F2FD',
                        label='Deployment: frontend (Replicas: 2)', fontsize='12')
                fe.node('frontend_pod1', 
                       'Pod: frontend-1\n\n'
                       'Container: Next.js\n'
                       'Port: 3000\n\n'
                       'Resources:\n'
                       'CPU: 200m-500m\n'
                       'RAM: 256Mi-512Mi',
                       fillcolor='#90CAF9', color='#1976D2', fontsize='9')
                fe.node('frontend_pod2', 
                       'Pod: frontend-2\n\n'
                       'Container: Next.js\n'
                       'Port: 3000\n\n'
                       'Resources:\n'
                       'CPU: 200m-500m\n'
                       'RAM: 256Mi-512Mi',
                       fillcolor='#90CAF9', color='#1976D2', fontsize='9')
            
            # BACKEND
            with ns.subgraph(name='cluster_backend') as be:
                be.attr(style='filled', color='#388E3C', fillcolor='#E8F5E9',
                        label='Deployment: backend (Replicas: 2-10 HPA)', fontsize='12')
                be.node('backend_pod1', 
                       'Pod: backend-1\n\n'
                       'Init: wait-postgres\n\n'
                       'Container: FastAPI\n'
                       'Port: 8000\n\n'
                       'ENV from Secret:\n'
                       'DATABASE_URL\n\n'
                       'Resources:\n'
                       'CPU: 200m-500m\n'
                       'RAM: 256Mi-512Mi',
                       fillcolor='#A5D6A7', color='#388E3C', fontsize='9')
                be.node('backend_pod2', 
                       'Pod: backend-2\n\n'
                       'Init: wait-postgres\n\n'
                       'Container: FastAPI\n'
                       'Port: 8000\n\n'
                       'ENV from Secret:\n'
                       'DATABASE_URL\n\n'
                       'Resources:\n'
                       'CPU: 200m-500m\n'
                       'RAM: 256Mi-512Mi',
                       fillcolor='#A5D6A7', color='#388E3C', fontsize='9')
            
            # POSTGRES
            with ns.subgraph(name='cluster_postgres') as pg:
                pg.attr(style='filled', color='#7B1FA2', fillcolor='#F3E5F5',
                        label='Deployment: postgres (Replicas: 1)', fontsize='12')
                pg.node('postgres_pod', 
                       'Pod: postgres\n\n'
                       'Container: PostgreSQL 13\n'
                       'Port: 5432\n\n'
                       'ENV from Secret:\n'
                       'POSTGRES_USER\n'
                       'POSTGRES_PASSWORD\n'
                       'POSTGRES_DB\n\n'
                       'Volume Mount:\n'
                       '/var/lib/postgresql/data\n\n'
                       'Resources:\n'
                       'CPU: 250m-500m\n'
                       'RAM: 256Mi-512Mi',
                       fillcolor='#CE93D8', color='#7B1FA2', fontsize='9')
            
            # ============================================
            # RESSOURCES SUPPORT
            # ============================================
            
            # SECRET
            ns.node('secret', 
                   'Secret:\npostgres-secret\n\n'
                   'Data:\n'
                   '• POSTGRES_USER\n'
                   '• POSTGRES_PASSWORD\n'
                   '• POSTGRES_DB\n'
                   '• DATABASE_URL',
                   fillcolor='#FFCDD2', color='#C62828', fontsize='9',
                   shape='folder')
            
            # PVC
            ns.node('pvc', 
                   'PersistentVolumeClaim:\npostgres-pvc\n\n'
                   'Storage: 1Gi\n'
                   'AccessMode: RWO\n'
                   'StorageClass: standard',
                   fillcolor='#FFE0B2', color='#E65100', fontsize='9',
                   shape='cylinder')
            
            # HPA
            ns.node('hpa', 
                   'HorizontalPodAutoscaler:\nbackend-hpa\n\n'
                   'Target: backend\n'
                   'Min: 2, Max: 10\n\n'
                   'Metrics:\n'
                   '• CPU: 50%\n'
                   '• Memory: 70%',
                   fillcolor='#D1C4E9', color='#512DA8', fontsize='9',
                   shape='hexagon')
    
    # ============================================
    # CONNEXIONS
    # ============================================
    
    # User → Ingress
    dot.edge('user', 'ingress', 
            label='  HTTP\\nsmart-todo-app.local  ', 
            color='#4A90E2', penwidth='2', fontsize='10')
    
    # Ingress → Services
    dot.edge('ingress', 'frontend_svc', 
            label='  /  ', 
            color='#1976D2', penwidth='1.5', fontsize='9')
    dot.edge('ingress', 'backend_svc', 
            label='  /api\\n/create_task\\n/get_task\\n/task  ', 
            color='#388E3C', penwidth='1.5', fontsize='9')
    
    # Services → Pods (Frontend)
    dot.edge('frontend_svc', 'frontend_pod1', 
            label='  Load Balance  ', 
            color='#1976D2', style='dashed', fontsize='8')
    dot.edge('frontend_svc', 'frontend_pod2', 
            label='  Load Balance  ', 
            color='#1976D2', style='dashed', fontsize='8')
    
    # Services → Pods (Backend)
    dot.edge('backend_svc', 'backend_pod1', 
            label='  Load Balance  ', 
            color='#388E3C', style='dashed', fontsize='8')
    dot.edge('backend_svc', 'backend_pod2', 
            label='  Load Balance  ', 
            color='#388E3C', style='dashed', fontsize='8')
    
    # Services → Pods (Postgres)
    dot.edge('postgres_svc', 'postgres_pod', 
            label='  TCP:5432  ', 
            color='#7B1FA2', style='dashed', fontsize='8')
    
    # Backend → Postgres Service
    dot.edge('backend_pod1', 'postgres_svc', 
            label='  SQL\\nQueries  ', 
            color='#7B1FA2', penwidth='1.5', fontsize='9')
    dot.edge('backend_pod2', 'postgres_svc', 
            label='  SQL\\nQueries  ', 
            color='#7B1FA2', penwidth='1.5', fontsize='9')
    
    # Secret → Pods
    dot.edge('secret', 'backend_pod1', 
            label='  ENV\\nInjection  ', 
            color='#C62828', style='dotted', fontsize='8')
    dot.edge('secret', 'backend_pod2', 
            label='  ENV\\nInjection  ', 
            color='#C62828', style='dotted', fontsize='8')
    dot.edge('secret', 'postgres_pod', 
            label='  ENV\\nInjection  ', 
            color='#C62828', style='dotted', fontsize='8')
    
    # PVC → Postgres
    dot.edge('pvc', 'postgres_pod', 
            label='  Volume\\nMount  ', 
            color='#E65100', penwidth='2', fontsize='9')
    
    # HPA → Backend Deployment (conceptuel)
    dot.edge('hpa', 'backend_pod1', 
            label='  Monitors &\\nScales  ', 
            color='#512DA8', style='dotted', constraint='false', 
            fontsize='9', labelfloat='true')
    dot.edge('hpa', 'backend_pod2', 
            label='', 
            color='#512DA8', style='dotted', constraint='false')
    
    return dot


def create_flow_diagram():
    """Crée un diagramme de flux de requête détaillé"""
    
    flow = Digraph(
        comment='Flow de requête API',
        format='png',
        engine='dot'
    )
    
    flow.attr(rankdir='TB', splines='ortho')
    flow.attr('node', shape='box', style='rounded,filled', fontname='Arial')
    
    # Définir les étapes du flow
    steps = [
        ('1', 'Utilisateur\nPOST /create_task', '#E8F4F8'),
        ('2', 'Ingress Controller\nRoute vers backend-service', '#FFF59D'),
        ('3', 'Service Backend\nLoad Balancing', '#C8E6C9'),
        ('4', 'Pod Backend\nValidation + SQL Query', '#A5D6A7'),
        ('5', 'Service Postgres\nConnexion TCP:5432', '#E1BEE7'),
        ('6', 'Pod Postgres\nINSERT dans la DB', '#CE93D8'),
        ('7', 'Réponse SQL\nRow créée (id: 1)', '#CE93D8'),
        ('8', 'Réponse JSON\n{id: 1, title: ...}', '#A5D6A7'),
        ('9', 'Réponse HTTP 201\nvia Ingress', '#FFF59D'),
        ('10', 'Utilisateur\nReçoit la réponse', '#E8F4F8'),
    ]
    
    # Créer les nœuds
    for step_id, label, color in steps:
        flow.node(step_id, label, fillcolor=color)
    
    # Créer les connexions
    for i in range(len(steps) - 1):
        flow.edge(steps[i][0], steps[i+1][0], penwidth='2')
    
    return flow


def create_hpa_diagram():
    """Crée un diagramme explicatif du HPA"""
    
    hpa = Digraph(
        comment='HPA Autoscaling Process',
        format='png',
        engine='dot'
    )
    
    hpa.attr(rankdir='TB')
    hpa.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='10')
    
    # Étapes du scaling
    hpa.node('metrics', 
            'Metrics Server\n\nCollecte toutes les 15s:\n• CPU: 75% (seuil: 50%)\n• Memory: 60% (seuil: 70%)',
            fillcolor='#BBDEFB')
    
    hpa.node('hpa_ctrl', 
            'HPA Controller\n\nCalcule le besoin:\n'
            'Replicas = 2 × (75% / 50%) = 3\n'
            'Décision: Scale 2 → 3 pods',
            fillcolor='#D1C4E9')
    
    hpa.node('deploy', 
            'Deployment Controller\n\nMet à jour le ReplicaSet:\nreplicas: 3',
            fillcolor='#C8E6C9')
    
    hpa.node('rs', 
            'ReplicaSet Controller\n\nCrée un nouveau pod:\nbackend-3',
            fillcolor='#A5D6A7')
    
    hpa.node('pod', 
            'Nouveau Pod\n\nInit Container → Main Container\n→ Health Checks → Ready',
            fillcolor='#81C784')
    
    hpa.node('service', 
            'Service Backend\n\nAjoute le nouveau pod:\n'
            'Endpoints: backend-1, backend-2, backend-3',
            fillcolor='#66BB6A')
    
    # Connexions
    hpa.edge('metrics', 'hpa_ctrl', label='CPU > 50%', penwidth='2')
    hpa.edge('hpa_ctrl', 'deploy', label='Update replicas', penwidth='2')
    hpa.edge('deploy', 'rs', label='Create pod', penwidth='2')
    hpa.edge('rs', 'pod', label='Schedule', penwidth='2')
    hpa.edge('pod', 'service', label='Register', penwidth='2')
    
    return hpa


def create_persistence_diagram():
    """Crée un diagramme de test de persistance"""
    
    persist = Digraph(
        comment='Test de persistance',
        format='png',
        engine='dot'
    )
    
    persist.attr(rankdir='LR')
    persist.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='9')
    
    # État initial
    with persist.subgraph(name='cluster_before') as before:
        before.attr(label='État Initial', fontsize='12')
        before.node('pod1', 'Pod: postgres-abc\n\nRunning\n50 rows in DB', fillcolor='#CE93D8')
        before.node('pvc1', 'PVC: postgres-pvc\n\n1Gi\n50 rows stored', 
                   fillcolor='#FFE0B2', shape='cylinder')
        before.edge('pod1', 'pvc1', label='mounted')
    
    # Action
    persist.node('action', 
                'kubectl delete pod\npostgres-abc', 
                fillcolor='#FFCDD2', shape='ellipse')
    
    # État après
    with persist.subgraph(name='cluster_after') as after:
        after.attr(label='État Final', fontsize='12')
        after.node('pod2', 'Pod: postgres-xyz\n(nouveau)\n\nRunning\n50 rows in DB ✓', 
                  fillcolor='#A5D6A7')
        after.node('pvc2', 'PVC: postgres-pvc\n(même PVC!)\n\n1Gi\n50 rows intact ✓', 
                  fillcolor='#FFE0B2', shape='cylinder')
        after.edge('pod2', 'pvc2', label='mounted\n(same PVC)')
    
    # Connexions
    persist.edge('pvc1', 'action', style='invis')
    persist.edge('action', 'pod2', label='Deployment crée\nnouveau pod', penwidth='2')
    persist.edge('pvc1', 'pvc2', label='Données\npersistées ✓', 
                penwidth='3', color='green')
    
    return persist


def main():
    """Génère tous les diagrammes"""
    
    print("Génération des diagrammes d'architecture Kubernetes...")
    
    output_dir = 'diagrams'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Dossier '{output_dir}' créé")
    
    diagrams = [
        ('architecture_complete', create_k8s_architecture_diagram(), 
         'Architecture complète de l\'application'),
        ('flow_requete', create_flow_diagram(), 
         'Flow d\'une requête API'),
        ('hpa_autoscaling', create_hpa_diagram(), 
         'Processus d\'autoscaling HPA'),
        ('persistence_test', create_persistence_diagram(), 
         'Test de persistance des données'),
    ]
    
    for filename, diagram, description in diagrams:
        filepath = os.path.join(output_dir, filename)
        diagram.render(filepath, cleanup=True)
        print(f"✓ {description}: {filepath}.png")


if __name__ == "__main__":
    main()
