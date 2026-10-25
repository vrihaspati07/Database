-- =================================================================
-- Migration 003: Sovereign Complete Authentication Schema
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- =================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create or Update Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT NULL,
    role TEXT DEFAULT 'developer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure full_name column exists if users table was previously created with 'name'
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='full_name'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='users' AND column_name='name'
        ) THEN
            ALTER TABLE users RENAME COLUMN name TO full_name;
        ELSE
            ALTER TABLE users ADD COLUMN full_name TEXT NOT NULL DEFAULT 'User';
        END IF;
    END IF;
END $$;

-- Alter email type to CITEXT if needed
DO $$
BEGIN
    BEGIN
        ALTER TABLE users ALTER COLUMN email TYPE CITEXT;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Alter password_hash to allow NULL for Google OAuth accounts
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create index on email for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_email_citext ON users(email);

-- 3. Create OAuth Accounts Table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider, provider_user_id);
