-- =================================================================
-- Migration 001 Rollback: Drop All Tables
-- Product: Hind DB
-- Parent Company: Hind India Private Limited
-- =================================================================

DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS functions CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS databases CASCADE;
DROP TABLE IF EXISTS users CASCADE;
