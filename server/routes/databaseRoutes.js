/**
 * Hind DB - Database & Dashboard Router
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Router } from 'express';
import {
  getDatabases,
  createDatabase,
  getDatabaseById,
  deleteDatabase,
  getTables,
  createTable,
  getTableData,
  insertRow,
  updateRow,
  deleteRow,
  executeQuery,
  getStorageFiles,
  uploadFile,
  getFunctions,
  createFunction,
  deployFunction,
} from '../controllers/databaseController.js';

const router = Router();

// Databases
router.get('/', getDatabases);
router.post('/', createDatabase);
router.get('/:id', getDatabaseById);
router.delete('/:id', deleteDatabase);

// Tables & Data
router.get('/:id/tables', getTables);
router.post('/:id/tables', createTable);
router.get('/:id/tables/:name', getTableData);
router.post('/:id/tables/:name', insertRow);
router.put('/:id/tables/:name/:rowId', updateRow);
router.delete('/:id/tables/:name/:rowId', deleteRow);

// SQL Query Execution
router.post('/:id/query', executeQuery);

// Storage
router.get('/:id/storage', getStorageFiles);
router.post('/:id/storage/upload', uploadFile);

// Serverless Edge Functions
router.get('/:id/functions', getFunctions);
router.post('/:id/functions', createFunction);
router.post('/:id/functions/:fnId/deploy', deployFunction);

export default router;
