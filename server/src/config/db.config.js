/**
 * Hind DB - PostgreSQL Connection Pool Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import pg from 'pg';
import { envConfig } from './env.config.js';

const { Pool } = pg;

export const pool = new Pool({
  host: envConfig.db.host,
  port: envConfig.db.port,
  user: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.database,
  ssl: envConfig.db.ssl,
  max: envConfig.db.max,
  idleTimeoutMillis: envConfig.db.idleTimeoutMillis,
  connectionTimeoutMillis: envConfig.db.connectionTimeoutMillis,
});

pool.on('connect', (client) => {
  client.query("SET timezone = 'Asia/Kolkata'");
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Error]: Idle client error', err.message);
});

export async function executeQuery(text, params = []) {
  const start = performance.now();
  try {
    const res = await pool.query(text, params);
    const duration = (performance.now() - start).toFixed(2);
    return { ...res, durationMs: parseFloat(duration) };
  } catch (err) {
    console.error(`[PostgreSQL Query Error]: ${err.message}`);
    throw err;
  }
}
