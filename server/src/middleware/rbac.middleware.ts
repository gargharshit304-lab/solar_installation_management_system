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
        `Access denied. Role '${req.user.role}' lacks authority for this workspace.`
      ));
    }

    next();
  };
}

/**
 * Capability-based authorization middleware
 * Checks:
 * 1. Role's base capability permissions
 * 2. Active Operational Delegations granted to user
 * 3. Strict governance: Owner Admin cannot execute field installations directly
 */
export function requireCapability(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'));
    }

    const user = req.user;

    // Strict Administrative Separation: Owner cannot execute field installations without explicit delegation
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

    // Check inherent role capabilities
    const baseCapabilities = ROLE_CAPABILITIES[user.role as UserRole] || [];
    if (baseCapabilities.includes(permission)) {
      return next();
    }

    // Check operational delegations
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
