import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// Accept only a conservative request-id format so client-supplied values
// cannot inject control characters into logs or response headers.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' && REQUEST_ID_PATTERN.test(incomingId)
    ? incomingId
    : crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
