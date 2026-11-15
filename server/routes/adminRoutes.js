/**
 * Hind DB - Secret Sovereign Admin & Security Router
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAdminAuth, checkBannedIp, sendCloaked404 } from '../middleware/adminSecurity.js';

const router = express.Router();

// Apply IP shield to all admin routes
router.use(checkBannedIp);

// 1. Secret Authentication Gate
router.post('/auth/login', adminController.login);
router.post('/auth/logout', requireAdminAuth, adminController.logout);
router.get('/auth/me', requireAdminAuth, adminController.getMe);

// 2. Service Health & Infrastructure
router.get('/health', requireAdminAuth, adminController.getHealth);
router.post('/health/test-now', requireAdminAuth, adminController.testHealthNow);

// 3. Business Stats
router.get('/stats', requireAdminAuth, adminController.getStats);

// 4. Users Management
router.get('/users', requireAdminAuth, adminController.getUsers);
router.get('/users/:id', requireAdminAuth, adminController.getUserDetail);
router.post('/users/:id/action', requireAdminAuth, adminController.executeUserAction);
router.post('/users/bulk-action', requireAdminAuth, adminController.executeBulkUserAction);

// 5. Projects Management
router.get('/projects', requireAdminAuth, adminController.getProjects);
router.post('/projects/:id/reveal-connection', requireAdminAuth, adminController.revealProjectConnection);
router.post('/projects/:id/action', requireAdminAuth, adminController.executeProjectAction);
router.post('/projects/retry-provisioning/:id', requireAdminAuth, adminController.retryProvisioning);

// 6. Security & Abuse Center
router.get('/security', requireAdminAuth, adminController.getSecurity);
router.post('/security/banned-ips', requireAdminAuth, adminController.manageBannedIp);

// 7. Revenue & Billing
router.get('/revenue', requireAdminAuth, adminController.getRevenue);
router.post('/revenue/retry-payment/:id', requireAdminAuth, adminController.retryPayment);

// 8. System Logs & Audit
router.get('/logs', requireAdminAuth, adminController.getLogs);

// 9. CSV Exports
router.get('/export/:type', requireAdminAuth, adminController.exportCsv);

// 10. Alert Operations
router.post('/alerts/test', requireAdminAuth, adminController.sendTestAlert);
router.post('/alerts/daily-summary', requireAdminAuth, adminController.sendDailySummaryNow);

// 11. Storage Phase 4 Platform Intelligence
router.get('/storage', requireAdminAuth, adminController.getStorageAdmin);
router.post('/storage/projects/:id/action', requireAdminAuth, adminController.executeStorageProjectAction);

// 12. Catch-all for undefined admin sub-endpoints -> Return cloaked 404
router.use((req, res) => {
  return sendCloaked404(req, res);
});

export default router;

