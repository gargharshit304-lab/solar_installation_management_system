import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  userController.getUsers(req, res, next);
});

router.patch(
  '/:userId/status',
  requireAuth,
  requireRole(['owner_admin']),
  (req, res, next) => {
    userController.setStatus(req, res, next);
  }
);

export const userRoutes = router;
