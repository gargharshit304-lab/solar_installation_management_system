import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendError } from '../utils/response';
import { CSRF_COOKIE, CSRF_HEADER, verifySignedCsrfToken } from '../utils/cookies';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Pre-authentication endpoints that cannot yet carry a CSRF cookie.
const EXEMPT_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/password-reset/request',
  '/api/v1/auth/password-reset/confirm'
]);

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Double-submit cookie CSRF protection for cookie-authenticated state changes.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const cookieValue = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  // The cookie must carry a valid server HMAC, and the header must echo the
  // exact signed cookie value (double-submit).
  const rawCookieToken = verifySignedCsrfToken(cookieValue);

  if (
    !rawCookieToken ||
    typeof cookieValue !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieValue.length === 0 ||
    !safeEqual(cookieValue, headerToken)
  ) {
    return sendError(res, 403, 'CSRF_VALIDATION_FAILED', 'Missing or invalid CSRF token.');
  }

  next();
}
