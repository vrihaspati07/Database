# Hind DB - Local Development & Setup Guide

This guide walks you through setting up the complete Hind DB stack (Frontend, Backend API, PostgreSQL 16, Redis 7, MinIO S3 Object Storage) on your local machine.

---

## 1. Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **npm** or **pnpm** / **yarn**
- **Docker & Docker Compose**: v2.20+
- **Git**

---

## 2. Quickstart in 5 Minutes

### Step 1: Clone & Navigate
```bash
git clone https://github.com/vrihaspati07/Database.git
cd Database
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default values in `.env.example` are preconfigured to work out-of-the-box with local Docker containers.

---

## 3. Launching Infrastructure Services

Start PostgreSQL 16, Redis 7, and MinIO Object Storage in detached mode:

```bash
docker compose up -d postgres redis minio
```

Check container status and health:
```bash
docker compose ps
```

Services will be accessible on:
- **PostgreSQL 16**: `localhost:5432` (User: `hind_admin`, DB: `hind_db_production`)
- **Redis 7**: `localhost:6379`
- **MinIO S3 API**: `http://localhost:9000`
- **MinIO Web Console**: `http://localhost:9001` (User: `hind_minio_admin`, Password: `hind_minio_secret_key_2026`)

---

## 4. Run Database Migrations & Seeds

Initialize tables, relations, and seed data:

```bash
# Run migrations up
npm run migrate:up
```

To roll back migrations if needed:
```bash
npm run migrate:down
```

---

## 5. Starting the Applications

### Start the Backend Engine (Terminal 1)
```bash
# Start backend API on port 4000 (or configured PORT)
node server/index.js
```

Verify backend health:
```bash
curl http://localhost:4000/health
```

### Start the Frontend Developer Console (Terminal 2)
```bash
# Start Vite development server
npm run dev
```

The frontend will run at:
- **Developer Console**: `http://localhost:5173`

---

## 6. Running with Full Docker Compose Stack

If you prefer running the entire stack (including Frontend & Backend) inside Docker:

```bash
docker compose up --build
```

- **Frontend Web UI**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:3000`
- **MinIO Console**: `http://localhost:9001`

---

## 7. Useful Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Start local frontend dev server |
| `npm run build` | `tsc -b && vite build` | Type-check and build production frontend |
| `npm run server` | `node server/src/server.js` | Start backend server |
| `npm run migrate:up` | `node server/db/migrations/migrate.js up` | Apply database migrations |
| `npm run migrate:down` | `node server/db/migrations/migrate.js down` | Rollback migrations |
| `npm run lint` | `oxlint` | Fast linter validation |

---

## 8. Troubleshooting

- **Port Conflict (5432 or 6379 already in use)**: Stop any local PostgreSQL or Redis services running on your host:
  ```bash
  brew services stop postgresql
  brew services stop redis
  ```
- **MinIO Connection Error**: Verify MinIO container is healthy with `docker compose logs minio`.
