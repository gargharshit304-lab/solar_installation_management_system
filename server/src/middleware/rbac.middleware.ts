import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { UserRole, ROLE_CAPABILITIES } from '../config/constants';
import { rbacService } from '../modules/rbac/rbac.service';

/**
 * Ensures user has at least one of the allowed roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(new AppError(
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS',
        'Access denied. Your role lacks authority for this workspace.'
      ));
    }

    next();
  };
}

/**
 * Action-level authorization middleware
 * Checks exact resource action permission (e.g. resource='inventory', action='create')
 */
export function requireAction(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'));
    }

    const entityId = typeof req.params.id === 'string' ? req.params.id : undefined;
    const isAllowed = await rbacService.checkActionPermission(
      req.user,
      resource,
      action,
      { entityId }
    );

    if (!isAllowed) {
      return next(new AppError(
        403,
        'INSUFFICIENT_PERMISSIONS',
        `Access denied. Requires '${resource}.${action}' permission.`
      ));
    }

    next();
  };
}

/**
 * Capability-based authorization middleware
 * Checks:
 * 1. Strict governance: Owner Admin cannot execute field installations directly
 * 2. Exact dynamic role permissions from database / in-memory matrix
 * 3. Active Operational Delegations granted to user
 */
export function requireCapability(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'));
    }

    const user = req.user;

    // 1. Strict Administrative Separation: Owner cannot execute field installations directly
    if (user.role === 'owner_admin' && permission.startsWith('installations.execute')) {
      const delegations = await rbacService.getActiveDelegationsForUser(user.id, permission);
      if (delegations.length === 0) {
        return next(new AppError(
          403,
          'OPERATIONAL_EXECUTION_RESTRICTED',
          'Administrative authority does not include operational job execution. Only assigned installation engineers can complete installations.'
        ));
      }
    }

    // 2. Check dynamic role permissions from database / in-memory matrix
    if (await rbacService.hasPermission(user.role, permission)) {
      return next();
    }

    // 3. Check operational delegations
    const activeDelegations = await rbacService.getActiveDelegationsForUser(user.id, permission);
    if (activeDelegations.length > 0) {
      return next();
    }

    return next(new AppError(
      403,
      'CAPABILITY_UNAUTHORIZED',
      `Access denied. User lacks required capability '${permission}'.`
    ));
  };
}
