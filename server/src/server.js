/**
 * Hind DB - Main Server Runner
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import app from './app.js';
import { envConfig } from './config/env.config.js';
import { logger } from './utils/logger.js';

const PORT = envConfig.app.port;

const server = app.listen(PORT, () => {
  logger.info(`Hind DB Core Engine running on port ${PORT}`);
  logger.info(`Prometheus metrics active at http://localhost:${PORT}/metrics`);
  logger.info(`Health check active at http://localhost:${PORT}/health`);
});

export default server;
