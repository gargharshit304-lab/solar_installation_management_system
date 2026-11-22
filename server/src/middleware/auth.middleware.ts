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

    req.user = user;
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
