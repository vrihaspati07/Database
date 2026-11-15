/**
 * Hind DB - Database & Dashboard Router
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { teamController } from '../controllers/teamController.js';
import { functionsController } from '../controllers/functionsController.js';
import { apiKeyController } from '../controllers/apiKeyController.js';
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
} from '../controllers/databaseController.js';

const router = Router();

// Accept Invite Endpoint (Global database invite acceptance; must precede /:id routes)
router.post('/invites/accept', requireAuth, teamController.acceptInvite);

// Databases
router.get('/', getDatabases);
router.post('/', createDatabase);
router.get('/:id', getDatabaseById);
router.delete('/:id', deleteDatabase);

// Team Management
router.get('/:id/team', requireAuth, teamController.getTeam);
router.post('/:id/team/invites', requireAuth, teamController.inviteMember);
router.patch('/:id/team/:memberId', requireAuth, teamController.updateRole);
router.delete('/:id/team/:memberId', requireAuth, teamController.removeMember);

// API Keys Management (admin+)
router.get('/:id/api-keys', requireAuth, apiKeyController.listKeys);
router.post('/:id/api-keys', requireAuth, apiKeyController.createKey);
router.delete('/:id/api-keys/:keyId', requireAuth, apiKeyController.revokeKey);

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
router.get('/:id/functions', requireAuth, functionsController.listFunctions);
router.post('/:id/functions', requireAuth, functionsController.createFunction);
router.put('/:id/functions/:fnId', requireAuth, functionsController.updateFunction);
router.delete('/:id/functions/:fnId', requireAuth, functionsController.deleteFunction);
router.post('/:id/functions/:fnId/invoke', requireAuth, functionsController.invokeFunction);
router.get('/:id/functions/:fnId/logs', requireAuth, functionsController.getLogs);

export default router;
