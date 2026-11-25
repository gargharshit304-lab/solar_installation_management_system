import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';
import {
  REFRESH_COOKIE,
  CSRF_COOKIE,
  generateCsrfToken,
  setCsrfCookie,
  setSessionCookies,
  clearSessionCookies
} from '../../utils/cookies';

/**
 * Resolves the client IP from the Express request. Express applies the
 * configured `trust proxy` policy, so a spoofed X-Forwarded-For header is not
 * trusted when proxy support is disabled.
 */
function getClientIp(req: Request): string | undefined {
  return req.ip || req.socket.remoteAddress;
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;
      const ipAddress = getClientIp(req);
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({
        email,
        password,
        rememberMe,
        ipAddress,
        userAgent
      });

      const accessMaxAgeMs = (rememberMe ? 30 : 1) * 86400 * 1000;
      setSessionCookies(res, result.accessToken, result.refreshToken, accessMaxAgeMs);

      sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
        token: result.accessToken,
        expiresAt: result.expiresAt
      }, 200);
    } catch (err) {
      next(err);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return sendSuccess(res, { authenticated: false, user: null });
      }

      const user = await authService.getUserById(req.user.id);
      if (!user || !user.isActive) {
        clearSessionCookies(res);
        return sendSuccess(res, { authenticated: false, user: null });
      }

      if (!req.cookies?.[CSRF_COOKIE]) {
        setCsrfCookie(res, generateCsrfToken());
      }

      sendSuccess(res, {
        authenticated: true,
        user: {
          id: user.id,
          name: user.fullName || user.name,
          email: user.email,
          role: user.roleId || user.role,
          roleTitle: user.roleTitle,
          department: user.department,
          avatar: user.avatarUrl || user.avatar,
          isActive: user.isActive,
          emailVerified: user.emailVerified
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Refresh tokens are accepted only from the HttpOnly cookie, never from
      // the request body, so scripts cannot read or replay them.
      const refreshToken = req.cookies?.[REFRESH_COOKIE];
      if (!refreshToken) {
        return sendSuccess(res, { authenticated: false, user: null });
      }
      const ipAddress = getClientIp(req);

      const result = await authService.refreshSession(refreshToken, ipAddress);

      setSessionCookies(res, result.accessToken, result.refreshToken, 86400 * 1000);

      sendSuccess(res, { user: result.user, expiresAt: result.expiresAt });
    } catch (err) {
      clearSessionCookies(res);
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE];
      const userId = req.user?.id;
      const ipAddress = getClientIp(req);

      await authService.logout(refreshToken, userId, ipAddress);
      clearSessionCookies(res);

      sendSuccess(res, { message: 'Logged out successfully.' });
    } catch (err) {
      clearSessionCookies(res);
      next(err);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);

      // The reset token must never be exposed through the API response.
      // In development it is logged server-side to allow manual testing.
      if (env.NODE_ENV !== 'production' && result.resetToken !== 'token_dispatched_if_account_exists') {
        console.info(`[DEV ONLY] Password reset token for ${email}: ${result.resetToken}`);
      }

      sendSuccess(res, {
        message: 'If the email exists, a password reset link has been dispatched.'
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      sendSuccess(res, { message: 'Password has been successfully reset. Please log in.' });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
