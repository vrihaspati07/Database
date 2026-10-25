-- Rollback Migration 003
DROP TABLE IF EXISTS oauth_accounts CASCADE;
-- Do not drop users table completely if other tables depend on it, but revert if needed
