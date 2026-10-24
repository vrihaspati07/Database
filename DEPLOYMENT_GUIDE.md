# Hind DB - Complete Production Deployment & Operations Guide

> **Product**: Hind DB  
> **Company**: Hind India Private Limited  
> **Region**: AWS Sovereign Region (`ap-south-1`)  
> **Copyright**: © 2026 Hind. A Hind India Private Limited Company.

---

## 1. Architecture Overview

- **Cloud Platform**: AWS (Sovereign Region `ap-south-1`)
- **Container Orchestration**: AWS Elastic Kubernetes Service (EKS v1.30+)
- **Container Registry**: Amazon Elastic Container Registry (ECR)
- **Ingress Controller**: AWS Application Load Balancer (ALB) Controller with ACM TLS/SSL
- **Database**: High-Availability Managed PostgreSQL 16 Cluster
- **Cache & Message Broker**: Redis 7 Cluster
- **Blob / Object Storage**: MinIO / Amazon S3 (`ap-south-1`)
- **Monitoring & Telemetry**: Prometheus (`/metrics`) + Grafana Dashboard + Prometheus Alertmanager
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **CI/CD**: GitHub Actions

---

## 2. Step-by-Step Deployment Guide

### Step 1: Authenticate with AWS & ECR (`ap-south-1`)

```bash
# 1. Configure AWS CLI with sovereign region
export AWS_REGION="ap-south-1"
export AWS_ACCOUNT_ID="123456789012"
aws configure set region $AWS_REGION

# 2. Create ECR repositories if not already created
aws ecr create-repository --repository-name hind-db-backend --region $AWS_REGION
aws ecr create-repository --repository-name hind-db-frontend --region $AWS_REGION

# 3. Authenticate Docker with ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

---

### Step 2: Build & Push Production Docker Containers

```bash
# Build & Push Backend Container (Node.js 18 on Port 3000)
docker build -f Dockerfile.backend -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/hind-db-backend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/hind-db-backend:latest

# Build & Push Frontend Container (React 18 + Vite + Nginx on Port 80)
docker build -f Dockerfile.frontend -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/hind-db-frontend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/hind-db-frontend:latest
```

---

### Step 3: Run Database Migrations & Seeds

```bash
# Apply initial tables, RLS policies, and seed superuser data
node server/db/migrations/migrate.js up
```

---

### Step 4: Apply Kubernetes Manifests to AWS EKS

```bash
# 1. Connect to EKS Cluster
aws eks update-kubeconfig --name hind-db-cluster-sovereign --region ap-south-1

# 2. Apply Namespace, ConfigMap & Secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Deploy Backend & Frontend Services
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 4. Deploy Ingress (AWS ALB) and Horizontal Pod Autoscaler (HPA)
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# 5. Verify Zero-Downtime Rollout
kubectl rollout status deployment/hind-db-backend -n hind-db
kubectl rollout status deployment/hind-db-frontend -n hind-db
```

---

## 3. Rollback Procedure

### A. Instant Kubernetes Workload Rollback

If a bad deployment is detected, revert instantly to the previous stable revision:

```bash
# Rollback Backend deployment to previous replica revision
kubectl rollout undo deployment/hind-db-backend -n hind-db

# Rollback Frontend deployment
kubectl rollout undo deployment/hind-db-frontend -n hind-db

# Check rollout history
kubectl rollout history deployment/hind-db-backend -n hind-db
```

### B. Database Schema Rollback

To revert a database migration:

```bash
node server/db/migrations/migrate.js down
```

---

## 4. Scaling Configuration

### A. Horizontal Pod Autoscaler (HPA)

The API automatically scales between **3 and 20 pods** based on CPU/Memory load:

```yaml
minReplicas: 3
maxReplicas: 20
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 75
```

### B. Manual Instant Scale-Up for High-Traffic Events (e.g. Diwali Sale)

```bash
kubectl scale deployment/hind-db-backend --replicas=15 -n hind-db
kubectl scale deployment/hind-db-frontend --replicas=10 -n hind-db
```

---

## 5. Monitoring, Telemetry & Logging

- **Prometheus Scrape Endpoint**: `https://api.hind.io/metrics`
- **Health Check Endpoint**: `https://api.hind.io/health`
- **Grafana Dashboards**: Port `3000` via internal VPN / SSO (Dashboard UID: `hind-db-cluster-telemetry`).
- **Prometheus Alert Rules**: Located in [`server/monitoring/alert_rules.yml`](file:///Users/vrihaspatichaubey/Desktop/Database/server/monitoring/alert_rules.yml).
