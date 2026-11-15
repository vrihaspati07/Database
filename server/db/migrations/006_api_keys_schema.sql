-- =================================================================
-- Migration 006: API Keys Schema DDL
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- =================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(100) PRIMARY KEY,
    database_id VARCHAR(100) NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'anon',
    key_prefix VARCHAR(50) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist if table was partially created previously
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NULL;

-- High-performance lookup indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_database_id ON api_keys(database_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

