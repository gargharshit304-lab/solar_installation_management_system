import { Router } from 'express';
import { employeeController } from './employee.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// Retrieve authorized departments for logged in user
router.get('/departments', requireAuth, (req, res, next) => {
  employeeController.getDepartments(req, res, next);
});

// Search & filter employees with pagination
router.get('/', requireAuth, (req, res, next) => {
  employeeController.searchEmployees(req, res, next);
});

export const employeeRoutes = router;
