import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokens';
import { AppError } from '../utils/response';
import { authService } from '../modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { id: string; isActive?: boolean };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Check HttpOnly cookie
    else if (req.cookies && req.cookies.solaros_session_token) {
      token = req.cookies.solaros_session_token;
    }

    if (!token) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please log in to access this resource.');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new AppError(401, 'INVALID_SESSION', 'Session is invalid or has expired. Please log in again.');
    }

    // Verify user is not deactivated
    const user = await authService.getUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Please contact the administrator.');
    }

    req.user = {
      ...payload,
      id: payload.sub,
      isActive: user.isActive
    };

    next();
  } catch (err) {
    next(err);
  }
}
