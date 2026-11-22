import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { sendError } from '../utils/response';

export interface ValidationSpec {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validates and sanitizes selected request components against Zod schemas.
 * Unknown keys are stripped by default, preventing mass assignment.
 *
 * Note: Express 5 exposes `req.query` through a getter, so validated query
 * data is attached to `res.locals.validatedQuery` instead of reassigning it.
 */
export function validateRequest(spec: ValidationSpec) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (spec.params) {
      const result = spec.params.safeParse(req.params);
      if (!result.success) {
        return sendValidationError(res, result.error);
      }
      req.params = result.data as Request['params'];
    }

    if (spec.query) {
      const result = spec.query.safeParse(req.query);
      if (!result.success) {
        return sendValidationError(res, result.error);
      }
      res.locals.validatedQuery = result.data;
    }

    if (spec.body) {
      const result = spec.body.safeParse(req.body);
      if (!result.success) {
        return sendValidationError(res, result.error);
      }
      req.body = result.data;
    }

    next();
  };
}

/**
 * Validates and sanitizes req.body against a Zod schema.
 * Kept for backwards compatibility with existing routers.
 */
export function validateBody(schema: ZodSchema) {
  return validateRequest({ body: schema });
}

function sendValidationError(res: Response, error: ZodError): void {
  sendError(
    res,
    400,
    'VALIDATION_ERROR',
    'Invalid request payload.',
    error.issues.map(issue => ({
      field: issue.path.map(String).join('.'),
      message: issue.message
    }))
  );
}
