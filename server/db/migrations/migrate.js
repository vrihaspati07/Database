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
