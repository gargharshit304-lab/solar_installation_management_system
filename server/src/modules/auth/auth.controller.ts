import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({
        email,
        password,
        rememberMe,
        ipAddress,
        userAgent
      });

      // Set secure HttpOnly cookie for session synchronization
      const maxAgeMs = (rememberMe ? 30 : 1) * 86400 * 1000;
      res.cookie('solaros_session_token', result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAgeMs,
        path: '/'
      });

      sendSuccess(res, result, 200);
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
      const { refreshToken } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      const result = await authService.refreshSession(refreshToken, ipAddress);

      // Refresh cookie
      res.cookie('solaros_session_token', result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 1000,
        path: '/'
      });

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      const userId = req.user?.id;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      await authService.logout(refreshToken, userId, ipAddress);

      // Clear cookie
      res.clearCookie('solaros_session_token', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });

      sendSuccess(res, { message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      sendSuccess(res, {
        message: 'If the email exists, a password reset link has been dispatched.',
        resetToken: result.resetToken
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
