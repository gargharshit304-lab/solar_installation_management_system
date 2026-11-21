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
