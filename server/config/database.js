/**
 * Hind DB - PostgreSQL Connection Pool & Transaction Manager
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

const poolConfig = config.db.databaseUrl
  ? { connectionString: config.db.databaseUrl, ssl: config.db.ssl }
  : {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      ssl: config.db.ssl,
      max: config.db.max,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      connectionTimeoutMillis: config.db.connectionTimeoutMillis,
    };

export const pool = new Pool(poolConfig);

// Pool lifecycle events
pool.on('connect', (client) => {
  // Set default timezone and search path for sovereign Indian deployments
  client.query("SET timezone = 'Asia/Kolkata'");
});

pool.on('error', (err) => {
  console.error('[Hind DB Postgres Error]: Unexpected error on idle client', err);
});

/**
 * Execute query with automated connection acquisition & latency profiling
 */
export async function query(text, params = []) {
  const start = performance.now();
  try {
    const res = await pool.query(text, params);
    const duration = (performance.now() - start).toFixed(2);
    if (process.env.DEBUG_SQL === 'true') {
      console.log(`[SQL Query] (${duration}ms):`, text, params);
    }
    return res;
  } catch (err) {
    console.error(`[SQL Error]: ${err.message} in query "${text}"`);
    throw err;
  }
}

/**
 * Execute atomic ACID transaction helper
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Health check ping
 */
export async function testDbConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    return {
      status: 'UP',
      time: res.rows[0].current_time,
      version: res.rows[0].pg_version,
    };
  } catch (err) {
    return {
      status: 'DOWN',
      error: err.message,
    };
  }
}
