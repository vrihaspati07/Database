/**
 * Hind DB - Complete REST API Routes
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { DatabaseController, MetricsController } from '../controllers/database.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { apiKeyRateLimiter, sanitizeInputs } from '../middleware/security.middleware.js';

export const authRouter = express.Router();
authRouter.post('/register', apiKeyRateLimiter, sanitizeInputs, AuthController.register);
authRouter.post('/login', apiKeyRateLimiter, sanitizeInputs, AuthController.login);
authRouter.get('/me', authenticate, AuthController.me);

export const databaseRouter = express.Router();

// 1. GET /api/v1/databases
databaseRouter.get('/', authenticate, apiKeyRateLimiter, DatabaseController.list);

// 2. POST /api/v1/databases
databaseRouter.post('/', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.create);

// 3. GET /api/v1/databases/:id
databaseRouter.get('/:id', authenticate, apiKeyRateLimiter, DatabaseController.getDetails);

// 4. DELETE /api/v1/databases/:id
databaseRouter.delete('/:id', authenticate, apiKeyRateLimiter, DatabaseController.delete);

// 5. GET /api/v1/databases/:id/tables
databaseRouter.get('/:id/tables', authenticate, apiKeyRateLimiter, DatabaseController.listTables);

// 6. POST /api/v1/databases/:id/tables
databaseRouter.post('/:id/tables', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.createTable);

// 7. GET /api/v1/databases/:id/tables/:name
databaseRouter.get('/:id/tables/:name', authenticate, apiKeyRateLimiter, DatabaseController.getTableData);

// 8. POST /api/v1/databases/:id/tables/:name
databaseRouter.post('/:id/tables/:name', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.insertRow);

// 9. PUT /api/v1/databases/:id/tables/:name/:rowId
databaseRouter.put('/:id/tables/:name/:rowId', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.updateRow);

// 10. DELETE /api/v1/databases/:id/tables/:name/:rowId
databaseRouter.delete('/:id/tables/:name/:rowId', authenticate, apiKeyRateLimiter, DatabaseController.deleteRow);

// 11. POST /api/v1/databases/:id/query
databaseRouter.post('/:id/query', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.executeQuery);

// 12. GET /api/v1/databases/:id/storage
databaseRouter.get('/:id/storage', authenticate, apiKeyRateLimiter, DatabaseController.listStorage);

// 13. POST /api/v1/databases/:id/storage/upload
databaseRouter.post('/:id/storage/upload', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.uploadStorage);

// 14. GET /api/v1/databases/:id/functions
databaseRouter.get('/:id/functions', authenticate, apiKeyRateLimiter, DatabaseController.listFunctions);

// 15. POST /api/v1/databases/:id/functions
databaseRouter.post('/:id/functions', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.createFunction);

// 16. POST /api/v1/databases/:id/functions/:id/deploy
databaseRouter.post('/:id/functions/:fnId/deploy', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.deployFunction);

export const storageRouter = express.Router();
storageRouter.get('/:id', authenticate, apiKeyRateLimiter, DatabaseController.listStorage);
storageRouter.post('/:id/upload', authenticate, apiKeyRateLimiter, sanitizeInputs, DatabaseController.uploadStorage);

export const metricsRouter = express.Router();
metricsRouter.get('/metrics', MetricsController.getMetrics);
metricsRouter.get('/health', MetricsController.getHealth);
metricsRouter.get('/api/v1/metrics', MetricsController.getMetrics);
metricsRouter.get('/api/v1/health', MetricsController.getHealth);
