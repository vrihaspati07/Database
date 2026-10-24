# Hind DB - Architecture & System Design

> **Product**: Hind DB  
> **Company**: Hind India Private Limited  
> **Region**: AWS Sovereign Region (`ap-south-1`)  
> **Compliance**: DPDP Act (India 2026), ISO 27001, SOC 2 Type II  
> **Copyright**: © 2026 Hind. A Hind India Private Limited Company.

---

## 1. Executive Summary

Hind DB is a sovereign, high-performance database and backend application platform engineered specifically for modern engineering teams. It brings together relational data modeling (PostgreSQL 16), ultra-fast caching (Redis 7), high-throughput distributed object storage (MinIO/S3), real-time pub/sub synchronization, serverless edge function execution, and enterprise-grade observability (Prometheus/Grafana) into a unified platform with sub-millisecond edge latency in India and worldwide.

---

## 2. High-Level Architecture Diagram

```
                             +----------------------------------------+
                             |           End Users / Clients          |
                             | (Web Browser / Mobile App / CLI / SDK) |
                             +----------------------------------------+
                                                 |
                                                 | HTTPS / WSS (TLS 1.3)
                                                 v
                             +----------------------------------------+
                             |      AWS Application Load Balancer     |
                             |    (ACM SSL Termination - ap-south-1)  |
                             +----------------------------------------+
                                       /                    \
                                      /                      \
                        [Port 80 / 443]                      [Port 3000 / 4000]
                                     /                        \
                                    v                          v
                     +---------------------------+   +-------------------------------+
                     |   Frontend Web Cluster    |   |     Backend API Engine        |
                     | (React 19 + Vite + Nginx) |   |  (Node.js / Express Cluster)  |
                     |  - Developer Studio UI    |   |  - Auth & MFA Middleware      |
                     |  - SQL Editor / Query UI  |   |  - Row-Level Security (RLS)   |
                     |  - Storage File Browser   |   |  - Dynamic Query Engine       |
                     |  - Edge Functions Editor  |   |  - Telemetry & Prometheus     |
                     +---------------------------+   +-------------------------------+
                                                                 |
               +--------------------+----------------------------+-----------------------+
               |                    |                            |                       |
               v                    v                            v                       v
     +--------------------+ +--------------------+     +--------------------+  +--------------------+
     |   PostgreSQL 16    | |   Redis 7 Cluster  |     |   MinIO / AWS S3   |  |     Bull Queue     |
     |  Relational Store  | | In-Memory Cache &  |     |   Object Storage   |  | Asynchronous Jobs, |
     |  JSONB Live Engine | | Pub/Sub Broadcast  |     | Media, Assets, Blobs| | Webhooks & Emails  |
     +--------------------+ +--------------------+     +--------------------+  +--------------------+
               |                    |                            |                       |
               +--------------------+----------------------------+-----------------------+
                                                 |
                                                 v
                                   +---------------------------+
                                   |   Prometheus & Grafana    |
                                   |  - Metrics Scraping       |
                                   |  - Cluster Telemetry      |
                                   |  - Automated Alertmanager |
                                   +---------------------------+
```

---

## 3. Core Subsystems

### 3.1. Compute & Application Layer
- **Frontend Layer**:
  - React 19, TypeScript, Vite, Tailwind CSS 4, and Lucide React.
  - Features real-time state management, interactive SQL querying, schema visualizer, file management console, and developer metrics dashboard.
  - Packaged via multi-stage Docker build served through high-performance Nginx with gzip/brotli compression and security headers.
- **Backend API Layer**:
  - Node.js Express service built with modular separation of concerns (`routes`, `controllers`, `services`, `middleware`, `models`).
  - Strict input validation, sanitized SQL execution, and JWT/MFA authentication guards.

### 3.2. Data Persistence Layer (PostgreSQL 16)
- **Tables & Relational Metadata**: Fully normalized relational schema managing users, databases, tables, schema definitions, API keys, team memberships, and audit logs.
- **Dynamic JSONB Row Store**: High-performance JSONB storage engine supporting ad-hoc schema fields, indexing via GIN indexes, and sub-millisecond query evaluation.
- **Row-Level Security (RLS)**: Enforced multi-tenant isolation guaranteeing zero cross-tenant leakage.

### 3.3. Cache & Message Broker (Redis 7)
- **Distributed Session Cache**: In-memory caching for session tokens, permissions, and database connection pooling.
- **Real-Time Pub/Sub**: Real-time event broadcasting for live database changes, query notifications, and user collaboration.
- **Distributed Rate Limiting**: Token bucket algorithm preventing abuse and DDoS attacks.

### 3.4. Object Storage (MinIO / S3)
- Multi-tenant S3-compliant object store located in `ap-south-1`.
- Automatic bucket provisioning, presigned URLs for direct client uploads, MIME validation, and tamper-proof asset hashes.

### 3.5. Background Processing (Bull Queue)
- Redis-backed distributed task queue for asynchronous workload processing:
  - Transactional email dispatch.
  - Asynchronous webhook deliveries.
  - Database backup archiving.
  - Heavy ETL or migration runs.

---

## 4. Security & Compliance (DPDP Act India 2026)

1. **Data Sovereignty**: All cluster workloads, persistent volumes, database replicas, and object backups reside strictly within AWS Sovereign Region (`ap-south-1`).
2. **Encryption Standards**:
   - **In-Transit**: TLS 1.3 enforced across all public endpoints and inter-service mesh communication.
   - **At-Rest**: AES-256 encryption across PostgreSQL volumes, Redis append-only files, and MinIO storage blocks.
3. **Audit Logging**: Comprehensive, immutable `activity_logs` table tracking every DDL/DML mutation, auth attempt, and administrative access.
4. **Secrets Management**: Dynamic secrets injected via Kubernetes Secrets and AWS KMS with zero hardcoded credentials in source code.

---

## 5. High Availability & Fault Tolerance

- **Multi-AZ Replication**: PostgreSQL 16 streaming replication across 3 Availability Zones with automatic failover.
- **Horizontal Pod Autoscaling (HPA)**: Kubernetes HPA dynamically scales backend pods from 3 to 20 replicas based on target CPU (>70%) and memory (>75%) utilization.
- **Zero-Downtime Rolling Upgrades**: Kubernetes rolling deployment strategy ensuring continuous service availability during deployments.
