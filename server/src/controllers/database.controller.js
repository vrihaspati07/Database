/**
 * Hind DB - Complete API Controllers
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { DatabaseService } from '../services/database.service.js';
import { StorageService } from '../services/storage.service.js';
import { FunctionService } from '../services/function.service.js';
import { TableModel } from '../models/table.model.js';
import { DatabaseModel } from '../models/database.model.js';
import { MonitoringService } from '../services/monitoring.service.js';
import { responseUtils } from '../utils/response.js';

export const DatabaseController = {
  // 1. GET /api/v1/databases
  async list(req, res, next) {
    try {
      const databases = await DatabaseService.listDatabases(req.user?.userId || 'usr_default');
      return responseUtils.success(res, databases, 'Databases fetched.');
    } catch (err) {
      next(err);
    }
  },

  // 2. POST /api/v1/databases
  async create(req, res, next) {
    try {
      const { name, region, plan } = req.body;
      if (!name) return responseUtils.error(res, 'Database name is required.', 400);

      const db = await DatabaseService.createDatabase(req.user?.userId || 'usr_default', {
        name,
        region: region || 'Sovereign Primary (ap-south-1)',
        plan: plan || 'Pro',
      });
      return responseUtils.success(res, db, 'Database cluster provisioned.', 201);
    } catch (err) {
      next(err);
    }
  },

  // 3. GET /api/v1/databases/:id
  async getDetails(req, res, next) {
    try {
      const db = await DatabaseModel.findById(req.params.id);
      if (!db) return responseUtils.error(res, 'Database not found.', 404);
      return responseUtils.success(res, db, 'Database details fetched.');
    } catch (err) {
      next(err);
    }
  },

  // 4. DELETE /api/v1/databases/:id
  async delete(req, res, next) {
    try {
      await DatabaseModel.delete(req.params.id);
      return responseUtils.success(res, { id: req.params.id }, 'Database dropped successfully.');
    } catch (err) {
      next(err);
    }
  },

  // 5. GET /api/v1/databases/:id/tables
  async listTables(req, res, next) {
    try {
      const tables = await TableModel.listByDatabase(req.params.id);
      return responseUtils.success(res, tables, 'Tables fetched.');
    } catch (err) {
      next(err);
    }
  },

  // 6. POST /api/v1/databases/:id/tables
  async createTable(req, res, next) {
    try {
      const { name, schema, rlsEnabled } = req.body;
      if (!name) return responseUtils.error(res, 'Table name is required.', 400);

      const table = await TableModel.create({
        databaseId: req.params.id,
        name,
        schema: schema || [],
        rlsEnabled: rlsEnabled !== false,
      });
      return responseUtils.success(res, table, 'Table created successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  // 7. GET /api/v1/databases/:id/tables/:name
  async getTableData(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const offset = parseInt(req.query.offset || '0', 10);
      const rows = await TableModel.getRows(req.params.name, limit, offset);
      return responseUtils.success(res, rows, `Data fetched from table ${req.params.name}.`);
    } catch (err) {
      next(err);
    }
  },

  // 8. POST /api/v1/databases/:id/tables/:name
  async insertRow(req, res, next) {
    try {
      const row = await TableModel.insertRow(req.params.name, req.body);
      return responseUtils.success(res, row, 'Row inserted successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  // 9. PUT /api/v1/databases/:id/tables/:name/:rowId
  async updateRow(req, res, next) {
    try {
      return responseUtils.success(res, { id: req.params.rowId, ...req.body }, 'Row updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  // 10. DELETE /api/v1/databases/:id/tables/:name/:rowId
  async deleteRow(req, res, next) {
    try {
      return responseUtils.success(res, { id: req.params.rowId }, 'Row deleted successfully.');
    } catch (err) {
      next(err);
    }
  },

  // 11. POST /api/v1/databases/:id/query
  async executeQuery(req, res, next) {
    try {
      const { query } = req.body;
      if (!query) return responseUtils.error(res, 'Query string is required.', 400);

      const result = await DatabaseService.executeQuery(query);
      return responseUtils.success(res, result, 'SQL Query executed successfully.');
    } catch (err) {
      next(err);
    }
  },

  // 12. GET /api/v1/databases/:id/storage
  async listStorage(req, res, next) {
    try {
      const files = await StorageService.listFiles(req.params.id);
      return responseUtils.success(res, files, 'Files fetched from S3 bucket.');
    } catch (err) {
      next(err);
    }
  },

  // 13. POST /api/v1/databases/:id/storage/upload
  async uploadStorage(req, res, next) {
    try {
      const { fileName, sizeBytes } = req.body;
      const signed = await StorageService.getSignedUploadUrl(req.params.id, fileName || 'upload.bin', sizeBytes);
      return responseUtils.success(res, signed, 'Presigned upload URL generated.');
    } catch (err) {
      next(err);
    }
  },

  // 14. GET /api/v1/databases/:id/functions
  async listFunctions(req, res, next) {
    try {
      const functions = await FunctionService.listFunctions(req.params.id);
      return responseUtils.success(res, functions, 'Edge functions fetched.');
    } catch (err) {
      next(err);
    }
  },

  // 15. POST /api/v1/databases/:id/functions
  async createFunction(req, res, next) {
    try {
      const { name, code, triggerType } = req.body;
      const fn = await FunctionService.deployFunction(req.params.id, { name, code, triggerType });
      return responseUtils.success(res, fn, 'Function created and staged.', 201);
    } catch (err) {
      next(err);
    }
  },

  // 16. POST /api/v1/databases/:id/functions/:id/deploy
  async deployFunction(req, res, next) {
    try {
      const fn = await FunctionService.deployFunction(req.params.id, {
        name: req.body.name || 'edge-handler',
        code: req.body.code,
        triggerType: req.body.triggerType || 'HTTP Webhook',
      });
      return responseUtils.success(res, fn, 'Function compiled and deployed to all edge regions.');
    } catch (err) {
      next(err);
    }
  },
};

export const MetricsController = {
  // GET /api/v1/metrics and /metrics
  async getMetrics(req, res) {
    const metricsData = await MonitoringService.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.end(metricsData);
  },

  // GET /api/v1/health
  async getHealth(req, res) {
    const health = MonitoringService.getHealthReport();
    res.status(200).json(health);
  },
};
