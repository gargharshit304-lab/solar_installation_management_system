import { Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

export const ACCESS_COOKIE = 'solaros_session_token';
export const REFRESH_COOKIE = 'solaros_refresh_token';
export const CSRF_COOKIE = 'solaros_csrf';
export const CSRF_HEADER = 'x-csrf-token';

const isProd = env.NODE_ENV === 'production';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function signCsrfToken(rawToken: string): string {
  return crypto.createHmac('sha256', env.COOKIE_SECRET).update(rawToken).digest('hex');
}

/**
 * Verifies the HMAC that binds a CSRF cookie to this server, preventing
 * cookie-injection attacks from sibling/sub domains. Returns the raw token.
 */
export function verifySignedCsrfToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const separator = value.lastIndexOf('.');
  if (separator <= 0) return null;

  const rawToken = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = signCsrfToken(rawToken);

  if (signature.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ? rawToken
    : null;
}

export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE, `${token}.${signCsrfToken(token)}`, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function setSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessMaxAgeMs: number
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: accessMaxAgeMs
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  setCsrfCookie(res, generateCsrfToken());
}

export function clearSessionCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: isProd });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth', httpOnly: true, sameSite: 'lax', secure: isProd });
  res.clearCookie(CSRF_COOKIE, { path: '/', httpOnly: false, sameSite: 'lax', secure: isProd });
}
