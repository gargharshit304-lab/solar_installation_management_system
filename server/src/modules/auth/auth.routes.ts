import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema
} from './auth.validation';

const router = Router();

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  (req, res, next) => {
    authController.login(req, res, next);
  }
);

router.get('/session', requireAuth, (req, res, next) => {
  authController.getSession(req, res, next);
});

router.post(
  '/refresh',
  authRateLimiter,
  (req, res, next) => {
    authController.refresh(req, res, next);
  }
);

router.post('/logout', authRateLimiter, optionalAuth, (req, res, next) => {
  authController.logout(req, res, next);
});

router.post(
  '/password-reset/request',
  authRateLimiter,
  validateRequest({ body: passwordResetRequestSchema }),
  (req, res, next) => {
    authController.requestPasswordReset(req, res, next);
  }
);

router.post(
  '/password-reset/confirm',
  authRateLimiter,
  validateRequest({ body: passwordResetConfirmSchema }),
  (req, res, next) => {
    authController.resetPassword(req, res, next);
  }
);

export const authRoutes = router;
