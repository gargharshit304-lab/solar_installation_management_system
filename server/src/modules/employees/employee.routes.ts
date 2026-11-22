import { Router } from 'express';
import { employeeController } from './employee.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCapability } from '../../middleware/rbac.middleware';

console.log('[EmployeeRoutes] Loading employee routes...');

const router = Router();

router.use((req, res, next) => {
  console.log('[EmployeeRoutes] Request received:', req.method, req.path);
  next();
});

// Retrieve authorized departments for logged in user
router.get('/departments', requireAuth, (req, res, next) => {
  employeeController.getDepartments(req, res, next);
});

// Search & filter employees with pagination
router.get('/', requireAuth, (req, res, next) => {
  employeeController.searchEmployees(req, res, next);
});

// Create new employee (Owner/Admin only)
router.post('/', requireAuth, requireCapability('employees.create'), (req, res, next) => {
  employeeController.createEmployee(req, res, next);
});

// Update employee (Owner/Admin only)
router.put('/:id', requireAuth, requireCapability('employees.update'), (req, res, next) => {
  employeeController.updateEmployee(req, res, next);
});

// Delete employee (Owner/Admin only)
router.delete('/:id', requireAuth, requireCapability('employees.create'), (req, res, next) => {
  employeeController.deleteEmployee(req, res, next);
});

export const employeeRoutes = router;