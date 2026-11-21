import { Router } from 'express';
import { auditController } from './audit.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Only Owner / Administrator can inspect enterprise company-wide audit logs
router.get('/', requireAuth, requireRole(['owner_admin']), (req, res, next) => {
  auditController.getLogs(req, res, next);
});

// Explicit Immutability Guards: Audit logs are append-only.
// No user or administrator may edit, mutate, or purge audit trail records.
router.put(['/', '/:id'], (req, res) => {
  res.status(405).json({
    success: false,
    error: {
      code: 'AUDIT_LOG_IMMUTABLE',
      message: 'Audit logs are immutable append-only records. Update operations are strictly prohibited.'
    }
  });
});

router.patch(['/', '/:id'], (req, res) => {
  res.status(405).json({
    success: false,
    error: {
      code: 'AUDIT_LOG_IMMUTABLE',
      message: 'Audit logs are immutable append-only records. Modifications are strictly prohibited.'
    }
  });
});

router.delete(['/', '/:id'], (req, res) => {
  res.status(405).json({
    success: false,
    error: {
      code: 'AUDIT_LOG_IMMUTABLE',
      message: 'Audit logs are immutable append-only records. Deletion or purging is strictly prohibited.'
    }
  });
});

export const auditRoutes = router;
