/**
 * Hind DB - Bull Queue Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import Bull from 'bull';
import { envConfig } from './env.config.js';

export function initializeQueue(queueName) {
  try {
    const queue = new Bull(queueName, {
      redis: {
        host: envConfig.redis.host,
        port: envConfig.redis.port,
        password: envConfig.redis.password,
        db: envConfig.redis.db,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    });

    queue.on('error', () => {});
    return queue;
  } catch (err) {
    return {
      add: async (data) => ({ id: `job_${Date.now()}`, data }),
      process: () => {},
    };
  }
}
