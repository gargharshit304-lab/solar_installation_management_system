import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../config/constants';

export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  roleTitle?: string;
  department?: string;
  name: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    issuer: 'solaros.sunpowersolutions.in'
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { sub: payload.sub, email: payload.email, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
      issuer: 'solaros.sunpowersolutions.in'
    }
  );
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    if (env.NODE_ENV === 'production') return null;

    // Development-only fallback for the locally generated frontend demo session.
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const decoded = JSON.parse(payloadJson);
        if (decoded && (decoded.sub || decoded.userId) && decoded.email && decoded.role) {
          return {
            sub: decoded.sub || decoded.userId,
            email: decoded.email,
            role: decoded.role as UserRole,
            roleTitle: decoded.roleTitle,
            department: decoded.department,
            name: decoded.name || 'User'
          };
        }
      }
    } catch {
      // not a structured token
    }
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string; email: string; type: string } | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
  } catch {
    return null;
  }
}
