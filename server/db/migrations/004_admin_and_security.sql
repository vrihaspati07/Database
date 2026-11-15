-- =================================================================
-- Migration 004: Sovereign Admin Panel & Security Infrastructure
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- Copyright: © 2026 Hind. A Hind India Private Limited Company.
-- =================================================================

-- 1. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email CITEXT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_email);

-- 2. Banned IP Addresses
CREATE TABLE IF NOT EXISTS banned_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 5,
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NULL,
    created_by VARCHAR(255) NOT NULL DEFAULT 'SYSTEM_SHIELD'
);
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip ON banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_banned_ips_expires ON banned_ips(expires_at);

-- 3. Service Health Logs (Uptime and Latency Tracking)
CREATE TABLE IF NOT EXISTS service_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'UP', 'DEGRADED', 'DOWN'
    response_time_ms NUMERIC(8,2) NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_health_service ON service_health_logs(service_name, checked_at DESC);

-- 4. Security Events (Platform-wide abuse, attacks, anomalies)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- 'BRUTE_FORCE', 'IP_SPIKE', 'RATE_LIMIT_EXCEEDED', 'SPAM_PROJECT'
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    user_email CITEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

-- 5. Subscriptions & Billing
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'Pro', -- 'Free', 'Pro', 'Enterprise'
    amount NUMERIC(10,2) NOT NULL DEFAULT 2499.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 6. Payment Events (Track Success, Failure, Retries)
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL, -- 'SUCCESS', 'FAILED', 'REFUNDED'
    failure_reason TEXT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_events_user ON payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_status ON payment_events(status);

-- 7. Provisioning Logs
CREATE TABLE IF NOT EXISTS provisioning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    database_id UUID NULL,
    user_id UUID NULL,
    database_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'COMPLETED', 'FAILED', 'IN_PROGRESS'
    duration_ms INT NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_created ON provisioning_logs(created_at DESC);

-- 8. System Error Logs
CREATE TABLE IF NOT EXISTS system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_created ON system_error_logs(created_at DESC);

