import { Router, Request, Response, NextFunction } from 'express';
import { employeeController } from './employee.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCapability, requireRole } from '../../middleware/rbac.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.validation';

const router = Router();

const requireRoleAssignmentIfChangingRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.body?.role === 'owner_admin') {
    // Only an existing owner may mint another owner account.
    return requireRole(['owner_admin'])(req, res, next);
  }
  if (req.body?.role) {
    return requireCapability('employees.assign_roles')(req, res, next);
  }
  next();
};

// Retrieve authorized departments for logged in user
router.get('/departments', requireAuth, (req, res, next) => {
  employeeController.getDepartments(req, res, next);
});

// Search & filter employees with pagination
router.get('/', requireAuth, (req, res, next) => {
  employeeController.searchEmployees(req, res, next);
});

// Create new employee (Owner/Admin only)
router.post(
  '/',
  requireAuth,
  requireCapability('employees.create'),
  validateBody(createEmployeeSchema),
  requireRoleAssignmentIfChangingRole,
  requireCapability('employees.assign_roles'),
  (req, res, next) => {
    employeeController.createEmployee(req, res, next);
  }
);

// Update employee (Owner/Admin only)
router.put(
  '/:id',
  requireAuth,
  requireCapability('employees.update'),
  validateBody(updateEmployeeSchema),
  requireRoleAssignmentIfChangingRole,
  (req, res, next) => {
    employeeController.updateEmployee(req, res, next);
  }
);

// Deactivate employee (Owner/Admin only)
router.delete('/:id', requireAuth, requireCapability('employees.deactivate'), (req, res, next) => {
  employeeController.deleteEmployee(req, res, next);
});

export const employeeRoutes = router;
