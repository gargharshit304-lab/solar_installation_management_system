import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../utils/response';

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests from this IP address. Please try again after 15 minutes.'
    );
  }
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      429,
      'AUTH_RATE_LIMIT_EXCEEDED',
      'Too many authentication attempts. Please wait 15 minutes before trying again.'
    );
  }
});
