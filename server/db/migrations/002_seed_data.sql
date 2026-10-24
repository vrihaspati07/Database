-- =================================================================
-- Migration 002: Seed Initial Production Datasets
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- =================================================================

-- Seed Demo Superuser
INSERT INTO users (id, email, full_name, role, mfa_enabled, is_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'aarav.sharma@hind.io',
    'Aarav Sharma',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Seed Default Cluster
INSERT INTO databases (id, user_id, name, region, plan, status, size_bytes)
VALUES (
    'db_sovereign_01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'production-ecommerce-cluster',
    'Sovereign Primary (ap-south-1)',
    'Pro',
    'ACTIVE',
    4294967296
) ON CONFLICT (id) DO NOTHING;

-- Seed Tables
INSERT INTO tables (id, database_id, name, schema, rls_enabled, row_count)
VALUES (
    'tbl_orders',
    'db_sovereign_01',
    'quick_commerce_orders',
    '[{"name": "id", "type": "UUID", "isPrimary": true}, {"name": "customer_name", "type": "VARCHAR(255)"}, {"name": "amount_inr", "type": "INTEGER"}, {"name": "payment_method", "type": "VARCHAR(50)"}, {"name": "status", "type": "VARCHAR(50)"}, {"name": "city", "type": "VARCHAR(100)"}]'::jsonb,
    true,
    85940
) ON CONFLICT (id) DO NOTHING;

-- Seed Team Members
INSERT INTO team_members (id, database_id, name, email, role, status)
VALUES 
    ('tm_1', 'db_sovereign_01', 'Aarav Sharma', 'aarav.sharma@hind.io', 'admin', 'ACTIVE'),
    ('tm_2', 'db_sovereign_01', 'Priya Iyer', 'priya.iyer@hind.io', 'developer', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
