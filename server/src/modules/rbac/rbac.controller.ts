import { Request, Response, NextFunction } from 'express';
import { rbacService } from './rbac.service';
import { sendSuccess } from '../../utils/response';

export class RbacController {
  getRoles(req: Request, res: Response, next: NextFunction): void {
    try {
      const roles = rbacService.getRoleDefinitions();
      sendSuccess(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async getDelegations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegations = await rbacService.getAllDelegations();
      sendSuccess(res, delegations);
    } catch (err) {
      next(err);
    }
  }

  async createDelegation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegation = await rbacService.createDelegation(req.body, req.user);
      sendSuccess(res, delegation, 201);
    } catch (err) {
      next(err);
    }
  }

  async revokeDelegation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delegation = await rbacService.revokeDelegation(req.params.id, req.user);
      sendSuccess(res, delegation);
    } catch (err) {
      next(err);
    }
  }
}

export const rbacController = new RbacController();
