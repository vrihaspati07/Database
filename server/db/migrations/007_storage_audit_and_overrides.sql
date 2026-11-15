-- =================================================================
-- Migration 007: Storage Phase 2 & 3 - Audit Logs & Quota Overrides
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- Copyright: © 2026 Hind. A Hind India Private Limited Company.
-- =================================================================

-- 1. Storage Audit Logs Table
CREATE TABLE IF NOT EXISTS storage_audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    bucket_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NULL,
    action VARCHAR(50) NOT NULL, -- 'UPLOAD', 'DOWNLOAD', 'DELETE', 'SIGNED_URL_CREATED'
    bytes BIGINT NOT NULL DEFAULT 0,
    ip_address VARCHAR(100) NULL,
    api_key_id VARCHAR(100) NULL,
    user_email VARCHAR(255) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storage_audit_project ON storage_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_action ON storage_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_storage_audit_created_at ON storage_audit_logs(created_at);

-- 2. Add storage_quota_override_bytes to databases and storage_project_usage
ALTER TABLE databases ADD COLUMN IF NOT EXISTS storage_quota_override_bytes BIGINT NULL;
ALTER TABLE storage_project_usage ADD COLUMN IF NOT EXISTS storage_quota_override_bytes BIGINT NULL;

