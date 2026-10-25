/**
 * Hind DB - Redis Distributed Cache & Session Manager
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import Redis from 'ioredis';
import { config } from './index.js';

let redisClient = null;
let isConnected = false;

// Fallback in-memory map if standalone redis is not accessible in dev mode
const memoryStore = new Map();

try {
  const redisOptions = {
    keyPrefix: config.redis.keyPrefix,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('[Hind DB Redis]: Redis not reachable, falling back to local memory cache.');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  };

  if (config.redis.redisUrl && !config.redis.redisUrl.includes('localhost')) {
    redisClient = new Redis(config.redis.redisUrl, redisOptions);
  } else {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      ...redisOptions,
    });
  }

  redisClient.on('connect', () => {
    isConnected = true;
    console.log('[Hind DB Redis]: Connected successfully to Redis Cache.');
  });

  redisClient.on('error', () => {
    isConnected = false;
  });

  redisClient.connect().catch(() => {
    isConnected = false;
  });
} catch (e) {
  isConnected = false;
}

export const redis = {
  async get(key) {
    if (isConnected && redisClient) {
      try {
        const val = await redisClient.get(key);
        if (!val) return null;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      } catch (err) {
        console.error('[Redis Get Error]:', err.message);
      }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key, value, ttlSeconds = config.redis.defaultTtl) {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (isConnected && redisClient) {
      try {
        if (ttlSeconds) {
          await redisClient.set(key, payload, 'EX', ttlSeconds);
        } else {
          await redisClient.set(key, payload);
        }
        return true;
      } catch (err) {
        console.error('[Redis Set Error]:', err.message);
      }
    }
    memoryStore.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return true;
  },

  async del(key) {
    if (isConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch (err) {}
    }
    memoryStore.delete(key);
    return true;
  },

  async getdel(key) {
    if (isConnected && redisClient) {
      try {
        let val = null;
        if (typeof redisClient.getdel === 'function') {
          val = await redisClient.getdel(key);
        } else {
          val = await redisClient.get(key);
          if (val) await redisClient.del(key);
        }
        if (!val) return null;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      } catch (err) {
        console.error('[Redis getdel Error]:', err.message);
      }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    memoryStore.delete(key);
    if (item.expiry && item.expiry < Date.now()) {
      return null;
    }
    return item.value;
  },

  async delPattern(pattern) {
    if (isConnected && redisClient) {
      try {
        const keys = await redisClient.keys(`${config.redis.keyPrefix}${pattern}`);
        if (keys.length > 0) {
          const stripped = keys.map((k) => k.replace(config.redis.keyPrefix, ''));
          await redisClient.del(...stripped);
        }
      } catch (err) {}
    }
    for (const k of memoryStore.keys()) {
      if (k.includes(pattern)) memoryStore.delete(k);
    }
    return true;
  },

  async getHealth() {
    return {
      connected: isConnected,
      mode: isConnected ? 'Redis Cluster' : 'In-Memory Fallback',
      memoryKeys: memoryStore.size,
    };
  },

  getClient() {
    return redisClient;
  },

  isAvailable() {
    return isConnected && redisClient !== null;
  },
};
