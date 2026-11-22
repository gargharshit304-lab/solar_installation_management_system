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

    // Resolve the authoritative account record from the database.
    const user = (payload.email ? await authService.getUserByEmail(payload.email) : null) || 
                 (payload.sub ? await authService.getUserById(payload.sub) : null);
    if (!user) {
      throw new AppError(401, 'INVALID_SESSION', 'Session user no longer exists. Please log in again.');
    }
    if (user.isActive === false) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Please contact the administrator.');
    }

    req.user = {
      ...payload,
      id: user.id,
      role: (user.roleId || user.role || payload.role) as any,
      department: user.department || payload.department,
      name: user.fullName || user.name || payload.name,
      isActive: user.isActive !== false
    };

    next();
  } catch (err) {
    next(err);
  }
}
