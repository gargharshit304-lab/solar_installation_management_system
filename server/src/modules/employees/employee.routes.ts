import { Router, Request, Response, NextFunction } from 'express';
import { employeeController } from './employee.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCapability, requireRole, requireAction } from '../../middleware/rbac.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  promoteEmployeeSchema,
  transferEmployeeSchema
} from './employee.validation';

const router = Router();

const requireRoleAssignmentIfChangingRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.body?.role === 'owner_admin' || req.body?.newRoleId === 'owner_admin') {
    // Only an existing owner may mint another owner account.
    return requireRole(['owner_admin'])(req, res, next);
  }
  if (req.body?.role || req.body?.newRoleId) {
    return requireCapability('employees.assign_roles')(req, res, next);
  }
  next();
};

// Retrieve authorized departments for logged in user
router.get('/departments', requireAuth, (req, res, next) => {
  employeeController.getDepartments(req, res, next);
});

// Search & filter employees with pagination
router.get('/', requireAuth, requireAction('workforce', 'view'), (req, res, next) => {
  employeeController.searchEmployees(req, res, next);
});

// Create new employee (Owner/Admin or authorized HR/Ops)
router.post(
  '/',
  requireAuth,
  requireAction('workforce', 'create'),
  validateBody(createEmployeeSchema),
  requireRoleAssignmentIfChangingRole,
  (req, res, next) => {
    employeeController.createEmployee(req, res, next);
  }
);

// Get single employee details
router.get('/:id', requireAuth, requireAction('workforce', 'view'), (req, res, next) => {
  employeeController.getEmployeeById(req, res, next);
});

// Get employee career history timeline
router.get('/:id/career-history', requireAuth, requireAction('workforce', 'view'), (req, res, next) => {
  employeeController.getCareerHistory(req, res, next);
});

// Update employee general details
router.put(
  '/:id',
  requireAuth,
  requireAction('workforce', 'edit'),
  validateBody(updateEmployeeSchema),
  requireRoleAssignmentIfChangingRole,
  (req, res, next) => {
    employeeController.updateEmployee(req, res, next);
  }
);

// Promote employee workflow
router.post(
  '/:id/promote',
  requireAuth,
  requireAction('workforce', 'edit'),
  validateBody(promoteEmployeeSchema),
  requireRoleAssignmentIfChangingRole,
  (req, res, next) => {
    employeeController.promoteEmployee(req, res, next);
  }
);

// Department transfer workflow
router.post(
  '/:id/transfer',
  requireAuth,
  requireAction('workforce', 'edit'),
  validateBody(transferEmployeeSchema),
  (req, res, next) => {
    employeeController.transferEmployee(req, res, next);
  }
);

// Deactivate/delete employee
router.delete('/:id', requireAuth, requireAction('workforce', 'delete'), (req, res, next) => {
  employeeController.deleteEmployee(req, res, next);
});

export const employeeRoutes = router;
