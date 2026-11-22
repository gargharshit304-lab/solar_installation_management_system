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
  pagination?: any,
  message?: string
): void {
  const requestId = (res.req as any)?.id || 'unknown';

  let paginationObj: any = undefined;
  if (pagination) {
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || pagination.limit || 20;
    const totalRecords = pagination.totalRecords ?? pagination.total ?? 0;
    const totalPages = pagination.totalPages || Math.max(1, Math.ceil(totalRecords / pageSize));
    paginationObj = {
      page,
      pageSize,
      totalRecords,
      totalPages,
      hasNextPage: pagination.hasNextPage ?? (page < totalPages),
      hasPreviousPage: pagination.hasPreviousPage ?? (page > 1),
      limit: pageSize,
      total: totalRecords
    };
  }

  const meta: ApiResponseMeta = {
    requestId,
    timestamp: new Date().toISOString(),
    ...(paginationObj && { pagination: paginationObj })
  };

  res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(paginationObj ? { pagination: paginationObj } : {}),
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
