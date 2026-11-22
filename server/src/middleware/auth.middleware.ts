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

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.solaros_session_token;
}

async function resolveUser(req: Request): Promise<(TokenPayload & { id: string; isActive: boolean }) | null> {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  // Re-load the account and authoritative role from the database so that
  // role changes and deactivations take effect immediately.
  const user = await authService.getUserById(payload.sub);
  if (!user || !user.isActive) return null;

  return {
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.roleId || user.role,
    roleTitle: user.roleTitle,
    department: user.department,
    name: user.fullName || user.name,
    isActive: user.isActive
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!extractToken(req)) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please log in to access this resource.');
    }

    const user = await resolveUser(req);
    if (!user) {
      throw new AppError(401, 'INVALID_SESSION', 'Session is invalid, expired, or the account is inactive.');
    }

<<<<<<< HEAD
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

=======
    req.user = user;
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.user = (await resolveUser(req)) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
}
