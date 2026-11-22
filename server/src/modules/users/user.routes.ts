import { Router } from 'express';
import { z } from 'zod';
import { userController } from './user.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole, requireCapability } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';

const router = Router();

const setStatusSchema = z.object({
  active: z.boolean()
}).strict();

router.get('/', requireAuth, requireCapability('employees.view_all'), (req, res, next) => {
  userController.getUsers(req, res, next);
});

router.patch(
  '/:userId/status',
  requireAuth,
  requireRole(['owner_admin']),
  validateRequest({ body: setStatusSchema }),
  (req, res, next) => {
    userController.setStatus(req, res, next);
  }
);

export const userRoutes = router;
