-- ===================================================================
-- Hind DB - Complete Sovereign PostgreSQL Schema
-- Company: Hind India Private Limited
-- Product: Hind DB (hind.io)
-- Copyright: © 2026 Hind. A Hind India Private Limited Company.
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255) NULL,
    avatar_url VARCHAR(512) NULL,
    role VARCHAR(50) DEFAULT 'developer', -- 'admin', 'developer', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Databases Table
CREATE TABLE IF NOT EXISTS databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL DEFAULT 'sovereign-dc-01', -- 'Sovereign-Zone-1', 'Sovereign-Zone-2'
    plan VARCHAR(50) NOT NULL DEFAULT 'Pro', -- 'Free', 'Pro', 'Enterprise'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PROVISIONING', 'MAINTENANCE'
    size_bytes BIGINT NOT NULL DEFAULT 10485760, -- bytes
    connection_uri TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_databases_user ON databases(user_id);

-- 3. Tables Table (Postgres Table Metadata)
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schema JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of column definitions: [{name, type, nullable, isPrimary, default}]
    row_count BIGINT NOT NULL DEFAULT 0,
    rls_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(database_id, name)
);
CREATE INDEX IF NOT EXISTS idx_tables_database ON tables(database_id);

-- 4. Rows Table (Flexible JSONB Row Store & Live Query Engine)
CREATE TABLE IF NOT EXISTS rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rows_table ON rows(table_id);
CREATE INDEX IF NOT EXISTS idx_rows_data_gin ON rows USING gin(data);

-- 5. Files Table (S3 / MinIO Object Storage)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(512) NOT NULL,
    size BIGINT NOT NULL, -- in bytes
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    public_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_files_database ON files(database_id);

-- 6. Serverless Functions Table
CREATE TABLE IF NOT EXISTS functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    runtime VARCHAR(50) NOT NULL DEFAULT 'typescript',
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'HTTP', -- 'HTTP', 'Database Webhook', 'Cron'
    status VARCHAR(50) NOT NULL DEFAULT 'DEPLOYED',
    invocations BIGINT NOT NULL DEFAULT 0,
    avg_latency_ms NUMERIC(5,2) NOT NULL DEFAULT 3.2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(database_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_functions_database ON functions(database_id);

-- 7. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'anon', -- 'anon', 'service_role'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE NULL
);
CREATE INDEX IF NOT EXISTS idx_api_keys_database ON api_keys(database_id);

-- 8. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'developer', -- 'admin', 'developer', 'viewer'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INVITED', 'SUSPENDED'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- 9. Activity & Audit Security Logs (DPDP Act 2026 Compliance)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    database_id UUID REFERENCES databases(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'DATABASE', 'TABLE', 'ROW', 'STORAGE', 'FUNCTION', 'AUTH'
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_db ON activity_logs(database_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
