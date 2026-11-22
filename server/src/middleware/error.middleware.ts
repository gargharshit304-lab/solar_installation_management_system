import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const formattedErrors = issues.map((e: any) => ({
      field: e.path ? e.path.join('.') : '',
      message: e.message
    }));
    return sendError(
      res,
      422,
      'VALIDATION_ERROR',
      'Invalid request payload.',
      formattedErrors
    );
  }

  // 2. Custom Application Errors
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // 3. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'INVALID_TOKEN', 'Malformed or invalid authentication token.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'TOKEN_EXPIRED', 'Session token has expired. Please refresh your session.');
  }

  // 4. Default / Unhandled 500 Errors
  console.error(`[Unhandled Error] Request ${req.id || 'unknown'}:`, err);
  // Detail and stack traces are development-only. Anything other than an
  // explicit development environment must fail closed.
  const isDevelopment = env.NODE_ENV === 'development';
  const message = isDevelopment
    ? err.message || 'Internal Server Error'
    : 'An unexpected internal error occurred.';

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message, isDevelopment ? err.stack : undefined);
}
