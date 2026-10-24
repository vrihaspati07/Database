-- =================================================================
-- Migration 001: Initial Core Schema DDL
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    salt VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email',
    role VARCHAR(50) DEFAULT 'developer',
    mfa_enabled BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Databases Table
CREATE TABLE IF NOT EXISTS databases (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) DEFAULT 'Mumbai (ap-south-1)',
    plan VARCHAR(50) DEFAULT 'Pro',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    size_bytes BIGINT DEFAULT 10485760,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Schema Tables Table
CREATE TABLE IF NOT EXISTS tables (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schema JSONB NOT NULL DEFAULT '[]',
    rls_enabled BOOLEAN DEFAULT true,
    row_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Storage Files Table
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    size BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/octet-stream',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Edge Functions Table
CREATE TABLE IF NOT EXISTS functions (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    trigger_type VARCHAR(100) DEFAULT 'HTTP Webhook',
    status VARCHAR(50) DEFAULT 'DEPLOYED',
    invocations BIGINT DEFAULT 0,
    avg_latency_ms NUMERIC(5, 2) DEFAULT 2.4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(50) NOT NULL,
    role VARCHAR(50) DEFAULT 'anon',
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'developer',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_databases_user_id ON databases(user_id);
CREATE INDEX IF NOT EXISTS idx_tables_database_id ON tables(database_id);
CREATE INDEX IF NOT EXISTS idx_files_database_id ON files(database_id);
CREATE INDEX IF NOT EXISTS idx_functions_database_id ON functions(database_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_database_id ON api_keys(database_id);
