/**
 * Hind DB - Redis Client Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import Redis from 'ioredis';
import { envConfig } from './env.config.js';

let redisInstance = null;

try {
  redisInstance = new Redis({
    host: envConfig.redis.host,
    port: envConfig.redis.port,
    password: envConfig.redis.password,
    db: envConfig.redis.db,
    keyPrefix: envConfig.redis.keyPrefix,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 150, 1000);
    },
    lazyConnect: true,
  });

  redisInstance.connect().catch(() => {});
} catch (e) {
  redisInstance = null;
}

export const redisClient = redisInstance;
