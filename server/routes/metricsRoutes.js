/**
 * Hind DB - Prometheus Metrics & Health Routes
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import { metricsController } from '../controllers/metricsController.js';

const router = express.Router();

router.get('/metrics', metricsController.getMetrics);
router.get('/health', metricsController.getHealth);
router.get('/api/v1/health', metricsController.getHealth);

export default router;
