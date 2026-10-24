# Hind DB - API Reference Specification

> **Base URL**: `http://localhost:4000/api/v1` (Local) / `https://api.hind.io/api/v1` (Cloud)  
> **Region**: AWS Mumbai (`ap-south-1`)  
> **Standard Response Format**: All responses return a standard JSON envelope with `success`, `data`/`error`, and `meta`.

---

## Standard JSON Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-25T00:00:00.000Z",
    "region": "ap-south-1 (Mumbai)",
    "attribution": "© 2026 Hind. A Hind India Private Limited Company."
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token provided"
  },
  "meta": {
    "timestamp": "2026-10-25T00:00:00.000Z",
    "region": "ap-south-1 (Mumbai)"
  }
}
```

---

## 1. Authentication Endpoints

Base Route: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/signup` | Register a new developer account | No |
| `POST` | `/login` | Authenticate with email/password and obtain JWT | No |
| `POST` | `/verify-email` | Verify email address via OTP or verification token | No |
| `POST` | `/forgot-password` | Request password reset email | No |
| `POST` | `/reset-password` | Reset password using one-time token | No |
| `GET` | `/oauth/google` | Initiate Google OAuth 2.0 flow | No |
| `GET` | `/oauth/github` | Initiate GitHub OAuth 2.0 flow | No |
| `POST` | `/refresh` | Refresh JWT access token via refresh token cookie | No |
| `POST` | `/logout` | Invalidate user session and clear auth cookies | Yes |
| `GET` | `/me` | Get currently authenticated user profile | Yes (`Bearer <token>`) |

### Example: Register User (`POST /signup`)
```bash
curl -X POST https://api.hind.io/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Sharma",
    "email": "aarav@example.in",
    "password": "SecurePassword#2026"
  }'
```

---

## 2. Database Management Endpoints

Base Route: `/api/v1/databases`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all databases owned by the tenant |
| `POST` | `/` | Provision a new database cluster (`name`, `region`, `plan`) |
| `GET` | `/:id` | Fetch database cluster metadata, health, and size |
| `DELETE` | `/:id` | Drop a database cluster and associated resources |

### Example: Create Database (`POST /`)
```bash
curl -X POST https://api.hind.io/api/v1/databases \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "e-commerce-prod",
    "region": "mumbai-dc-01",
    "plan": "Pro"
  }'
```

---

## 3. Tables & Dynamic Data Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:id/tables` | List all tables for a specific database |
| `POST` | `/:id/tables` | Create a new table with column schema definitions |
| `GET` | `/:id/tables/:name` | Fetch rows from a table with pagination and filters |
| `POST` | `/:id/tables/:name` | Insert a new row / record into a table |
| `PUT` | `/:id/tables/:name/:rowId` | Update row data by ID |
| `DELETE` | `/:id/tables/:name/:rowId` | Delete a row by ID |

---

## 4. SQL Studio & Query Execution

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/:id/query` | Execute raw SQL statements with read/write safety guards |

### Example: Run SQL Query (`POST /:id/query`)
```bash
curl -X POST https://api.hind.io/api/v1/databases/c9a41031-2917-48f0/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT id, name, price, stock FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 20;"
  }'
```

---

## 5. Storage (S3 / MinIO) Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:id/storage` | List uploaded files and asset metadata |
| `POST` | `/:id/storage/upload` | Upload binary/multipart file to MinIO object store |

---

## 6. Serverless Edge Functions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:id/functions` | List deployed serverless functions |
| `POST` | `/:id/functions` | Create a serverless function with code and trigger type |
| `POST` | `/:id/functions/:fnId/deploy` | Build and deploy a function instance |

---

## 7. Observability, Telemetry & Health

Root Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Instant cluster health check (PostgreSQL, Redis, MinIO) |
| `GET` | `/api/v1/health` | Alias for `/health` |
| `GET` | `/metrics` | Prometheus metrics export endpoint for scraping |

### Health Check Response
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "storage": "connected",
  "timestamp": "2026-10-25T00:00:00.000Z",
  "region": "ap-south-1"
}
```
