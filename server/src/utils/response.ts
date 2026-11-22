import { Response } from 'express';

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiResponseMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: ApiResponseMeta['pagination'],
  message?: string
): void {
  const requestId = (res.req as any)?.id || 'unknown';
  const meta: ApiResponseMeta = {
    requestId,
    timestamp: new Date().toISOString(),
    ...(pagination && { pagination })
  };

  res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
    meta
  });
}

export function sendError(
  res: Response,
  statusCode = 400,
  code: string,
  message: string,
  details?: any
): void {
  const requestId = (res.req as any)?.id || 'unknown';
  const meta: ApiResponseMeta = {
    requestId,
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json({
    success: false,
    code,
    message,
    error: {
      code,
      message,
      ...(details !== undefined && { details })
    },
    meta
  });
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
