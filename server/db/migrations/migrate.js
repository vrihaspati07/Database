/**
 * Hind DB - Automated Database Migration Runner
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const direction = process.argv[2] || 'up';
  console.log(`[Hind DB Migrations]: Running migration in '${direction.toUpperCase()}' direction...`);

  const client = await pool.connect();
  try {
    if (direction === 'down') {
      if (fs.existsSync(path.join(__dirname, '003_rollback_auth_schema.sql'))) {
        const rollbackAuthSql = fs.readFileSync(path.join(__dirname, '003_rollback_auth_schema.sql'), 'utf-8');
        await client.query(rollbackAuthSql);
      }
      const rollbackSql = fs.readFileSync(path.join(__dirname, '001_rollback_schema.sql'), 'utf-8');
      await client.query(rollbackSql);
      console.log('[Hind DB Migrations]: Rollback completed successfully.');
    } else {
      const schemaSql = fs.readFileSync(path.join(__dirname, '001_initial_schema.sql'), 'utf-8');
      const seedSql = fs.readFileSync(path.join(__dirname, '002_seed_data.sql'), 'utf-8');

      console.log('[Hind DB Migrations]: Applying 001_initial_schema.sql...');
      await client.query(schemaSql);

      console.log('[Hind DB Migrations]: Applying 002_seed_data.sql...');
      await client.query(seedSql);

      if (fs.existsSync(path.join(__dirname, '003_auth_schema.sql'))) {
        console.log('[Hind DB Migrations]: Applying 003_auth_schema.sql...');
        const authSql = fs.readFileSync(path.join(__dirname, '003_auth_schema.sql'), 'utf-8');
        await client.query(authSql);
      }

      if (fs.existsSync(path.join(__dirname, '004_admin_and_security.sql'))) {
        console.log('[Hind DB Migrations]: Applying 004_admin_and_security.sql...');
        const adminSql = fs.readFileSync(path.join(__dirname, '004_admin_and_security.sql'), 'utf-8');
        await client.query(adminSql);
      }

      if (fs.existsSync(path.join(__dirname, '005_storage_schema.sql'))) {
        console.log('[Hind DB Migrations]: Applying 005_storage_schema.sql...');
        const storageSql = fs.readFileSync(path.join(__dirname, '005_storage_schema.sql'), 'utf-8');
        await client.query(storageSql);
      }

      if (fs.existsSync(path.join(__dirname, '006_api_keys_schema.sql'))) {
        console.log('[Hind DB Migrations]: Applying 006_api_keys_schema.sql...');
        const apiKeysSql = fs.readFileSync(path.join(__dirname, '006_api_keys_schema.sql'), 'utf-8');
        await client.query(apiKeysSql);
      }

      if (fs.existsSync(path.join(__dirname, '007_storage_audit_and_overrides.sql'))) {
        console.log('[Hind DB Migrations]: Applying 007_storage_audit_and_overrides.sql...');
        const storagePhase2Sql = fs.readFileSync(path.join(__dirname, '007_storage_audit_and_overrides.sql'), 'utf-8');
        await client.query(storagePhase2Sql);
      }

      console.log('[Hind DB Migrations]: All migrations applied successfully!');
    }
  } catch (err) {
    console.error('[Hind DB Migrations Error]:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
