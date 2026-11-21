import { Router } from 'express';
import { rbacController } from './rbac.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const updatePermissionsSchema = z.object({
  permissions: z.record(z.array(z.string()))
});

const createDelegationSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee Name is required'),
  grantedPermission: z.string().min(1, 'Granted Permission is required'),
  departmentScope: z.string().min(1, 'Department Scope is required'),
  resourceId: z.string().optional(),
  justification: z.string().min(5, 'Justification must be at least 5 characters'),
  effectiveFrom: z.string().min(1, 'Effective from date is required'),
  effectiveTo: z.string().min(1, 'Effective to date is required')
});

router.get('/roles', requireAuth, (req, res, next) => {
  rbacController.getRoles(req, res, next);
});

router.put(
  '/roles/:roleKey/permissions',
  requireAuth,
  requireRole(['owner_admin']),
  validateRequest({ body: updatePermissionsSchema }),
  (req, res, next) => {
    rbacController.updatePermissions(req, res, next);
  }
);

router.get('/delegations', requireAuth, (req, res, next) => {
  rbacController.getDelegations(req, res, next);
});

router.post(
  '/delegations',
  requireAuth,
  requireRole(['owner_admin']),
  validateRequest({ body: createDelegationSchema }),
  (req, res, next) => {
    rbacController.createDelegation(req, res, next);
  }
);

router.delete(
  '/delegations/:id',
  requireAuth,
  requireRole(['owner_admin']),
  (req, res, next) => {
    rbacController.revokeDelegation(req, res, next);
  }
);

export const rbacRoutes = router;
