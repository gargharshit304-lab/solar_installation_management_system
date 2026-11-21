import { Router } from 'express';
import { auditController } from './audit.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Only Owner / Administrator can inspect enterprise audit logs
router.get('/', requireAuth, requireRole(['owner_admin']), (req, res, next) => {
  auditController.getLogs(req, res, next);
});

export const auditRoutes = router;
