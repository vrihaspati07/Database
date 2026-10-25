# Hind DB 🇮🇳

<p align="center">
  <strong>The Sovereign Cloud Database & Real-Time Backend Platform Built for High-Scale Applications</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/Region-AWS_Sovereign_(ap--south--1)-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS Sovereign Region" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Documentation & Guides](#-documentation--guides)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [Production Deployment](#-production-deployment)
- [API Reference](#-api-reference)
- [Telemetry & Observability](#-telemetry--observability)
- [License & Copyright](#-license--copyright)

---

## 🌟 Overview

**Hind DB** is an open, sovereign backend-as-a-service (BaaS) and cloud database engineered to power mission-critical web and mobile applications. Built ground-up for extreme reliability, sub-millisecond query performance, and strict data sovereignty compliance (India DPDP Act 2026), Hind DB consolidates everything modern developers need into one unified platform:

- **PostgreSQL 16 Engine** with instant table management and dynamic JSONB query indexing.
- **Real-Time Data Sync** with Redis 7 pub/sub broadcasting.
- **Enterprise Authentication** with multi-tenant Row Level Security (RLS), email verification, and OAuth 2.0.
- **Integrated S3 Storage** powered by MinIO with automatic CDN pre-signing.
- **Serverless Edge Functions** with microsecond execution latency.
- **Production Kubernetes Readiness** with battle-tested manifests for AWS EKS (`ap-south-1`).

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🗄️ **SQL Studio & Table Designer** | Intuitive visual table creator, schema migrations, and interactive query workbench with live syntax highlighting. |
| ⚡ **Supersonic Latency** | Optimized connection pooling and distributed Redis caching for sub-millisecond reads in AWS Sovereign Cloud (`ap-south-1`). |
| 🔐 **Built-in Auth & RLS** | Robust JWT authentication, password hashing, MFA support, and granular Row Level Security isolating tenant data. |
| 📦 **S3-Compatible Object Store** | MinIO multi-tenant file and asset storage with presigned URLs, MIME filtering, and metadata indexing. |
| ⚡ **Serverless Edge Functions** | Deploy and execute TypeScript/JavaScript edge workers triggered via HTTP, cron, or database events. |
| 📊 **Observability & Telemetry** | Native Prometheus `/metrics` scraping, Grafana dashboards, and real-time health inspection. |
| 🇮🇳 **DPDP Act 2026 Sovereign Compliance** | Complete data residency inside Indian borders with immutable cryptographic audit logging. |

---

## 🏗️ Architecture

```
                             +----------------------------------------+
                             |       End Users & Client SDKs          |
                             +----------------------------------------+
                                                 |
                                                 | HTTPS / WSS (TLS 1.3)
                                                 v
                             +----------------------------------------+
                             |        Application Load Balancer       |
                             +----------------------------------------+
                                       /                    \
                                      /                      \
                        [Port 80 / 443]                      [Port 3000 / 4000]
                                     /                        \
                                    v                          v
                     +---------------------------+   +-------------------------------+
                     |   Frontend Web Console    |   |      Backend Core API         |
                     | (React 19 + Vite + Nginx) |   |  (Node.js / Express Cluster)  |
                     +---------------------------+   +-------------------------------+
                                                                 |
               +--------------------+----------------------------+-----------------------+
               |                    |                            |                       |
               v                    v                            v                       v
     +--------------------+ +--------------------+     +--------------------+  +--------------------+
     |   PostgreSQL 16    | |   Redis 7 Cluster  |     |   MinIO / AWS S3   |  |     Bull Queue     |
     | Relational + JSONB | | Cache & Pub/Sub    |     | Object Storage     |  | Async Background   |
     +--------------------+ +--------------------+     +--------------------+  +--------------------+
```

---

## 💻 Tech Stack

### Frontend Console
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 6, Oxlint
- **Styling**: Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Deployment**: Nginx Alpine Docker container

### Backend Engine
- **Runtime**: Node.js 18+ / Express.js 5
- **Database**: PostgreSQL 16 (pg-pool, parameterized queries, JSONB indexing)
- **Cache & Real-Time**: Redis 7 (ioredis)
- **Object Storage**: MinIO S3 SDK
- **Job Queue**: Bull Queue (Redis-backed)
- **Monitoring**: Prometheus client (`prom-client`), Grafana

### DevOps & Cloud
- **Containers**: Multi-stage Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`)
- **Orchestration**: Docker Compose, Kubernetes (AWS EKS v1.30+)
- **Region**: AWS Sovereign Region (`ap-south-1`)
- **CI/CD**: GitHub Actions

---

## 📂 Repository Structure

```
Database/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD automated deployment workflow
├── docs/
│   ├── ARCHITECTURE.md            # Detailed architecture, security & scaling deep dive
│   ├── API_REFERENCE.md           # Complete REST API specification
│   └── LOCAL_SETUP.md             # Developer local setup guide
├── k8s/                           # Production Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── server/                        # Backend Node.js / Express API engine
│   ├── config/                    # Database, Redis, MinIO & Queue configs
│   ├── controllers/               # Auth, Database, Storage & Metrics handlers
│   ├── db/                        # SQL schemas and migration runners
│   ├── middleware/                # Auth, Rate limiting, Error & Metrics middleware
│   ├── monitoring/                # Prometheus & Grafana configs & dashboards
│   ├── routes/                    # API route definitions
│   └── index.js                   # Backend entry point
├── src/                           # Frontend React 19 web application
│   ├── components/                # UI components, SQL editor, Modals & Layouts
│   ├── context/                   # Global auth and tenant context
│   ├── pages/                     # Console, Auth & Dashboard views
│   ├── services/                  # API client services
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Frontend entry point
├── DEPLOYMENT_GUIDE.md            # Complete AWS EKS & production operations guide
├── docker-compose.yml             # Local multi-service Docker Compose stack
├── Dockerfile.backend             # Production backend container definition
├── Dockerfile.frontend            # Production frontend container definition
├── nginx.conf                     # Production Nginx reverse proxy configuration
├── package.json                   # Workspace dependencies and scripts
└── vite.config.ts                 # Vite bundler configuration
```

---

## 📚 Documentation & Guides

- 📘 [**Local Development Setup Guide**](docs/LOCAL_SETUP.md)
- 📐 [**System Architecture & Security Design**](docs/ARCHITECTURE.md)
- 🔌 [**API Reference Specification**](docs/API_REFERENCE.md)
- 🚢 [**AWS EKS Production Deployment Guide**](DEPLOYMENT_GUIDE.md)

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/vrihaspati07/Database.git
cd Database
npm install
cp .env.example .env
```

### 2. Start Services via Docker Compose
```bash
docker compose up -d postgres redis minio
```

### 3. Run Migrations & Start App
```bash
# Apply schema and initial seed data
npm run migrate:up

# Terminal 1: Run Backend API
node server/index.js

# Terminal 2: Run Frontend Web Console
npm run dev
```

Visit **http://localhost:5173** to access the Hind DB Developer Console!

---

## 🔐 Authentication Setup

Hind DB features a sovereign, self-hosted authentication engine built with **Argon2id** password hashing, **Redis-backed token rotation**, and **Google OAuth 2.0** via `google-auth-library`.

### 1. Environment Variables Configuration

Copy `.env.example` to `.env` and configure the following variables:

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 16 connection string | `postgresql://hind_admin:hind_secure_pass_2026@localhost:5432/hind_db_production` |
| `REDIS_URL` | Redis 7 connection string | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret key for signing 15-minute JWT access tokens | Strong 256-bit random secret |
| `FRONTEND_URL` | Base URL of frontend web app | `http://localhost:5173` |
| `BACKEND_URL` | Base URL of backend Express API | `http://localhost:4000` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 Web Client ID | `your-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret | `your-client-secret` |
| `GOOGLE_REDIRECT_URI` | Google OAuth authorized callback URI | `http://localhost:4000/auth/google/callback` |
| `SMTP_HOST` | Outgoing SMTP server hostname | `smtp.gmail.com` *(optional in dev)* |
| `SMTP_PORT` | Outgoing SMTP port (587 or 465) | `587` |
| `SMTP_USER` | SMTP username / account email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password / app password | `your-app-password` |
| `MAIL_FROM` | Default sender header | `"Hind DB" <noreply@hind.io>` |

> **Development Mode Mailbox**: If `SMTP_HOST` is left blank in development (`NODE_ENV=development`), verification and password reset links are automatically printed to the terminal console for instant testing.

### 2. Google Cloud OAuth 2.0 Setup

To enable Google Sign-In:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one (e.g. `hind-db-auth`).
3. Go to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type.
   - Enter your App name (`Hind DB`) and developer contact emails.
   - Add scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Hind DB Web Client`.
   - **Authorized JavaScript origins**: `http://localhost:5173`, `http://localhost:4000`.
   - **Authorized redirect URIs**: `http://localhost:4000/auth/google/callback`.
5. Copy the generated **Client ID** and **Client Secret** into your `.env` file.

### 3. Running Database Migrations

Hind DB database schemas use `citext` for case-insensitive email indexes, UUID primary keys, and dedicated OAuth account link tables:

```bash
# Apply all pending migrations (up)
npm run migrate:up

# Rollback last migration (down)
npm run migrate:down

# Or run via node-pg-migrate CLI directly:
npm run migrate:pg:up
npm run migrate:pg:down
```

---

## 🚢 Production Deployment

For complete instructions on deploying to **AWS Elastic Kubernetes Service (EKS)** in Sovereign Region (`ap-south-1`):

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full AWS CLI, ECR, and rollback steps.

---

## 🔌 API Reference

| Route | Method | Description |
|---|---|---|
| `/api/v1/auth/signup` | `POST` | Register developer account |
| `/api/v1/auth/login` | `POST` | Authenticate & retrieve JWT |
| `/api/v1/auth/me` | `GET` | Retrieve authenticated profile |
| `/api/v1/databases` | `GET` | List tenant database clusters |
| `/api/v1/databases` | `POST` | Create a new database cluster |
| `/api/v1/databases/:id/query` | `POST` | Execute raw SQL statements |
| `/api/v1/databases/:id/storage`| `GET` | List storage files and assets |
| `/health` | `GET` | Cluster liveness and readiness probe |
| `/metrics` | `GET` | Prometheus telemetry metrics export |

For complete payloads and examples, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

---

## 📊 Telemetry & Observability

- **Metrics Scrape Endpoint**: `http://localhost:4000/metrics`
- **Health Check**: `http://localhost:4000/health`
- **Grafana Dashboard Provisioning**: Included in [`server/monitoring/grafana/`](server/monitoring/grafana/)

---

## 📄 License & Copyright

Copyright © 2026 Hind. A **Hind India Private Limited** Company. All rights reserved.  
Licensed under the Apache 2.0 / Proprietary Sovereign Cloud Software License.
