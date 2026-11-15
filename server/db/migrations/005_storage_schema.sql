-- =================================================================
-- Migration 005: Hind DB Sovereign Storage (Cloudflare R2 Backend)
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- Copyright: © 2026 Hind. A Hind India Private Limited Company.
-- =================================================================

-- 1. Storage Buckets Table
CREATE TABLE IF NOT EXISTS storage_buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) NOT NULL DEFAULT 'default_project',
    name VARCHAR(255) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    file_count INT NOT NULL DEFAULT 0,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, name)
);
CREATE INDEX IF NOT EXISTS idx_storage_buckets_project ON storage_buckets(project_id);
CREATE INDEX IF NOT EXISTS idx_storage_buckets_name ON storage_buckets(name);

-- 2. Storage Files Table
CREATE TABLE IF NOT EXISTS storage_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) NOT NULL DEFAULT 'default_project',
    bucket_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(512) NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    r2_key VARCHAR(512) NOT NULL,
    public_url TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_storage_files_project_bucket ON storage_files(project_id, bucket_name);
CREATE INDEX IF NOT EXISTS idx_storage_files_name ON storage_files(name);

-- 3. Storage Project Usage Table (1GB Free Quota)
CREATE TABLE IF NOT EXISTS storage_project_usage (
    project_id VARCHAR(255) PRIMARY KEY,
    used_bytes BIGINT NOT NULL DEFAULT 0,
    quota_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1 GB Free
    file_count INT NOT NULL DEFAULT 0,
    plan VARCHAR(50) NOT NULL DEFAULT 'Free',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

